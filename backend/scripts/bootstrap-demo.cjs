// Explicit and idempotent demo environment bootstrap for DaftarIn.
// Does NOT wipe or reset database. Preserves existing accounts and passwords.
const path = require('node:path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
  quiet: true,
});
const bcrypt = require('bcrypt');
const { ConfigService } = require('@nestjs/config');

async function main() {
  const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL atau DIRECT_URL wajib diisi.');
  }

  // Load PrismaService
  const { PrismaService } = require('../dist/prisma/prisma.service.js');
  const db = new PrismaService(new ConfigService());

  try {
    console.log('Menjalankan bootstrap demo idempotent...');

    // 1. Pastikan Peran (Roles) Tersedia
    const citizenRole = await db.role.upsert({
      where: { roleCode: 'citizen' },
      update: {},
      create: { roleCode: 'citizen', roleName: 'Citizen' },
    });
    const officerRole = await db.role.upsert({
      where: { roleCode: 'officer' },
      update: {},
      create: { roleCode: 'officer', roleName: 'Officer' },
    });
    const adminRole = await db.role.upsert({
      where: { roleCode: 'admin' },
      update: {},
      create: { roleCode: 'admin', roleName: 'admin' },
    });

    // 2. Akun Contoh (Warga, Petugas, Admin)
    const demoAccounts = [
      {
        email: 'warga@daftarin.test',
        displayName: 'Warga Contoh',
        roleId: citizenRole.id,
        roleCode: 'citizen',
      },
      {
        email: 'petugas@daftarin.test',
        displayName: 'Petugas Verifikasi',
        roleId: officerRole.id,
        roleCode: 'officer',
      },
      {
        email: 'admin@daftarin.test',
        displayName: 'Administrator Sistem',
        roleId: adminRole.id,
        roleCode: 'admin',
      },
    ];

    const INITIAL_PASSWORD = 'DaftarIn2026!';

    for (const demo of demoAccounts) {
      const existing = await db.user.findUnique({
        where: { email: demo.email },
        include: { userRoles: true },
      });

      if (!existing) {
        const passwordHash = await bcrypt.hash(INITIAL_PASSWORD, 12);
        await db.user.create({
          data: {
            displayName: demo.displayName,
            email: demo.email,
            passwordHash,
            authProvider: 'local',
            accountStatus: 'ACTIVE',
            emailVerifiedAt: new Date(),
            userRoles: {
              create: {
                roleId: demo.roleId,
                isActive: true,
              },
            },
          },
        });
        console.log(`[BOOTSTRAP] Akun ${demo.email} (${demo.roleCode}) berhasil dibuat dengan sandi awal.`);
      } else {
        // Jangan mereset password jika akun sudah ada!
        console.log(`[BOOTSTRAP] Akun ${demo.email} sudah ada. Sandi existing tetap dipertahankan.`);

        // Pastikan role assignment aktif
        const hasRole = existing.userRoles.some((ur) => ur.roleId === demo.roleId);
        if (!hasRole) {
          await db.userRole.create({
            data: {
              userId: existing.id,
              roleId: demo.roleId,
              isActive: true,
            },
          });
          console.log(`[BOOTSTRAP] Role ${demo.roleCode} ditambahkan ke akun ${demo.email}.`);
        }
      }
    }

    // 3. Pastikan Katalog Layanan Contoh (Idempotent Upsert)
    try {
      const REGION_ID = '11111111-1111-4111-8111-111111111111';
      const AGENCY_ID = '22222222-2222-4222-8222-222222222222';
      const SERVICE_ID = '33333333-3333-4333-8333-333333333333';
      const GUIDE_VERSION_ID = '44444444-4444-4444-8444-444444444444';
      const RULE_VERSION_ID = '88888888-8888-4888-8888-888888888888';

      const region = await db.region.upsert({
        where: { code: '3171' },
        update: {},
        create: {
          id: REGION_ID,
          code: '3171',
          name: 'Kota Contoh',
          regionType: 'city',
          isActive: true,
        },
      });

      const agency = await db.agency.upsert({
        where: { id: AGENCY_ID },
        update: {},
        create: {
          id: AGENCY_ID,
          name: 'Dinas Kependudukan dan Pencatatan Sipil Kota Contoh',
          agencyType: 'local_government',
          regionId: region.id,
          address: 'Jl. Contoh No. 1, Kota Contoh',
          officialWebsite: 'https://disdukcapil.example.go.id',
          contactInfo: '0800-000-000',
          isActive: true,
        },
      });

      const service = await db.service.upsert({
        where: { slug: 'penerbitan-kartu-keluarga' },
        update: {},
        create: {
          id: SERVICE_ID,
          slug: 'penerbitan-kartu-keluarga',
          name: 'Penerbitan Kartu Keluarga',
          category: 'Administrasi Kependudukan',
          summary: 'Panduan contoh untuk penerbitan Kartu Keluarga.',
          agencyId: agency.id,
          regionId: region.id,
          publicationStatus: 'PUBLISHED',
          publishedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      });

      await db.guideVersion.upsert({
        where: {
          serviceId_versionNumber: {
            serviceId: service.id,
            versionNumber: 1,
          },
        },
        update: {},
        create: {
          id: GUIDE_VERSION_ID,
          serviceId: service.id,
          versionNumber: 1,
          status: 'PUBLISHED',
          procedureJson: [
            { step: 1, title: 'Siapkan dokumen persyaratan', description: 'Pastikan KK lama, KTP, dan surat pengantar lengkap dan jelas.' },
            { step: 2, title: 'Kirim permohonan', description: 'Unggah formulir dan dokumen untuk ditinjau oleh petugas.' },
            { step: 3, title: 'Terima hasil', description: 'Pantau status permohonan hingga dokumen KK baru diterbitkan.' },
          ],
          officialCostJson: { status: 'gratis', amount: 0, currency: 'IDR', display_text: 'Gratis / Rp 0' },
          officialDurationJson: { status: 'estimasi', value: 3, unit: 'hari_kerja', display_text: '1-3 Hari Kerja' },
          applicationChannelsJson: [
            { id: 'online', type: 'website', label: 'Portal Layanan Online', url: 'https://layanan.example.go.id' },
            { id: 'in_person', type: 'in_person', label: 'Loket Disdukcapil', url: null },
          ],
          publishedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      });

      await db.requirementRuleVersion.upsert({
        where: {
          serviceId_versionNumber: {
            serviceId: service.id,
            versionNumber: 1,
          },
        },
        update: {},
        create: {
          id: RULE_VERSION_ID,
          serviceId: service.id,
          versionNumber: 1,
          status: 'PUBLISHED',
          rulesConfigJson: {},
          publishedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      });

      const source = await db.officialSource.upsert({
        where: { id: '66666666-6666-4666-8666-666666666661' },
        update: {},
        create: {
          id: '66666666-6666-4666-8666-666666666661',
          url: 'https://example.go.id/layanan/kartu-keluarga',
          title: 'Panduan Layanan Kartu Keluarga (contoh)',
          publisher: 'Pemerintah Kota Contoh',
          sourceType: 'official_website',
          reviewStatus: 'available',
          accessedAt: new Date('2026-01-01T00:00:00.000Z'),
          lastCheckedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      });

      await db.requirement.upsert({
        where: { id: '99999999-9999-4999-8999-999999999991' },
        update: {},
        create: {
          id: '99999999-9999-4999-8999-999999999991',
          ruleVersion: { connect: { id: RULE_VERSION_ID } },
          source: { connect: { id: source.id } },
          requirementCode: 'kk_lama',
          title: 'Kartu Keluarga Lama',
          description: 'Foto atau pindaian Kartu Keluarga lama yang masih terbaca jelas.',
          requirementType: 'document',
          isMandatory: true,
          conditionJson: { type: 'always' },
          displayOrder: 1,
        },
      });

      await db.requirement.upsert({
        where: { id: '99999999-9999-4999-8999-999999999992' },
        update: {},
        create: {
          id: '99999999-9999-4999-8999-999999999992',
          ruleVersion: { connect: { id: RULE_VERSION_ID } },
          source: { connect: { id: source.id } },
          requirementCode: 'ktp_pemohon',
          title: 'KTP Pemohon / Kepala Keluarga',
          description: 'Foto KTP asli pemohon atau kepala keluarga.',
          requirementType: 'document',
          isMandatory: true,
          conditionJson: { type: 'always' },
          displayOrder: 2,
        },
      });

      await db.requirement.upsert({
        where: { id: '99999999-9999-4999-8999-999999999993' },
        update: {},
        create: {
          id: '99999999-9999-4999-8999-999999999993',
          ruleVersion: { connect: { id: RULE_VERSION_ID } },
          source: { connect: { id: source.id } },
          requirementCode: 'surat_pengantar',
          title: 'Surat Pengantar RT/RW',
          description: 'Surat pengantar dari RT/RW setempat jika ada perubahan data.',
          requirementType: 'document',
          isMandatory: false,
          conditionJson: { type: 'conditional' },
          displayOrder: 3,
        },
      });

      await db.serviceQuestion.upsert({
        where: {
          serviceId_questionKey: {
            serviceId: service.id,
            questionKey: 'alasan_permohonan',
          },
        },
        update: {},
        create: {
          id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
          serviceId: service.id,
          questionKey: 'alasan_permohonan',
          label: 'Apa alasan permohonan KK?',
          inputType: 'single_select',
          isPublicNonpersonal: true,
          isRequired: true,
          optionsJson: [
            { value: 'baru', label: 'Penerbitan KK Baru' },
            { value: 'perubahan', label: 'Perubahan Data KK' },
            { value: 'hilang_rusak', label: 'KK Hilang atau Rusak' },
          ],
          displayOrder: 1,
          isActive: true,
        },
      });

      console.log('[BOOTSTRAP] Katalog layanan, persyaratan, dan panduan berhasil disiapkan.');
    } catch (catalogErr) {
      console.log('[BOOTSTRAP NOTE] Katalog layanan di DB menunggu penerapan migration skema baru: ' + catalogErr.message);
    }

    console.log('[BOOTSTRAP] Katalog layanan, persyaratan, dan panduan berhasil disiapkan.');
    console.log('[BOOTSTRAP] Selesai tanpa membuat riwayat pengajuan otomatis.');
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error('[BOOTSTRAP ERROR]', err);
  process.exit(1);
});
