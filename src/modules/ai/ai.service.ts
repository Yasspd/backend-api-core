import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { loadOptionalPackage } from '../common/utils/optional-package.util';
import { SelectorExtractionResult } from './interfaces/selector-extraction-result.interface';

interface CheerioElement {
  attribs?: Record<string, string>;
}

interface CheerioCollection {
  remove(): void;
  each(callback: (index: number, element: CheerioElement) => void): void;
  removeAttr(attributeName: string): void;
  text(): string;
}

interface CheerioDocument {
  (selectorOrElement: string | CheerioElement): CheerioCollection;
  html(): string | null;
}

interface CheerioStatic {
  load(markup: string): CheerioDocument;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly cheerio = loadOptionalPackage<CheerioStatic>('cheerio');

  constructor(private readonly configService: ConfigService) {}

  cleanHtml(rawHtml: string): string {
    const $ = this.cheerio.load(rawHtml);
    $('script, style, svg, noscript, header, footer').remove();

    $('*').each((_: number, element: CheerioElement) => {
      const node = $(element);
      const attributeNames = Object.keys(element.attribs ?? {});

      attributeNames.forEach((attributeName) => {
        if (attributeName !== 'class' && attributeName !== 'id') {
          node.removeAttr(attributeName);
        }
      });
    });

    return $.html() ?? '';
  }

  async extractSelector(cleanHtml: string): Promise<string> {
    const response = await this.requestSelector(cleanHtml);

    if (!response.found || !response.selector) {
      throw new BadGatewayException('AI selector extraction failed to identify a selector');
    }

    return response.selector;
  }

  private async requestSelector(cleanHtml: string): Promise<SelectorExtractionResult> {
    const provider = this.configService.get<string>('LLM_PROVIDER')?.toLowerCase() ?? 'deepseek';

    if (provider === 'gemini') {
      return this.callGemini(cleanHtml);
    }

    return this.callDeepSeek(cleanHtml);
  }

  private async callDeepSeek(cleanHtml: string): Promise<SelectorExtractionResult> {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    const endpoint =
      this.configService.get<string>('DEEPSEEK_API_URL') ?? 'https://api.deepseek.com/chat/completions';
    const model = this.configService.get<string>('DEEPSEEK_MODEL') ?? 'deepseek-chat';

    if (!apiKey) {
      throw new InternalServerErrorException('DEEPSEEK_API_KEY is not configured');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: this.buildSystemPrompt() },
          { role: 'user', content: cleanHtml },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`DeepSeek request failed: ${response.status} ${body}`);
      throw new BadGatewayException('DeepSeek selector extraction failed');
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;

    return this.parseSelectorResponse(content);
  }

  private async callGemini(cleanHtml: string): Promise<SelectorExtractionResult> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const model = this.configService.get<string>('GEMINI_MODEL') ?? 'gemini-1.5-flash';
    const endpoint =
      this.configService.get<string>('GEMINI_API_URL') ??
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    if (!apiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY is not configured');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: this.buildSystemPrompt() }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: cleanHtml }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Gemini request failed: ${response.status} ${body}`);
      throw new BadGatewayException('Gemini selector extraction failed');
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const content = payload.candidates?.[0]?.content?.parts?.[0]?.text;

    return this.parseSelectorResponse(content);
  }

  private parseSelectorResponse(content: string | undefined): SelectorExtractionResult {
    if (!content) {
      throw new BadGatewayException('LLM did not return selector content');
    }

    const normalized = content.replace(/```json|```/g, '').trim();

    try {
      const parsed = JSON.parse(normalized) as Partial<SelectorExtractionResult>;
      return {
        selector: typeof parsed.selector === 'string' ? parsed.selector : '',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
        found: parsed.found === true,
      };
    } catch {
      this.logger.error(`Failed to parse selector JSON: ${normalized}`);
      throw new BadGatewayException('Invalid selector payload returned by LLM');
    }
  }

  private buildSystemPrompt(): string {
    return [
      'You extract the single best CSS selector that returns the product price from HTML.',
      'Respond with strict JSON only and no explanation.',
      'Use this exact schema: {"selector":"string","confidence":0.0,"found":true}.',
      'Prefer stable selectors using id or class names and avoid nth-child unless necessary.',
      'If no price selector can be identified, return {"selector":"","confidence":0,"found":false}.',
    ].join(' ');
  }
}
