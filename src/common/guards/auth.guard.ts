import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthService } from '../../modules/auth/auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SKIP_MFA_KEY } from '../decorators/skip-mfa.decorator';
import { ExceptionCode } from '../exceptions/reference/exception-code.reference';
import { AppUnauthorizedException } from '../exceptions/unauthorized.exception';
import { IRequest } from '../interfaces/express-request.interface';
import { TokenType } from '../references/auth.reference';
import { UserStatus } from '../references/user-status.reference';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<IRequest>();
    const token = this.extractToken(request);

    if (!token) throw new AppUnauthorizedException({ message: 'No token provided' });

    const session = await this.authService.verifyAccessToken(token);

    if (session.user.status !== UserStatus.Active) {
      throw new AppUnauthorizedException({
        message: 'User not active',
        code: ExceptionCode.InactiveUser,
      });
    }

    const isMFASkipped = this.reflector.getAllAndOverride<boolean>(SKIP_MFA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isMFASkipped && session.user.mfa_enabled && !session.mfa_verified_at) {
      throw new AppUnauthorizedException({ message: 'Please complete MFA.', code: ExceptionCode.MFARequired });
    }

    request.session = { ...session };

    return true;
  }

  private extractToken(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === TokenType.Bearer ? token : undefined;
  }
}
