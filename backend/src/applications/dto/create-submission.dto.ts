import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateSubmissionSchema = z.object({
  citizen_note: z.string().trim().max(1000).optional().nullable(),
  consent_version: z.string().trim().default('v1.0'),
  consent_confirmed: z.literal(true),
  family_member_id: z.string().uuid().optional().nullable(),
  agency_id: z.string().uuid().optional().nullable(),
});

export class CreateSubmissionDto extends createZodDto(CreateSubmissionSchema) {}

export const CreateResubmissionSchema = z.object({
  changes_summary: z.string().trim().min(1).max(1000),
  citizen_note: z.string().trim().max(1000).optional().nullable(),
  consent_version: z.string().trim().default('v1.0'),
  consent_confirmed: z.literal(true),
});

export class CreateResubmissionDto extends createZodDto(
  CreateResubmissionSchema,
) {}
