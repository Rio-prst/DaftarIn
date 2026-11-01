import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().email('Format email tidak valid'),
});

export class ForgotPasswordDto extends createZodDto(ForgotPasswordSchema) {}
