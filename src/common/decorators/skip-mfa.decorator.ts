import { SetMetadata } from '@nestjs/common';

export const SKIP_MFA_KEY = 'disableTwoFactorAuthKey';
export const SkipMFA = () => SetMetadata(SKIP_MFA_KEY, true);
