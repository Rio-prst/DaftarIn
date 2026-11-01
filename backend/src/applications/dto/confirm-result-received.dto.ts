import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ConfirmResultReceivedSchema = z.object({
  received_at: z.string().datetime().optional().nullable(),
  channel: z.enum(['online_portal', 'in_person', 'email', 'other']).optional(),
  official_reference_number: z.string().trim().max(120).optional().nullable(),
  acknowledgement_confirmed: z.literal(true),
  note: z.string().trim().max(1000).optional().nullable(),
  proof_document_id: z.string().uuid().optional().nullable(),
});

export class ConfirmResultReceivedDto extends createZodDto(
  ConfirmResultReceivedSchema,
) {}
