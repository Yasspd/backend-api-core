"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const optional_package_util_1 = require("../common/utils/optional-package.util");
let AiService = AiService_1 = class AiService {
    configService;
    logger = new common_1.Logger(AiService_1.name);
    cheerio = (0, optional_package_util_1.loadOptionalPackage)('cheerio');
    constructor(configService) {
        this.configService = configService;
    }
    cleanHtml(rawHtml) {
        const $ = this.cheerio.load(rawHtml);
        $('script, style, svg, noscript, header, footer').remove();
        $('*').each((_, element) => {
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
    async extractSelector(cleanHtml) {
        const response = await this.requestSelector(cleanHtml);
        if (!response.found || !response.selector) {
            throw new common_1.BadGatewayException('AI selector extraction failed to identify a selector');
        }
        return response.selector;
    }
    async requestSelector(cleanHtml) {
        const provider = this.configService.get('LLM_PROVIDER')?.toLowerCase() ?? 'deepseek';
        if (provider === 'gemini') {
            return this.callGemini(cleanHtml);
        }
        return this.callDeepSeek(cleanHtml);
    }
    async callDeepSeek(cleanHtml) {
        const apiKey = this.configService.get('DEEPSEEK_API_KEY');
        const endpoint = this.configService.get('DEEPSEEK_API_URL') ?? 'https://api.deepseek.com/chat/completions';
        const model = this.configService.get('DEEPSEEK_MODEL') ?? 'deepseek-chat';
        if (!apiKey) {
            throw new common_1.InternalServerErrorException('DEEPSEEK_API_KEY is not configured');
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
            throw new common_1.BadGatewayException('DeepSeek selector extraction failed');
        }
        const payload = (await response.json());
        const content = payload.choices?.[0]?.message?.content;
        return this.parseSelectorResponse(content);
    }
    async callGemini(cleanHtml) {
        const apiKey = this.configService.get('GEMINI_API_KEY');
        const model = this.configService.get('GEMINI_MODEL') ?? 'gemini-1.5-flash';
        const endpoint = this.configService.get('GEMINI_API_URL') ??
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        if (!apiKey) {
            throw new common_1.InternalServerErrorException('GEMINI_API_KEY is not configured');
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
            throw new common_1.BadGatewayException('Gemini selector extraction failed');
        }
        const payload = (await response.json());
        const content = payload.candidates?.[0]?.content?.parts?.[0]?.text;
        return this.parseSelectorResponse(content);
    }
    parseSelectorResponse(content) {
        if (!content) {
            throw new common_1.BadGatewayException('LLM did not return selector content');
        }
        const normalized = content.replace(/```json|```/g, '').trim();
        try {
            const parsed = JSON.parse(normalized);
            return {
                selector: typeof parsed.selector === 'string' ? parsed.selector : '',
                confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
                found: parsed.found === true,
            };
        }
        catch {
            this.logger.error(`Failed to parse selector JSON: ${normalized}`);
            throw new common_1.BadGatewayException('Invalid selector payload returned by LLM');
        }
    }
    buildSystemPrompt() {
        return [
            'You extract the single best CSS selector that returns the product price from HTML.',
            'Respond with strict JSON only and no explanation.',
            'Use this exact schema: {"selector":"string","confidence":0.0,"found":true}.',
            'Prefer stable selectors using id or class names and avoid nth-child unless necessary.',
            'If no price selector can be identified, return {"selector":"","confidence":0,"found":false}.',
        ].join(' ');
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map