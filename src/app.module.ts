import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AiModule } from './modules/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { ScraperModule } from './modules/scraper/scraper.module';
import { TargetsModule } from './modules/targets/targets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    AiModule,
    ScraperModule,
    NotificationsModule,
    TargetsModule,
    SchedulerModule,
  ],
})
export class AppModule {}
