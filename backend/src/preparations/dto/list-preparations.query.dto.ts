import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const listPreparationsQuerySchema = z
  .object({
    status: z.string().trim().optional(),
    service_id: z.string().uuid().optional(),
    sort: z.enum(['created_at', 'updated_at', 'status']).default('updated_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
    page: z.coerce.number().int().min(1).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export class ListPreparationsQueryDto extends createZodDto(
  listPreparationsQuerySchema,
) {}
