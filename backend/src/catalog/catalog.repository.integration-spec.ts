import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import {
  GuideVersionStatus,
  RuleVersionStatus,
  ServicePublicationStatus,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogRepository } from './catalog.repository';

const TEST_PREFIX = 'catalog-integration-';
const REGION_ID = 'b1111111-1111-4111-8111-111111111111';
const AGENCY_ID = 'b2222222-2222-4222-8222-222222222222';
const SERVICE_ID = 'b3333333-3333-4333-8333-333333333333';
const DRAFT_SERVICE_ID = 'b3333333-3333-4333-8333-333333333334';
const GUIDE_VERSION_ID = 'b4444444-4444-4444-8444-444444444444';
const GUIDE_SECTION_ID = 'b5555555-5555-4555-8555-555555555555';
const SOURCE_ID = 'b6666666-6666-4666-8666-666666666666';
const SOURCE_LINK_ID = 'b7777777-7777-4777-8777-777777777777';
const RULE_VERSION_ID = 'b8888888-8888-4888-8888-888888888888';
const REQUIREMENT_ID = 'b9999999-9999-4999-8999-999999999999';
const QUESTION_ID = 'baaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
const PRIVATE_QUESTION_ID = 'baaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';

const NOW = new Date('2026-01-01T00:00:00.000Z');

let prisma: PrismaService;
let repository: CatalogRepository;

async function cleanFixtures(): Promise<void> {
  if (!prisma) {
    return;
  }

  await prisma.guideSourceLink.deleteMany({
    where: { id: SOURCE_LINK_ID },
  });
  await prisma.guideSection.deleteMany({
    where: { id: GUIDE_SECTION_ID },
  });
  await prisma.requirement.deleteMany({
    where: { id: REQUIREMENT_ID },
  });
  await prisma.serviceQuestion.deleteMany({
    where: {
      serviceId: {
        in: [SERVICE_ID, DRAFT_SERVICE_ID],
      },
    },
  });
  await prisma.guideVersion.deleteMany({
    where: {
      serviceId: {
        in: [SERVICE_ID, DRAFT_SERVICE_ID],
      },
    },
  });
  await prisma.requirementRuleVersion.deleteMany({
    where: {
      serviceId: {
        in: [SERVICE_ID, DRAFT_SERVICE_ID],
      },
    },
  });
  await prisma.service.deleteMany({
    where: {
      id: {
        in: [SERVICE_ID, DRAFT_SERVICE_ID],
      },
    },
  });
  await prisma.officialSource.deleteMany({
    where: { id: SOURCE_ID },
  });
  await prisma.agency.deleteMany({
    where: { id: AGENCY_ID },
  });
  await prisma.region.deleteMany({
    where: { id: REGION_ID },
  });
}

async function createFixtures(): Promise<void> {
  await prisma.region.create({
    data: {
      id: REGION_ID,
      code: `${TEST_PREFIX}3171`,
      name: 'Kota Integrasi',
      regionType: 'city',
      isActive: true,
    },
  });

  await prisma.agency.create({
    data: {
      id: AGENCY_ID,
      name: 'Dinas Integrasi',
      agencyType: 'local_government',
      regionId: REGION_ID,
      isActive: true,
    },
  });

  await prisma.service.create({
    data: {
      id: SERVICE_ID,
      slug: `${TEST_PREFIX}layanan`,
      name: 'Layanan Integrasi',
      category: 'Kategori Integrasi',
      summary: 'Ringkasan layanan integrasi.',
      agencyId: AGENCY_ID,
      regionId: REGION_ID,
      publicationStatus: ServicePublicationStatus.PUBLISHED,
      publishedAt: NOW,
    },
  });

  await prisma.service.create({
    data: {
      id: DRAFT_SERVICE_ID,
      slug: `${TEST_PREFIX}draft`,
      name: 'Draft Integrasi',
      category: 'Kategori Integrasi',
      summary: 'Draft layanan integrasi.',
      agencyId: AGENCY_ID,
      regionId: REGION_ID,
      publicationStatus: ServicePublicationStatus.DRAFT,
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
          title: 'Langkah integrasi',
          description: 'Deskripsi langkah integrasi.',
        },
      ],
      sourceReviewedAt: NOW,
      publishedAt: NOW,
    },
  });

  await prisma.guideSection.create({
    data: {
      id: GUIDE_SECTION_ID,
      guideVersionId: GUIDE_VERSION_ID,
      sectionType: 'procedure',
      title: 'Prosedur Integrasi',
      contentJson: {},
      displayOrder: 1,
    },
  });

  await prisma.officialSource.create({
    data: {
      id: SOURCE_ID,
      url: 'https://example.go.id/integrasi',
      title: 'Sumber Integrasi',
      publisher: 'Penerbit Integrasi',
      sourceType: 'official_website',
      accessedAt: NOW,
      lastCheckedAt: NOW,
      reviewStatus: 'available',
    },
  });

  await prisma.guideSourceLink.create({
    data: {
      id: SOURCE_LINK_ID,
      guideSectionId: GUIDE_SECTION_ID,
      sourceId: SOURCE_ID,
      claimOrField: 'procedure',
    },
  });

  await prisma.requirementRuleVersion.create({
    data: {
      id: RULE_VERSION_ID,
      serviceId: SERVICE_ID,
      versionNumber: 2,
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
      requirementCode: `${TEST_PREFIX}requirement`,
      title: 'Persyaratan Integrasi',
      description: 'Deskripsi persyaratan integrasi.',
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
      questionKey: `${TEST_PREFIX}question`,
      label: 'Pertanyaan Integrasi',
      inputType: 'boolean',
      isPublicNonpersonal: true,
      isRequired: true,
      optionsJson: [
        { value: 'true', label: 'Ya' },
        { value: 'false', label: 'Tidak' },
      ],
      validationJson: {
        help_text: 'Bantuan pertanyaan integrasi.',
      },
      displayOrder: 1,
      isActive: true,
    },
  });

  await prisma.serviceQuestion.create({
    data: {
      id: PRIVATE_QUESTION_ID,
      serviceId: SERVICE_ID,
      questionKey: `${TEST_PREFIX}private`,
      label: 'Pertanyaan Privat',
      inputType: 'text',
      isPublicNonpersonal: false,
      isRequired: true,
      displayOrder: 2,
      isActive: true,
    },
  });
}

describe('CatalogRepository integration', () => {
  beforeAll(async () => {
    const databaseUrl = process.env.DATABASE_URL_TEST;

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL_TEST wajib diisi untuk integration test catalog.',
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
    repository = new CatalogRepository(prisma);

    await cleanFixtures();
    await createFixtures();
  }, 30_000);

  afterAll(async () => {
    await cleanFixtures();

    if (prisma) {
      await prisma.$disconnect();
    }
  }, 30_000);

  it('lists only active regions matching the query', async () => {
    const result = await repository.listRegions({
      q: 'Integrasi',
      page: 1,
      pageSize: 20,
    });

    expect(result.total).toBe(1);
    expect(result.items[0]).toMatchObject({
      id: REGION_ID,
      name: 'Kota Integrasi',
      regionType: 'city',
      isActive: true,
    });
  });

  it('lists published services and excludes drafts', async () => {
    const result = await repository.listServices({
      q: 'Integrasi',
      page: 1,
      pageSize: 20,
      sort: 'name',
      order: 'asc',
    });

    expect(result.total).toBe(1);
    expect(result.items[0]).toMatchObject({
      id: SERVICE_ID,
      slug: `${TEST_PREFIX}layanan`,
      publicationStatus: ServicePublicationStatus.PUBLISHED,
    });
  });

  it('returns only published services by id', async () => {
    const published = await repository.findServiceById(SERVICE_ID);
    const draft = await repository.findServiceById(DRAFT_SERVICE_ID);

    expect(published?.id).toBe(SERVICE_ID);
    expect(draft).toBeNull();
  });

  it('loads the active guide and published requirements', async () => {
    const result = await repository.findServiceGuideById(SERVICE_ID);

    expect(result?.guideVersions).toHaveLength(1);
    expect(result?.guideVersions[0]?.versionNumber).toBe(1);
    expect(result?.requirementRuleVersions).toHaveLength(1);
    expect(result?.requirementRuleVersions[0]?.requirements).toHaveLength(1);
  });

  it('returns only active public questions', async () => {
    const result = await repository.findServiceQuestionsById(SERVICE_ID);

    expect(result?.serviceQuestions).toHaveLength(1);
    expect(result?.serviceQuestions[0]?.id).toBe(QUESTION_ID);
    expect(result?.requirementRuleVersions[0]?.versionNumber).toBe(2);
  });

  it('loads sources linked to guide sections and requirements', async () => {
    const result = await repository.findServiceSourcesById(SERVICE_ID);

    expect(
      result?.guideVersions[0]?.guideSections[0]?.guideSourceLinks,
    ).toHaveLength(1);
    expect(result?.requirementRuleVersions[0]?.requirements[0]?.source.id).toBe(
      SOURCE_ID,
    );
  });
});
