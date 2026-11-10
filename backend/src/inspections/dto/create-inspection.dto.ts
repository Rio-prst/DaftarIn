import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const documentVersionSchema = z.object({
  document_id: z.string().uuid(),
  version: z.number().int().positive(),
});

const consentSchema = z
  .object({
    accepted: z.boolean().default(true),
    notice_version: z.string().trim().default('1.0'),
    purpose: z.string().trim().default('document_inspection'),
  })
  .default({
    accepted: true,
    notice_version: '1.0',
    purpose: 'document_inspection',
  });

const createInspectionSchema = z
  .object({
    expected_data_version: z.number().int().positive().optional().default(1),
    document_versions: z.array(documentVersionSchema).optional(),
    consent: consentSchema.optional(),
  })
  .strip();

export class CreateInspectionDto extends createZodDto(createInspectionSchema) {}
