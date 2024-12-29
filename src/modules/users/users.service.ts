import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, FindOneOptions, Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

  async create({
    data,
    options,
  }: {
    data: Pick<User, 'email' | 'passwordHash' | 'role' | 'status'>;
    options?: { manager?: EntityManager };
  }): Promise<User> {
    const user = this.createEntity({
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
      status: data.status,
    });

    const manager = options?.manager || this.usersRepository.manager;

    return await manager.save(User, user);
  }

  async findOne(options: FindOneOptions<User>): Promise<User | null> {
    return await this.usersRepository.findOne(options);
  }

  async update(user: User, options?: { manager?: EntityManager }): Promise<User> {
    const repository = options?.manager || this.usersRepository.manager;

    return await repository.save(User, user);
  }

  createEntity(entity: DeepPartial<User>) {
    return this.usersRepository.create(entity);
  }
}
