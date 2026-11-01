import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateServiceSchema = z.object({
  name: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(3).max(160),
  category: z.string().trim().min(2).max(100),
  agency_id: z.string().uuid(),
  region_id: z.string().uuid(),
  summary: z.string().trim().max(1000).optional().nullable(),
});

export class CreateServiceDto extends createZodDto(CreateServiceSchema) {}
