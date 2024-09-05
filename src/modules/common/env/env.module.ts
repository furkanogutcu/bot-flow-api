import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';

import { ENVSchema } from '../../../validations/common/env.validation';
import { ENVService } from './env.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ validate: (env) => ENVSchema.parse(env) })],
  providers: [ENVService],
  exports: [ENVService],
})
export class ENVModule {
  static forRoot(envPath?: string): DynamicModule {
    const configModuleOptions: ConfigModuleOptions = {
      validate: (env) => ENVSchema.parse(env),
      ...(envPath ? { envFilePath: envPath } : {}),
    };

    return {
      module: ENVModule,
      imports: [ConfigModule.forRoot(configModuleOptions)],
      providers: [ENVService],
      exports: [ENVService],
    };
  }
}
