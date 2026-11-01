import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateHelpRequestSchema = z.object({
  topic: z.string().trim().min(3).max(200),
  category: z.string().trim().min(2).max(80),
  message: z.string().trim().min(5).max(2000),
  application_id: z.string().uuid().optional().nullable(),
  preparation_id: z.string().uuid().optional().nullable(),
});

export class CreateHelpRequestDto extends createZodDto(
  CreateHelpRequestSchema,
) {}

export const CreateHelpReplySchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export class CreateHelpReplyDto extends createZodDto(CreateHelpReplySchema) {}
