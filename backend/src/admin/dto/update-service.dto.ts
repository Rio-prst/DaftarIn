import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateServiceSchema = z.object({
  name: z.string().trim().min(3).max(200).optional(),
  category: z.string().trim().min(2).max(100).optional(),
  summary: z.string().trim().max(1000).optional().nullable(),
  publication_status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export class UpdateServiceDto extends createZodDto(UpdateServiceSchema) {}
