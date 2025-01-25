import { Injectable } from '@nestjs/common';

import { CacheService } from '../common/cache/cache.service';
import { CacheKey } from '../common/cache/cache-key';
import { IMFAContext } from './interfaces/mfa.interface';

@Injectable()
export class MFAContextService {
  constructor(private readonly cacheService: CacheService) {}

  async get(userID: string): Promise<IMFAContext | null> {
    const cacheKey = this.getCacheKey(userID);

    return (await this.cacheService.get(cacheKey, { decrypt: true })) as IMFAContext | null;
  }

  async set(userID: string, context: IMFAContext): Promise<void> {
    const cacheKey = this.getCacheKey(userID);

    await this.cacheService.set(cacheKey, context, {
      encrypt: true,
      ttl: 300,
    });
  }

  async clear(userID: string): Promise<void> {
    const cacheKey = this.getCacheKey(userID);

    await this.cacheService.del(cacheKey);
  }

  private getCacheKey(userID: string) {
    return CacheKey.of('userMFA', userID);
  }
}
