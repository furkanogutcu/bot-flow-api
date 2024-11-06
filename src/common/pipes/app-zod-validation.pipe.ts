import { ZodDtoStatic, ZodValidationPipe } from '@anatine/zod-nestjs';
import { ArgumentMetadata, Injectable } from '@nestjs/common';

import { AppValidationException } from '../exceptions/validation.exception';

@Injectable()
export class AppZodValidationPipe extends ZodValidationPipe {
  transform(value: unknown, metadata: ArgumentMetadata) {
    const zodSchema = (metadata?.metatype as ZodDtoStatic)?.zodSchema;

    if (!zodSchema) return value;

    const parseResult = zodSchema.safeParse(value);

    if (!parseResult.success) throw new AppValidationException(parseResult.error);

    return parseResult.data;
  }
}
