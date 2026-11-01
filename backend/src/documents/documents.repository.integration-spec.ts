import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import {
  AccountStatus,
  GuideVersionStatus,
  PreparationStatus,
  ServicePublicationStatus,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentsRepository } from './documents.repository';

const TEST_PREFIX = 'doc-integration-';
const USER_ID = 'f1111111-1111-4111-8111-111111111111';
const REGION_ID = 'f2222222-2222-4222-8222-222222222222';
const AGENCY_ID = 'f3333333-3333-4333-8333-333333333333';
const SERVICE_ID = 'f4444444-4444-4444-8444-444444444444';
const GUIDE_VERSION_ID = 'f5555555-5555-4555-8555-555555555555';
const PREPARATION_ID = 'f6666666-6666-4666-8666-666666666666';

const NOW = new Date('2026-01-01T00:00:00.000Z');

let prisma: PrismaService;
let repository: DocumentsRepository;

async function cleanFixtures(): Promise<void> {
  if (!prisma) {
    return;
  }

  await prisma.documentVersion.deleteMany({
    where: { preparationId: PREPARATION_ID },
  });

  await prisma.preparation.deleteMany({
    where: { id: PREPARATION_ID },
  });

  await prisma.guideVersion.deleteMany({
    where: { serviceId: SERVICE_ID },
  });

  await prisma.service.deleteMany({
    where: { id: SERVICE_ID },
  });

  await prisma.agency.deleteMany({
    where: { id: AGENCY_ID },
  });

  await prisma.region.deleteMany({
    where: { id: REGION_ID },
  });

  await prisma.user.deleteMany({
    where: { id: USER_ID },
  });
}

async function createFixtures(): Promise<void> {
  await prisma.user.create({
    data: {
      id: USER_ID,
      email: `${TEST_PREFIX}user@example.com`,
      displayName: 'Document Test User',
      authProvider: 'local',
      passwordHash: 'hash',
      accountStatus: AccountStatus.ACTIVE,
    },
  });

  await prisma.region.create({
    data: {
      id: REGION_ID,
      code: `${TEST_PREFIX}3171`,
      name: 'Kota Uji Dokumen',
      regionType: 'city',
      isActive: true,
    },
  });

  await prisma.agency.create({
    data: {
      id: AGENCY_ID,
      name: 'Dinas Uji Dokumen',
      agencyType: 'local_government',
      regionId: REGION_ID,
      isActive: true,
    },
  });

  await prisma.service.create({
    data: {
      id: SERVICE_ID,
      slug: `${TEST_PREFIX}layanan-dokumen`,
      name: 'Layanan Uji Dokumen',
      category: 'Kependudukan',
      summary: 'Ringkasan layanan uji dokumen.',
      agencyId: AGENCY_ID,
      regionId: REGION_ID,
      publicationStatus: ServicePublicationStatus.PUBLISHED,
      publishedAt: NOW,
    },
  });

  await prisma.guideVersion.create({
    data: {
      id: GUIDE_VERSION_ID,
      serviceId: SERVICE_ID,
      versionNumber: 1,
      status: GuideVersionStatus.PUBLISHED,
      procedureJson: [
        {
          step: 1,
          title: 'Unggah berkas',
          description: 'Unggah KTP dan Kartu Keluarga.',
        },
      ],
      publishedAt: NOW,
    },
  });

  await prisma.preparation.create({
    data: {
      id: PREPARATION_ID,
      userId: USER_ID,
      serviceId: SERVICE_ID,
      guideVersionId: GUIDE_VERSION_ID,
      internalReference: 'PREP-2026-DOC001',
      status: PreparationStatus.DRAFT,
      currentDataVersion: 1,
      version: 1,
    },
  });
}

describe('DocumentsRepository integration', () => {
  beforeAll(async () => {
    const databaseUrl = process.env.DATABASE_URL_TEST;

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL_TEST wajib diisi untuk integration test documents.',
      );
    }

    const configService = {
      getOrThrow: (key: string) => {
        if (key !== 'DATABASE_URL') {
          throw new Error(`Config ${key} tidak tersedia untuk test.`);
        }

        return databaseUrl;
      },
    } as unknown as ConfigService;

    prisma = new PrismaService(configService);
    await prisma.$connect();
    repository = new DocumentsRepository(prisma);

    await cleanFixtures();
    await createFixtures();
  }, 30_000);

  afterAll(async () => {
    await cleanFixtures();

    if (prisma) {
      await prisma.$disconnect();
    }
  }, 30_000);

  it('creates DocumentVersion and queries active versions', async () => {
    const v1 = await repository.createVersion({
      preparationId: PREPARATION_ID,
      userId: USER_ID,
      documentType: 'ktp',
      versionNumber: 1,
      storageKey: `users/${USER_ID}/ktp/v1.pdf`,
      originalFilename: 'ktp.pdf',
      detectedMimeType: 'application/pdf',
      fileSizeBytes: BigInt(2048),
      checksumSha256: 'sha256-mock-hash-1',
      processingStatus: 'available',
    });

    expect(v1.id).toBeDefined();
    expect(v1.versionNumber).toBe(1);
    expect(v1.fileSizeBytes).toBe(BigInt(2048));

    const activeList = await repository.findActiveVersions(PREPARATION_ID);
    expect(activeList).toHaveLength(1);
    expect(activeList[0].id).toBe(v1.id);

    const highest = await repository.getHighestVersionNumber(
      PREPARATION_ID,
      'ktp',
    );
    expect(highest).toBe(1);
  });

  it('enforces unique version constraint and supports version incrementing', async () => {
    const v2 = await repository.createVersion({
      preparationId: PREPARATION_ID,
      userId: USER_ID,
      documentType: 'ktp',
      versionNumber: 2,
      storageKey: `users/${USER_ID}/ktp/v2.pdf`,
      originalFilename: 'ktp-v2.pdf',
      detectedMimeType: 'application/pdf',
      fileSizeBytes: BigInt(4096),
      checksumSha256: 'sha256-mock-hash-2',
      processingStatus: 'available',
    });

    expect(v2.versionNumber).toBe(2);

    const highest = await repository.getHighestVersionNumber(
      PREPARATION_ID,
      'ktp',
    );
    expect(highest).toBe(2);

    const allKtp = await repository.findVersionsByType(PREPARATION_ID, 'ktp');
    expect(allKtp).toHaveLength(2);
    expect(allKtp[0].versionNumber).toBe(2);
    expect(allKtp[1].versionNumber).toBe(1);

    // Unique constraint on [preparationId, documentType, versionNumber]
    await expect(
      repository.createVersion({
        preparationId: PREPARATION_ID,
        userId: USER_ID,
        documentType: 'ktp',
        versionNumber: 2, // duplicate!
        storageKey: 'users/.../dup.pdf',
        originalFilename: 'dup.pdf',
        detectedMimeType: 'application/pdf',
        fileSizeBytes: BigInt(1024),
        checksumSha256: 'dup',
        processingStatus: 'available',
      }),
    ).rejects.toThrow();
  });

  it('soft-deletes all versions of a documentType', async () => {
    const deletedCount = await repository.softDeleteDocumentType(
      PREPARATION_ID,
      'ktp',
    );
    expect(deletedCount).toBe(2);

    const activeList = await repository.findActiveVersions(PREPARATION_ID);
    expect(activeList).toHaveLength(0);

    const highestAfterDelete = await repository.getHighestVersionNumber(
      PREPARATION_ID,
      'ktp',
    );
    // Highest recorded version is still 2 (so next version will be 3)
    expect(highestAfterDelete).toBe(2);
  });
});
