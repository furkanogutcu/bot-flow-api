import { Inject, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { DataSource, EntityManager } from 'typeorm';

import { AppBadRequestException } from '../../common/exceptions/bad-request.exception';
import { AppInternalException } from '../../common/exceptions/internal.exception';
import { AppNotFoundException } from '../../common/exceptions/not-found.exception';
import { ExceptionCode } from '../../common/exceptions/reference/exception-code.reference';
import { AppUnprocessableEntityException } from '../../common/exceptions/unprocessable-entity.exception';
import { IRequest } from '../../common/interfaces/express-request.interface';
import { MFAMethod } from '../../common/references/mfa.reference';
import { APIResponseOnlyMessage } from '../../common/responses/types/api-response.type';
import { SessionsService } from '../sessions/sessions.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { IMFASetupResponse } from './interfaces/mfa.interface';
import { BaseMFAMethod } from './methods/mfa-method.abstract';
import { MFA_METHODS } from './mfa.constants';
import { MFAContextService } from './mfa-context.service';

@Injectable()
export class MFAService {
  constructor(
    @Inject(MFA_METHODS)
    private readonly methods: Record<MFAMethod, BaseMFAMethod>,
    private readonly contextService: MFAContextService,
    private readonly usersService: UsersService,
    private readonly typeormDataSource: DataSource,
    private readonly sessionsService: SessionsService,
  ) {}

  async startSetup(
    userID: string,
    methodName: MFAMethod,
  ): Promise<APIResponseOnlyMessage & { mfa_setup?: IMFASetupResponse }> {
    const user = await this.findOrThrowUser(userID);

    this.checkMFADisabled(user);

    const method = this.getMethod(methodName);

    const result = await method.setup(user);

    return {
      message: 'MFA has been successfully initialized. Please complete the MFA setup.',
      mfa_setup: result,
    };
  }

  async completeSetup(session: IRequest['session'], verificationCode: string): Promise<APIResponseOnlyMessage> {
    const user = await this.findOrThrowUser(session.user.id);

    this.checkMFADisabled(user);

    const context = await this.contextService.get(user.id);

    if (!context) {
      throw new AppUnprocessableEntityException({ message: 'MFA setup not started.' });
    }

    await this.verifyCode({ user, methodName: context.method, verificationCode });

    await this.typeormDataSource.transaction(async (manager) => {
      await this.updateSessionMFAVerified(session, { manager });

      await this.updateUserMFA({
        user,
        mfa: {
          enable: true,
          method: context.method,
          secret: context.secret,
        },
        options: { manager },
      });

      await this.contextService.clear(user.id);
    });

    return { message: 'MFA enabled successfully.' };
  }

  async verify(session: IRequest['session'], verificationCode: string): Promise<APIResponseOnlyMessage> {
    const user = await this.findOrThrowUser(session.user.id);

    this.checkMFAEnabled(user);

    await this.verifyCode({ user, methodName: user.mfa_method!, verificationCode });

    await this.updateSessionMFAVerified(session);

    return { message: 'MFA verified successfully.' };
  }

  async sendChallenge(userID: string): Promise<APIResponseOnlyMessage> {
    const user = await this.findOrThrowUser(userID);

    this.checkMFAEnabled(user);

    const context = await this.contextService.get(userID);

    const activeMethod = context?.method || user.mfa_method!;

    const method = this.getMethod(activeMethod);

    if (!method.sendChallenge) {
      throw new AppUnprocessableEntityException({
        message: `${activeMethod.toUpperCase()} method does not support challenge.`,
      });
    }

    await method.sendChallenge(user);

    return { message: 'MFA challenge sent successfully.' };
  }

  async disable(userID: string, verificationCode: string): Promise<APIResponseOnlyMessage> {
    const user = await this.findOrThrowUser(userID);

    this.checkMFAEnabled(user);

    await this.verifyCode({
      user,
      methodName: user.mfa_method!,
      verificationCode,
    });

    await this.updateUserMFA({
      user,
      mfa: {
        enable: false,
        method: null,
        secret: null,
      },
    });

    await this.contextService.clear(userID);

    return { message: 'MFA disabled successfully.' };
  }

  private getMethod(methodName: MFAMethod): BaseMFAMethod {
    const method = this.methods[methodName];

    if (!method) {
      throw new AppInternalException({ message: `Unknown MFA method: ${methodName}` });
    }

    return method;
  }

  private async findOrThrowUser(userID: string): Promise<User> {
    const user = await this.usersService.findOne({
      where: { id: userID },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        mfa_enabled: true,
        mfa_method: true,
        mfa_secret: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
    });

    if (!user) {
      throw new AppNotFoundException({ resourceName: 'User' });
    }

    return user;
  }

  private checkMFADisabled(user: User): void {
    if (user.mfa_enabled) {
      throw new AppUnprocessableEntityException({ message: 'MFA is already enabled.' });
    }
  }

  private checkMFAEnabled(user: User): void {
    if (!user.mfa_enabled || !user.mfa_method) {
      throw new AppUnprocessableEntityException({ message: 'MFA is not enabled.' });
    }
  }

  private async verifyCode({
    user,
    methodName,
    verificationCode,
  }: {
    user: User;
    methodName: MFAMethod;
    verificationCode: string;
  }): Promise<void> {
    const method = this.getMethod(methodName);

    const isVerified = await method.verify(user, verificationCode);

    if (!isVerified) {
      throw new AppBadRequestException({
        message: 'Wrong MFA verification code.',
        code: ExceptionCode.WrongMFACode,
      });
    }
  }

  private async updateSessionMFAVerified(
    session: IRequest['session'],
    options?: { manager?: EntityManager },
  ): Promise<void> {
    const updateSession = this.sessionsService.createEntity({
      ...session,
      mfa_verified_at: DateTime.now().toJSDate(),
    });

    await this.sessionsService.update(updateSession, { manager: options?.manager });
  }

  private async updateUserMFA({
    user,
    mfa,
    options,
  }: {
    user: User;
    mfa: { enable: boolean; method?: MFAMethod | null; secret?: string | null };
    options?: { manager?: EntityManager };
  }) {
    const updateUser = this.usersService.createEntity({
      ...user,
      mfa_enabled: mfa.enable,
      mfa_method: mfa.method,
      mfa_secret: mfa.secret,
    });

    await this.usersService.update(updateUser, { manager: options?.manager });
  }
}
