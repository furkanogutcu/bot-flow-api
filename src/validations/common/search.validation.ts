import { z } from 'zod';

export const searchSchema = z.object({
  q: z.string().optional(),
});
