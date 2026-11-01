import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class AdminListDto extends createZodDto(
  z
    .object({
      q: z.string().trim().max(160).optional(),
      cursor: z.uuid().optional(),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    })
    .strict(),
) {}

export class ChangeAccessDto extends createZodDto(
  z
    .object({
      role: z.enum(['citizen', 'officer']),
      status: z.enum(['ACTIVE', 'SUSPENDED']),
      agency_id: z.uuid().optional(),
      expected_updated_at: z.iso.datetime(),
      current_password: z.string().min(1).max(72),
    })
    .strict()
    .refine((value) => value.role !== 'officer' || Boolean(value.agency_id), {
      message: 'Pilih instansi untuk akses petugas.',
      path: ['agency_id'],
    }),
) {}
