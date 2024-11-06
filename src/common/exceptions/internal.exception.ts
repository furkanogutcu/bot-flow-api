import { HttpStatus } from '@nestjs/common';

import { AppException } from './app.exception';
import { ExceptionCode } from './reference/exception-code.reference';

export class AppInternalException extends AppException {
  readonly originalError?: Error;

  constructor({
    message = 'An unexpected error occurred.',
    code,
    error,
  }: { message?: string; code?: ExceptionCode; error?: Error } = {}) {
    super({
      message,
      code: code || ExceptionCode.UnexpectedError,
      httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });

    this.originalError = error;
  }
}
