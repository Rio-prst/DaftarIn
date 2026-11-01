import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const registerSchema = z
  .object({
    display_name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    password: z.string().min(8).max(72),
    privacy_accepted: z.boolean().optional(),
    privacy_notice_version: z.string().max(100).optional(),
    terms_accepted: z.boolean().optional(),
    consent: z.boolean().optional(),
  })
  .strict();

export class RegisterDto extends createZodDto(registerSchema) {}
