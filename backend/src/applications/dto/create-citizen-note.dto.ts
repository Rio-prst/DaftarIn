import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateCitizenNoteSchema = z.object({
  note: z.string().trim().min(1, 'Catatan tidak boleh kosong').max(2000),
  reported_status: z.string().trim().optional(),
  occurred_at: z.string().datetime().optional().nullable(),
});

export class CreateCitizenNoteDto extends createZodDto(
  CreateCitizenNoteSchema,
) {}
