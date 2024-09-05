import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ENV } from '../../../validations/common/env.validation';

@Injectable()
export class ENVService {
  constructor(private configService: ConfigService<ENV, true>) {}

  get<T extends keyof ENV>(key: T) {
    return this.configService.get(key, { infer: true });
  }
}
