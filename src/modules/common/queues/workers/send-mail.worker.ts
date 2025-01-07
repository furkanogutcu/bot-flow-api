import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { AppQueue } from '../../../../common/references/queue.reference';
import { MailService } from '../../mail/mail.service';
import { ISendMailParams } from './interfaces/send-mail.interface';

@Processor(AppQueue.SendMail)
export class SendMailWorker extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<ISendMailParams>): Promise<any> {
    await this.mailService.sendMailSync(job.data);
  }
}
