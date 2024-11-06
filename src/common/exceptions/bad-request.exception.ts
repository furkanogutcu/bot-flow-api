import { HttpStatus } from '@nestjs/common';

import { AppException } from './app.exception';
import { ExceptionCode } from './reference/exception-code.reference';

export class AppBadRequestException extends AppException {
  constructor({ message, code }: { message: string; code: ExceptionCode }) {
    super({
      message,
      code,
      httpCode: HttpStatus.BAD_REQUEST,
    });
  }
}
