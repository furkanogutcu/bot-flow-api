import { RegisterQueueOptions } from '@nestjs/bullmq';

import { AppQueue } from '../common/references/queue.reference';

export const defaultJobOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: {
    age: 0,
    count: 0,
  },
  removeOnFail: {
    age: 5 * 24 * 3600,
  },
};

export const queueConfig: Partial<Record<AppQueue, RegisterQueueOptions['defaultJobOptions']>> = {};
