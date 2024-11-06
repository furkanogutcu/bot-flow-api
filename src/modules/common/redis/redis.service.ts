import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Redis } from 'ioredis';

import { ENVService } from '../env/env.service';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private readonly redisClient: Redis;

  constructor(private readonly envService: ENVService) {
    this.redisClient = new Redis(this.envService.get('REDIS_URL'), { maxRetriesPerRequest: null });
  }

  getClient(): Redis {
    return this.redisClient;
  }

  async onApplicationShutdown() {
    await this.redisClient.quit();
  }
}
