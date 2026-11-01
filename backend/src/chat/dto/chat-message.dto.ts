import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ChatHistoryItemSchema = z.object({
  sender: z.enum(['user', 'bot']),
  text: z.string().trim().min(1).max(1500),
});

export const ChatMessageRequestSchema = z.object({
  query: z.string().trim().min(1).max(1000),
  serviceId: z
    .union([z.string().uuid(), z.number().int().min(1).max(6)])
    .optional(),
  history: z.array(ChatHistoryItemSchema).max(4).default([]),
});

export class ChatMessageRequestDto extends createZodDto(
  ChatMessageRequestSchema,
) {}
