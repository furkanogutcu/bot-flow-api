import { ExceptionCode } from '../reference/exception-code.reference';
import { IValidationErrorDetail } from './validation-error-detail.interface';

export interface IErrorResponse {
  error: {
    code: ExceptionCode;
    message: string;
    details?: IValidationErrorDetail[];
  };
}
