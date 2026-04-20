import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EmailType } from './mail.type';

const emailTemplates = {
  [EmailType.VERIFY_EMAIL]: {
    subject: 'Verify Your Email',
    template: 'verify-email',
  },
  [EmailType.RESET_PASSWORD]: {
    subject: 'Reset Your Password',
    template: 'reset-password',
  },
};

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(email: string, type: EmailType, code: string) {
    const template = emailTemplates[type];
    if(!template)
      throw new Error('Invalid email type');

    await this.mailerService.sendMail({
      to: email,
      subject: template.subject,
      template: template.template,
      context: {
        code: code
      }
    });
  }
}
