import { Injectable } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';

import { ExceptionCode } from '../../common/exceptions/reference/exception-code.reference';
import { AppUnauthorizedException } from '../../common/exceptions/unauthorized.exception';
import { IJWTTokenPayload } from '../../common/interfaces/auth.interface';
import { ENVService } from '../common/env/env.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class JWTService {
  constructor(
    private readonly envService: ENVService,
    private readonly jwtService: JwtService,
  ) {}

  async generateAccessToken(user: User, sessionKey: string): Promise<string> {
    const payload = this.buildPayload(user, sessionKey);

    return this.jwtService.sign(payload, {
      secret: this.envService.get('JWT_SECRET_FOR_ACCESS_TOKEN'),
      expiresIn: this.envService.get('JWT_EXPIRES_FOR_ACCESS_TOKEN'),
    });
  }

  async generateRefreshToken(user: User, sessionKey: string): Promise<string> {
    const payload = this.buildPayload(user, sessionKey);

    return this.jwtService.sign(payload, {
      secret: this.envService.get('JWT_SECRET_FOR_REFRESH_TOKEN'),
      expiresIn: this.envService.get('JWT_EXPIRES_FOR_REFRESH_TOKEN'),
    });
  }

  verifyAccessToken(token: string): IJWTTokenPayload {
    try {
      return this.jwtService.verify(token, { secret: this.envService.get('JWT_SECRET_FOR_ACCESS_TOKEN') });
    } catch {
      throw new AppUnauthorizedException({ message: 'Invalid access token' });
    }
  }

  verifyRefreshToken(token: string): IJWTTokenPayload {
    try {
      return this.jwtService.verify(token, { secret: this.envService.get('JWT_SECRET_FOR_REFRESH_TOKEN') });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new AppUnauthorizedException({
          message: 'Refresh token expired',
          code: ExceptionCode.TokenExpired,
        });
      }

      throw new AppUnauthorizedException({ message: 'Invalid refresh token' });
    }
  }

  private buildPayload(user: User, sessionKey: string): IJWTTokenPayload {
    return {
      sub: user.id,
      sessionKey,
    };
  }
}
