import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const answerItemSchema = z.object({
  question_id: z.string().uuid(),
  value: z.union([z.string(), z.boolean(), z.number(), z.array(z.string())]),
});

const createPreparationSchema = z
  .object({
    service_id: z.string().uuid(),
    region_id: z.string().uuid(),
    guide_version: z.number().int().positive().optional(),
    questionnaire_version: z.number().int().positive().optional(),
    answers: z.array(answerItemSchema).optional().default([]),
    display_name: z.string().trim().max(160).optional(),
  })
  .strict();

export class CreatePreparationDto extends createZodDto(
  createPreparationSchema,
) {}
