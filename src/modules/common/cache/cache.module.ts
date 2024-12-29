import { Module } from '@nestjs/common';

import { RedisModule } from '../redis/redis.module';
import { SensitiveModule } from '../sensitive/sensitive.module';
import { CacheService } from './cache.service';

@Module({
  imports: [SensitiveModule, RedisModule],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
