import { Body, Controller, Delete, Get, HttpCode, Post, Query, Req } from '@nestjs/common';

import { Public } from '../../common/decorators/public.decorator';
import { IJWTTokensResponse } from '../../common/interfaces/auth.interface';
import { IRequest } from '../../common/interfaces/express-request.interface';
import { APIResponseOnlyMessage } from '../../common/responses/types/api-response.type';
import {
  EmailVerificationTokenParam,
  LoginPayload,
  PasswordResetPayload,
  RefreshTokensPayload,
  RegisterPayload,
  ResendEmailVerificationEmailPayload,
  SendPasswordResetEmailPayload,
} from '../../validations/auth.validation';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(200)
  @Post('login')
  async login(@Body() payload: LoginPayload): Promise<IJWTTokensResponse> {
    return await this.authService.login(payload);
  }

  @Public()
  @HttpCode(200)
  @Post('register')
  async register(@Body() payload: RegisterPayload): Promise<IJWTTokensResponse> {
    return await this.authService.register(payload);
  }

  @Public()
  @HttpCode(200)
  @Post('refresh-tokens')
  async refreshTokens(@Body() payload: RefreshTokensPayload): Promise<IJWTTokensResponse> {
    return await this.authService.refreshTokens(payload.refresh_token);
  }

  @Public()
  @Get('verify-email')
  async verifyEmail(@Query() { token }: EmailVerificationTokenParam): Promise<APIResponseOnlyMessage> {
    return await this.authService.verifyEmail(token);
  }

  @Public()
  @HttpCode(200)
  @Post('verify-email/resend')
  async resendEmailVerificationCode(
    @Body() payload: ResendEmailVerificationEmailPayload,
  ): Promise<APIResponseOnlyMessage> {
    return await this.authService.sendEmailVerificationEmail(payload.email);
  }

  @Public()
  @HttpCode(200)
  @Post('password-reset/request')
  async passwordResetRequest(@Body() payload: SendPasswordResetEmailPayload): Promise<APIResponseOnlyMessage> {
    return await this.authService.sendPasswordResetEmail(payload.email);
  }

  @Public()
  @HttpCode(200)
  @Post('password-reset')
  async passwordReset(@Body() payload: PasswordResetPayload): Promise<APIResponseOnlyMessage> {
    return await this.authService.resetPassword(payload);
  }

  @Delete('logout')
  async logout(@Req() req: IRequest): Promise<APIResponseOnlyMessage> {
    return await this.authService.logout(req.session);
  }
}
