import './database/extensions';

import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Settings } from 'luxon';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { ENVService } from './modules/common/env/env.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.enableShutdownHooks();

  app.useLogger(app.get(Logger));

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const ENV = app.get(ENVService);

  Settings.defaultZone = 'utc';

  await app.listen(ENV.get('PORT'));
}

void bootstrap();
