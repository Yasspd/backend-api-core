import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TargetsService } from '../targets/targets.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly targetsService: TargetsService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyPolling(): Promise<void> {
    this.logger.log('Starting hourly price polling cycle');
    await this.targetsService.refreshActiveTargets();
    this.logger.log('Finished hourly price polling cycle');
  }
}
