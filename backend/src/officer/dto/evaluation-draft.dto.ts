import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AssessmentItemSchema = z.object({
  item_type: z.enum(['DOCUMENT', 'FORM_DATA']),
  item_id: z.string(),
  verdict: z.enum(['SESUAI', 'PERLU_PERBAIKAN', 'BELUM_DAPAT_DIPERIKSA']),
  note: z.string().trim().max(1000).default(''),
});

export const EvaluationDraftSchema = z.object({
  overall_notes: z.string().trim().max(2000).optional().nullable(),
  items: z.array(AssessmentItemSchema).default([]),
});

export class EvaluationDraftDto extends createZodDto(EvaluationDraftSchema) {}
