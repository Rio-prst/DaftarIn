import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const listAdminServicesQuerySchema = z
  .object({
    q: z.string().trim().optional(),
    publication_status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    region_id: z.string().uuid().optional(),
    agency_id: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export class ListAdminServicesQueryDto extends createZodDto(
  listAdminServicesQuerySchema,
) {}
