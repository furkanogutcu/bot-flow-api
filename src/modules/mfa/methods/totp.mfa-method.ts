import { Injectable } from '@nestjs/common';
import OTPAuth from 'otpauth';

import { MFAMethod, MFASetupResponseType } from '../../../common/references/mfa.reference';
import { ENVService } from '../../common/env/env.service';
import { User } from '../../users/entities/user.entity';
import { IMFASetupResponse } from '../interfaces/mfa.interface';
import { IMFAContext } from '../interfaces/mfa.interface';
import { MFAContextService } from '../mfa-context.service';
import { BaseMFAMethod } from './mfa-method.abstract';

@Injectable()
export class TOTPMFAMethod extends BaseMFAMethod {
  constructor(
    protected readonly contextService: MFAContextService,
    private readonly envService: ENVService,
  ) {
    super(contextService);
  }

  get methodName(): MFAMethod {
    return MFAMethod.TOTP;
  }

  protected async onSetup(
    user: User,
  ): Promise<{ context: Omit<IMFAContext, 'method'>; responseData?: IMFASetupResponse }> {
    const totp = this.getTOTP(user);

    return {
      context: { secret: totp.secret.base32 },
      responseData: { type: MFASetupResponseType.QR_DATA, data: totp.toString() },
    };
  }

  protected async onVerify(user: User, verificationCode: string, context?: IMFAContext): Promise<boolean> {
    const secret = context?.secret || user.mfa_secret;

    if (!secret) return false;

    const totp = this.getTOTP(user, { secret });

    return totp.validate({ token: verificationCode }) === 0;
  }

  private getTOTP(user: User, options?: { secret?: string }) {
    return new OTPAuth.TOTP({
      issuer: this.envService.get('MFA_ISSUER'),
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      secret: options?.secret,
    });
  }
}
