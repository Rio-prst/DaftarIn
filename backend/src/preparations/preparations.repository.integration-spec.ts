import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import {
  AccountStatus,
  GuideVersionStatus,
  PreparationStatus,
  RuleVersionStatus,
  ServicePublicationStatus,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PreparationsRepository } from './preparations.repository';

const TEST_PREFIX = 'prep-integration-';
const USER_ID = 'e1111111-1111-4111-8111-111111111111';
const OTHER_USER_ID = 'e1111111-1111-4111-8111-111111111112';
const REGION_ID = 'e2222222-2222-4222-8222-222222222222';
const AGENCY_ID = 'e3333333-3333-4333-8333-333333333333';
const SERVICE_ID = 'e4444444-4444-4444-8444-444444444444';
const GUIDE_VERSION_ID = 'e5555555-5555-4555-8555-555555555555';
const RULE_VERSION_ID = 'e6666666-6666-4666-8666-666666666666';
const SOURCE_ID = 'e7777777-7777-4777-8777-777777777777';
const REQUIREMENT_ID = 'e8888888-8888-4888-8888-888888888888';
const QUESTION_ID = 'e9999999-9999-4999-8999-999999999999';

const NOW = new Date('2026-01-01T00:00:00.000Z');

let prisma: PrismaService;
let repository: PreparationsRepository;

async function cleanFixtures(): Promise<void> {
  if (!prisma) {
    return;
  }

  await prisma.answerVersion.deleteMany({
    where: {
      preparation: {
        userId: { in: [USER_ID, OTHER_USER_ID] },
      },
    },
  });

  await prisma.documentVersion.deleteMany({
    where: {
      userId: { in: [USER_ID, OTHER_USER_ID] },
    },
  });

  await prisma.preparation.deleteMany({
    where: {
      userId: { in: [USER_ID, OTHER_USER_ID] },
    },
  });

  await prisma.requirement.deleteMany({
    where: { id: REQUIREMENT_ID },
  });

  await prisma.requirementRuleVersion.deleteMany({
    where: { serviceId: SERVICE_ID },
  });

  await prisma.serviceQuestion.deleteMany({
    where: { serviceId: SERVICE_ID },
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

  await prisma.officialSource.deleteMany({
    where: { id: SOURCE_ID },
  });

  await prisma.region.deleteMany({
    where: { id: REGION_ID },
  });

  await prisma.user.deleteMany({
    where: { id: { in: [USER_ID, OTHER_USER_ID] } },
  });
}

async function createFixtures(): Promise<void> {
  await prisma.user.createMany({
    data: [
      {
        id: USER_ID,
        email: `${TEST_PREFIX}user@example.com`,
        displayName: 'Integration User',
        authProvider: 'local',
        passwordHash: 'hash',
        accountStatus: AccountStatus.ACTIVE,
      },
      {
        id: OTHER_USER_ID,
        email: `${TEST_PREFIX}other@example.com`,
        displayName: 'Other User',
        authProvider: 'local',
        passwordHash: 'hash',
        accountStatus: AccountStatus.ACTIVE,
      },
    ],
  });

  await prisma.region.create({
    data: {
      id: REGION_ID,
      code: `${TEST_PREFIX}3171`,
      name: 'Kota Uji Preparations',
      regionType: 'city',
      isActive: true,
    },
  });

  await prisma.officialSource.create({
    data: {
      id: SOURCE_ID,
      url: 'https://example.go.id/sumber',
      title: 'Sumber Resmi',
      publisher: 'Dinas',
      sourceType: 'official_website',
      accessedAt: NOW,
      lastCheckedAt: NOW,
      reviewStatus: 'available',
    },
  });

  await prisma.agency.create({
    data: {
      id: AGENCY_ID,
      name: 'Dinas Uji',
      agencyType: 'local_government',
      regionId: REGION_ID,
      isActive: true,
    },
  });

  await prisma.service.create({
    data: {
      id: SERVICE_ID,
      slug: `${TEST_PREFIX}layanan`,
      name: 'Layanan Uji Preparations',
      category: 'Kependudukan',
      summary: 'Ringkasan layanan uji.',
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
          title: 'Siapkan dokumen',
          description: 'Siapkan dokumen yang diperlukan.',
        },
      ],
      publishedAt: NOW,
    },
  });

  await prisma.requirementRuleVersion.create({
    data: {
      id: RULE_VERSION_ID,
      serviceId: SERVICE_ID,
      versionNumber: 1,
      status: RuleVersionStatus.PUBLISHED,
      rulesConfigJson: {},
      effectiveAt: NOW,
      publishedAt: NOW,
    },
  });

  await prisma.requirement.create({
    data: {
      id: REQUIREMENT_ID,
      ruleVersionId: RULE_VERSION_ID,
      requirementCode: `${TEST_PREFIX}req_ktp`,
      title: 'KTP Pemohon',
      description: 'Scan KTP asli',
      requirementType: 'document',
      isMandatory: true,
      conditionJson: { type: 'always' },
      sourceId: SOURCE_ID,
      displayOrder: 1,
    },
  });

  await prisma.serviceQuestion.create({
    data: {
      id: QUESTION_ID,
      serviceId: SERVICE_ID,
      questionKey: `${TEST_PREFIX}alasan`,
      label: 'Alasan pengajuan?',
      inputType: 'single_select',
      isPublicNonpersonal: true,
      isRequired: true,
      displayOrder: 1,
      isActive: true,
    },
  });
}

describe('PreparationsRepository integration', () => {
  beforeAll(async () => {
    const databaseUrl = process.env.DATABASE_URL_TEST;

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL_TEST wajib diisi untuk integration test preparations.',
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
    repository = new PreparationsRepository(prisma);

    await cleanFixtures();
    await createFixtures();
  }, 30_000);

  afterAll(async () => {
    await cleanFixtures();

    if (prisma) {
      await prisma.$disconnect();
    }
  }, 30_000);

  it('creates a preparation with initial answers and finds it by id', async () => {
    const created = await repository.create({
      userId: USER_ID,
      serviceId: SERVICE_ID,
      guideVersionId: GUIDE_VERSION_ID,
      internalReference: 'PREP-2026-TEST001',
      answers: [
        {
          questionId: QUESTION_ID,
          value: 'baru',
        },
      ],
    });

    expect(created.id).toBeDefined();
    expect(created.internalReference).toBe('PREP-2026-TEST001');
    expect(created.status).toBe(PreparationStatus.DRAFT);
    expect(created.currentDataVersion).toBe(1);
    expect(created.answerVersions).toHaveLength(1);
    expect(created.answerVersions[0].questionId).toBe(QUESTION_ID);

    const found = await repository.findById(created.id, USER_ID);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);
    expect(found?.service.name).toBe('Layanan Uji Preparations');

    const unauthorizedFind = await repository.findById(
      created.id,
      OTHER_USER_ID,
    );
    expect(unauthorizedFind).toBeNull();
  });

  it('lists only preparations belonging to the user', async () => {
    const result = await repository.list({
      userId: USER_ID,
      page: 1,
      pageSize: 20,
      sort: 'updated_at',
      order: 'desc',
    });

    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.items.every((item) => item.userId === USER_ID)).toBe(true);
  });

  it('updates answers and increments dataVersion', async () => {
    const list = await repository.list({
      userId: USER_ID,
      page: 1,
      pageSize: 1,
      sort: 'created_at',
      order: 'desc',
    });

    const target = list.items[0];

    const updated = await repository.updateAnswers({
      id: target.id,
      nextDataVersion: 2,
      answers: [
        {
          questionId: QUESTION_ID,
          value: 'perubahan',
        },
      ],
      nextStatus: PreparationStatus.RECHECK_REQUIRED,
    });

    expect(updated.currentDataVersion).toBe(2);
    expect(updated.status).toBe(PreparationStatus.RECHECK_REQUIRED);

    const reloaded = await repository.findById(target.id, USER_ID);
    expect(reloaded?.currentDataVersion).toBe(2);
    expect(reloaded?.answerVersions).toHaveLength(2);
  });

  it('archives a preparation and excludes it from default list', async () => {
    const list = await repository.list({
      userId: USER_ID,
      page: 1,
      pageSize: 1,
      sort: 'created_at',
      order: 'desc',
    });

    const target = list.items[0];

    const archived = await repository.archive(target.id, USER_ID);
    expect(archived.status).toBe(PreparationStatus.ARCHIVED);
    expect(archived.archivedAt).toBeInstanceOf(Date);

    const defaultList = await repository.list({
      userId: USER_ID,
      page: 1,
      pageSize: 20,
      sort: 'updated_at',
      order: 'desc',
    });

    expect(defaultList.items.some((item) => item.id === target.id)).toBe(false);

    const archivedList = await repository.list({
      userId: USER_ID,
      status: PreparationStatus.ARCHIVED,
      page: 1,
      pageSize: 20,
      sort: 'updated_at',
      order: 'desc',
    });

    expect(archivedList.items.some((item) => item.id === target.id)).toBe(true);
  });

  it('finds latest published guide and requirements for the service', async () => {
    const guide = await repository.findLatestPublishedGuide(SERVICE_ID);
    expect(guide).not.toBeNull();
    expect(guide?.versionNumber).toBe(1);

    const ruleVersion = await repository.findRequirementsForRule(SERVICE_ID);
    expect(ruleVersion).not.toBeNull();
    expect(ruleVersion?.requirements).toHaveLength(1);
    expect(ruleVersion?.requirements[0].title).toBe('KTP Pemohon');

    const questions = await repository.findQuestionsForService(SERVICE_ID);
    expect(questions).toHaveLength(1);
    expect(questions[0].questionKey).toBe(`${TEST_PREFIX}alasan`);
  });
});
