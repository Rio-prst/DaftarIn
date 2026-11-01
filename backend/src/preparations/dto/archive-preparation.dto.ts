import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const archivePreparationSchema = z
  .object({
    reason: z.string().trim().max(255).optional(),
  })
  .strict();

export class ArchivePreparationDto extends createZodDto(
  archivePreparationSchema,
) {}
