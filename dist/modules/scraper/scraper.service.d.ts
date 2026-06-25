import { ConfigService } from '@nestjs/config';
import { FetchPageResult } from './interfaces/fetch-page-result.interface';
export declare class AntiBotBlockedError extends Error {
    readonly statusCode: number;
    readonly proxyUrl?: string | undefined;
    readonly blockType: string;
    constructor(message: string, statusCode: number, proxyUrl?: string | undefined, options?: {
        blockType?: string;
    });
}
export declare class ScraperService {
    private readonly configService;
    private readonly logger;
    private readonly cheerio;
    private readonly userAgents;
    constructor(configService: ConfigService);
    fetchHtml(url: string): Promise<FetchPageResult>;
    extractPriceFromHtml(html: string, selector: string): string;
    private assertNotBlocked;
    private detectBlockType;
    private toUpstreamFetchError;
    private extractStatusCode;
    private extractProxyUrl;
    private isDnsResolutionError;
    private isInvalidUrlError;
    private matchesErrorCode;
    private buildHeaders;
    private pickProxy;
    private pickUserAgent;
    private tryLoadGotScraping;
}
