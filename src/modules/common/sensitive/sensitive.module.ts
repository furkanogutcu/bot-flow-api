import { Module } from '@nestjs/common';

import { SensitiveService } from './sensitive.service';

@Module({
  providers: [SensitiveService],
  exports: [SensitiveService],
})
export class SensitiveModule {}
