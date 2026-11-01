import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const loginSchema = z
  .object({
    email: z.string().trim().email().max(320),
    password: z.string().min(1).max(72),
  })
  .strict();

export class LoginDto extends createZodDto(loginSchema) {}
