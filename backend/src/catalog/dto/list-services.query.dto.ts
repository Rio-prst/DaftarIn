import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const listServicesQuerySchema = z
  .object({
    q: z.string().trim().min(1).max(160).optional(),
    region_id: z.string().uuid().optional(),
    category_id: z.string().trim().min(1).max(160).optional(),
    page: z.coerce.number().int().min(1).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
    sort: z
      .enum(['name', 'published_at', 'created_at'])
      .default('published_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();

export class ListServicesQueryDto extends createZodDto(
  listServicesQuerySchema,
) {}
