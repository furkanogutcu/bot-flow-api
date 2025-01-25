import { MFAMethod } from '../../../common/references/mfa.reference';
import { User } from '../../users/entities/user.entity';
import { IMFASetupResponse } from '../interfaces/mfa.interface';
import { IMFAContext } from '../interfaces/mfa.interface';
import { MFAContextService } from '../mfa-context.service';

export abstract class BaseMFAMethod {
  constructor(protected readonly contextService: MFAContextService) {}

  abstract get methodName(): MFAMethod;

  async setup(user: User): Promise<IMFASetupResponse | undefined> {
    let context: IMFAContext = {
      method: this.methodName,
    };

    const result = await this.onSetup(user);

    context = { ...context, ...result.context };

    await this.contextService.set(user.id, context);

    return result.responseData;
  }

  async verify(user: User, verificationCode: string): Promise<boolean> {
    const context = await this.contextService.get(user.id);

    return await this.onVerify(user, verificationCode, context || undefined);
  }

  async sendChallenge?(user: User): Promise<void>;

  protected abstract onVerify(user: User, verificationCode: string, context?: IMFAContext): Promise<boolean>;

  protected abstract onSetup(
    user: User,
  ): Promise<{ context: Omit<IMFAContext, 'method'>; responseData?: IMFASetupResponse }>;
}
