import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { TargetsService } from '../targets/targets.service';
import { TargetStatus } from '@prisma/client';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private isRunning = false;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly targetsService: TargetsService,
  ) {}

  // Запуск Cron-задачи каждый час
  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyPricePolling() {
    if (this.isRunning) {
      this.logger.warn('[Scheduler] Предыдущий цикл сканирования цен еще не завершен. Пропуск.');
      return;
    }

    this.isRunning = true;
    this.logger.log('[Scheduler] Запуск планового ежечасного цикла автоматического обновления цен...');

    try {
      // 1. Вызываем метод обновления всех активных целей в TargetsService
      await this.targetsService.refreshActiveTargets();
      this.logger.log('[Scheduler] Плановый цикл обновления цен успешно завершен.');
    } catch (error) {
      this.logger.error(`[Scheduler] Ошибка при автоматическом обновлении цен: ${(error as Error).message}`, (error as Error).stack);
    } finally {
      this.isRunning = false;
    }
  }
}
