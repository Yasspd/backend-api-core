import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ScraperModule } from '../scraper/scraper.module';
import { FallbackEventsService } from './fallback-events.service';
import { TargetsController } from './targets.controller';
import { TargetsService } from './targets.service';

@Module({
  imports: [AuthModule, AiModule, ScraperModule, NotificationsModule],
  controllers: [TargetsController],
  providers: [TargetsService, FallbackEventsService],
  exports: [TargetsService, FallbackEventsService],
})
export class TargetsModule {}
