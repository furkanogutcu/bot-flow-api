import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

import { ENVService } from '../env/env.service';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (envService: ENVService) => ({
        transport: {
          host: envService.get('SMTP_HOST'),
          port: envService.get('SMTP_PORT') || envService.get('SMTP_SECURE') ? 465 : 587,
          secure: envService.get('SMTP_SECURE'),
          auth: {
            user: envService.get('SMTP_USER'),
            pass: envService.get('SMTP_PASSWORD'),
          },
        },
        defaults: {
          from: `${envService.get('MAIL_SENDER_USERNAME')} <${envService.get('SMTP_USER')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ENVService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
