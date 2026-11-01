import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LinkPreparationSchema = z.object({
  preparation_id: z.string().uuid(),
});

export class LinkPreparationDto extends createZodDto(LinkPreparationSchema) {}
