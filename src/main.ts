import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.enableShutdownHooks();

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  app.setGlobalPrefix('api/v1');

  await app.listen(3000);
}

void bootstrap();
