import { NotFoundException } from '@nestjs/common';
import {
  GuideVersionStatus,
  RuleVersionStatus,
  ServicePublicationStatus,
} from '../generated/prisma/client';
import { CatalogService } from './catalog.service';
import type {
  ICatalogRepository,
  ServiceGuideRecord,
  ServiceListRecord,
  ServiceQuestionsRecord,
  ServiceSourcesRecord,
} from './interfaces/catalog.repository.interface';

const CREATED_AT = new Date('2026-01-01T00:00:00.000Z');

const SOURCE = {
  id: 'source-1',
  url: 'https://example.go.id/sumber',
  title: 'Sumber Contoh',
  publisher: 'Penerbit Contoh',
  sourceType: 'official_website',
  sourcePublishedDate: null,
  accessedAt: CREATED_AT,
  lastCheckedAt: CREATED_AT,
  reviewStatus: 'available',
  createdAt: CREATED_AT,
};

const REGION = {
  id: 'region-1',
  code: '3171',
  name: 'Kota Contoh',
  regionType: 'city',
  parentRegionId: null,
  isActive: true,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
};

const AGENCY = {
  id: 'agency-1',
  name: 'Dinas Contoh',
  agencyType: 'local_government',
  regionId: 'region-1',
  address: null,
  officialWebsite: null,
  contactInfo: null,
  cooperationStatus: null,
  isActive: true,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
};

function makeServiceRecord(): ServiceListRecord {
  return {
    id: 'service-1',
    slug: 'layanan-contoh',
    name: 'Layanan Contoh',
    category: 'Administrasi Kependudukan',
    summary: 'Ringkasan layanan.',
    agencyId: 'agency-1',
    regionId: 'region-1',
    publicationStatus: ServicePublicationStatus.PUBLISHED,
    availability: 'ACTIVE' as any,
    pausedReason: null,
    publishedAt: CREATED_AT,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    agency: AGENCY,
    region: REGION,
    guideVersions: [
      {
        id: 'guide-1',
        serviceId: 'service-1',
        versionNumber: 1,
        status: GuideVersionStatus.PUBLISHED,
        procedureJson: [
          {
            step: 1,
            title: 'Siapkan dokumen',
            description: 'Siapkan dokumen.',
          },
        ],
        officialCostJson: null,
        officialDurationJson: null,
        applicationChannelsJson: [
          {
            id: 'channel-1',
            type: 'website',
            label: 'Portal',
            url: 'https://example.go.id',
            instructions: 'Ikuti petunjuk.',
          },
        ],
        sourceReviewedAt: CREATED_AT,
        publishedAt: CREATED_AT,
        createdAt: CREATED_AT,
        updatedAt: CREATED_AT,
        createdById: null,
        guideSections: [
          {
            id: 'section-1',
            guideVersionId: 'guide-1',
            sectionType: 'procedure',
            title: 'Prosedur',
            contentJson: {},
            displayOrder: 1,
            guideSourceLinks: [
              {
                id: 'link-1',
                guideSectionId: 'section-1',
                sourceId: 'source-1',
                claimOrField: 'procedure',
                notes: null,
                source: SOURCE,
              },
            ],
          },
        ],
      },
    ],
  };
}

function makeGuideRecord(): ServiceGuideRecord {
  return {
    ...makeServiceRecord(),
    requirementRuleVersions: [
      {
        id: 'rule-1',
        serviceId: 'service-1',
        versionNumber: 2,
        status: RuleVersionStatus.PUBLISHED,
        rulesConfigJson: {},
        effectiveAt: CREATED_AT,
        publishedAt: CREATED_AT,
        createdAt: CREATED_AT,
        updatedAt: CREATED_AT,
        createdById: null,
        requirements: [
          {
            id: 'requirement-1',
            ruleVersionId: 'rule-1',
            requirementCode: 'kk_lama',
            title: 'Kartu Keluarga lama',
            description: 'Kartu Keluarga lama.',
            requirementType: 'document',
            isMandatory: true,
            conditionJson: { type: 'always' },
            sourceId: 'source-1',
            displayOrder: 1,
            source: SOURCE,
          },
        ],
      },
    ],
  };
}

function makeQuestionsRecord(): ServiceQuestionsRecord {
  return {
    id: 'service-1',
    requirementRuleVersions: [
      {
        id: 'rule-1',
        serviceId: 'service-1',
        versionNumber: 2,
        status: RuleVersionStatus.PUBLISHED,
        rulesConfigJson: {},
        effectiveAt: CREATED_AT,
        publishedAt: CREATED_AT,
        createdAt: CREATED_AT,
        updatedAt: CREATED_AT,
        createdById: null,
      },
    ],
    serviceQuestions: [
      {
        id: 'question-1',
        serviceId: 'service-1',
        questionKey: 'alasan_permohonan',
        label: 'Apa alasan permohonan?',
        inputType: 'single_select',
        isPublicNonpersonal: true,
        isRequired: true,
        optionsJson: [
          { value: 'baru', label: 'KK baru' },
          { value: 'perubahan', label: 'Perubahan data' },
        ],
        validationJson: {
          help_text: 'Pilih alasan.',
          requirements_effect: ['requirement-1'],
        },
        dependsOnQuestionId: null,
        dependencyRuleJson: null,
        displayOrder: 1,
        isActive: true,
      },
    ],
  } as unknown as ServiceQuestionsRecord;
}

function makeSourcesRecord(): ServiceSourcesRecord {
  return {
    id: 'service-1',
    guideVersions: [
      {
        guideSections: [
          {
            id: 'section-1',
            title: 'Prosedur',
            guideSourceLinks: [
              {
                claimOrField: 'procedure',
                source: SOURCE,
              },
            ],
          },
        ],
      },
    ],
    requirementRuleVersions: [
      {
        requirements: [
          {
            requirementCode: 'kk_lama',
            title: 'Kartu Keluarga lama',
            source: SOURCE,
          },
        ],
      },
    ],
  } as unknown as ServiceSourcesRecord;
}

function makeRepository(): jest.Mocked<ICatalogRepository> {
  return {
    listRegions: jest.fn(),
    listServices: jest.fn(),
    findServiceById: jest.fn(),
    findServiceGuideById: jest.fn(),
    findServiceQuestionsById: jest.fn(),
    findServiceSourcesById: jest.fn(),
  };
}

describe('CatalogService', () => {
  let repository: jest.Mocked<ICatalogRepository>;
  let service: CatalogService;

  beforeEach(() => {
    repository = makeRepository();
    service = new CatalogService(repository);
  });

  it('returns regions with pagination metadata', async () => {
    repository.listRegions.mockResolvedValue({
      items: [REGION],
      total: 1,
    });

    const result = await service.listRegions({
      page: 1,
      pageSize: 20,
    });

    expect(result.data).toEqual([
      {
        id: 'region-1',
        name: 'Kota Contoh',
        type: 'city',
        parent_id: null,
      },
    ]);
    expect(result.meta).toEqual({
      page: 1,
      page_size: 20,
      total_items: 1,
      total_pages: 1,
    });
  });

  it('maps a published service summary', async () => {
    repository.listServices.mockResolvedValue({
      items: [makeServiceRecord()],
      total: 1,
    });

    const result = await service.listServices({
      page: 1,
      pageSize: 20,
      sort: 'published_at',
      order: 'desc',
    });

    expect(result.data[0]).toMatchObject({
      id: 'service-1',
      category: {
        id: 'Administrasi Kependudukan',
        name: 'Administrasi Kependudukan',
      },
      current_guide_version: 1,
      source_health: 'available',
      reviewed_at: '2026-01-01T00:00:00.000Z',
    });
  });

  it('throws when a service detail is missing', async () => {
    repository.findServiceById.mockResolvedValue(null);

    await expect(service.getService('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('maps guide requirements and procedure steps', async () => {
    repository.findServiceGuideById.mockResolvedValue(makeGuideRecord());

    const result = await service.getServiceGuide('service-1');

    expect(result.version).toBe(1);
    expect(result.requirements).toEqual([
      {
        id: 'requirement-1',
        name: 'Kartu Keluarga lama',
        description: 'Kartu Keluarga lama.',
        required: true,
        condition: { type: 'always' },
        sources: [
          {
            id: 'source-1',
            title: 'Sumber Contoh',
            url: 'https://example.go.id/sumber',
          },
        ],
      },
    ]);
    expect(result.procedure_steps).toEqual([
      {
        step: 1,
        title: 'Siapkan dokumen',
        description: 'Siapkan dokumen.',
      },
    ]);
  });

  it('maps public questions and questionnaire version', async () => {
    repository.findServiceQuestionsById.mockResolvedValue(
      makeQuestionsRecord(),
    );

    const result = await service.getServiceQuestions('service-1');

    expect(result.questionnaire_version).toBe(2);
    expect(result.questions[0]).toMatchObject({
      id: 'question-1',
      key: 'alasan_permohonan',
      help_text: 'Pilih alasan.',
      options: [
        { value: 'baru', label: 'KK baru' },
        { value: 'perubahan', label: 'Perubahan data' },
      ],
      requirements_effect: ['requirement-1'],
    });
  });

  it('deduplicates sources across guide sections and requirements', async () => {
    repository.findServiceSourcesById.mockResolvedValue(makeSourcesRecord());

    const result = await service.getServiceSources('service-1');

    expect(result.sources).toHaveLength(1);
    expect(result.sources[0]).toMatchObject({
      id: 'source-1',
      source_status: 'available',
    });
    expect(result.sources[0].supports).toHaveLength(2);
  });
});
