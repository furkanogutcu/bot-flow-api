import { z } from 'zod';

export const ENVSchema = z.object({
  PORT: z.coerce.number(),
});

export type ENV = z.infer<typeof ENVSchema>;
