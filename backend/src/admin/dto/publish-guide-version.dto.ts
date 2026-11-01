import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PublishGuideVersionSchema = z.object({
  confirm_sources_reviewed: z
    .boolean()
    .refine(
      (val) => val === true,
      'Konfirmasi peninjauan sumber wajib bernilai true',
    ),
  change_summary: z.string().trim().max(1000).optional().nullable(),
});

export class PublishGuideVersionDto extends createZodDto(
  PublishGuideVersionSchema,
) {}
