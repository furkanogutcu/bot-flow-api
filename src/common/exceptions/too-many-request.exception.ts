import { HttpStatus } from '@nestjs/common';

import { AppException } from './app.exception';
import { ExceptionCode } from './reference/exception-code.reference';

export class AppTooManyRequestException extends AppException {
  constructor() {
    super({
      message: 'You have exceeded the number of allowed requests. Please try again later.',
      code: ExceptionCode.RateLimit,
      httpCode: HttpStatus.TOO_MANY_REQUESTS,
    });
  }
}
