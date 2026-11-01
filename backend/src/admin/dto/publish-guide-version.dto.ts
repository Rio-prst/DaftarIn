import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PublishGuideVersionSchema = z.object({
  confirm_sources_reviewed: z
    .boolean()
    .refine(
      (val) => val === true,
      'Konfirmasi peninjauan sumber wajib bernilai true',
    ),
  change_summary: z.string().trim().min(5).max(1000),
  expected_version: z.number().int().positive().optional(),
});

export class PublishGuideVersionDto extends createZodDto(
  PublishGuideVersionSchema,
) {}
