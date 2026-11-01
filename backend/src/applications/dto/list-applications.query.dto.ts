import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const listApplicationsQuerySchema = z
  .object({
    status: z.string().trim().optional(),
    service_id: z.string().uuid().optional(),
    source_mode: z.string().trim().optional(),
    sort: z
      .enum(['created_at', 'updated_at', 'submitted_date', 'status'])
      .default('updated_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
    page: z.coerce.number().int().min(1).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export class ListApplicationsQueryDto extends createZodDto(
  listApplicationsQuerySchema,
) {}
