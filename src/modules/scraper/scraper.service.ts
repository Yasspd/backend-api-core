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

interface UpstreamFetchErrorContext {
  statusCode: number;
  blockType: string;
  proxyUrl?: string;
}

export class AntiBotBlockedError extends Error {
  readonly blockType: string;

  constructor(
    readonly message: string,
    readonly statusCode: number,
    readonly proxyUrl?: string,
    options?: { blockType?: string },
  ) {
    super(message);
    this.name = AntiBotBlockedError.name;
    this.blockType = options?.blockType ?? 'UPSTREAM_UNAVAILABLE';
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
    const wbRegex = /wildberries\.ru\/catalog\/(\d+)\/detail(?:\.aspx)?/i;
    const match = url.match(wbRegex);

    if (match) {
      const itemId = match[1];
      const apiUrl = `https://card.wb.ru/cards/v1/detail?appType=1&curr=rub&dest=-1257786&nm=${itemId}`;
      const proxyUrl = this.pickProxy();
      const userAgent = this.pickUserAgent();

      try {
        const gotScrapingModule = this.tryLoadGotScraping();
        if (gotScrapingModule) {
          const client = gotScrapingModule.gotScraping.extend({
            http2: true,
            proxyUrl,
            headers: {
              ...this.buildHeaders(userAgent),
              accept: 'application/json, text/plain, */*',
            },
            https: {
              rejectUnauthorized: true,
            },
            throwHttpErrors: false,
            retry: {
              limit: 0,
            },
          });

          const response = await client.get(apiUrl, {
            timeout: {
              request: 20000,
            },
          });

          this.assertNotBlocked(response.statusCode, proxyUrl);

          const payload = JSON.parse(response.body) as {
            data?: {
              products?: Array<{ salePriceU?: number }>;
            };
          };
          const salePriceU = payload.data?.products?.[0]?.salePriceU;
          if (typeof salePriceU !== 'number') {
            throw new ServiceUnavailableException('Failed to fetch Wildberries price');
          }

          const price = (salePriceU / 100).toString();
          return {
            html: price,
            directPrice: price,
          };
        }

        const response = await fetch(apiUrl, {
          headers: {
            ...this.buildHeaders(userAgent),
            accept: 'application/json, text/plain, */*',
          },
        });

        this.assertNotBlocked(response.status, proxyUrl);

        const payload = (await response.json()) as {
          data?: {
            products?: Array<{ salePriceU?: number }>;
          };
        };
        const salePriceU = payload.data?.products?.[0]?.salePriceU;
        if (typeof salePriceU !== 'number') {
          throw new ServiceUnavailableException('Failed to fetch Wildberries price');
        }

        const price = (salePriceU / 100).toString();
        return {
          html: price,
          directPrice: price,
        };
      } catch (error) {
        if (error instanceof AntiBotBlockedError) {
          this.logger.warn(
            `[Scraper] Upstream returned status ${error.statusCode} for ${url} (${error.blockType}) via ${error.proxyUrl ?? proxyUrl ?? 'direct'}. Switching target to FALLBACK_REQUIRED.`,
          );
          throw error;
        }

        const upstreamError = this.toUpstreamFetchError(proxyUrl, error);
        if (upstreamError) {
          this.logger.warn(
            `[Scraper] Upstream returned status ${upstreamError.statusCode} for ${url} (${upstreamError.blockType}) via ${upstreamError.proxyUrl ?? 'direct'}. Switching target to FALLBACK_REQUIRED.`,
          );
          throw new AntiBotBlockedError(
            `Upstream returned status ${upstreamError.statusCode}`,
            upstreamError.statusCode,
            upstreamError.proxyUrl,
            {
              blockType: upstreamError.blockType,
            },
          );
        }

        if (this.isInvalidUrlError(error)) {
          const message = error instanceof Error ? error.message : 'Invalid target URL';
          this.logger.error(`[Scraper] Invalid target URL ${url}: ${message}`);
          throw new ServiceUnavailableException(`Failed to fetch target URL: ${message}`);
        }

        if (this.isDnsResolutionError(error)) {
          const message = error instanceof Error ? error.message : 'DNS lookup failed';
          this.logger.error(`[Scraper] DNS resolution failed for ${url}: ${message}`);
          throw new ServiceUnavailableException(`Failed to fetch target URL: ${message}`);
        }

        const message = error instanceof Error ? error.message : 'Unknown scraping error';
        this.logger.error(`[Scraper] Failed to fetch ${url}: ${message}`);
        throw new ServiceUnavailableException(`Failed to fetch target URL: ${message}`);
      }
    }

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
          throwHttpErrors: false,
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
        };
      }

      const response = await fetch(url, {
        headers: this.buildHeaders(userAgent),
      });

      this.assertNotBlocked(response.status, proxyUrl);

      return {
        html: await response.text(),
      };
    } catch (error) {
      if (error instanceof AntiBotBlockedError) {
        this.logger.warn(
          `[Scraper] Upstream returned status ${error.statusCode} for ${url} (${error.blockType}) via ${error.proxyUrl ?? proxyUrl ?? 'direct'}. Switching target to FALLBACK_REQUIRED.`,
        );
        throw error;
      }

      const upstreamError = this.toUpstreamFetchError(proxyUrl, error);
      if (upstreamError) {
        this.logger.warn(
          `[Scraper] Upstream returned status ${upstreamError.statusCode} for ${url} (${upstreamError.blockType}) via ${upstreamError.proxyUrl ?? 'direct'}. Switching target to FALLBACK_REQUIRED.`,
        );
        throw new AntiBotBlockedError(
          `Upstream returned status ${upstreamError.statusCode}`,
          upstreamError.statusCode,
          upstreamError.proxyUrl,
          {
            blockType: upstreamError.blockType,
          },
        );
      }

      if (this.isInvalidUrlError(error)) {
        const message = error instanceof Error ? error.message : 'Invalid target URL';
        this.logger.error(`[Scraper] Invalid target URL ${url}: ${message}`);
        throw new ServiceUnavailableException(`Failed to fetch target URL: ${message}`);
      }

      if (this.isDnsResolutionError(error)) {
        const message = error instanceof Error ? error.message : 'DNS lookup failed';
        this.logger.error(`[Scraper] DNS resolution failed for ${url}: ${message}`);
        throw new ServiceUnavailableException(`Failed to fetch target URL: ${message}`);
      }

      const message = error instanceof Error ? error.message : 'Unknown scraping error';
      this.logger.error(`[Scraper] Failed to fetch ${url}: ${message}`);
      throw new ServiceUnavailableException(`Failed to fetch target URL: ${message}`);
    }
  }

  extractPriceFromHtml(html: string, selector: string): string {
    if (selector === 'DIRECT_API') {
      return html;
    }
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
    if (statusCode !== 200 && statusCode !== 201) {
      throw new AntiBotBlockedError(
        `Upstream returned status ${statusCode}`,
        statusCode,
        proxyUrl,
        {
          blockType: this.detectBlockType(statusCode),
        },
      );
    }
  }

  private detectBlockType(statusCode: number): string {
    if (statusCode === 403 || statusCode === 407 || statusCode === 498) {
      return 'ACCESS_BLOCKED';
    }

    if (statusCode === 429) {
      return 'RATE_LIMITED';
    }

    if (statusCode >= 500 && statusCode <= 599) {
      return 'UPSTREAM_SERVER_ERROR';
    }

    return 'UPSTREAM_UNAVAILABLE';
  }

  private toUpstreamFetchError(
    proxyUrl: string | undefined,
    error: unknown,
  ): UpstreamFetchErrorContext | null {
    const statusCode = this.extractStatusCode(error);
    if (statusCode === null) {
      return null;
    }

    return {
      statusCode,
      blockType: this.detectBlockType(statusCode),
      proxyUrl: this.extractProxyUrl(error) ?? proxyUrl,
    };
  }

  private extractStatusCode(error: unknown): number | null {
    if (!error || typeof error !== 'object') {
      return null;
    }

    const candidates = [
      (error as { statusCode?: unknown }).statusCode,
      (error as { status?: unknown }).status,
      (error as { response?: { statusCode?: unknown; status?: unknown } }).response?.statusCode,
      (error as { response?: { statusCode?: unknown; status?: unknown } }).response?.status,
      (error as { cause?: { statusCode?: unknown; status?: unknown } }).cause?.statusCode,
      (error as { cause?: { statusCode?: unknown; status?: unknown } }).cause?.status,
      (error as { cause?: { response?: { statusCode?: unknown; status?: unknown } } }).cause?.response?.statusCode,
      (error as { cause?: { response?: { statusCode?: unknown; status?: unknown } } }).cause?.response?.status,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  private extractProxyUrl(error: unknown): string | undefined {
    if (!error || typeof error !== 'object') {
      return undefined;
    }

    const candidates = [
      (error as { options?: { proxyUrl?: unknown } }).options?.proxyUrl,
      (error as { request?: { options?: { proxyUrl?: unknown } } }).request?.options?.proxyUrl,
      (error as { cause?: { options?: { proxyUrl?: unknown } } }).cause?.options?.proxyUrl,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.length > 0) {
        return candidate;
      }
    }

    return undefined;
  }

  private isDnsResolutionError(error: unknown): boolean {
    return this.matchesErrorCode(error, ['ENOTFOUND', 'EAI_AGAIN']);
  }

  private isInvalidUrlError(error: unknown): boolean {
    if (error instanceof TypeError && error.message.toLowerCase().includes('invalid url')) {
      return true;
    }

    return this.matchesErrorCode(error, ['ERR_INVALID_URL']);
  }

  private matchesErrorCode(error: unknown, codes: string[]): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const candidates = [
      (error as { code?: unknown }).code,
      (error as { cause?: { code?: unknown } }).cause?.code,
    ];

    return candidates.some((candidate) => typeof candidate === 'string' && codes.includes(candidate));
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
