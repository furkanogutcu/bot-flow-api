export enum ExceptionCode {
  SomeFieldsAlreadyExists = 'some_fields_already_exists',
  InsufficientPermissions = 'insufficient_permissions',
  UnexpectedError = 'unexpected_error',
  ResourceNotFound = 'resource_not_found',
  ResourceAlreadyExists = 'resource_already_exists', // TODO
  RateLimit = 'rate_limit',
  Unauthorized = 'unauthorized',
  UnprocessableEntity = 'unprocessable_entity',
  ValidationFailed = 'validation_failed',
  InvalidRequest = 'invalid_request',
}
