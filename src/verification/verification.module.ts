import { VerificationService } from './verification.service';
import { RedisModule } from 'src/redis/redis.module';
import { MailModule } from 'src/mail/mail.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [RedisModule, MailModule],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
