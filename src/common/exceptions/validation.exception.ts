import { HttpStatus } from '@nestjs/common';
import { ZodError, ZodIssue, ZodIssueCode } from 'zod';

import { AppException } from './app.exception';
import { IValidationErrorDetail } from './interfaces/validation-error-detail.interface';
import { ExceptionCode } from './reference/exception-code.reference';
import { ValidationErrorType } from './reference/validation-error-type.reference';

export class AppValidationException extends AppException {
  readonly zodError: ZodError;

  constructor(error: ZodError) {
    super({
      code: ExceptionCode.ValidationFailed,
      httpCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid request payload.',
      details: AppValidationException.buildDetails(error),
    });

    this.zodError = error;
  }

  private static buildDetails(zodError: ZodError): IValidationErrorDetail[] {
    return zodError.errors.flatMap((error): IValidationErrorDetail[] => {
      const type = this.detectDetailType(error);

      const paths = error.path.map((item) => item.toString());

      if (error.code === ZodIssueCode.unrecognized_keys) {
        return error.keys.map((key) => ({
          type: ValidationErrorType.Unrecognized,
          path: [...paths, key].join('.'),
          message: 'This key is not recognized',
        }));
      }

      return [
        {
          type,
          path: paths.join('.'),
          message: error.message,
        },
      ];
    });
  }

  private static detectDetailType(error: ZodIssue): ValidationErrorType {
    switch (error.code) {
      case ZodIssueCode.invalid_type: {
        if (error.received === 'undefined') return ValidationErrorType.MissingField;

        return ValidationErrorType.Invalid;
      }

      case ZodIssueCode.unrecognized_keys:
        return ValidationErrorType.Unrecognized;

      default:
        return ValidationErrorType.Invalid;
    }
  }
}
