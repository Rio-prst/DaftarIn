import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const listAssignmentsQuerySchema = z
  .object({
    status: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export class ListAssignmentsQueryDto extends createZodDto(
  listAssignmentsQuerySchema,
) {}
