// Operator-only provisioning. No HTTP endpoint or default administrator password.
const path = require('node:path');
const { randomUUID } = require('node:crypto');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
  quiet: true,
});
const { z } = require('zod');
const bcrypt = require('bcrypt');
const { ConfigService } = require('@nestjs/config');
class OperatorInputError extends Error {}

async function main() {
  if (!process.argv.includes('--create-admin'))
    throw new OperatorInputError(
      'Gunakan opsi --create-admin untuk membuat akun administrator baru.',
    );
  const input = z
    .object({
      ADMIN_EMAIL: z
        .string()
        .trim()
        .email()
        .max(320)
        .transform((value) => value.toLowerCase()),
      ADMIN_NAME: z.string().trim().min(3).max(200),
      ADMIN_PASSWORD: z
        .string()
        .min(12)
        .refine((value) => Buffer.byteLength(value, 'utf8') <= 72),
      DATABASE_URL: z
        .string()
        .refine((value) => /^postgres(ql)?:\/\//.test(value)),
    })
    .safeParse(process.env);
  if (!input.success)
    throw new OperatorInputError(
      'Isi ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD (minimal 12 karakter, maksimal 72 byte), dan DATABASE_URL yang valid pada environment operator.',
    );
  const { PrismaService } = require('../dist/prisma/prisma.service.js');
  const db = new PrismaService(new ConfigService());
  try {
    const passwordHash = await bcrypt.hash(input.data.ADMIN_PASSWORD, 12);
    await db.$transaction(async (tx) => {
      const role = await tx.role.upsert({
        where: { roleCode: 'admin' },
        update: {},
        create: { roleCode: 'admin', roleName: 'Administrator' },
      });
      const user = await tx.user.create({
        data: {
          displayName: input.data.ADMIN_NAME,
          email: input.data.ADMIN_EMAIL,
          passwordHash,
          authProvider: 'local',
          accountStatus: 'ACTIVE',
          userRoles: { create: { roleId: role.id } },
        },
      });
      await tx.auditEvent.create({
        data: {
          actorUserId: user.id,
          actorRole: 'system',
          action: 'ADMIN_BOOTSTRAP',
          objectType: 'user',
          objectId: user.id,
          requestId: randomUUID(),
          outcome: 'success',
          metadataJson: {},
        },
      });
    });
    console.log(
      'Akun administrator baru berhasil dibuat. Gunakan halaman masuk aplikasi.',
    );
  } finally {
    await db.$disconnect();
    delete process.env.ADMIN_PASSWORD;
  }
}
main().catch((error) => {
  console.error(
    error instanceof OperatorInputError
      ? error.message
      : 'Pembuatan akun gagal. Periksa konfigurasi dan apakah email sudah terdaftar.',
  );
  process.exitCode = 1;
});
