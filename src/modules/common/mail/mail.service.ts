import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Queue } from 'bullmq';
import { DateTime } from 'luxon';

import { IUserAgent } from '../../../common/interfaces/express-request.interface';
import { AppQueue } from '../../../common/references/queue.reference';
import { User } from '../../users/entities/user.entity';
import { ENVService } from '../env/env.service';
import { ISendMailParams } from '../queues/workers/interfaces/send-mail.interface';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly envService: ENVService,
    @InjectQueue(AppQueue.SendMail) private readonly sendMailQueue: Queue<ISendMailParams>,
  ) {}

  async sendMailSync(payload: ISendMailParams): Promise<void> {
    await this.mailerService.sendMail(payload);
  }

  async sendMailAsync(payload: ISendMailParams): Promise<void> {
    await this.sendMailQueue.add('send-mail', payload);
  }

  async sendWelcome({
    user,
    token,
    tokenDuration,
  }: {
    user: User;
    token: string;
    tokenDuration: number;
  }): Promise<void> {
    const url = new URL(`${this.envService.get('APP_URL')}/api/v1/auth/verify-email`);

    url.searchParams.append('token', token);

    await this.sendMailAsync({
      to: user.email,
      subject: 'Welcome to Bot Flow',
      template: 'welcome',
      context: {
        name: this.generateName(user),
        url: url.toString(),
        duration: tokenDuration.toString(),
      },
    });
  }

  async sendEmailVerification({
    user,
    token,
    tokenDuration,
  }: {
    user: User;
    token: string;
    tokenDuration: number;
  }): Promise<void> {
    const url = new URL(`${this.envService.get('APP_URL')}/api/v1/auth/verify-email`);

    url.searchParams.append('token', token);

    await this.sendMailAsync({
      to: user.email,
      subject: 'Confirm your email address',
      template: 'email-verification',
      context: {
        name: this.generateName(user),
        url: url.toString(),
        duration: tokenDuration.toString(),
      },
    });
  }

  async sendEmailVerificationSuccessful(user: User): Promise<void> {
    await this.sendMailAsync({
      to: user.email,
      subject: 'Email verification successful',
      template: 'email-verification-successful',
      context: {
        name: this.generateName(user),
      },
    });
  }

  async sendPasswordReset({
    user,
    token,
    tokenDuration,
  }: {
    user: User;
    token: string;
    tokenDuration: number;
  }): Promise<void> {
    const url = new URL(this.envService.get('FE_PASSWORD_RESET_URL'));

    url.searchParams.append('token', token);

    await this.sendMailAsync({
      to: user.email,
      subject: 'Forgot password',
      template: 'password-reset',
      context: {
        name: this.generateName(user),
        url: url.toString(),
        duration: tokenDuration.toString(),
      },
    });
  }

  async sendPasswordResetSuccessful(user: User): Promise<void> {
    await this.sendMailAsync({
      to: user.email,
      subject: 'Password reset successful',
      template: 'password-reset-successful',
      context: {
        name: this.generateName(user),
      },
    });
  }

  async sendUnrecognizedLogin({
    user,
    resolveToken,
    details,
  }: {
    user: User;
    resolveToken: string;
    details: {
      userAgent: IUserAgent;
      timestamp: number;
    };
  }): Promise<void> {
    const url = new URL(`${this.envService.get('APP_URL')}/api/v1/suspicious-activities/resolve`);

    url.searchParams.append('token', resolveToken);

    await this.sendMailAsync({
      to: user.email,
      subject: 'New unrecognized login to your account',
      template: 'unrecognized-login',
      context: {
        name: this.generateName(user),
        user_agent_device: details.userAgent.device,
        user_agent_browser: details.userAgent.browser,
        user_agent_os: details.userAgent.os,
        resolve_url: url.toString(),
        datetime: DateTime.fromMillis(details.timestamp).toFormat("yyyy-MM-dd HH:mm:ss 'UTC'"),
      },
    });
  }

  async sendMFAChallenge({ user, challenge }: { user: User; challenge: string }): Promise<void> {
    await this.sendMailAsync({
      to: user.email,
      subject: `${challenge} is your security code`,
      template: 'mfa-challenge',
      context: {
        name: this.generateName(user),
        challenge,
      },
    });
  }

  private generateName(user: User): string {
    return user.email.split('@')[0];
  }
}
