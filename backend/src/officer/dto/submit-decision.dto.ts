import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AssessmentItemSchema } from './evaluation-draft.dto';

export const SubmitDecisionSchema = z.object({
  decision: z.enum(['approved_for_submission', 'revision_requested']),
  expected_version: z.number().int().positive().optional(),
  overall_notes: z.string().trim().max(2000).optional().nullable(),
  revision_due_at: z.string().datetime().optional().nullable(),
  items: z
    .array(AssessmentItemSchema)
    .min(1, 'Minimal satu item penilaian harus diberikan'),
});

export class SubmitDecisionDto extends createZodDto(SubmitDecisionSchema) {}
