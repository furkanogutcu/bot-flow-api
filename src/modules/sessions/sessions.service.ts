import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import {
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Not,
  Repository,
} from 'typeorm';

import { IRequest } from '../../common/interfaces/express-request.interface';
import { SessionView } from '../../common/interfaces/sessions.interface';
import { PaginatedAPIResponse } from '../../common/responses/types/api-response.type';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(@InjectRepository(Session) private readonly sessionsRepository: Repository<Session>) {}

  async create({
    data,
    options,
  }: {
    data: Pick<Session, 'user' | 'session_key' | 'user_agent' | 'ip_address'> & { refreshToken: string };
    options?: { manager?: EntityManager };
  }): Promise<Session> {
    const session = this.createEntity({
      user: data.user,
      session_key: data.session_key,
      user_agent: data.user_agent,
      ip_address: data.ip_address,
      refresh_token_hash: data.refreshToken,
      last_accessed_at: DateTime.now().toJSDate(),
    });

    const manager = options?.manager || this.sessionsRepository.manager;

    return await manager.save(Session, session);
  }

  async findOne(options: FindOneOptions<Session>): Promise<Session | null> {
    return await this.sessionsRepository.findOne(options);
  }

  async list(options: FindManyOptions<Session>): Promise<Session[]> {
    return await this.sessionsRepository.find(options);
  }

  async update(session: Session, options?: { manager?: EntityManager }): Promise<Session> {
    const repository = options?.manager || this.sessionsRepository.manager;

    return await repository.save(Session, session);
  }

  async revoke(sessionID: string, options?: { manager?: EntityManager }): Promise<void> {
    const repository = options?.manager || this.sessionsRepository.manager;

    const session = await repository.findOneOrFail(Session, { where: { id: sessionID } });

    await repository.softRemove(Session, session);
  }

  async revokeAll(
    userID: string,
    options?: { manager?: EntityManager; currentSession?: IRequest['session'] },
  ): Promise<void> {
    const repository = options?.manager || this.sessionsRepository.manager;

    const query: FindOptionsWhere<Session> = {
      user: { id: userID },
    };

    if (options?.currentSession) {
      query.id = Not(options.currentSession.id);
    }

    const sessions = await repository.find(Session, { where: query });

    await repository.softRemove(Session, sessions);
  }

  async findCurrent(session: IRequest['session']): Promise<SessionView | null> {
    return await this.findOne({
      where: { id: session.id, user: { id: session.user.id } },
      select: ['id', 'user_agent', 'ip_address', 'created_at', 'last_accessed_at'],
    });
  }

  async listActives(
    currentSession: IRequest['session'],
    options?: {
      skip?: number;
      take?: number;
      orderBy?: FindOptionsOrder<Session>;
    },
  ): Promise<PaginatedAPIResponse<SessionView & { is_current: boolean }>> {
    const { data, metadata } = await this.sessionsRepository.listWithPagination({
      where: { user: { id: currentSession.user.id } },
      select: ['id', 'user_agent', 'ip_address', 'created_at', 'last_accessed_at'],
      skip: options?.skip,
      take: options?.take,
      order: options?.orderBy || { last_accessed_at: 'desc' },
    });

    return {
      metadata,
      data: data.map((session) => {
        return {
          ...session,
          is_current: session.id === currentSession.id,
        };
      }),
    };
  }

  createEntity(entity: DeepPartial<Session>): Session {
    return this.sessionsRepository.create(entity);
  }
}
