import { Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Req } from '@nestjs/common';

import { OrderBy, OrderByParam } from '../../common/decorators/order-by.decorator';
import { Pagination } from '../../common/decorators/pagination.decorator';
import { AppUnprocessableEntityException } from '../../common/exceptions/unprocessable-entity.exception';
import { IRequest } from '../../common/interfaces/express-request.interface';
import { SessionView } from '../../common/interfaces/sessions.interface';
import { PaginatedAPIResponse } from '../../common/responses/types/api-response.type';
import { PaginationParams } from '../../validations/common/pagination.validation';
import { Session } from './entities/session.entity';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get('current')
  async findCurrent(@Req() req: IRequest): Promise<SessionView | null> {
    return await this.sessionsService.findCurrent(req.session);
  }

  @Get()
  async listActives(
    @Pagination() { skip, take }: PaginationParams,
    @OrderBy<Session>(['created_at', 'last_accessed_at']) orderBy: OrderByParam<Session>,
    @Req() req: IRequest,
  ): Promise<PaginatedAPIResponse<SessionView & { is_current: boolean }>> {
    return await this.sessionsService.listActives(req.session, { skip, take, orderBy });
  }

  @HttpCode(204)
  @Delete(':sessionId')
  async revoke(@Req() req: IRequest, @Param('sessionId', ParseUUIDPipe) sessionID: string): Promise<void> {
    if (req.session.id === sessionID) {
      throw new AppUnprocessableEntityException({
        message: 'To revoke your current session, please request a logout.',
      });
    }

    await this.sessionsService.revoke(sessionID);
  }

  @HttpCode(204)
  @Delete()
  async revokeAll(@Req() req: IRequest): Promise<void> {
    await this.sessionsService.revokeAll(req.session.user.id, { currentSession: req.session });
  }
}
