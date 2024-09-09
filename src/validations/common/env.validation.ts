import { z } from 'zod';

export const ENVSchema = z.object({
  PORT: z.coerce.number(),
  NODE_ENV: z.enum(['production', 'development']).default('development'),
});

export type ENV = z.infer<typeof ENVSchema>;
