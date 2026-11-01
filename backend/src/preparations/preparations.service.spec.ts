import { ConflictException, NotFoundException } from '@nestjs/common';
import { PreparationStatus } from '../generated/prisma/client';
import type {
  IPreparationsRepository,
  PreparationWithRelations,
} from './interfaces/preparations.repository.interface';
import { PreparationsService } from './preparations.service';

const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const SERVICE_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const REGION_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const PREPARATION_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const GUIDE_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const QUESTION_ID = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const SOURCE_ID = '11111111-2222-4333-8444-555555555555';
const REQ_ID = '99999999-9999-4999-8999-999999999999';

function makeMockPreparation(
  overrides: Partial<PreparationWithRelations> = {},
): PreparationWithRelations {
  return {
    id: PREPARATION_ID,
    userId: USER_ID,
    serviceId: SERVICE_ID,
    guideVersionId: GUIDE_ID,
    internalReference: 'PREP-2026-ABCDEF12',
    status: PreparationStatus.DRAFT,
    currentDataVersion: 1,
    version: 1,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    archivedAt: null,
    deletedAt: null,
    familyMemberId: null,
    service: {
      id: SERVICE_ID,
      slug: 'layanan-uji',
      name: 'Layanan Uji',
      regionId: REGION_ID,
      agencyId: 'agency-1',
      category: 'Kependudukan',
      summary: 'Ringkasan uji',
      publicationStatus: 'PUBLISHED',
      availability: 'ACTIVE' as any,
      pausedReason: null,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      region: {
        id: REGION_ID,
        code: '3171',
        name: 'Kota Uji',
        regionType: 'city',
        parentRegionId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    guideVersion: {
      id: GUIDE_ID,
      serviceId: SERVICE_ID,
      versionNumber: 1,
      status: 'PUBLISHED',
      procedureJson: null,
      officialCostJson: null,
      officialDurationJson: null,
      applicationChannelsJson: null,
      sourceReviewedAt: null,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: null,
    },
    answerVersions: [
      {
        id: 'ans-1',
        preparationId: PREPARATION_ID,
        questionId: QUESTION_ID,
        dataVersion: 1,
        answerJson: { value: 'baru' },
        valueOrigin: 'citizen_entered',
        createdAt: new Date(),
        createdById: USER_ID,
        question: {
          id: QUESTION_ID,
          serviceId: SERVICE_ID,
          questionKey: 'alasan',
          label: 'Alasan Permohonan',
          inputType: 'single_select',
          isPublicNonpersonal: true,
          isRequired: true,
          optionsJson: null,
          validationJson: null,
          dependsOnQuestionId: null,
          dependencyRuleJson: null,
          displayOrder: 1,
          isActive: true,
        },
      },
    ],
    documentVersions: [],
    inspectionRuns: [],
    ...overrides,
  };
}

describe('PreparationsService', () => {
  let repository: jest.Mocked<IPreparationsRepository>;
  let service: PreparationsService;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      updateAnswers: jest.fn(),
      archive: jest.fn(),
      findLatestPublishedGuide: jest.fn(),
      findRequirementsForRule: jest.fn(),
      findQuestionsForService: jest.fn(),
      restore: jest.fn(),
      delete: jest.fn(),
      countSubmissions: jest.fn(),
    };

    service = new PreparationsService(repository);
  });

  it('lists preparations with pagination metadata', async () => {
    repository.list.mockResolvedValue({
      items: [makeMockPreparation()],
      total: 1,
    });

    const result = await service.listPreparations({
      userId: USER_ID,
      page: 1,
      pageSize: 20,
      sort: 'updated_at',
      order: 'desc',
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(PREPARATION_ID);
    expect(result.data[0].status).toBe('draft');
    expect(result.data[0].readiness).toBe('not_assessed');
    expect(result.meta.total_items).toBe(1);
  });

  it('creates preparation with generated internal reference', async () => {
    repository.findLatestPublishedGuide.mockResolvedValue({
      id: GUIDE_ID,
      versionNumber: 1,
    } as any);

    repository.create.mockResolvedValue(makeMockPreparation());

    const result = await service.createPreparation({
      userId: USER_ID,
      serviceId: SERVICE_ID,
      answers: [],
    });

    expect(result.id).toBe(PREPARATION_ID);
    expect(result.guide_version).toBe(1);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER_ID,
        serviceId: SERVICE_ID,
        guideVersionId: GUIDE_ID,
        internalReference: expect.stringMatching(/^PREP-\d{4}-[A-Z0-9]+$/),
      }),
    );
  });

  it('throws NotFoundException if service has no published guide', async () => {
    repository.findLatestPublishedGuide.mockResolvedValue(null);

    await expect(
      service.createPreparation({
        userId: USER_ID,
        serviceId: SERVICE_ID,
        answers: [],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('gets preparation detail and returns mapped view', async () => {
    repository.findById.mockResolvedValue(makeMockPreparation());

    const result = await service.getPreparation(PREPARATION_ID, USER_ID);

    expect(result.id).toBe(PREPARATION_ID);
    expect(result.answers).toHaveLength(1);
    expect(result.answers[0].question_key).toBe('alasan');
    expect(result.answers[0].value).toBe('baru');
  });

  it('throws ConflictException when expectedDataVersion does not match', async () => {
    repository.findById.mockResolvedValue(
      makeMockPreparation({ currentDataVersion: 2 }),
    );

    await expect(
      service.updatePreparation({
        id: PREPARATION_ID,
        userId: USER_ID,
        nextDataVersion: 1,
        expectedDataVersion: 1, // Expected 1, actual 2 -> Conflict!
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('increments currentDataVersion on answer update', async () => {
    const initial = makeMockPreparation({ currentDataVersion: 1 });
    repository.findById.mockResolvedValue(initial);

    const updated = makeMockPreparation({ currentDataVersion: 2 });
    repository.updateAnswers.mockResolvedValue(updated);

    const result = await service.updatePreparation({
      id: PREPARATION_ID,
      userId: USER_ID,
      nextDataVersion: 1,
      expectedDataVersion: 1,
      answers: [{ questionId: QUESTION_ID, value: 'perubahan' }],
    });

    expect(result.data_version).toBe(2);
    expect(repository.updateAnswers).toHaveBeenCalledWith(
      expect.objectContaining({
        id: PREPARATION_ID,
        nextDataVersion: 2,
      }),
    );
  });

  it('archives a preparation and returns archived status', async () => {
    repository.findById.mockResolvedValue(makeMockPreparation());
    repository.archive.mockResolvedValue(
      makeMockPreparation({ status: PreparationStatus.ARCHIVED }),
    );

    const result = await service.archivePreparation(PREPARATION_ID, USER_ID);

    expect(result.status).toBe('archived');
    expect(result.is_archived).toBe(true);
  });

  it('evaluates requirements and marks fulfillment against uploaded documents', async () => {
    const prepWithDoc = makeMockPreparation({
      documentVersions: [
        {
          id: 'doc-1',
          preparationId: PREPARATION_ID,
          userId: USER_ID,
          documentType: 'ktp',
          versionNumber: 1,
          storageKey: 'private/key',
          originalFilename: 'ktp.jpg',
          detectedMimeType: 'image/jpeg',
          fileSizeBytes: BigInt(2048),
          checksumSha256: 'hash',
          processingStatus: 'available',
          uploadedAt: new Date(),
          deletedAt: null,
        },
      ],
    });

    repository.findById.mockResolvedValue(prepWithDoc);
    repository.findRequirementsForRule.mockResolvedValue({
      id: 'rule-1',
      versionNumber: 1,
      requirements: [
        {
          id: REQ_ID,
          requirementCode: 'ktp',
          title: 'KTP Pemohon',
          description: 'Foto/scan KTP',
          isMandatory: true,
          conditionJson: { type: 'always' },
          source: {
            id: SOURCE_ID,
            title: 'Peraturan',
            url: 'https://example.go.id',
          },
        } as any,
      ],
    } as any);
    repository.findQuestionsForService.mockResolvedValue([]);

    const result = await service.getPreparationRequirements(
      PREPARATION_ID,
      USER_ID,
    );

    expect(result.requirements).toHaveLength(1);
    expect(result.requirements[0].fulfilled).toBe(true);
    expect(result.requirements[0].document?.filename).toBe('ktp.jpg');
  });
});
