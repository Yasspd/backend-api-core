import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private readonly configService;
    private readonly logger;
    private readonly cheerio;
    constructor(configService: ConfigService);
    cleanHtml(rawHtml: string): string;
    extractSelector(cleanHtml: string): Promise<string>;
    private requestSelector;
    private callDeepSeek;
    private callGemini;
    private parseSelectorResponse;
    private buildSystemPrompt;
}
