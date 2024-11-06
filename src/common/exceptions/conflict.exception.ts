import { HttpStatus } from '@nestjs/common';

import { AppException } from './app.exception';
import { IValidationErrorDetail } from './interfaces/validation-error-detail.interface';
import { ExceptionCode } from './reference/exception-code.reference';
import { ValidationErrorType } from './reference/validation-error-type.reference';

export class AppConflictException extends AppException {
  readonly conflictedFields: string[];

  constructor({ conflictedFields }: { conflictedFields: string[] }) {
    super({
      message: 'Some fields already exists.',
      code: ExceptionCode.SomeFieldsAlreadyExists,
      httpCode: HttpStatus.CONFLICT,
      details: AppConflictException.buildDetails(conflictedFields),
    });

    this.conflictedFields = conflictedFields;
  }

  private static buildDetails(conflictedFields: string[]) {
    return conflictedFields.map((field): IValidationErrorDetail => {
      return {
        path: [field],
        type: ValidationErrorType.AlreadyExists,
        message: `${field} already exists`,
      };
    });
  }
}
