import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';

import { AppQueue } from '../../../common/references/queue.reference';
import { defaultJobOptions, queueConfig } from '../../../configs/queue.config';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';
import { WorkersModule } from './workers/workers.module';

const queues = Object.values(AppQueue).map((queueName) => {
  return BullModule.registerQueueAsync({
    name: queueName,
    useFactory: async (redisService: RedisService) => {
      return {
        connection: redisService.getClient(),
        defaultJobOptions: {
          ...defaultJobOptions,
          ...queueConfig[queueName],
        },
      };
    },
    imports: [RedisModule],
    inject: [RedisService],
  });
});

@Global()
@Module({
  imports: [...queues, WorkersModule],
  exports: queues,
})
export class QueuesModule {}
