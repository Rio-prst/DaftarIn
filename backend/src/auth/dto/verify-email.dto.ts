import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const VerifyEmailSchema = z.object({
  token: z.string().trim().min(1, 'Token verifikasi wajib disertakan'),
});

export class VerifyEmailDto extends createZodDto(VerifyEmailSchema) {}
