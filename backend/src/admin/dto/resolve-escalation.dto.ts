import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ResolveEscalationSchema = z.object({
  resolution_note: z.string().trim().min(5).max(1000),
});

export class ResolveEscalationDto extends createZodDto(
  ResolveEscalationSchema,
) {}
