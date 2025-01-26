import { Controller, Get, Query, Req } from '@nestjs/common';

import { OrderBy, OrderByParam } from '../../common/decorators/order-by.decorator';
import { Pagination } from '../../common/decorators/pagination.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AppBadRequestException } from '../../common/exceptions/bad-request.exception';
import { ExceptionCode } from '../../common/exceptions/reference/exception-code.reference';
import { IRequest } from '../../common/interfaces/express-request.interface';
import { APIResponseOnlyMessage, PaginatedAPIResponse } from '../../common/responses/types/api-response.type';
import { PaginationParams } from '../../validations/common/pagination.validation';
import { SuspiciousActivityFilterParams } from '../../validations/suspicious-activities.validation';
import { SuspiciousActivity } from './entities/suspicious-activity.entity';
import { SuspiciousActivitiesService } from './suspicious-activities.service';

@Controller('suspicious-activities')
export class SuspiciousActivitiesController {
  constructor(private readonly suspiciousActivitiesService: SuspiciousActivitiesService) {}

  @Public()
  @Get('resolve')
  async resolveSuspiciousActivity(@Query('token') token: string): Promise<APIResponseOnlyMessage> {
    if (!token) {
      throw new AppBadRequestException({
        message: 'Resolve token required.',
        code: ExceptionCode.ResolveTokenRequired,
      });
    }

    return await this.suspiciousActivitiesService.resolve(token);
  }

  @Get()
  async list(
    @Req() req: IRequest,
    @Pagination() { skip, take }: PaginationParams,
    @OrderBy<SuspiciousActivity>(['created_at', 'resolved_at']) orderBy: OrderByParam<SuspiciousActivity>,
    @Query() filter: SuspiciousActivityFilterParams,
  ): Promise<PaginatedAPIResponse<SuspiciousActivity>> {
    return await this.suspiciousActivitiesService.list({
      userID: req.session.user.id,
      filter,
      options: { skip, take, orderBy },
    });
  }
}
