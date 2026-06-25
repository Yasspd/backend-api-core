import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma, Target, TargetStatus } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { NotificationService } from '../notifications/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { AntiBotBlockedError, ScraperService } from '../scraper/scraper.service';
import { CreateTargetDto } from './dto/create-target.dto';
import { FallbackHtmlDto } from './dto/fallback-html.dto';
import { FallbackEventsService } from './fallback-events.service';

interface TargetWithUser extends Target {
  user: {
    id: string;
    email: string | null;
    deviceToken: string;
  };
}

@Injectable()
export class TargetsService {
  private readonly logger = new Logger(TargetsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly scraperService: ScraperService,
    private readonly aiService: AiService,
    private readonly notificationService: NotificationService,
    private readonly fallbackEventsService: FallbackEventsService,
  ) {}

  async createTarget(userId: string, dto: CreateTargetDto) {
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
          targetPrice: new Prisma.Decimal(dto.targetPrice.toFixed(2)),
          currentPrice: new Prisma.Decimal(currentPriceValue),
          status: TargetStatus.ACTIVE,
          priceHistory: {
            create: {
              price: new Prisma.Decimal(currentPriceValue),
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
    } catch (error) {
      if (error instanceof AntiBotBlockedError) {
        const target = await this.prismaService.target.create({
          data: {
            userId,
            url: dto.url,
            targetPrice: new Prisma.Decimal(dto.targetPrice.toFixed(2)),
            status: TargetStatus.FALLBACK_REQUIRED,
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

  async listTargets(userId: string) {
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

  async processFallbackHtml(userId: string, targetId: string, dto: FallbackHtmlDto) {
    const target = await this.findOwnedTarget(userId, targetId);
    const selector = target.selector ?? (await this.resolveSelectorFromFallbackHtml(dto.html));
    const extractedPrice = this.scraperService.extractPriceFromHtml(dto.html, selector);

    return this.prismaService.target.update({
      where: { id: target.id },
      data: {
        selector,
        currentPrice: new Prisma.Decimal(extractedPrice),
        status: TargetStatus.ACTIVE,
        priceHistory: {
          create: {
            price: new Prisma.Decimal(extractedPrice),
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

  async refreshActiveTargets(): Promise<void> {
    const targets = await this.prismaService.target.findMany({
      where: { status: TargetStatus.ACTIVE },
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

  private async refreshSingleTarget(target: TargetWithUser): Promise<void> {
    if (!target.selector) {
      await this.markFailed(target.id, 'Target selector is missing');
      return;
    }

    try {
      const fetchResult = await this.scraperService.fetchHtml(target.url);
      const extractedPrice = this.scraperService.extractPriceFromHtml(fetchResult.html, target.selector);
      const updatedTarget = await this.updatePriceAndHistory(target.id, extractedPrice, TargetStatus.ACTIVE);
      const currentPrice = updatedTarget.currentPrice;

      const shouldNotify =
        currentPrice !== null &&
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
    } catch (error) {
      if (error instanceof AntiBotBlockedError) {
        await this.markFallbackRequired(target, error);
        return;
      }

      const message = error instanceof Error ? error.message : 'Unknown target refresh error';
      this.logger.error(`Target refresh failed for ${target.id}: ${message}`);
      await this.markFailed(target.id, message);
    }
  }

  private async updatePriceAndHistory(targetId: string, price: string, status: TargetStatus) {
    return this.prismaService.target.update({
      where: { id: targetId },
      data: {
        currentPrice: new Prisma.Decimal(price),
        status,
        priceHistory: {
          create: {
            price: new Prisma.Decimal(price),
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

  private async resolveSelectorFromFallbackHtml(html: string): Promise<string> {
    const cleanedHtml = this.aiService.cleanHtml(html);
    return this.aiService.extractSelector(cleanedHtml);
  }

  private async markFallbackRequired(
    target: Pick<Target, 'id' | 'userId' | 'url'>,
    error: AntiBotBlockedError,
  ): Promise<void> {
    await this.prismaService.target.update({
      where: { id: target.id },
      data: {
        status: TargetStatus.FALLBACK_REQUIRED,
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

  private async markFailed(targetId: string, reason: string): Promise<void> {
    this.logger.warn(`Marking target ${targetId} as failed: ${reason}`);
    await this.prismaService.target.update({
      where: { id: targetId },
      data: {
        status: TargetStatus.FAILED,
      },
    });
  }

  private async findOwnedTarget(userId: string, targetId: string): Promise<Target> {
    const target = await this.prismaService.target.findFirst({
      where: {
        id: targetId,
        userId,
      },
    });

    if (!target) {
      throw new NotFoundException('Target not found');
    }

    return target;
  }
}
