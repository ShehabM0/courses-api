import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import type { Cache } from 'cache-manager';

@Injectable()
export class VerificationService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly redisClient: Cache,
    private mailService: MailService,
  ) {}

  async sendVerificationCode(email: string) {
    const verificationCode: string = this.generateVerificationCode();
    await this.redisClient.set(`verify:${email}`, verificationCode, 300000); // ms
    await this.mailService.sendMail(
      email,
      'Email verification',
      `Your verification code is: ${verificationCode}`
    );
  }

  generateVerificationCode(length = 6): string {
    const digs: string = '0123456789';
    const n: number = digs.length;
    let code = '';

    for (let i = 0; i < length; i++)
      code += digs.charAt(Math.floor(Math.random() * n));

    return code;
  }
}
