import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import { randomBytes, randomUUID } from 'crypto';
import { DateTime } from 'luxon';
import ms from 'ms';
import { DataSource, EntityManager, ILike } from 'typeorm';

import { AppBadRequestException } from '../../common/exceptions/bad-request.exception';
import { AppConflictException } from '../../common/exceptions/conflict.exception';
import { ExceptionCode } from '../../common/exceptions/reference/exception-code.reference';
import { AppUnauthorizedException } from '../../common/exceptions/unauthorized.exception';
import { IJWTTokensResponse } from '../../common/interfaces/auth.interface';
import { IRequest } from '../../common/interfaces/express-request.interface';
import { TokenType } from '../../common/references/auth.reference';
import { UserRole } from '../../common/references/user-role.reference';
import { UserStatus } from '../../common/references/user-status.reference';
import { APIResponseOnlyMessage } from '../../common/responses/types/api-response.type';
import { LoginPayload, PasswordResetPayload, RegisterPayload } from '../../validations/auth.validation';
import { CacheService } from '../common/cache/cache.service';
import { CacheKey } from '../common/cache/cache-key';
import { ENVService } from '../common/env/env.service';
import { MailService } from '../common/mail/mail.service';
import { SessionsService } from '../sessions/sessions.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { JWTService } from './jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly typeormDataSource: DataSource,
    private readonly envService: ENVService,
    private readonly cacheService: CacheService,
    private readonly mailService: MailService,
    private readonly jwtService: JWTService,
    private readonly sessionsService: SessionsService,
  ) {}

  async verifyAccessToken(accessToken: string): Promise<IRequest['session']> {
    const payload = this.jwtService.verifyAccessToken(accessToken);

    const { sub: userID, sessionKey } = payload;

    const session = await this.sessionsService.findOne({
      where: { session_key: sessionKey, user: { id: userID } },
      select: { id: true, session_key: true },
      relations: { user: true },
    });

    if (!session || !session.user) {
      throw new AppUnauthorizedException({ message: 'Session not found' });
    }

    if (session.user.deleted_at || session.user.status !== UserStatus.Active) {
      throw new AppUnauthorizedException({ message: 'User not active', code: ExceptionCode.InactiveUser });
    }

    return session;
  }

  async register(payload: RegisterPayload): Promise<IJWTTokensResponse> {
    const isEmailAlreadyExists = await this.usersService.findOne({
      where: {
        email: ILike(payload.email),
      },
    });

    if (isEmailAlreadyExists) throw new AppConflictException({ conflictedFields: ['email'] });

    return await this.typeormDataSource.transaction(async (manager) => {
      const user = await this.usersService.create({
        data: {
          email: payload.email,
          passwordHash: payload.password,
          role: UserRole.Member,
          status: UserStatus.PendingEmailVerification,
        },
        options: { manager },
      });

      await this.sendWelcomeToEmail(user);

      return await this.createSession(user, { manager });
    });
  }

  async login(payload: LoginPayload): Promise<IJWTTokensResponse> {
    const user = await this.usersService.findOne({
      where: { email: payload.email },
    });

    if (!user || !(await argon2.verify(user.passwordHash, payload.password))) {
      throw new AppUnauthorizedException({
        message: 'Email or password is incorrect',
        code: ExceptionCode.IncorrectCredentials,
      });
    }

    return await this.createSession(user);
  }

  async sendEmailVerificationEmail(email: string): Promise<APIResponseOnlyMessage> {
    const user = await this.usersService.findOne({ where: { email } });

    if (user && user.status === UserStatus.PendingEmailVerification) {
      await this.sendEmailVerificationToEmail(user);
    }

    return {
      message: 'If an account with this email exists, a verification link will be sent to the email address.',
    };
  }

  async verifyEmail(token: string): Promise<APIResponseOnlyMessage> {
    const cacheKey = this.cacheKeyForEmailVerification(token);

    const userID = await this.cacheService.get(cacheKey, { decrypt: true });

    if (!userID) {
      throw new AppBadRequestException({
        message: 'Invalid token.',
        code: ExceptionCode.InvalidToken,
      });
    }

    const user = await this.usersService.findOne({
      where: { id: userID.toString() },
    });

    if (!user) {
      throw new AppBadRequestException({
        message: 'Invalid token.',
        code: ExceptionCode.InvalidToken,
      });
    }

    return await this.typeormDataSource.transaction(async (manager) => {
      const updatedUser = this.usersService.createEntity({
        ...user,
        status: UserStatus.Active,
      });

      await this.usersService.update(updatedUser, { manager });

      await this.mailService.sendEmailVerificationSuccessful(updatedUser);

      await this.cacheService.del(cacheKey);

      return { message: 'Email address has been successfully verified.' };
    });
  }

  async sendPasswordResetEmail(email: string): Promise<APIResponseOnlyMessage> {
    const user = await this.usersService.findOne({ where: { email } });

    if (user) {
      await this.sendPasswordResetToEmail(user);
    }

    return {
      message: 'If an account with this email exists, a password reset link will be sent to the email address.',
    };
  }

  async resetPassword(payload: PasswordResetPayload): Promise<APIResponseOnlyMessage> {
    const cacheKey = this.cacheKeyForPasswordReset(payload.token);

    const userID = await this.cacheService.get(cacheKey, { decrypt: true });

    if (!userID) {
      throw new AppBadRequestException({
        message: 'Invalid token.',
        code: ExceptionCode.InvalidToken,
      });
    }

    const user = await this.usersService.findOne({
      where: { id: userID.toString() },
    });

    if (!user) {
      throw new AppBadRequestException({
        message: 'Invalid token.',
        code: ExceptionCode.InvalidToken,
      });
    }

    return await this.typeormDataSource.transaction(async (manager) => {
      const updatedUser = this.usersService.createEntity({
        ...user,
        passwordHash: payload.new_password,
      });

      await this.usersService.update(updatedUser, { manager });

      await this.mailService.sendPasswordResetSuccessful(updatedUser);

      await this.sessionsService.revokeAll(updatedUser, { manager });

      await this.cacheService.del(cacheKey);

      return { message: 'Your password has been successfully reset and all your sessions have been logged out.' };
    });
  }

  async refreshTokens(refreshToken: string): Promise<IJWTTokensResponse> {
    const payload = this.jwtService.verifyRefreshToken(refreshToken);

    const { sub: userID, sessionKey } = payload;

    const session = await this.sessionsService.findOne({
      where: { session_key: sessionKey, user: { id: userID } },
      relations: { user: true },
    });

    if (!session || !session.user || !(await argon2.verify(session.refresh_token_hash, refreshToken))) {
      throw new AppUnauthorizedException({ message: 'Invalid refresh token' });
    }

    // TODO: Session ile mevcut isteğin ip ve cihaz bilgisi valide edilebilir.

    return await this.typeormDataSource.transaction(async (manager) => {
      const { accessToken, refreshToken, sessionKey } = await this.createTokens(session.user);

      const updatedSession = this.sessionsService.createEntity({
        ...session,
        session_key: sessionKey,
        refresh_token_hash: refreshToken,
        last_accessed_at: DateTime.now().toJSDate(),
      });

      await this.sessionsService.update(updatedSession, { manager });

      return this.buildJWTTokensResponse(accessToken, refreshToken);
    });
  }

  async logout(session: IRequest['session']): Promise<APIResponseOnlyMessage> {
    await this.sessionsService.revoke({ session });

    return {
      message: 'You have been successfully logged out.',
    };
  }

  private async sendPasswordResetToEmail(user: User) {
    const { token, duration } = await this.createRandomToken({
      type: 'passwordReset',
      duration: this.envService.get('PASSWORD_RESET_TOKEN_DURATION'),
      user,
    });

    await this.mailService.sendPasswordReset({ user, token, tokenDuration: duration });
  }

  private async sendWelcomeToEmail(user: User) {
    const { token, duration } = await this.createRandomToken({
      type: 'emailVerification',
      duration: this.envService.get('EMAIL_VERIFICATION_TOKEN_DURATION'),
      user,
    });

    await this.mailService.sendWelcome({ user, token, tokenDuration: duration });
  }

  private async sendEmailVerificationToEmail(user: User): Promise<void> {
    const { token, duration } = await this.createRandomToken({
      type: 'emailVerification',
      duration: this.envService.get('EMAIL_VERIFICATION_TOKEN_DURATION'),
      user,
    });

    await this.mailService.sendEmailVerification({ user, token, tokenDuration: duration });
  }

  private async createRandomToken({
    type,
    duration,
    user,
  }: {
    type: 'emailVerification' | 'passwordReset';
    duration: number;
    user: User;
  }): Promise<{ token: string; duration: number }> {
    let token: string | undefined;
    let cacheKey: string | undefined;

    const cacheKeyFunc =
      type === 'emailVerification' ? this.cacheKeyForEmailVerification : this.cacheKeyForPasswordReset;

    do {
      token = randomBytes(32).toString('hex');
      cacheKey = cacheKeyFunc(token);
    } while (!!(await this.cacheService.get(cacheKey, { decrypt: true })));

    await this.cacheService.set(cacheKey, user.id, {
      encrypt: true,
      ttl: duration,
    });

    return { token, duration };
  }

  private cacheKeyForEmailVerification(token: string): string {
    return CacheKey.of('userEmailVerification', token);
  }

  private cacheKeyForPasswordReset(token: string): string {
    return CacheKey.of('userPasswordReset', token);
  }

  private async createTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    sessionKey: string;
  }> {
    const sessionKey = randomUUID();

    return {
      accessToken: await this.jwtService.generateAccessToken(user, sessionKey),
      refreshToken: await this.jwtService.generateRefreshToken(user, sessionKey),
      sessionKey,
    };
  }

  private buildJWTTokensResponse(accessToken: string, refreshToken: string): IJWTTokensResponse {
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: TokenType.Bearer,
      expires_in: ms(this.envService.get('JWT_EXPIRES_FOR_ACCESS_TOKEN')) / 1000,
    };
  }

  private async createSession(user: User, options?: { manager?: EntityManager }): Promise<IJWTTokensResponse> {
    const { accessToken, refreshToken, sessionKey } = await this.createTokens(user);

    // TODO: Device info eklenmeli
    await this.sessionsService.create({
      user,
      sessionKey,
      refreshToken,
      options,
    });

    return this.buildJWTTokensResponse(accessToken, refreshToken);
  }
}
