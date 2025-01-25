export enum ExceptionCode {
  SomeFieldsAlreadyExists = 'some_fields_already_exists',
  InsufficientPermissions = 'insufficient_permissions',
  UnexpectedError = 'unexpected_error',
  ResourceNotFound = 'resource_not_found',
  RateLimit = 'rate_limit',
  Unauthorized = 'unauthorized',
  UnprocessableEntity = 'unprocessable_entity',
  ValidationFailed = 'validation_failed',
  InvalidRequest = 'invalid_request',
  IncorrectCredentials = 'incorrect_credentials',
  InactiveUser = 'inactive_user',
  InvalidToken = 'invalid_token',
  TokenInvalidOrActivityResolved = 'token_invalid_or_activity_resolved',
  TokenExpired = 'token_expired',
  WrongMFACode = 'wrong_mfa_code',
}
