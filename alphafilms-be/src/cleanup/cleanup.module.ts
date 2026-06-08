import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './cleanup.service';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [ScheduleModule.forRoot(), SessionsModule],
  providers: [CleanupService],
})
export class CleanupModule {}
