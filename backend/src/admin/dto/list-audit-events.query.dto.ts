import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const listAuditEventsQuerySchema = z
  .object({
    actor_id: z.string().uuid().optional(),
    action: z.string().trim().optional(),
    object_type: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export class ListAuditEventsQueryDto extends createZodDto(
  listAuditEventsQuerySchema,
) {}
