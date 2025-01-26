import { Controller, Get, Req } from '@nestjs/common';

import { IRequest } from '../../common/interfaces/express-request.interface';
import { UsersService } from './users.service';

@Controller('me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@Req() req: IRequest) {
    return await this.usersService.findOne({
      where: { id: req.session.user.id },
      select: {
        id: true,
        email: true,
        status: true,
        role: true,
        mfa_enabled: true,
        mfa_method: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
}
