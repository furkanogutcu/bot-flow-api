import { Module } from '@nestjs/common';

import { MFAMethod } from '../../common/references/mfa.reference';
import { CacheModule } from '../common/cache/cache.module';
import { MailModule } from '../common/mail/mail.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersModule } from '../users/users.module';
import { EmailMFAMethod } from './methods/email.mfa-method';
import { BaseMFAMethod } from './methods/mfa-method.abstract';
import { TOTPMFAMethod } from './methods/totp.mfa-method';
import { MFA_METHODS } from './mfa.constants';
import { MfaController } from './mfa.controller';
import { MFAService } from './mfa.service';
import { MFAContextService } from './mfa-context.service';

@Module({
  imports: [CacheModule, UsersModule, SessionsModule, MailModule],
  controllers: [MfaController],
  providers: [
    MFAContextService,
    MFAService,
    EmailMFAMethod,
    TOTPMFAMethod,
    {
      provide: MFA_METHODS,
      useFactory: (emailMethod: EmailMFAMethod, totpMethod: TOTPMFAMethod): Record<MFAMethod, BaseMFAMethod> => {
        return {
          email: emailMethod,
          totp: totpMethod,
        };
      },
      inject: [EmailMFAMethod, TOTPMFAMethod],
    },
  ],
  exports: [MFAService],
})
export class MFAModule {}
