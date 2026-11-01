import { z } from 'zod';

export function validateEnvironment(input: Record<string, unknown>) {
  const schema = z.object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z
      .string()
      .refine((value) => /^postgres(ql)?:\/\//.test(value)),
    JWT_ACCESS_SECRET: z
      .string()
      .min(32)
      .refine((value) => !value.startsWith('replace-')),
    COOKIE_SECURE: z.enum(['true', 'false']).default('false'),
    CORS_ORIGIN: z
      .string()
      .default('http://localhost:3001')
      .refine((value) =>
        value.split(',').every((item) => {
          try {
            const url = new URL(item.trim());
            return (
              url.origin === item.trim() &&
              ['http:', 'https:'].includes(url.protocol)
            );
          } catch {
            return false;
          }
        }),
      ),
  });
  const result = schema.safeParse(input);
  if (!result.success)
    throw new Error(
      'Konfigurasi server belum valid: ' +
        [
          ...new Set(result.error.issues.map((issue) => issue.path.join('.'))),
        ].join(', '),
    );
  if (
    result.data.NODE_ENV === 'production' &&
    (result.data.COOKIE_SECURE !== 'true' ||
      result.data.CORS_ORIGIN.split(',').some(
        (origin) => !origin.trim().startsWith('https://'),
      ))
  ) {
    throw new Error(
      'Produksi membutuhkan cookie Secure dan origin frontend HTTPS.',
    );
  }
  return { ...input, ...result.data };
}
