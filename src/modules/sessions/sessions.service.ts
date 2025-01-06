import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { DeepPartial, EntityManager, FindOneOptions, Repository } from 'typeorm';

import { IRequest, IUserAgent } from '../../common/interfaces/express-request.interface';
import { User } from '../users/entities/user.entity';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(@InjectRepository(Session) private readonly sessionsRepository: Repository<Session>) {}

  async create({
    user,
    sessionKey,
    refreshToken,
    userAgent,
    options,
  }: {
    user: User;
    sessionKey: string;
    refreshToken: string;
    userAgent?: IUserAgent;
    options?: { manager?: EntityManager };
  }): Promise<Session> {
    const session = this.createEntity({
      user,
      session_key: sessionKey,
      user_agent: userAgent,
      refresh_token_hash: refreshToken,
      last_accessed_at: DateTime.now().toJSDate(),
    });

    const manager = options?.manager || this.sessionsRepository.manager;

    return await manager.save(Session, session);
  }

  async findOne(options: FindOneOptions<Session>): Promise<Session | null> {
    return await this.sessionsRepository.findOne(options);
  }

  async update(session: Session, options?: { manager?: EntityManager }): Promise<Session> {
    const repository = options?.manager || this.sessionsRepository.manager;

    return await repository.save(Session, session);
  }

  async revoke({ session, options }: { session: IRequest['session']; options?: { manager?: EntityManager } }) {
    const repository = options?.manager || this.sessionsRepository.manager;

    return await repository.softRemove(Session, session);
  }

  async revokeAll(user: User, options?: { manager?: EntityManager }) {
    const repository = options?.manager || this.sessionsRepository.manager;

    const sessions = await repository.find(Session, { where: { user: { id: user.id } } });

    return await repository.softRemove(Session, sessions);
  }

  createEntity(entity: DeepPartial<Session>) {
    return this.sessionsRepository.create(entity);
  }
}
