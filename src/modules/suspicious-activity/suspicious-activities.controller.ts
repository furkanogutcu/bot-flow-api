import { Controller, Get, Query } from '@nestjs/common';

import { Public } from '../../common/decorators/public.decorator';
import { APIResponseOnlyMessage } from '../../common/responses/types/api-response.type';
import { SuspiciousActivitiesService } from './suspicious-activities.service';

@Controller('suspicious-activities')
export class SuspiciousActivitiesController {
  constructor(private readonly suspiciousActivitiesService: SuspiciousActivitiesService) {}

  @Public()
  @Get('resolve')
  async resolveSuspiciousActivity(@Query('token') token: string): Promise<APIResponseOnlyMessage> {
    return await this.suspiciousActivitiesService.resolve(token);
  }
}
