import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AssignOfficerSchema = z.object({
  application_id: z.string().uuid(),
  officer_user_id: z.string().uuid(),
  reason: z.string().trim().min(3).max(500),
  expected_version: z.number().int().positive().optional(),
});

export class AssignOfficerDto extends createZodDto(AssignOfficerSchema) {}
