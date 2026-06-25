export interface GotScrapingClient {
    get(url: string, options?: Record<string, unknown>): Promise<{
        body: string;
        statusCode: number;
        headers: Record<string, string | string[] | undefined>;
    }>;
}
export interface GotScrapingModule {
    gotScraping: {
        extend(options: Record<string, unknown>): GotScrapingClient;
    };
}
