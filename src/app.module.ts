import { Module } from '@nestjs/common';

import { ENVModule } from './modules/common/env/env.module';
import { LoggerModule } from './modules/common/logger/logger.module';

@Module({
  imports: [ENVModule, LoggerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
