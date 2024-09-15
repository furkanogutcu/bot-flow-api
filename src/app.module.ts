import { Module } from '@nestjs/common';

import { DatabaseModule } from './modules/common/database/database.module';
import { ENVModule } from './modules/common/env/env.module';
import { LoggerModule } from './modules/common/logger/logger.module';

@Module({
  imports: [ENVModule, LoggerModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
