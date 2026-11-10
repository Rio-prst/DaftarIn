import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const listFindingsQuerySchema = z
  .object({
    status: z.string().trim().optional(),
    category: z.string().trim().optional(),
    action_level: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strip();

export class ListFindingsQueryDto extends createZodDto(
  listFindingsQuerySchema,
) {}
