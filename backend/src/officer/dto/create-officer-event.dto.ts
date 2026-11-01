import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const OfficerEventStatusSchema = z.enum([
  'accepted',
  'verification',
  'needs_correction',
  'processing',
  'completed',
]);

export const RevisionActionSchema = z.object({
  type: z.string().trim().min(1),
  label: z.string().trim().min(1),
});

export const RevisionRequestSchema = z.object({
  reason: z.string().trim().min(1, 'Alasan revisi wajib diisi'),
  actions: z
    .array(RevisionActionSchema)
    .min(1, 'Minimal satu tindakan revisi wajib dicantumkan'),
  due_at: z.string().datetime().optional().nullable(),
});

export const CompletionInfoSchema = z.object({
  instructions: z.string().trim().min(1),
  result_url: z.string().url().optional().nullable(),
});

export const CreateOfficerEventSchema = z
  .object({
    event_type: z.enum(['status_changed', 'revision_requested']),
    status: OfficerEventStatusSchema,
    occurred_at: z.string().datetime().optional().nullable(),
    note: z.string().trim().max(2000).optional().nullable(),
    revision_request: RevisionRequestSchema.optional().nullable(),
    completion_info: CompletionInfoSchema.optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'needs_correction' && !data.revision_request) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'revision_request wajib diisi ketika status needs_correction',
        path: ['revision_request'],
      });
    }
  });

export class CreateOfficerEventDto extends createZodDto(
  CreateOfficerEventSchema,
) {}
