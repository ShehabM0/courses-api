import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenService } from './token.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenCleanupService {
  constructor(private tokenService: TokenService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens() {
    await this.tokenService.cleanupExpiredTokens();
  }
}
