import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { EmailType } from 'src/mail/mail.type';
import type { Cache } from 'cache-manager';

@Injectable()
export class VerificationService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly redisClient: Cache,
    private mailService: MailService,
  ) {}

  async sendVerificationCode(email: string, type: EmailType) {
    const verificationCode: string = this.generateVerificationCode();
    await this.redisClient.set(`verify:${email}`, verificationCode, 300000); // ms
    await this.mailService.sendMail(email, type, verificationCode);
  }

  async verifyVerificationCode(email: string, code: string): Promise<boolean> {
    const key: string = `verify:${email}`;
    const verificationCode = await this.redisClient.get(key);
    if(verificationCode === code) {
      await this.redisClient.del(key);
      return true;
    }
    return false;
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
