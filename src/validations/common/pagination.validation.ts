import { z } from 'zod';

export const paginationSchema = z
  .object({
    page: z.coerce.number().int().positive().optional().default(1),
    per_page: z.coerce.number().int().positive().optional().default(20),
  })
  .transform(({ page, per_page }) => {
    return {
      skip: (page - 1) * per_page,
      take: per_page,
    };
  });

export type PaginationParams = z.output<typeof paginationSchema>;
