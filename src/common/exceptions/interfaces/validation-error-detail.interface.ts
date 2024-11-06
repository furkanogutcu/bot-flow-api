import { ValidationErrorType } from '../reference/validation-error-type.reference';

export interface IValidationErrorDetail {
  type: ValidationErrorType;
  path: string[];
  message: string;
}
