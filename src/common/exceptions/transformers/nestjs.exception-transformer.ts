import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { AppException } from '../app.exception';
import { AppBadRequestException } from '../bad-request.exception';
import { AppForbiddenException } from '../forbidden.exception';
import { AppNotFoundException } from '../not-found.exception';
import { ExceptionCode } from '../reference/exception-code.reference';
import { AppUnauthorizedException } from '../unauthorized.exception';
import { AppUnprocessableEntityException } from '../unprocessable-entity.exception';

export class NestJSExceptionTransformer {
  static transform(exception: HttpException): AppException | undefined {
    if (exception instanceof BadRequestException) {
      return new AppBadRequestException({ message: exception.message, code: ExceptionCode.InvalidRequest });
    }

    if (exception instanceof ForbiddenException) {
      return new AppForbiddenException({ message: exception.message });
    }

    if (exception instanceof NotFoundException) {
      return new AppNotFoundException({ message: exception.message });
    }

    if (exception instanceof UnauthorizedException) {
      return new AppUnauthorizedException({ message: exception.message });
    }

    if (exception instanceof UnprocessableEntityException) {
      return new AppUnprocessableEntityException({
        message: exception.message,
      });
    }
  }
}
