import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { DeepPartial, EntityManager, IsNull, Not, Repository } from 'typeorm';

import { ExceptionCode } from '../../common/exceptions/reference/exception-code.reference';
import { AppUnprocessableEntityException } from '../../common/exceptions/unprocessable-entity.exception';
import { IUserAgent } from '../../common/interfaces/express-request.interface';
import { APIResponseOnlyMessage } from '../../common/responses/types/api-response.type';
import { suspiciousActivityConfig } from '../../configs/suspicious-activity.config';
import { Session } from '../sessions/entities/session.entity';
import { SessionsService } from '../sessions/sessions.service';
import { SuspiciousActivity } from './entities/suspicious-activity.entity';

@Injectable()
export class SuspiciousActivitiesService {
  constructor(
    @InjectRepository(SuspiciousActivity) private suspiciousActivityRepository: Repository<SuspiciousActivity>,
    private readonly sessionsService: SessionsService,
  ) {}

  async create({
    data,
    options,
  }: {
    data: Pick<SuspiciousActivity, 'user' | 'session' | 'type' | 'details' | 'resolve_token'>;
    options?: { manager?: EntityManager };
  }): Promise<SuspiciousActivity> {
    const activity = this.createEntity({
      user: data.user,
      session: data.session,
      type: data.type,
      details: data.details,
      resolve_token: data.resolve_token,
    });

    const manager = options?.manager || this.suspiciousActivityRepository.manager;

    return await manager.save(SuspiciousActivity, activity);
  }

  async resolve(resolveToken: string, options?: { manager?: EntityManager }): Promise<APIResponseOnlyMessage> {
    const repository = options?.manager || this.suspiciousActivityRepository.manager;

    const activity = await this.suspiciousActivityRepository.findOne({
      where: {
        resolve_token: resolveToken,
        resolved_at: IsNull(),
      },
    });

    if (!activity) {
      throw new AppUnprocessableEntityException({
        message: 'Suspicious activity already resolved or invalid token',
        code: ExceptionCode.TokenInvalidOrActivityResolved,
      });
    }

    activity.resolve_token = null;
    activity.resolved_at = DateTime.now().toJSDate();

    await repository.save(SuspiciousActivity, activity);

    return { message: 'Suspicious activity resolved successfully' };
  }

  createEntity(entity: DeepPartial<SuspiciousActivity>) {
    return this.suspiciousActivityRepository.create(entity);
  }

  async evaluateLoginRisk({
    userID,
    sessionID,
    request,
  }: {
    userID: string;
    sessionID: string;
    request: { ipAddress: string; userAgent: IUserAgent };
  }): Promise<{ isSuspicious: boolean; riskScore: number }> {
    const lastSessions = await this.getLastSessionsForUser({ userID, currentSessionID: sessionID, count: 3 });

    if (lastSessions.length === 0) {
      return { isSuspicious: false, riskScore: 0 };
    }

    const weightsMap = new Map<string, number>([
      ['ip_address', suspiciousActivityConfig.unrecognizedLogin.weights.ipAddress],
      ['device', suspiciousActivityConfig.unrecognizedLogin.weights.device],
      ['browser', suspiciousActivityConfig.unrecognizedLogin.weights.browser],
      ['os', suspiciousActivityConfig.unrecognizedLogin.weights.os],
    ]);

    const riskScore = Array.from(weightsMap).reduce((totalRisk, [attribute, weight]) => {
      const values = lastSessions.map((session) => {
        if (attribute === 'ip_address') {
          return session.ip_address ?? 'undefined';
        }

        return session.user_agent?.[attribute as keyof IUserAgent] ?? 'undefined';
      });

      const currentValue =
        attribute === 'ip_address'
          ? request.ipAddress || 'undefined'
          : request.userAgent[attribute as keyof IUserAgent] || 'undefined';

      const frequencies = this.getFrequencies(values);
      const currentFrequency = frequencies[currentValue] || 0;
      const totalOccurrences = Object.values(frequencies).reduce((sum, count) => sum + count, 0);

      const probability = currentFrequency / totalOccurrences;
      const risk = 1 - probability;

      return totalRisk + risk * weight;
    }, 0);

    const isSuspicious = riskScore > 1;

    return { isSuspicious, riskScore };
  }

  private async getLastSessionsForUser({
    userID,
    currentSessionID,
    count,
  }: {
    userID: string;
    currentSessionID: string;
    count: number;
  }): Promise<Session[]> {
    return await this.sessionsService.list({
      where: {
        id: Not(currentSessionID),
        user: { id: userID },
      },
      order: {
        created_at: 'desc',
      },
      take: count,
      withDeleted: true,
    });
  }

  private getFrequencies(values: string[]): Record<string, number> {
    return values.reduce(
      (acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
