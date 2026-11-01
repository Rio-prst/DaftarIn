import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PauseServiceSchema = z.object({
  reason: z.string().trim().min(3).max(500),
});

export class PauseServiceDto extends createZodDto(PauseServiceSchema) {}
