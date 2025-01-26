import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';

import { SkipMFA } from '../../common/decorators/skip-mfa.decorator';
import { IRequest } from '../../common/interfaces/express-request.interface';
import { APIResponseOnlyMessage } from '../../common/responses/types/api-response.type';
import { SetupMFAPayload, VerifyMFAPayload } from '../../validations/mfa.validation';
import { IMFASetupResponse } from './interfaces/mfa.interface';
import { MFAService } from './mfa.service';

@SkipMFA()
@Controller('auth/mfa')
export class MfaController {
  constructor(private readonly mfaService: MFAService) {}

  @HttpCode(200)
  @Post('setup/start')
  async startSetup(
    @Req() req: IRequest,
    @Body() payload: SetupMFAPayload,
  ): Promise<APIResponseOnlyMessage & { mfa_setup?: IMFASetupResponse }> {
    return await this.mfaService.startSetup(req.session.user.id, payload.method);
  }

  @HttpCode(200)
  @Post('setup/complete')
  async completeSetup(@Req() req: IRequest, @Body() payload: VerifyMFAPayload): Promise<APIResponseOnlyMessage> {
    return await this.mfaService.completeSetup(req.session, payload.verification_code);
  }

  @HttpCode(200)
  @Post('verify')
  async verify(@Req() req: IRequest, @Body() payload: VerifyMFAPayload): Promise<APIResponseOnlyMessage> {
    return await this.mfaService.verify(req.session, payload.verification_code);
  }

  @HttpCode(200)
  @Post('send-challenge')
  async sendChallenge(@Req() req: IRequest): Promise<APIResponseOnlyMessage> {
    return await this.mfaService.sendChallenge(req.session.user.id);
  }

  @HttpCode(200)
  @Post('disable')
  async disable(@Req() req: IRequest, @Body() payload: VerifyMFAPayload): Promise<APIResponseOnlyMessage> {
    return await this.mfaService.disable(req.session.user.id, payload.verification_code);
  }
}
