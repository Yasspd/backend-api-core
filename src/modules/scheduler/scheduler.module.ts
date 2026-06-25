import { Module } from '@nestjs/common';
import { TargetsModule } from '../targets/targets.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [TargetsModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
