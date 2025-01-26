import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const filterSchema = z.object({
  state: z.enum(['resolved', 'unresolved']).optional(),
});

export class SuspiciousActivityFilterParams extends createZodDto(filterSchema) {}
