import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const answerItemSchema = z.object({
  question_id: z.string().uuid(),
  value: z.union([z.string(), z.boolean(), z.number(), z.array(z.string())]),
});

const evaluateServiceNeedsSchema = z
  .object({
    service_id: z.string().uuid(),
    region_id: z.string().uuid(),
    questionnaire_version: z.number().int().positive().optional(),
    answers: z.array(answerItemSchema).default([]),
  })
  .strict();

export class EvaluateServiceNeedsDto extends createZodDto(
  evaluateServiceNeedsSchema,
) {}
