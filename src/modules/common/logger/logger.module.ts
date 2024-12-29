import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

import { ENVService } from '../env/env.service';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ENVService],
      useFactory: async (envService: ENVService) => {
        const isDevMode = envService.get('NODE_ENV') === 'development';

        return {
          pinoHttp: {
            level: isDevMode ? 'debug' : 'info',
            transport: isDevMode ? { target: 'pino-pretty' } : undefined,
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
