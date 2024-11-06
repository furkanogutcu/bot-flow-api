import { HttpStatus } from '@nestjs/common';

import { AppException } from './app.exception';
import { ExceptionCode } from './reference/exception-code.reference';

export class AppUnauthorizedException extends AppException {
  constructor({ message = 'Access denied.', code }: { message?: string; code?: ExceptionCode } = {}) {
    super({
      message,
      code: code || ExceptionCode.Unauthorized,
      httpCode: HttpStatus.UNAUTHORIZED,
    });
  }
}
