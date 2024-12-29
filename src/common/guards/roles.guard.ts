import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Roles } from '../decorators/roles.decorator';
import { AppForbiddenException } from '../exceptions/forbidden.exception';
import { IRequest } from '../interfaces/express-request.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedRoles = this.reflector.getAllAndOverride(Roles, [context.getHandler(), context.getClass()]);

    if (!allowedRoles || allowedRoles.length < 1) return true;

    const request = context.switchToHttp().getRequest<IRequest>();

    if (!allowedRoles.includes(request.session.user.role)) {
      throw new AppForbiddenException({ message: 'You do not have permission to access this resource' });
    }

    return true;
  }
}
