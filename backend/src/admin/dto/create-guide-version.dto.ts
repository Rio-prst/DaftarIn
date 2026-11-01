import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ProcedureStepSchema = z.object({
  step: z.number().int().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

export const GuideRequirementSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional().nullable(),
  required: z.boolean().default(true),
});

export const CreateGuideVersionSchema = z.object({
  summary: z.string().trim().max(1000).optional().nullable(),
  procedure_steps: z
    .array(ProcedureStepSchema)
    .min(1, 'Minimal satu langkah prosedur wajib diisi'),
  requirements: z.array(GuideRequirementSchema).optional(),
  official_fee: z.record(z.string(), z.any()).optional().nullable(),
  official_processing_time: z.record(z.string(), z.any()).optional().nullable(),
  reviewed_at: z.string().datetime().optional().nullable(),
});

export class CreateGuideVersionDto extends createZodDto(
  CreateGuideVersionSchema,
) {}
