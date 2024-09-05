import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { ENVService } from './modules/common/env/env.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.enableShutdownHooks();

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  app.setGlobalPrefix('api/v1');

  const ENV = app.get(ENVService);

  await app.listen(ENV.get('PORT'));
}

void bootstrap();
