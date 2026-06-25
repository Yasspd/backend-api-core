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
var TargetsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const ai_service_1 = require("../ai/ai.service");
const notification_service_1 = require("../notifications/notification.service");
const prisma_service_1 = require("../prisma/prisma.service");
const scraper_service_1 = require("../scraper/scraper.service");
const fallback_events_service_1 = require("./fallback-events.service");
let TargetsService = TargetsService_1 = class TargetsService {
    prismaService;
    scraperService;
    aiService;
    notificationService;
    fallbackEventsService;
    logger = new common_1.Logger(TargetsService_1.name);
    constructor(prismaService, scraperService, aiService, notificationService, fallbackEventsService) {
        this.prismaService = prismaService;
        this.scraperService = scraperService;
        this.aiService = aiService;
        this.notificationService = notificationService;
        this.fallbackEventsService = fallbackEventsService;
    }
    async createTarget(userId, dto) {
        try {
            const fetchResult = await this.scraperService.fetchHtml(dto.url);
            const cleanedHtml = this.aiService.cleanHtml(fetchResult.html);
            const selector = await this.aiService.extractSelector(cleanedHtml);
            const currentPriceValue = this.scraperService.extractPriceFromHtml(fetchResult.html, selector);
            return this.prismaService.target.create({
                data: {
                    userId,
                    url: dto.url,
                    selector,
                    targetPrice: new client_1.Prisma.Decimal(dto.targetPrice.toFixed(2)),
                    currentPrice: new client_1.Prisma.Decimal(currentPriceValue),
                    status: client_1.TargetStatus.ACTIVE,
                    priceHistory: {
                        create: {
                            price: new client_1.Prisma.Decimal(currentPriceValue),
                        },
                    },
                },
                include: {
                    priceHistory: {
                        orderBy: { checkedAt: 'desc' },
                        take: 10,
                    },
                },
            });
        }
        catch (error) {
            if (error instanceof scraper_service_1.AntiBotBlockedError) {
                const target = await this.prismaService.target.create({
                    data: {
                        userId,
                        url: dto.url,
                        targetPrice: new client_1.Prisma.Decimal(dto.targetPrice.toFixed(2)),
                        status: client_1.TargetStatus.FALLBACK_REQUIRED,
                    },
                    include: {
                        priceHistory: {
                            orderBy: { checkedAt: 'desc' },
                            take: 10,
                        },
                    },
                });
                this.fallbackEventsService.emitFallbackRequired({
                    targetId: target.id,
                    userId: target.userId,
                    url: target.url,
                    reason: error.message,
                    requiredAt: new Date(),
                });
                return target;
            }
            throw error;
        }
    }
    async listTargets(userId) {
        return this.prismaService.target.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                priceHistory: {
                    orderBy: { checkedAt: 'desc' },
                    take: 20,
                },
            },
        });
    }
    async processFallbackHtml(userId, targetId, dto) {
        const target = await this.findOwnedTarget(userId, targetId);
        const selector = target.selector ?? (await this.resolveSelectorFromFallbackHtml(dto.html));
        const extractedPrice = this.scraperService.extractPriceFromHtml(dto.html, selector);
        return this.prismaService.target.update({
            where: { id: target.id },
            data: {
                selector,
                currentPrice: new client_1.Prisma.Decimal(extractedPrice),
                status: client_1.TargetStatus.ACTIVE,
                priceHistory: {
                    create: {
                        price: new client_1.Prisma.Decimal(extractedPrice),
                    },
                },
            },
            include: {
                priceHistory: {
                    orderBy: { checkedAt: 'desc' },
                    take: 10,
                },
            },
        });
    }
    async refreshActiveTargets() {
        const targets = await this.prismaService.target.findMany({
            where: { status: client_1.TargetStatus.ACTIVE },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        deviceToken: true,
                    },
                },
            },
        });
        for (const target of targets) {
            await this.refreshSingleTarget(target);
        }
    }
    async refreshSingleTarget(target) {
        if (!target.selector) {
            await this.markFailed(target.id, 'Target selector is missing');
            return;
        }
        try {
            const fetchResult = await this.scraperService.fetchHtml(target.url);
            const extractedPrice = this.scraperService.extractPriceFromHtml(fetchResult.html, target.selector);
            const updatedTarget = await this.updatePriceAndHistory(target.id, extractedPrice, client_1.TargetStatus.ACTIVE);
            const currentPrice = updatedTarget.currentPrice;
            const shouldNotify = currentPrice !== null &&
                currentPrice.lessThanOrEqualTo(target.targetPrice) &&
                (target.currentPrice === null || !target.currentPrice.equals(currentPrice));
            if (shouldNotify) {
                await this.notificationService.notifyPriceDrop({
                    user: target.user,
                    url: updatedTarget.url,
                    currentPrice: currentPrice.toString(),
                    targetPrice: updatedTarget.targetPrice.toString(),
                });
            }
        }
        catch (error) {
            if (error instanceof scraper_service_1.AntiBotBlockedError) {
                await this.markFallbackRequired(target, error);
                return;
            }
            const message = error instanceof Error ? error.message : 'Unknown target refresh error';
            this.logger.error(`Target refresh failed for ${target.id}: ${message}`);
            await this.markFailed(target.id, message);
        }
    }
    async updatePriceAndHistory(targetId, price, status) {
        return this.prismaService.target.update({
            where: { id: targetId },
            data: {
                currentPrice: new client_1.Prisma.Decimal(price),
                status,
                priceHistory: {
                    create: {
                        price: new client_1.Prisma.Decimal(price),
                    },
                },
            },
            include: {
                priceHistory: {
                    orderBy: { checkedAt: 'desc' },
                    take: 10,
                },
            },
        });
    }
    async resolveSelectorFromFallbackHtml(html) {
        const cleanedHtml = this.aiService.cleanHtml(html);
        return this.aiService.extractSelector(cleanedHtml);
    }
    async markFallbackRequired(target, error) {
        await this.prismaService.target.update({
            where: { id: target.id },
            data: {
                status: client_1.TargetStatus.FALLBACK_REQUIRED,
            },
        });
        this.fallbackEventsService.emitFallbackRequired({
            targetId: target.id,
            userId: target.userId,
            url: target.url,
            reason: error.message,
            requiredAt: new Date(),
        });
    }
    async markFailed(targetId, reason) {
        this.logger.warn(`Marking target ${targetId} as failed: ${reason}`);
        await this.prismaService.target.update({
            where: { id: targetId },
            data: {
                status: client_1.TargetStatus.FAILED,
            },
        });
    }
    async findOwnedTarget(userId, targetId) {
        const target = await this.prismaService.target.findFirst({
            where: {
                id: targetId,
                userId,
            },
        });
        if (!target) {
            throw new common_1.NotFoundException('Target not found');
        }
        return target;
    }
};
exports.TargetsService = TargetsService;
exports.TargetsService = TargetsService = TargetsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        scraper_service_1.ScraperService,
        ai_service_1.AiService,
        notification_service_1.NotificationService,
        fallback_events_service_1.FallbackEventsService])
], TargetsService);
//# sourceMappingURL=targets.service.js.map