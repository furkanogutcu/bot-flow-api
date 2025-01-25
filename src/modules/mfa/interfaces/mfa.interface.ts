import { MFASetupResponseType } from '../../../common/references/mfa.reference';
import { MFAMethod } from '../../../common/references/mfa.reference';

export interface IMFAContext {
  method: MFAMethod;
  challenge?: string;
  secret?: string;
}

export interface IMFASetupResponse {
  type: MFASetupResponseType;
  data: string;
}
