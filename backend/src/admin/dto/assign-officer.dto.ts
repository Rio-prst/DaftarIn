import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AssignOfficerSchema = z.object({
  application_id: z.string().uuid(),
  officer_user_id: z.string().uuid(),
});

export class AssignOfficerDto extends createZodDto(AssignOfficerSchema) {}
