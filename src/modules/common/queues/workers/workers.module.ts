import { Module } from '@nestjs/common';

import { MailModule } from '../../mail/mail.module';
import { SendMailWorker } from './send-mail.worker';

@Module({
  imports: [MailModule],
  providers: [SendMailWorker],
  exports: [SendMailWorker],
})
export class WorkersModule {}
