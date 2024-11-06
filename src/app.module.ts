import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { GlobalExceptionFilter } from './common/exceptions/filters/global.exception-filter';
import { AppZodValidationPipe } from './common/pipes/app-zod-validation.pipe';
import { DatabaseModule } from './modules/common/database/database.module';
import { ENVModule } from './modules/common/env/env.module';
import { LoggerModule } from './modules/common/logger/logger.module';

@Module({
  imports: [ENVModule, LoggerModule, DatabaseModule],
  providers: [
    { provide: APP_PIPE, useClass: AppZodValidationPipe },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
