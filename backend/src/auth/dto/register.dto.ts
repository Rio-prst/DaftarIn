import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const registerSchema = z
  .object({
    display_name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    password: z.string().min(8).max(72),
  })
  .strict();

export class RegisterDto extends createZodDto(registerSchema) {}
