import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const listRegionsQuerySchema = z
  .object({
    q: z.string().trim().min(1).max(160).optional(),
    parent_id: z.string().uuid().optional(),
    type: z.string().trim().min(1).max(64).optional(),
    page: z.coerce.number().int().min(1).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export class ListRegionsQueryDto extends createZodDto(listRegionsQuerySchema) {}
