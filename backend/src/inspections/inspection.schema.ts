import { z } from 'zod';

const SeveritySchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(z.enum(['INFO', 'WARNING', 'BLOCKING']));

const CategorySchema = z
  .string()
  .trim()
  .transform((value) => value.toLowerCase())
  .pipe(
    z.enum([
      'completeness',
      'document_type',
      'readability',
      'required_data',
      'data_mismatch',
      'uncertainty',
      'technical',
    ]),
  );

const limitedText = (limit: number, fallback = '') =>
  z
    .string()
    .trim()
    .max(limit * 4)
    .optional()
    .nullable()
    .transform((value) => (value ?? fallback).slice(0, limit));

export const InspectionIssueSchema = z.object({
  code: limitedText(80, 'AI_ISSUE'),
  severity: SeveritySchema.default('WARNING'),
  category: CategorySchema.default('uncertainty'),
  title: limitedText(200, 'Temuan pemeriksaan'),
  explanation: limitedText(1200, 'Perlu diperiksa kembali.'),
  field: limitedText(120).transform((value) => value || null),
  quoted_text: limitedText(240).transform((value) => value || null),
  suggested_action: limitedText(300).transform((value) => value || null),
  page: z.coerce.number().int().min(1).max(1000).nullish().catch(null),
  confidence: z.coerce.number().min(0).max(1).nullish().catch(null),
});

export const InspectionFieldSchema = z.object({
  name: limitedText(120, 'field'),
  value: limitedText(300, ''),
  confidence: z.coerce.number().min(0).max(1).nullish().catch(null),
});

export const InspectionResultSchema = z.object({
  document_type: limitedText(120, ''),
  readable: z.boolean().catch(true),
  confidence: z.coerce.number().min(0).max(1).catch(0.5),
  fields: z.array(InspectionFieldSchema).max(40).optional().default([]),
  issues: z.array(InspectionIssueSchema).max(30).optional().default([]),
});

export type InspectionResult = z.infer<typeof InspectionResultSchema>;
export type InspectionIssue = z.infer<typeof InspectionIssueSchema>;
