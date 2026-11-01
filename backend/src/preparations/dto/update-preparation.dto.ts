import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const answerItemSchema = z.object({
  question_id: z.string().uuid(),
  value: z.union([z.string(), z.boolean(), z.number(), z.array(z.string())]),
});

const updatePreparationSchema = z
  .object({
    display_name: z.string().trim().max(160).optional(),
    answers: z.array(answerItemSchema).optional(),
    expected_data_version: z.number().int().positive().optional(),
  })
  .strict();

export class UpdatePreparationDto extends createZodDto(
  updatePreparationSchema,
) {}
