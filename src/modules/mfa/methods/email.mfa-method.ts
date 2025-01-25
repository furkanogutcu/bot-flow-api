import { Injectable } from '@nestjs/common';

import { MFAMethod } from '../../../common/references/mfa.reference';
import { generateRandomInt } from '../../../common/utils/random.util';
import { MailService } from '../../common/mail/mail.service';
import { User } from '../../users/entities/user.entity';
import { IMFASetupResponse } from '../interfaces/mfa.interface';
import { IMFAContext } from '../interfaces/mfa.interface';
import { MFAContextService } from '../mfa-context.service';
import { BaseMFAMethod } from './mfa-method.abstract';

@Injectable()
export class EmailMFAMethod extends BaseMFAMethod {
  constructor(
    protected readonly contextService: MFAContextService,
    private readonly mailService: MailService,
  ) {
    super(contextService);
  }

  get methodName(): MFAMethod {
    return MFAMethod.EMAIL;
  }

  protected async onSetup(
    user: User,
  ): Promise<{ context: Omit<IMFAContext, 'method'>; responseData?: IMFASetupResponse }> {
    const challenge = this.generateChallenge();

    await this.sendChallengeToEmail(user, challenge);

    return { context: { challenge } };
  }

  protected async onVerify(_user: User, verificationCode: string, context?: IMFAContext): Promise<boolean> {
    if (!context) return false;

    return context.challenge === verificationCode;
  }

  async sendChallenge(user: User): Promise<void> {
    let context = await this.contextService.get(user.id);

    if (!context) {
      context = {
        method: this.methodName,
      };
    }

    context.challenge = this.generateChallenge();

    await this.contextService.set(user.id, context);

    await this.sendChallengeToEmail(user, context.challenge);
  }

  private async sendChallengeToEmail(user: User, challenge: string) {
    await this.mailService.sendMFAChallenge({
      user,
      challenge,
    });
  }

  private generateChallenge(): string {
    return generateRandomInt(6).toString();
  }
}
