import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { randomBytes } from 'crypto';

import { AppQueue } from '../../../../common/references/queue.reference';
import { SuspiciousActivityType } from '../../../../common/references/suspicious-activity.reference';
import { SessionsService } from '../../../sessions/sessions.service';
import { SuspiciousActivitiesService } from '../../../suspicious-activity/suspicious-activities.service';
import { MailService } from '../../mail/mail.service';
import { IDetectUnrecognizedLoginParams } from './interfaces/detect-unrecognized-login.interface';

@Processor(AppQueue.DetectUnrecognizedLogin)
export class DetectUnrecognizedLoginWorker extends WorkerHost {
  constructor(
    private readonly suspiciousActivitiesService: SuspiciousActivitiesService,
    private readonly sessionsService: SessionsService,
    private readonly mailService: MailService,
  ) {
    super();
  }

  async process(job: Job<IDetectUnrecognizedLoginParams>): Promise<any> {
    const session = await this.sessionsService.findOne({
      where: { id: job.data.sessionID, user: { id: job.data.userID } },
      relations: { user: true },
    });

    if (!session || !session.user) return;

    const { isSuspicious } = await this.suspiciousActivitiesService.evaluateLoginRisk({
      userID: job.data.userID,
      sessionID: session.id,
      request: job.data.request,
    });

    if (!isSuspicious) return;

    const resolveToken = randomBytes(32).toString('hex');

    await this.suspiciousActivitiesService.create({
      data: {
        user: session.user,
        session,
        type: SuspiciousActivityType.UnrecognizedLogin,
        resolve_token: resolveToken,
        details: {
          ip_address: job.data.request.ipAddress,
          user_agent: job.data.request.userAgent,
        },
      },
    });

    await this.mailService.sendUnrecognizedLogin({
      user: session.user,
      resolveToken,
      details: {
        userAgent: job.data.request.userAgent,
        timestamp: job.data.request.timestamp,
      },
    });
  }
}
