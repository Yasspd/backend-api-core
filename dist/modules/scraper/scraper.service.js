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
var ScraperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService = exports.AntiBotBlockedError = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const optional_package_util_1 = require("../common/utils/optional-package.util");
const price_util_1 = require("../common/utils/price.util");
class AntiBotBlockedError extends Error {
    statusCode;
    proxyUrl;
    blockType;
    constructor(message, statusCode, proxyUrl, options) {
        super(message);
        this.statusCode = statusCode;
        this.proxyUrl = proxyUrl;
        this.name = AntiBotBlockedError.name;
        this.blockType = options?.blockType ?? 'UPSTREAM_UNAVAILABLE';
    }
}
exports.AntiBotBlockedError = AntiBotBlockedError;
let ScraperService = ScraperService_1 = class ScraperService {
    configService;
    logger = new common_1.Logger(ScraperService_1.name);
    cheerio = (0, optional_package_util_1.loadOptionalPackage)('cheerio');
    userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    ];
    constructor(configService) {
        this.configService = configService;
    }
    async fetchHtml(url) {
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
        }
        catch (error) {
            if (error instanceof AntiBotBlockedError) {
                this.logger.warn(`[Scraper] Upstream returned status ${error.statusCode} for ${url} (${error.blockType}) via ${error.proxyUrl ?? proxyUrl ?? 'direct'}. Switching target to FALLBACK_REQUIRED.`);
                throw error;
            }
            const upstreamError = this.toUpstreamFetchError(proxyUrl, error);
            if (upstreamError) {
                this.logger.warn(`[Scraper] Upstream returned status ${upstreamError.statusCode} for ${url} (${upstreamError.blockType}) via ${upstreamError.proxyUrl ?? 'direct'}. Switching target to FALLBACK_REQUIRED.`);
                throw new AntiBotBlockedError(`Upstream returned status ${upstreamError.statusCode}`, upstreamError.statusCode, upstreamError.proxyUrl, {
                    blockType: upstreamError.blockType,
                });
            }
            if (this.isInvalidUrlError(error)) {
                const message = error instanceof Error ? error.message : 'Invalid target URL';
                this.logger.error(`[Scraper] Invalid target URL ${url}: ${message}`);
                throw new common_1.ServiceUnavailableException(`Failed to fetch target URL: ${message}`);
            }
            if (this.isDnsResolutionError(error)) {
                const message = error instanceof Error ? error.message : 'DNS lookup failed';
                this.logger.error(`[Scraper] DNS resolution failed for ${url}: ${message}`);
                throw new common_1.ServiceUnavailableException(`Failed to fetch target URL: ${message}`);
            }
            const message = error instanceof Error ? error.message : 'Unknown scraping error';
            this.logger.error(`[Scraper] Failed to fetch ${url}: ${message}`);
            throw new common_1.ServiceUnavailableException(`Failed to fetch target URL: ${message}`);
        }
    }
    extractPriceFromHtml(html, selector) {
        const $ = this.cheerio.load(html);
        const selection = $(selector);
        if (!selection.length) {
            throw new common_1.BadGatewayException(`Selector not found in HTML: ${selector}`);
        }
        const price = (0, price_util_1.normalizePrice)(selection.first().text() || selection.text());
        if (!price) {
            throw new common_1.BadGatewayException(`Unable to normalize price for selector: ${selector}`);
        }
        return price;
    }
    assertNotBlocked(statusCode, proxyUrl) {
        if (statusCode !== 200 && statusCode !== 201) {
            throw new AntiBotBlockedError(`Upstream returned status ${statusCode}`, statusCode, proxyUrl, {
                blockType: this.detectBlockType(statusCode),
            });
        }
    }
    detectBlockType(statusCode) {
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
    toUpstreamFetchError(proxyUrl, error) {
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
    extractStatusCode(error) {
        if (!error || typeof error !== 'object') {
            return null;
        }
        const candidates = [
            error.statusCode,
            error.status,
            error.response?.statusCode,
            error.response?.status,
            error.cause?.statusCode,
            error.cause?.status,
            error.cause?.response?.statusCode,
            error.cause?.response?.status,
        ];
        for (const candidate of candidates) {
            if (typeof candidate === 'number' && Number.isFinite(candidate)) {
                return candidate;
            }
        }
        return null;
    }
    extractProxyUrl(error) {
        if (!error || typeof error !== 'object') {
            return undefined;
        }
        const candidates = [
            error.options?.proxyUrl,
            error.request?.options?.proxyUrl,
            error.cause?.options?.proxyUrl,
        ];
        for (const candidate of candidates) {
            if (typeof candidate === 'string' && candidate.length > 0) {
                return candidate;
            }
        }
        return undefined;
    }
    isDnsResolutionError(error) {
        return this.matchesErrorCode(error, ['ENOTFOUND', 'EAI_AGAIN']);
    }
    isInvalidUrlError(error) {
        if (error instanceof TypeError && error.message.toLowerCase().includes('invalid url')) {
            return true;
        }
        return this.matchesErrorCode(error, ['ERR_INVALID_URL']);
    }
    matchesErrorCode(error, codes) {
        if (!error || typeof error !== 'object') {
            return false;
        }
        const candidates = [
            error.code,
            error.cause?.code,
        ];
        return candidates.some((candidate) => typeof candidate === 'string' && codes.includes(candidate));
    }
    buildHeaders(userAgent) {
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
            'x-stealth-ja3-profile': this.configService.get('SCRAPER_JA3_PROFILE') ?? 'chrome_137',
        };
    }
    pickProxy() {
        const proxyList = this.configService.get('PROXY_LIST');
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
    pickUserAgent() {
        const index = Math.floor(Math.random() * this.userAgents.length);
        return this.userAgents[index];
    }
    tryLoadGotScraping() {
        try {
            return (0, optional_package_util_1.loadOptionalPackage)('got-scraping');
        }
        catch {
            this.logger.warn('got-scraping is not installed, falling back to native fetch');
            return null;
        }
    }
};
exports.ScraperService = ScraperService;
exports.ScraperService = ScraperService = ScraperService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ScraperService);
//# sourceMappingURL=scraper.service.js.map