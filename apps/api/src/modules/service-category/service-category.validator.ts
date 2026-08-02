import { z } from 'zod';

export const searchCategoriesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    isActive: z.string().transform((val) => val === 'true').optional(),
  }),
});
