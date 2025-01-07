import { Module } from '@nestjs/common';

import { SessionsModule } from '../../../sessions/sessions.module';
import { SuspiciousActivitiesModule } from '../../../suspicious-activity/suspicious-activities.module';
import { MailModule } from '../../mail/mail.module';
import { DetectUnrecognizedLoginWorker } from './detect-unrecognized-login.worker';
import { SendMailWorker } from './send-mail.worker';

@Module({
  imports: [MailModule, SuspiciousActivitiesModule, SessionsModule],
  providers: [SendMailWorker, DetectUnrecognizedLoginWorker],
  exports: [SendMailWorker, DetectUnrecognizedLoginWorker],
})
export class WorkersModule {}
