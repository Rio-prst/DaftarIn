import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ConfirmResultReceivedSchema = z.object({
  received_at: z.string().datetime().optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
});

export class ConfirmResultReceivedDto extends createZodDto(
  ConfirmResultReceivedSchema,
) {}
