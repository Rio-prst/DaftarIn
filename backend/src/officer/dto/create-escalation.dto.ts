import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateOfficerEscalationSchema = z.object({
  reason: z.string().trim().min(5).max(1000),
  urgency: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  target_role: z.enum(['admin', 'supervisor']).default('admin'),
});

export class CreateOfficerEscalationDto extends createZodDto(
  CreateOfficerEscalationSchema,
) {}
