import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { CreateTargetDto } from './dto/create-target.dto';
import { FallbackHtmlDto } from './dto/fallback-html.dto';
import { TargetsService } from './targets.service';
export declare class TargetsController {
    private readonly targetsService;
    constructor(targetsService: TargetsService);
    createTarget(request: RequestWithUser, dto: CreateTargetDto): Promise<{
        priceHistory: {
            id: bigint;
            price: import("@prisma/client-runtime-utils").Decimal;
            checkedAt: Date;
            targetId: string;
        }[];
    } & {
        selector: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        targetPrice: import("@prisma/client-runtime-utils").Decimal;
        userId: string;
        currentPrice: import("@prisma/client-runtime-utils").Decimal | null;
        status: import(".prisma/client").$Enums.TargetStatus;
    }>;
    listTargets(request: RequestWithUser): Promise<({
        priceHistory: {
            id: bigint;
            price: import("@prisma/client-runtime-utils").Decimal;
            checkedAt: Date;
            targetId: string;
        }[];
    } & {
        selector: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        targetPrice: import("@prisma/client-runtime-utils").Decimal;
        userId: string;
        currentPrice: import("@prisma/client-runtime-utils").Decimal | null;
        status: import(".prisma/client").$Enums.TargetStatus;
    })[]>;
    submitFallbackHtml(request: RequestWithUser, targetId: string, dto: FallbackHtmlDto): Promise<{
        priceHistory: {
            id: bigint;
            price: import("@prisma/client-runtime-utils").Decimal;
            checkedAt: Date;
            targetId: string;
        }[];
    } & {
        selector: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        targetPrice: import("@prisma/client-runtime-utils").Decimal;
        userId: string;
        currentPrice: import("@prisma/client-runtime-utils").Decimal | null;
        status: import(".prisma/client").$Enums.TargetStatus;
    }>;
}
