import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ResetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Token reset wajib disertakan'),
  new_password: z
    .string()
    .min(8, 'Kata sandi baru minimal 8 karakter')
    .max(128, 'Kata sandi baru maksimal 128 karakter'),
});

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
