import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const registerSchema = z
  .object({
    display_name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    password: z.string().min(8).refine((value) => Buffer.byteLength(value) <= 72),
    phone: z.string().trim().regex(/^\+?\d{10,15}$/, 'Isi nomor telepon 10–15 angka.'),
    nik: z.string().regex(/^\d{16}$/, 'NIK harus berisi 16 angka.'),
    family_card_number: z.string().regex(/^\d{16}$/, 'Nomor KK harus berisi 16 angka.'),
    privacy_accepted: z.literal('true'),
    privacy_notice_version: z.literal('2026-11-11'),
  })
  .strict();

export class RegisterDto extends createZodDto(registerSchema) {}
