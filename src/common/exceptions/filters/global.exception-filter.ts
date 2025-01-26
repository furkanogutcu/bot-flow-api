import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { TypeORMError } from 'typeorm';
import { ZodError } from 'zod';

import { ENVService } from '../../../modules/common/env/env.service';
import { AppException } from '../app.exception';
import { AppInternalException } from '../internal.exception';
import { NestJSExceptionTransformer } from '../transformers/nestjs.exception-transformer';
import { TypeORMExceptionTransformer } from '../transformers/typeorm.exception-transformer';
import { AppValidationException } from '../validation.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly envService: ENVService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    try {
      if (exception instanceof AppException) {
        return response.status(exception.httpCode).json(exception.toJSON());
      }

      let appException: AppException | undefined;

      if (exception instanceof ZodError) {
        appException = new AppValidationException(exception);
      } else if (exception instanceof TypeORMError) {
        appException = TypeORMExceptionTransformer.transform(exception);
      } else if (exception instanceof HttpException) {
        appException = NestJSExceptionTransformer.transform(exception);
      }

      if (!appException) {
        appException = new AppInternalException({ error: exception });
      }

      return response.status(appException.httpCode).json(appException.toJSON());
    } catch (error: any) {
      const err = new AppInternalException({ error });

      return response.status(err.httpCode).json(err.toJSON);
    }
  }
}
