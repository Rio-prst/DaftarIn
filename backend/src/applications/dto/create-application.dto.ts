import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ChannelTypeSchema = z.enum([
  'online',
  'in_person',
  'email',
  'other',
]);

export const ApplicationChannelDtoSchema = z.object({
  type: ChannelTypeSchema,
  label: z.string().trim().max(100).optional(),
  url: z.string().url().trim().optional(),
});

export const CreateApplicationSchema = z.object({
  service_id: z.string().uuid(),
  preparation_id: z.string().uuid().optional().nullable(),
  submitted_at: z.string().datetime().optional().nullable(),
  channel: ApplicationChannelDtoSchema,
  official_application_number: z.string().trim().max(120).optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
});

export class CreateApplicationDto extends createZodDto(
  CreateApplicationSchema,
) {}
