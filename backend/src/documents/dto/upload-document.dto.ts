import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const uploadDocumentSchema = z
  .object({
    document_type: z.string().trim().min(1).max(64),
    requirement_id: z.string().uuid().optional(),
    display_name: z.string().trim().max(160).optional(),
  })
  .strip();

export class UploadDocumentDto extends createZodDto(uploadDocumentSchema) {}

const uploadVersionSchema = z
  .object({
    display_name: z.string().trim().max(160).optional(),
  })
  .strip();

export class UploadVersionDto extends createZodDto(uploadVersionSchema) {}
