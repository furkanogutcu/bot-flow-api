import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FindOptionsOrder } from 'typeorm';

import { createOrderBySchema } from '../../validations/common/order-by.validation';
import { IRequest } from '../interfaces/express-request.interface';

export type OrderByParam<Entity> = FindOptionsOrder<Entity> | undefined;

export const OrderBy = <Entity>(fields: (keyof Entity)[]) =>
  createParamDecorator((data: unknown, ctx: ExecutionContext): OrderByParam<Entity> => {
    const request: IRequest = ctx.switchToHttp().getRequest();

    const orderBySchema = createOrderBySchema(fields as string[]);

    return orderBySchema.parse(request.query).order_by as any;
  })();
