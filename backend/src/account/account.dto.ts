import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class UpdateProfileDto extends createZodDto(
  z
    .object({
      display_name: z.string().trim().min(3).max(200),
      phone: z
        .string()
        .max(30)
        .transform((value) => value.replace(/[\s-]/g, ''))
        .refine(
          (value) => value === '' || /^\+?\d{10,15}$/.test(value),
          'Nomor telepon harus berisi 10–15 angka.',
        ),
      expected_updated_at: z.iso.datetime().optional(),
    })
    .strict(),
) {}

export class ChangePasswordDto extends createZodDto(
  z
    .object({
      current_password: z.string().min(1).max(200),
      new_password: z
        .string()
        .min(8)
        .max(72)
        .refine(
          (value) => Buffer.byteLength(value, 'utf8') <= 72,
          'Kata sandi terlalu panjang.',
        ),
    })
    .strict(),
) {}

export class UpdatePreferencesDto extends createZodDto(
  z
    .object({
      font_size: z.enum(['normal', 'large']),
      high_contrast: z.boolean(),
      notify_in_app: z.boolean(),
    })
    .strict(),
) {}
