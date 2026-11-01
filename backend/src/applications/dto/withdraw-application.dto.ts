import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const WithdrawApplicationSchema = z.object({
  reason: z.string().trim().min(5).max(500),
  confirmation: z.literal(true),
  expected_version: z.number().int().positive().optional(),
});

export class WithdrawApplicationDto extends createZodDto(
  WithdrawApplicationSchema,
) {}
