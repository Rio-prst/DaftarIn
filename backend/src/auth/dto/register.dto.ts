import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const registerSchema = z
  .object({
    display_name: z.string().trim().min(3).max(200),
    email: z.string().trim().email().max(320),
    password: z
      .string()
      .min(8)
      .max(72)
      .refine(
        (value) => Buffer.byteLength(value, 'utf8') <= 72,
        'Kata sandi terlalu panjang.',
      ),
    privacy_accepted: z.literal(true),
    privacy_notice_version: z.literal('2026-11-01'),
  })
  .strict();

export class RegisterDto extends createZodDto(registerSchema) {}
