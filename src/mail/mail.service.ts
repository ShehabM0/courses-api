import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(to: string, subject: string, text: string) {
    await this.mailerService.sendMail({
      to: to,
      subject: subject,
      text: text,
    });
  }
}