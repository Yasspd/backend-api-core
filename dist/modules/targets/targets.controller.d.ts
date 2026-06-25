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
            price: import("@prisma/client/runtime/library").Decimal;
            checkedAt: Date;
            targetId: string;
        }[];
    } & {
        id: string;
        url: string;
        selector: string | null;
        targetPrice: import("@prisma/client/runtime/library").Decimal;
        currentPrice: import("@prisma/client/runtime/library").Decimal | null;
        status: import(".prisma/client").$Enums.TargetStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    listTargets(request: RequestWithUser): Promise<({
        priceHistory: {
            id: bigint;
            price: import("@prisma/client/runtime/library").Decimal;
            checkedAt: Date;
            targetId: string;
        }[];
    } & {
        id: string;
        url: string;
        selector: string | null;
        targetPrice: import("@prisma/client/runtime/library").Decimal;
        currentPrice: import("@prisma/client/runtime/library").Decimal | null;
        status: import(".prisma/client").$Enums.TargetStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    })[]>;
    submitFallbackHtml(request: RequestWithUser, targetId: string, dto: FallbackHtmlDto): Promise<{
        priceHistory: {
            id: bigint;
            price: import("@prisma/client/runtime/library").Decimal;
            checkedAt: Date;
            targetId: string;
        }[];
    } & {
        id: string;
        url: string;
        selector: string | null;
        targetPrice: import("@prisma/client/runtime/library").Decimal;
        currentPrice: import("@prisma/client/runtime/library").Decimal | null;
        status: import(".prisma/client").$Enums.TargetStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
}
