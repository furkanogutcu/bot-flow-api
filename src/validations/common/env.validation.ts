import { z } from 'zod';

export const ENVSchema = z.object({
  PORT: z.coerce.number(),
  NODE_ENV: z.enum(['production', 'development']).default('development'),
  DATABASE_URL: z.string().startsWith('postgres'),
});

export type ENV = z.infer<typeof ENVSchema>;
