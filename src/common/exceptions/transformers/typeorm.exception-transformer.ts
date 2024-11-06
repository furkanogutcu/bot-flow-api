import { EntityNotFoundError, QueryFailedError, TypeORMError } from 'typeorm';

import { joinColumnValues } from '../../references/join-column.reference';
import { AppException } from '../app.exception';
import { AppConflictException } from '../conflict.exception';
import { AppNotFoundException } from '../not-found.exception';
import { AppUnprocessableEntityException } from '../unprocessable-entity.exception';

export class TypeORMExceptionTransformer {
  static transform(exception: TypeORMError): AppException | undefined {
    if (exception instanceof EntityNotFoundError) {
      return this.transformEntityNotFoundError(exception);
    }

    if (exception instanceof QueryFailedError) {
      const exceptionCode = (exception as any).code;

      const transformer = TypeORMExceptionTransformer.queryFailedExceptionMapper[+exceptionCode];

      if (transformer) return transformer(exception);
    }
  }

  private static queryFailedExceptionMapper: Record<number, (exception: QueryFailedError) => AppException | undefined> =
    {
      22003: TypeORMExceptionTransformer.transformNumericOverflowError,
      23505: TypeORMExceptionTransformer.transformConflictError,
    };

  private static transformEntityNotFoundError(exception: EntityNotFoundError) {
    const match = exception.message.match(/"([^"]+)"/);

    return new AppNotFoundException({ resourceName: match?.[1] });
  }

  private static transformConflictError(exception: QueryFailedError) {
    const detail: string | undefined = (exception as any)?.detail;

    if (!detail) return;

    const matches = detail.match(/\(([^)]+)\)/);

    let conflictedFields: string[] = [];

    if (matches && matches[1]) {
      const keys = matches[1].split(', ').map((key: string) => key.trim());

      conflictedFields = keys.filter((key: any) => !joinColumnValues.includes(key));
    }

    return new AppConflictException({ conflictedFields });
  }

  private static transformNumericOverflowError(_exception: QueryFailedError) {
    return new AppUnprocessableEntityException({
      message: 'Numeric field is outside the allowed range',
    });
  }
}
