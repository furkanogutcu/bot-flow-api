import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';

import { GlobalExceptionFilter } from './common/exceptions/filters/global.exception-filter';
import { AuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AppZodValidationPipe } from './common/pipes/app-zod-validation.pipe';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/common/database/database.module';
import { ENVModule } from './modules/common/env/env.module';
import { LoggerModule } from './modules/common/logger/logger.module';
import { QueuesModule } from './modules/common/queues/queues.module';
import { MFAModule } from './modules/mfa/mfa.module';
import { SuspiciousActivitiesModule } from './modules/suspicious-activity/suspicious-activities.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ENVModule,
    LoggerModule,
    DatabaseModule,
    QueuesModule,
    AuthModule,
    UsersModule,
    SuspiciousActivitiesModule,
    MFAModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: AppZodValidationPipe },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
