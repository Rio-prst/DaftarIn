import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const recordCorrectionSchema = z
  .object({
    corrected_value: z.string().trim().min(1).max(500),
    note: z.string().trim().max(500).optional().nullable(),
  })
  .strip();

export class RecordCorrectionDto extends createZodDto(recordCorrectionSchema) {}
