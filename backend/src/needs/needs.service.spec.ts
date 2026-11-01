import { NotFoundException } from '@nestjs/common';
import {
  GuideVersionStatus,
  RuleVersionStatus,
  ServicePublicationStatus,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NeedsService } from './needs.service';

const SERVICE_ID = '11111111-1111-4111-8111-111111111111';
const REGION_ID = '22222222-2222-4222-8222-222222222222';
const SOURCE_ID = '33333333-3333-4333-8333-333333333333';
const REQ_ALWAYS_ID = '44444444-4444-4444-8444-444444444444';
const REQ_COND_ID = '55555555-5555-4555-8555-555555555555';
const QUESTION_ID = '66666666-6666-4666-8666-666666666666';

describe('NeedsService', () => {
  let prisma: jest.Mocked<PrismaService>;
  let service: NeedsService;

  beforeEach(() => {
    prisma = {
      service: {
        findFirst: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    service = new NeedsService(prisma);
  });

  it('throws NotFoundException when service is not found or inactive', async () => {
    (prisma.service.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      service.evaluateNeeds({
        serviceId: SERVICE_ID,
        regionId: REGION_ID,
        answers: [],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns always-active requirements by default', async () => {
    const mockService = {
      id: SERVICE_ID,
      regionId: REGION_ID,
      publicationStatus: ServicePublicationStatus.PUBLISHED,
      guideVersions: [
        {
          id: 'guide-1',
          versionNumber: 1,
          status: GuideVersionStatus.PUBLISHED,
        },
      ],
      requirementRuleVersions: [
        {
          id: 'rule-1',
          versionNumber: 2,
          status: RuleVersionStatus.PUBLISHED,
          requirements: [
            {
              id: REQ_ALWAYS_ID,
              requirementCode: 'ktp',
              title: 'KTP Pemohon',
              isMandatory: true,
              conditionJson: { type: 'always' },
              source: {
                id: SOURCE_ID,
                title: 'Peraturan Dukcapil',
                url: 'https://example.go.id',
              },
            },
            {
              id: REQ_COND_ID,
              requirementCode: 'surat_nikah',
              title: 'Buku Nikah',
              isMandatory: true,
              conditionJson: { type: 'conditional' },
              source: {
                id: SOURCE_ID,
                title: 'Peraturan Dukcapil',
                url: 'https://example.go.id',
              },
            },
          ],
        },
      ],
      serviceQuestions: [
        {
          id: QUESTION_ID,
          questionKey: 'status_perkawinan',
          label: 'Status Perkawinan?',
          inputType: 'single_select',
          isActive: true,
          validationJson: {
            requirements_effect: [REQ_COND_ID],
          },
        },
      ],
    };

    (prisma.service.findFirst as jest.Mock).mockResolvedValue(mockService);

    const result = await service.evaluateNeeds({
      serviceId: SERVICE_ID,
      regionId: REGION_ID,
      answers: [],
    });

    expect(result.service_id).toBe(SERVICE_ID);
    expect(result.region_id).toBe(REGION_ID);
    expect(result.questionnaire_version).toBe(2);
    expect(result.required_documents).toHaveLength(1);
    expect(result.required_documents[0].requirement_id).toBe(REQ_ALWAYS_ID);
  });

  it('includes conditional requirements when matching affirmative answers are provided', async () => {
    const mockService = {
      id: SERVICE_ID,
      regionId: REGION_ID,
      publicationStatus: ServicePublicationStatus.PUBLISHED,
      guideVersions: [
        {
          id: 'guide-1',
          versionNumber: 1,
          status: GuideVersionStatus.PUBLISHED,
        },
      ],
      requirementRuleVersions: [
        {
          id: 'rule-1',
          versionNumber: 2,
          status: RuleVersionStatus.PUBLISHED,
          requirements: [
            {
              id: REQ_ALWAYS_ID,
              requirementCode: 'ktp',
              title: 'KTP Pemohon',
              isMandatory: true,
              conditionJson: { type: 'always' },
              source: {
                id: SOURCE_ID,
                title: 'Peraturan Dukcapil',
                url: 'https://example.go.id',
              },
            },
            {
              id: REQ_COND_ID,
              requirementCode: 'surat_nikah',
              title: 'Buku Nikah',
              isMandatory: true,
              conditionJson: { type: 'conditional' },
              source: {
                id: SOURCE_ID,
                title: 'Peraturan Dukcapil',
                url: 'https://example.go.id',
              },
            },
          ],
        },
      ],
      serviceQuestions: [
        {
          id: QUESTION_ID,
          questionKey: 'status_perkawinan',
          label: 'Status Perkawinan?',
          inputType: 'single_select',
          isActive: true,
          validationJson: {
            requirements_effect: [REQ_COND_ID],
          },
        },
      ],
    };

    (prisma.service.findFirst as jest.Mock).mockResolvedValue(mockService);

    const result = await service.evaluateNeeds({
      serviceId: SERVICE_ID,
      regionId: REGION_ID,
      answers: [{ questionId: QUESTION_ID, value: 'menikah' }],
    });

    expect(result.required_documents).toHaveLength(2);
    expect(
      result.required_documents.some((d) => d.requirement_id === REQ_COND_ID),
    ).toBe(true);
  });
});
