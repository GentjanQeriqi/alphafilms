import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly sessionsService: SessionsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredSessions() {
    this.logger.log('Running expired sessions cleanup...');
    const count = await this.sessionsService.cleanupExpired();
    this.logger.log(`Cleaned up ${count} expired session(s)`);
  }
}
