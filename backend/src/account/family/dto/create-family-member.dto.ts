import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const FamilyRelationshipEnum = z.enum([
  'SPOUSE',
  'CHILD',
  'PARENT',
  'SIBLING',
  'WARD',
  'OTHER',
]);

export const CreateFamilyMemberSchema = z.object({
  full_name: z.string().trim().min(1).max(200),
  relationship: FamilyRelationshipEnum,
  nik: z
    .string()
    .trim()
    .regex(/^\d{16}$/, 'NIK harus 16 digit')
    .optional()
    .nullable(),
  birth_date: z.string().datetime().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
  is_under_age: z.boolean().default(false),
});

export class CreateFamilyMemberDto extends createZodDto(
  CreateFamilyMemberSchema,
) {}

export const UpdateFamilyMemberSchema = CreateFamilyMemberSchema.partial();

export class UpdateFamilyMemberDto extends createZodDto(
  UpdateFamilyMemberSchema,
) {}
