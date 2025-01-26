import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CacheModule } from '../common/cache/cache.module';
import { ENVService } from '../common/env/env.service';
import { MailModule } from '../common/mail/mail.module';
import { MFAModule } from '../mfa/mfa.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JWTService } from './jwt.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (envService: ENVService) => {
        return {
          signOptions: {
            audience: envService.get('JWT_AUDIENCE'),
            issuer: envService.get('JWT_ISSUER'),
          },
        };
      },
      inject: [ENVService],
    }),
    UsersModule,
    SessionsModule,
    CacheModule,
    MailModule,
    MFAModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JWTService],
  exports: [AuthService],
})
export class AuthModule {}
