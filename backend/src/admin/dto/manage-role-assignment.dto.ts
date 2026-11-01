import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RoleItemSchema = z.object({
  role: z.enum(['officer', 'admin', 'citizen']),
  region_id: z.string().uuid().optional().nullable(),
  agency_id: z.string().uuid().optional().nullable(),
  active: z.boolean().default(true),
});

export const ManageRoleAssignmentSchema = z.object({
  assignments: z
    .array(RoleItemSchema)
    .min(1, 'Minimal satu penugasan peran wajib diberikan'),
  reason: z.string().trim().max(500).optional().nullable(),
});

export class ManageRoleAssignmentDto extends createZodDto(
  ManageRoleAssignmentSchema,
) {}
