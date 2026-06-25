import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { loadOptionalPackage } from '../common/utils/optional-package.util';
import { normalizePrice } from '../common/utils/price.util';
import { FetchPageResult } from './interfaces/fetch-page-result.interface';
import { GotScrapingModule } from './interfaces/got-scraping.interface';

interface CheerioSelection {
  first(): { text(): string };
  text(): string;
  length: number;
}

interface CheerioDocument {
  (selector: string): CheerioSelection;
}

interface CheerioApi {
  load(markup: string): CheerioDocument;
}

export class AntiBotBlockedError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly proxyUrl?: string,
  ) {
    super(message);
  }
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private readonly cheerio = loadOptionalPackage<CheerioApi>('cheerio');
  private readonly userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
  ];

  constructor(private readonly configService: ConfigService) {}

  async fetchHtml(url: string): Promise<FetchPageResult> {
    const proxyUrl = this.pickProxy();
    const userAgent = this.pickUserAgent();

    try {
      const gotScrapingModule = this.tryLoadGotScraping();
      if (gotScrapingModule) {
        const client = gotScrapingModule.gotScraping.extend({
          http2: true,
          proxyUrl,
          headers: this.buildHeaders(userAgent),
          https: {
            rejectUnauthorized: true,
          },
          retry: {
            limit: 0,
          },
        });

        const response = await client.get(url, {
          timeout: {
            request: 20000,
          },
        });

        this.assertNotBlocked(response.statusCode, proxyUrl);

        return {
          html: response.body,
          statusCode: response.statusCode,
          userAgent,
          proxyUrl,
        };
      }

      const response = await fetch(url, {
        headers: this.buildHeaders(userAgent),
      });

      this.assertNotBlocked(response.status, proxyUrl);

      return {
        html: await response.text(),
        statusCode: response.status,
        userAgent,
        proxyUrl,
      };
    } catch (error) {
      if (error instanceof AntiBotBlockedError) {
        this.logger.warn(`Anti-bot block detected for ${url} via ${proxyUrl ?? 'direct'} (${error.statusCode})`);
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown scraping error';
      this.logger.error(`Failed to fetch ${url}: ${message}`);
      throw new ServiceUnavailableException(`Failed to fetch target URL: ${message}`);
    }
  }

  extractPriceFromHtml(html: string, selector: string): string {
    const $ = this.cheerio.load(html);
    const selection = $(selector);

    if (!selection.length) {
      throw new BadGatewayException(`Selector not found in HTML: ${selector}`);
    }

    const price = normalizePrice(selection.first().text() || selection.text());
    if (!price) {
      throw new BadGatewayException(`Unable to normalize price for selector: ${selector}`);
    }

    return price;
  }

  private assertNotBlocked(statusCode: number, proxyUrl?: string): void {
    if (statusCode === 403 || statusCode === 407) {
      throw new AntiBotBlockedError('Anti-bot protection blocked the request', statusCode, proxyUrl);
    }

    if (statusCode >= 400) {
      throw new ServiceUnavailableException(`Unexpected upstream status code: ${statusCode}`);
    }
  }

  private buildHeaders(userAgent: string): Record<string, string> {
    return {
      'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
      'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="137", "Google Chrome";v="137"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'upgrade-insecure-requests': '1',
      'user-agent': userAgent,
      'x-stealth-ja3-profile': this.configService.get<string>('SCRAPER_JA3_PROFILE') ?? 'chrome_137',
    };
  }

  private pickProxy(): string | undefined {
    const proxyList = this.configService.get<string>('PROXY_LIST');
    if (!proxyList) {
      return undefined;
    }

    const proxies = proxyList
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);

    if (!proxies.length) {
      return undefined;
    }

    const index = Math.floor(Math.random() * proxies.length);
    return proxies[index];
  }

  private pickUserAgent(): string {
    const index = Math.floor(Math.random() * this.userAgents.length);
    return this.userAgents[index];
  }

  private tryLoadGotScraping(): GotScrapingModule | null {
    try {
      return loadOptionalPackage<GotScrapingModule>('got-scraping');
    } catch {
      this.logger.warn('got-scraping is not installed, falling back to native fetch');
      return null;
    }
  }
}
