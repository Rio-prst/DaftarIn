import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  GuideVersionStatus,
  Prisma,
  PrismaClient,
  RuleVersionStatus,
  ServicePublicationStatus,
} from '../src/generated/prisma/client';

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DIRECT_URL atau DATABASE_URL wajib diisi untuk seed.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const REGION_ID = '11111111-1111-4111-8111-111111111111';
const AGENCY_ID = '22222222-2222-4222-8222-222222222222';
const SERVICE_ID = '33333333-3333-4333-8333-333333333333';
const GUIDE_VERSION_ID = '44444444-4444-4444-8444-444444444444';
const PROCEDURE_SECTION_ID = '55555555-5555-4555-8555-555555555551';
const REQUIREMENTS_SECTION_ID = '55555555-5555-4555-8555-555555555552';
const WEBSITE_SOURCE_ID = '66666666-6666-4666-8666-666666666661';
const REGULATION_SOURCE_ID = '66666666-6666-4666-8666-666666666662';
const PROCEDURE_SOURCE_LINK_ID = '77777777-7777-4777-8777-777777777771';
const REQUIREMENTS_SOURCE_LINK_ID = '77777777-7777-4777-8777-777777777772';
const RULE_VERSION_ID = '88888888-8888-4888-8888-888888888888';
const OLD_FAMILY_CARD_REQUIREMENT_ID = '99999999-9999-4999-8999-999999999991';
const ID_CARD_REQUIREMENT_ID = '99999999-9999-4999-8999-999999999992';
const NEIGHBORHOOD_LETTER_REQUIREMENT_ID =
  '99999999-9999-4999-8999-999999999993';
const REQUEST_REASON_QUESTION_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
const NEW_FAMILY_MEMBER_QUESTION_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';

const PUBLISHED_AT = new Date('2026-01-01T00:00:00.000Z');
const ACCESSED_AT = new Date('2026-01-01T00:00:00.000Z');
const LAST_CHECKED_AT = new Date('2026-01-01T00:00:00.000Z');

const additionalDemoServices = [
  {
    slug: 'penerbitan-ktp-el',
    name: 'Penerbitan dan Penggantian KTP-el',
    options: [
      { value: 'baru', label: 'KTP-el pertama' },
      { value: 'hilang', label: 'KTP-el hilang' },
      { value: 'rusak', label: 'KTP-el rusak' },
    ],
    documents: [
      { code: 'kk', title: 'Kartu Keluarga' },
      { code: 'bukti_hilang', title: 'Surat kehilangan contoh', when: 'hilang' },
      { code: 'ktp_rusak', title: 'KTP-el lama', when: 'rusak' },
    ],
  },
  {
    slug: 'pencatatan-kelahiran',
    name: 'Pencatatan Kelahiran',
    options: [{ value: 'baru', label: 'Pencatatan kelahiran baru' }],
    documents: [
      { code: 'kk', title: 'Kartu Keluarga' },
      { code: 'bukti_kelahiran', title: 'Surat keterangan kelahiran contoh' },
    ],
  },
  {
    slug: 'perpindahan-penduduk',
    name: 'Perpindahan Penduduk',
    options: [
      { value: 'dalam_daerah', label: 'Pindah dalam daerah' },
      { value: 'luar_daerah', label: 'Pindah ke luar daerah' },
    ],
    documents: [
      { code: 'kk', title: 'Kartu Keluarga' },
      { code: 'formulir_pindah', title: 'Formulir pindah contoh' },
    ],
  },
];

async function seedAdditionalDemoServices() {
  const existing = await prisma.service.findUniqueOrThrow({
    where: { slug: 'penerbitan-kartu-keluarga' },
    include: { region: true },
  });
  if (existing.region.name !== 'Kota Contoh') {
    throw new Error('Layanan contoh hanya dapat ditambahkan ke Kota Contoh.');
  }

  for (const entry of additionalDemoServices) {
    await prisma.$transaction(async (db) => {
      const alreadyExists = await db.service.findUnique({ where: { slug: entry.slug } });
      if (alreadyExists) return;

      const service = await db.service.create({
        data: {
          slug: entry.slug,
          name: entry.name,
          category: 'Administrasi Kependudukan',
          summary: 'Layanan simulasi Kota Contoh. Gunakan berkas contoh untuk mencoba alur persiapan.',
          agencyId: existing.agencyId,
          regionId: existing.regionId,
          publicationStatus: ServicePublicationStatus.PUBLISHED,
          publishedAt: PUBLISHED_AT,
        },
      });
      const source = await db.officialSource.create({
        data: {
          url: 'https://github.com/Rio-prst/DaftarIn',
          title: 'Data simulasi DaftarIn',
          publisher: 'DaftarIn',
          sourceType: 'demo',
          reviewStatus: 'needs_review',
          accessedAt: ACCESSED_AT,
        },
      });
      await db.guideVersion.create({
        data: {
          serviceId: service.id,
          versionNumber: 1,
          status: GuideVersionStatus.PUBLISHED,
          procedureJson: [
            { step: 1, title: 'Pilih kebutuhan', description: 'Pilih kondisi untuk mencoba alur simulasi.' },
            { step: 2, title: 'Siapkan berkas contoh', description: 'Unggah dokumen contoh untuk melihat proses validasi.' },
          ],
          publishedAt: PUBLISHED_AT,
        },
      });
      await db.requirementRuleVersion.create({
        data: {
          serviceId: service.id,
          versionNumber: 1,
          status: RuleVersionStatus.PUBLISHED,
          rulesConfigJson: {},
          publishedAt: PUBLISHED_AT,
          requirements: {
            create: entry.documents.map((document, index) => ({
              requirementCode: document.code,
              title: document.title,
              description: 'Unggah berkas contoh yang terbaca untuk simulasi ini.',
              requirementType: 'document',
              isMandatory: true,
              conditionJson: document.when
                ? { type: 'conditional', question_key: 'alasan_permohonan', equals: document.when }
                : { type: 'always' },
              sourceId: source.id,
              displayOrder: index + 1,
            })),
          },
        },
      });
      await db.serviceQuestion.create({
        data: {
          serviceId: service.id,
          questionKey: 'alasan_permohonan',
          label: 'Apa kebutuhanmu?',
          inputType: 'single_select',
          isPublicNonpersonal: true,
          isRequired: true,
          optionsJson: entry.options,
          displayOrder: 1,
        },
      });
    }, { timeout: 30_000 });
  }
}

async function main(): Promise<void> {
  const region = await prisma.region.upsert({
    where: { code: '3171' },
    update: {
      name: 'Kota Contoh',
      regionType: 'city',
      parentRegionId: null,
      isActive: true,
    },
    create: {
      id: REGION_ID,
      code: '3171',
      name: 'Kota Contoh',
      regionType: 'city',
      parentRegionId: null,
      isActive: true,
    },
  });

  const agency = await prisma.agency.upsert({
    where: { id: AGENCY_ID },
    update: {
      name: 'Dinas Kependudukan dan Pencatatan Sipil Kota Contoh',
      agencyType: 'local_government',
      regionId: region.id,
      address: 'Jl. Contoh No. 1, Kota Contoh',
      officialWebsite: 'https://example.go.id',
      contactInfo: '0800-000-000',
      cooperationStatus: 'not_applicable',
      isActive: true,
    },
    create: {
      id: AGENCY_ID,
      name: 'Dinas Kependudukan dan Pencatatan Sipil Kota Contoh',
      agencyType: 'local_government',
      regionId: region.id,
      address: 'Jl. Contoh No. 1, Kota Contoh',
      officialWebsite: 'https://example.go.id',
      contactInfo: '0800-000-000',
      cooperationStatus: 'not_applicable',
      isActive: true,
    },
  });

  const service = await prisma.service.upsert({
    where: { slug: 'penerbitan-kartu-keluarga' },
    update: {
      name: 'Penerbitan Kartu Keluarga',
      category: 'Administrasi Kependudukan',
      summary:
        'Panduan contoh untuk penerbitan Kartu Keluarga. Data ini adalah data dummy untuk pengembangan.',
      agencyId: agency.id,
      regionId: region.id,
      publicationStatus: ServicePublicationStatus.PUBLISHED,
      publishedAt: PUBLISHED_AT,
    },
    create: {
      id: SERVICE_ID,
      slug: 'penerbitan-kartu-keluarga',
      name: 'Penerbitan Kartu Keluarga',
      category: 'Administrasi Kependudukan',
      summary:
        'Panduan contoh untuk penerbitan Kartu Keluarga. Data ini adalah data dummy untuk pengembangan.',
      agencyId: agency.id,
      regionId: region.id,
      publicationStatus: ServicePublicationStatus.PUBLISHED,
      publishedAt: PUBLISHED_AT,
    },
  });

  const guideVersion = await prisma.guideVersion.upsert({
    where: {
      serviceId_versionNumber: {
        serviceId: service.id,
        versionNumber: 1,
      },
    },
    update: {
      status: GuideVersionStatus.PUBLISHED,
      procedureJson: [
        {
          step: 1,
          title: 'Siapkan dokumen',
          description:
            'Siapkan dokumen persyaratan yang tercantum pada bagian persyaratan.',
        },
        {
          step: 2,
          title: 'Ajukan permohonan',
          description:
            'Ajukan permohonan melalui kanal resmi yang tersedia pada panduan ini.',
        },
        {
          step: 3,
          title: 'Terima hasil',
          description:
            'Ikuti informasi dari instansi mengenai waktu dan cara pengambilan hasil.',
        },
      ],
      officialCostJson: {
        status: 'unknown',
        amount: null,
        currency: 'IDR',
        display_text: 'Belum tersedia pada sumber yang dicatat',
        sources: [],
      },
      officialDurationJson: {
        status: 'unknown',
        value: null,
        unit: null,
        basis: null,
        display_text: 'Belum tersedia pada sumber yang dicatat',
        sources: [],
      },
      applicationChannelsJson: [
        {
          id: 'channel-online',
          type: 'website',
          label: 'Portal layanan contoh',
          url: 'https://example.go.id/layanan/kartu-keluarga',
          instructions:
            'Ikuti petunjuk pada portal resmi yang tercantum. Data ini adalah data dummy.',
        },
        {
          id: 'channel-office',
          type: 'in_person',
          label: 'Loket layanan contoh',
          url: null,
          instructions:
            'Datang ke loket layanan pada hari kerja. Data ini adalah data dummy.',
        },
      ],
      sourceReviewedAt: PUBLISHED_AT,
      publishedAt: PUBLISHED_AT,
    },
    create: {
      id: GUIDE_VERSION_ID,
      serviceId: service.id,
      versionNumber: 1,
      status: GuideVersionStatus.PUBLISHED,
      procedureJson: [
        {
          step: 1,
          title: 'Siapkan dokumen',
          description:
            'Siapkan dokumen persyaratan yang tercantum pada bagian persyaratan.',
        },
        {
          step: 2,
          title: 'Ajukan permohonan',
          description:
            'Ajukan permohonan melalui kanal resmi yang tersedia pada panduan ini.',
        },
        {
          step: 3,
          title: 'Terima hasil',
          description:
            'Ikuti informasi dari instansi mengenai waktu dan cara pengambilan hasil.',
        },
      ],
      officialCostJson: {
        status: 'unknown',
        amount: null,
        currency: 'IDR',
        display_text: 'Belum tersedia pada sumber yang dicatat',
        sources: [],
      },
      officialDurationJson: {
        status: 'unknown',
        value: null,
        unit: null,
        basis: null,
        display_text: 'Belum tersedia pada sumber yang dicatat',
        sources: [],
      },
      applicationChannelsJson: [
        {
          id: 'channel-online',
          type: 'website',
          label: 'Portal layanan contoh',
          url: 'https://example.go.id/layanan/kartu-keluarga',
          instructions:
            'Ikuti petunjuk pada portal resmi yang tercantum. Data ini adalah data dummy.',
        },
        {
          id: 'channel-office',
          type: 'in_person',
          label: 'Loket layanan contoh',
          url: null,
          instructions:
            'Datang ke loket layanan pada hari kerja. Data ini adalah data dummy.',
        },
      ],
      sourceReviewedAt: PUBLISHED_AT,
      publishedAt: PUBLISHED_AT,
    },
  });

  await prisma.guideSection.upsert({
    where: { id: PROCEDURE_SECTION_ID },
    update: {
      guideVersionId: guideVersion.id,
      sectionType: 'procedure',
      title: 'Prosedur',
      contentJson: {
        note: 'Prosedur contoh untuk pengembangan.',
      },
      displayOrder: 1,
    },
    create: {
      id: PROCEDURE_SECTION_ID,
      guideVersionId: guideVersion.id,
      sectionType: 'procedure',
      title: 'Prosedur',
      contentJson: {
        note: 'Prosedur contoh untuk pengembangan.',
      },
      displayOrder: 1,
    },
  });

  await prisma.guideSection.upsert({
    where: { id: REQUIREMENTS_SECTION_ID },
    update: {
      guideVersionId: guideVersion.id,
      sectionType: 'requirements',
      title: 'Persyaratan',
      contentJson: {
        note: 'Persyaratan contoh untuk pengembangan.',
      },
      displayOrder: 2,
    },
    create: {
      id: REQUIREMENTS_SECTION_ID,
      guideVersionId: guideVersion.id,
      sectionType: 'requirements',
      title: 'Persyaratan',
      contentJson: {
        note: 'Persyaratan contoh untuk pengembangan.',
      },
      displayOrder: 2,
    },
  });

  const websiteSource = await prisma.officialSource.upsert({
    where: { id: WEBSITE_SOURCE_ID },
    update: {
      url: 'https://example.go.id/layanan/kartu-keluarga',
      title: 'Panduan Layanan Kartu Keluarga (contoh)',
      publisher: 'Pemerintah Kota Contoh',
      sourceType: 'official_website',
      sourcePublishedDate: null,
      accessedAt: ACCESSED_AT,
      lastCheckedAt: LAST_CHECKED_AT,
      reviewStatus: 'available',
    },
    create: {
      id: WEBSITE_SOURCE_ID,
      url: 'https://example.go.id/layanan/kartu-keluarga',
      title: 'Panduan Layanan Kartu Keluarga (contoh)',
      publisher: 'Pemerintah Kota Contoh',
      sourceType: 'official_website',
      sourcePublishedDate: null,
      accessedAt: ACCESSED_AT,
      lastCheckedAt: LAST_CHECKED_AT,
      reviewStatus: 'available',
    },
  });

  const regulationSource = await prisma.officialSource.upsert({
    where: { id: REGULATION_SOURCE_ID },
    update: {
      url: 'https://example.go.id/regulasi/kartu-keluarga',
      title: 'Regulasi Layanan Kartu Keluarga (contoh)',
      publisher: 'Pemerintah Kota Contoh',
      sourceType: 'regulation',
      sourcePublishedDate: null,
      accessedAt: ACCESSED_AT,
      lastCheckedAt: LAST_CHECKED_AT,
      reviewStatus: 'available',
    },
    create: {
      id: REGULATION_SOURCE_ID,
      url: 'https://example.go.id/regulasi/kartu-keluarga',
      title: 'Regulasi Layanan Kartu Keluarga (contoh)',
      publisher: 'Pemerintah Kota Contoh',
      sourceType: 'regulation',
      sourcePublishedDate: null,
      accessedAt: ACCESSED_AT,
      lastCheckedAt: LAST_CHECKED_AT,
      reviewStatus: 'available',
    },
  });

  await prisma.guideSourceLink.upsert({
    where: { id: PROCEDURE_SOURCE_LINK_ID },
    update: {
      guideSectionId: PROCEDURE_SECTION_ID,
      sourceId: websiteSource.id,
      claimOrField: 'procedure',
      notes: 'Sumber contoh untuk bagian prosedur.',
    },
    create: {
      id: PROCEDURE_SOURCE_LINK_ID,
      guideSectionId: PROCEDURE_SECTION_ID,
      sourceId: websiteSource.id,
      claimOrField: 'procedure',
      notes: 'Sumber contoh untuk bagian prosedur.',
    },
  });

  await prisma.guideSourceLink.upsert({
    where: { id: REQUIREMENTS_SOURCE_LINK_ID },
    update: {
      guideSectionId: REQUIREMENTS_SECTION_ID,
      sourceId: regulationSource.id,
      claimOrField: 'requirements',
      notes: 'Sumber contoh untuk bagian persyaratan.',
    },
    create: {
      id: REQUIREMENTS_SOURCE_LINK_ID,
      guideSectionId: REQUIREMENTS_SECTION_ID,
      sourceId: regulationSource.id,
      claimOrField: 'requirements',
      notes: 'Sumber contoh untuk bagian persyaratan.',
    },
  });

  const ruleVersion = await prisma.requirementRuleVersion.upsert({
    where: {
      serviceId_versionNumber: {
        serviceId: service.id,
        versionNumber: 1,
      },
    },
    update: {
      status: RuleVersionStatus.PUBLISHED,
      rulesConfigJson: {},
      effectiveAt: PUBLISHED_AT,
      publishedAt: PUBLISHED_AT,
    },
    create: {
      id: RULE_VERSION_ID,
      serviceId: service.id,
      versionNumber: 1,
      status: RuleVersionStatus.PUBLISHED,
      rulesConfigJson: {},
      effectiveAt: PUBLISHED_AT,
      publishedAt: PUBLISHED_AT,
    },
  });

  await prisma.requirement.upsert({
    where: {
      ruleVersionId_requirementCode: {
        ruleVersionId: ruleVersion.id,
        requirementCode: 'kk_lama',
      },
    },
    update: {
      title: 'Kartu Keluarga lama',
      description:
        'Kartu Keluarga yang sedang berlaku atau dokumen terakhir yang dimiliki.',
      requirementType: 'document',
      isMandatory: true,
      conditionJson: { type: 'always' },
      sourceId: regulationSource.id,
      displayOrder: 1,
    },
    create: {
      id: OLD_FAMILY_CARD_REQUIREMENT_ID,
      ruleVersionId: ruleVersion.id,
      requirementCode: 'kk_lama',
      title: 'Kartu Keluarga lama',
      description:
        'Kartu Keluarga yang sedang berlaku atau dokumen terakhir yang dimiliki.',
      requirementType: 'document',
      isMandatory: true,
      conditionJson: { type: 'always' },
      sourceId: regulationSource.id,
      displayOrder: 1,
    },
  });

  await prisma.requirement.upsert({
    where: {
      ruleVersionId_requirementCode: {
        ruleVersionId: ruleVersion.id,
        requirementCode: 'ktp_kepala_keluarga',
      },
    },
    update: {
      title: 'KTP kepala keluarga',
      description:
        'Kartu Tanda Penduduk kepala keluarga yang masih berlaku.',
      requirementType: 'document',
      isMandatory: true,
      conditionJson: { type: 'always' },
      sourceId: regulationSource.id,
      displayOrder: 2,
    },
    create: {
      id: ID_CARD_REQUIREMENT_ID,
      ruleVersionId: ruleVersion.id,
      requirementCode: 'ktp_kepala_keluarga',
      title: 'KTP kepala keluarga',
      description:
        'Kartu Tanda Penduduk kepala keluarga yang masih berlaku.',
      requirementType: 'document',
      isMandatory: true,
      conditionJson: { type: 'always' },
      sourceId: regulationSource.id,
      displayOrder: 2,
    },
  });

  await prisma.requirement.upsert({
    where: {
      ruleVersionId_requirementCode: {
        ruleVersionId: ruleVersion.id,
        requirementCode: 'surat_pengantar_rt_rw',
      },
    },
    update: {
      title: 'Surat pengantar RT/RW',
      description:
        'Surat pengantar dari RT/RW setempat sesuai ketentuan daerah.',
      requirementType: 'document',
      isMandatory: false,
      conditionJson: { type: 'conditional' },
      sourceId: regulationSource.id,
      displayOrder: 3,
    },
    create: {
      id: NEIGHBORHOOD_LETTER_REQUIREMENT_ID,
      ruleVersionId: ruleVersion.id,
      requirementCode: 'surat_pengantar_rt_rw',
      title: 'Surat pengantar RT/RW',
      description:
        'Surat pengantar dari RT/RW setempat sesuai ketentuan daerah.',
      requirementType: 'document',
      isMandatory: false,
      conditionJson: { type: 'conditional' },
      sourceId: regulationSource.id,
      displayOrder: 3,
    },
  });

  const requestReasonQuestion = await prisma.serviceQuestion.upsert({
    where: {
      serviceId_questionKey: {
        serviceId: service.id,
        questionKey: 'alasan_permohonan',
      },
    },
    update: {
      label: 'Apa alasan permohonan?',
      inputType: 'single_select',
      isPublicNonpersonal: true,
      isRequired: true,
      optionsJson: [
        { value: 'baru', label: 'Penerbitan KK baru' },
        { value: 'perubahan', label: 'Perubahan data KK' },
      ],
      validationJson: {
        help_text:
          'Pilih alasan yang paling sesuai. Data ini adalah data dummy.',
      },
      dependsOnQuestionId: null,
      dependencyRuleJson: Prisma.DbNull,
      displayOrder: 1,
      isActive: true,
    },
    create: {
      id: REQUEST_REASON_QUESTION_ID,
      serviceId: service.id,
      questionKey: 'alasan_permohonan',
      label: 'Apa alasan permohonan?',
      inputType: 'single_select',
      isPublicNonpersonal: true,
      isRequired: true,
      optionsJson: [
        { value: 'baru', label: 'Penerbitan KK baru' },
        { value: 'perubahan', label: 'Perubahan data KK' },
      ],
      validationJson: {
        help_text:
          'Pilih alasan yang paling sesuai. Data ini adalah data dummy.',
      },
      dependsOnQuestionId: null,
      dependencyRuleJson: Prisma.DbNull,
      displayOrder: 1,
      isActive: true,
    },
  });

  await prisma.serviceQuestion.upsert({
    where: {
      serviceId_questionKey: {
        serviceId: service.id,
        questionKey: 'anggota_keluarga_baru',
      },
    },
    update: {
      label: 'Apakah ada anggota keluarga baru?',
      inputType: 'boolean',
      isPublicNonpersonal: true,
      isRequired: true,
      optionsJson: [
        { value: 'true', label: 'Ya' },
        { value: 'false', label: 'Tidak' },
      ],
      validationJson: {
        help_text:
          'Pilih Ya jika ada penambahan anggota keluarga. Data ini adalah data dummy.',
      },
      dependsOnQuestionId: requestReasonQuestion.id,
      dependencyRuleJson: {
        question_key: 'alasan_permohonan',
        equals: 'perubahan',
      },
      displayOrder: 2,
      isActive: true,
    },
    create: {
      id: NEW_FAMILY_MEMBER_QUESTION_ID,
      serviceId: service.id,
      questionKey: 'anggota_keluarga_baru',
      label: 'Apakah ada anggota keluarga baru?',
      inputType: 'boolean',
      isPublicNonpersonal: true,
      isRequired: true,
      optionsJson: [
        { value: 'true', label: 'Ya' },
        { value: 'false', label: 'Tidak' },
      ],
      validationJson: {
        help_text:
          'Pilih Ya jika ada penambahan anggota keluarga. Data ini adalah data dummy.',
      },
      dependsOnQuestionId: requestReasonQuestion.id,
      dependencyRuleJson: {
        question_key: 'alasan_permohonan',
        equals: 'perubahan',
      },
      displayOrder: 2,
      isActive: true,
    },
  });
}

const seed = process.argv.includes('--additional-demo-services')
  ? seedAdditionalDemoServices()
  : main().then(seedAdditionalDemoServices);

seed
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
