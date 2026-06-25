import { Prisma } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { NotificationService } from '../notifications/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScraperService } from '../scraper/scraper.service';
import { CreateTargetDto } from './dto/create-target.dto';
import { FallbackHtmlDto } from './dto/fallback-html.dto';
import { FallbackEventsService } from './fallback-events.service';
export declare class TargetsService {
    private readonly prismaService;
    private readonly scraperService;
    private readonly aiService;
    private readonly notificationService;
    private readonly fallbackEventsService;
    private readonly logger;
    constructor(prismaService: PrismaService, scraperService: ScraperService, aiService: AiService, notificationService: NotificationService, fallbackEventsService: FallbackEventsService);
    createTarget(userId: string, dto: CreateTargetDto): Promise<{
        priceHistory: {
            id: bigint;
            price: Prisma.Decimal;
            checkedAt: Date;
            targetId: string;
        }[];
    } & {
        selector: string | null;
        id: string;
        url: string;
        createdAt: Date;
        updatedAt: Date;
        targetPrice: Prisma.Decimal;
        userId: string;
        currentPrice: Prisma.Decimal | null;
        status: import(".prisma/client").$Enums.TargetStatus;
    }>;
    listTargets(userId: string): Promise<({
        priceHistory: {
            id: bigint;
            price: Prisma.Decimal;
            checkedAt: Date;
            targetId: string;
        }[];
    } & {
        selector: string | null;
        id: string;
        url: string;
        createdAt: Date;
        updatedAt: Date;
        targetPrice: Prisma.Decimal;
        userId: string;
        currentPrice: Prisma.Decimal | null;
        status: import(".prisma/client").$Enums.TargetStatus;
    })[]>;
    processFallbackHtml(userId: string, targetId: string, dto: FallbackHtmlDto): Promise<{
        priceHistory: {
            id: bigint;
            price: Prisma.Decimal;
            checkedAt: Date;
            targetId: string;
        }[];
    } & {
        selector: string | null;
        id: string;
        url: string;
        createdAt: Date;
        updatedAt: Date;
        targetPrice: Prisma.Decimal;
        userId: string;
        currentPrice: Prisma.Decimal | null;
        status: import(".prisma/client").$Enums.TargetStatus;
    }>;
    refreshActiveTargets(): Promise<void>;
    private refreshSingleTarget;
    private updatePriceAndHistory;
    private resolveSelectorFromFallbackHtml;
    private markFallbackRequired;
    private createFallbackTarget;
    private markFailed;
    private findOwnedTarget;
}
