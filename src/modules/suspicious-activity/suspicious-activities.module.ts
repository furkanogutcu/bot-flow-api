import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SessionsModule } from '../sessions/sessions.module';
import { SuspiciousActivity } from './entities/suspicious-activity.entity';
import { SuspiciousActivitiesController } from './suspicious-activities.controller';
import { SuspiciousActivitiesService } from './suspicious-activities.service';

@Module({
  imports: [TypeOrmModule.forFeature([SuspiciousActivity]), SessionsModule],
  controllers: [SuspiciousActivitiesController],
  providers: [SuspiciousActivitiesService],
  exports: [SuspiciousActivitiesService],
})
export class SuspiciousActivitiesModule {}
