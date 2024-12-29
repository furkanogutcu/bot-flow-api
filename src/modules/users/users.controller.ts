import { Controller, Get, Req } from '@nestjs/common';

import { IRequest } from '../../common/interfaces/express-request.interface';

@Controller('me')
export class UsersController {
  @Get()
  getProfile(@Req() req: IRequest): IRequest['session']['user'] {
    return req.session.user;
  }
}
