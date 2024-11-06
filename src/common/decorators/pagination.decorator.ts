import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IRequest } from '../../interfaces/express-request.interface';
import { paginationSchema } from '../../validations/common/pagination.validation';

export const Pagination = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request: IRequest = ctx.switchToHttp().getRequest();

  return paginationSchema.parse(request.query);
});
