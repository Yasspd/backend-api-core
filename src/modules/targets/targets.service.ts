import {
  Injectable,
  Logger,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma, Target, TargetStatus } from '@prisma/client';
import * as cheerio from 'cheerio';
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
      
      let selector: string | null = null;
      let currentPriceValue: string;

      // Контур А: Оптимизированный прямой проход (для Wildberries API)
      if (fetchResult.directPrice) {
        selector = 'DIRECT_API';
        currentPriceValue = fetchResult.directPrice;
      } else {
        // Контур Б: Обычные сайты с использованием ИИ
        const cleanedHtml = this.aiService.cleanHtml(fetchResult.html);
        selector = await this.aiService.extractSelector(cleanedHtml);
        currentPriceValue = this.scraperService.extractPriceFromHtml(fetchResult.html, selector);
      }

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
        return this.createFallbackTarget(userId, dto, error);
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
    try {
      this.logger.log(`[Fallback] Начинаем обработку фолбэк HTML для цели ${targetId}`);
      if (!dto || !dto.html) {
        throw new HttpException('HTML-содержимое пустое или отсутствует', HttpStatus.BAD_REQUEST);
      }
      this.logger.log(`[Fallback] Длина полученного HTML: ${dto.html.length} символов`);
      
      const target = await this.findOwnedTarget(userId, targetId);
      this.logger.log(`[Fallback] Цель найдена в БД. Домен: ${target.url}`);

      let selector = target.selector;
      let extractedPrice: string | null = null;

      // 1. Попытка применить уже кэшированный селектор из БД
      if (selector) {
        try {
          this.logger.log(`[Fallback] Пробуем применить кэшированный селектор из БД: "${selector}"`);
          extractedPrice = this.scraperService.extractPriceFromHtml(dto.html, selector);
          this.logger.log(`[Fallback] Успешно извлечена цена по кэшированному селектору: "${extractedPrice}"`);
        } catch (error) {
          this.logger.warn(
            `[Fallback] Сохраненный селектор "${selector}" сломался. Запускаем переопределение...`
          );
          selector = null; // Сбрасываем, чтобы подобрать заново
        }
      }

      // 2. Умный локальный резолвер селекторов для известных сайтов (В обход ИИ!)
      if (!selector) {
        this.logger.log(`[Fallback] Селектор пуст. Запускаем локальный эвристический сканер селекторов...`);
        
        if (target.url.includes('wildberries.ru')) {
          const knownWbSelectors = [
            '.price-block__wallet-price',
            '.price-block__final-price',
            '.price-block__price',
            '.price-block__count',
            '.price-block__wallet-price-red',
            'span[class*="wallet-price"]',
            'span[class*="final-price"]',
            'span[class*="price-block__price"]',
            '.priceBlockWalletPrice--RJGuT' // Реальный обфусцированный селектор у пользователя
          ];

          const $ = cheerio.load(dto.html);
          for (const sel of knownWbSelectors) {
            const text = $(sel).text();
            // Если тег найден и содержит хотя бы одну цифру (цену)
            if (text && /\d/.test(text)) {
              selector = sel;
              this.logger.log(`[Fallback] Локальный сканер успешно определил селектор WB без запроса к ИИ: "${selector}"`);
              break;
            }
          }
        }
      }

      // 3. Если локальный резолвер не справился (другой сайт) — задействуем нейросеть
      if (!selector) {
        this.logger.log(`[Fallback] Локальные правила не подошли. Запускаем ИИ для анализа верстки...`);
        try {
          selector = await this.resolveSelectorFromFallbackHtml(dto.html);
          this.logger.log(`[Fallback] ИИ успешно определил селектор: "${selector}"`);
        } catch (aiError) {
          this.logger.error(`[Fallback] Ошибка ИИ-сервиса (AiService): ${(aiError as Error).message}`, (aiError as Error).stack);
          throw new Error(`Не удалось определить селектор цены через ИИ: ${(aiError as Error).message}`);
        }
      }

      // 4. Извлекаем цену
      if (!extractedPrice) {
        try {
          extractedPrice = this.scraperService.extractPriceFromHtml(dto.html, selector);
        } catch (parseError) {
          throw new Error(`Селектор "${selector}" найден, но извлечь по нему цену не удалось: ${(parseError as Error).message}`);
        }
      }

      // Очищаем цену перед вставкой в Prisma Decimal
      const cleanPriceStr = extractedPrice.replace(/[^\d.]/g, '');
      if (!cleanPriceStr || isNaN(Number(cleanPriceStr))) {
        throw new Error(`Извлеченная цена "${extractedPrice}" не приводится к числовому формату`);
      }

      // 5. Сохраняем изменения в базу данных
      this.logger.log(`[Fallback] Сохраняем обновленные данные в PostgreSQL. Цена: ${cleanPriceStr} ₽`);
      const updatedTarget = await this.prismaService.target.update({
        where: { id: target.id },
        data: {
          selector,
          currentPrice: new Prisma.Decimal(cleanPriceStr),
          status: TargetStatus.ACTIVE,
          priceHistory: {
            create: {
              price: new Prisma.Decimal(cleanPriceStr),
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

      this.logger.log(`[Fallback] База данных успешно обновлена! Цель переведена в статус ACTIVE.`);
      return updatedTarget;

    } catch (error) {
      this.logger.error(`[Fallback] Критический сбой при обработке фолбэка: ${(error as Error).message}`, (error as Error).stack);
      
      throw new HttpException(
        `Сбой фолбэка на бэкенде: ${(error as Error).message}`,
        HttpStatus.BAD_REQUEST
      );
    }
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

    this.logger.warn(
      `Target ${target.id} switched to FALLBACK_REQUIRED for ${target.url} due to blocked status ${error.statusCode} (${error.blockType}).`,
    );
  }

  private async createFallbackTarget(userId: string, dto: CreateTargetDto, error: AntiBotBlockedError) {
    const target = await this.prismaService.target.create({
      data: {
        userId,
        url: dto.url,
        selector: null,
        targetPrice: new Prisma.Decimal(dto.targetPrice.toFixed(2)),
        currentPrice: null,
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

    this.logger.warn(
      `[TargetsService] Target tracking initialized via Hybrid Fallback due to blocked status ${error.statusCode}.`,
    );

    return target;
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
