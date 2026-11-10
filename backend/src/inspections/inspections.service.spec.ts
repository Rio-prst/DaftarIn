import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  FindingResolutionStatus,
  FindingSeverity,
  InspectionStatus,
  PreparationStatus,
} from '../generated/prisma/client';
import type { IPreparationsRepository } from '../preparations/interfaces/preparations.repository.interface';
import type { IStorageService } from '../storage/interfaces/storage.service.interface';
import { InspectionMapper } from './inspection.mapper';
import { InspectionsService } from './inspections.service';
import type { IInspectionAiProvider } from './interfaces/inspection-ai.interface';
import type {
  FindingWithRelations,
  IInspectionsRepository,
  InspectionRunWithRuleVersion,
} from './interfaces/inspections.repository.interface';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const PREPARATION_ID = '22222222-2222-4222-8222-222222222222';
const SERVICE_ID = '33333333-3333-4333-8333-333333333333';
const GUIDE_VERSION_ID = '44444444-4444-4444-8444-444444444444';
const RULE_VERSION_ID = '55555555-5555-4555-8555-555555555555';
const RUN_ID = '66666666-6666-4666-8666-666666666666';
const REQ_ID = '77777777-7777-4777-8777-777777777777';
const DOC_ID = '88888888-8888-4888-8888-888888888888';
const FINDING_ID = '99999999-9999-4999-8999-999999999999';

function makeMockPreparation(overrides: Record<string, any> = {}): any {
  return {
    id: PREPARATION_ID,
    userId: USER_ID,
    serviceId: SERVICE_ID,
    guideVersionId: GUIDE_VERSION_ID,
    internalReference: 'PREP-2026-0001',
    status: PreparationStatus.DRAFT,
    currentDataVersion: 1,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    service: {
      id: SERVICE_ID,
      name: 'Layanan Pembuatan KTP',
      slug: 'ktp',
      region: { id: 'reg-1', name: 'DKI Jakarta' },
    },
    guideVersion: { versionNumber: 1 },
    answerVersions: [],
    documentVersions: [
      {
        id: DOC_ID,
        documentType: 'REQ_KTP',
        versionNumber: 1,
        originalFilename: 'ktp.jpg',
        storageKey: 'preparations/ktp.jpg',
        mimeType: 'image/jpeg',
        fileSizeBytes: BigInt(1024),
        deletedAt: null,
      },
    ],
    inspectionRuns: [],
    ...overrides,
  };
}

describe('InspectionsService', () => {
  let service: InspectionsService;
  let inspectionsRepository: jest.Mocked<IInspectionsRepository>;
  let preparationsRepository: jest.Mocked<IPreparationsRepository>;
  let storageService: jest.Mocked<IStorageService>;
  let aiProvider: jest.Mocked<IInspectionAiProvider>;
  let mapper: InspectionMapper;

  beforeEach(() => {
    inspectionsRepository = {
      findActiveRun: jest.fn(),
      findByIdempotencyKey: jest.fn(),
      createRun: jest.fn(),
      updateRun: jest.fn(),
      findRunById: jest.fn(),
      listRuns: jest.fn(),
      failStaleRuns: jest.fn(),
      createFindings: jest.fn(),
      listFindings: jest.fn(),
      findFinding: jest.fn(),
      createCorrection: jest.fn(),
      updateFindingResolution: jest.fn(),
      updateDocumentProcessingStatus: jest.fn(),
      updatePreparationStatus: jest.fn(),
    };

    preparationsRepository = {
      findById: jest.fn(),
      findRequirementsForRule: jest.fn(),
      findQuestionsForService: jest.fn(),
    } as unknown as jest.Mocked<IPreparationsRepository>;

    storageService = {
      downloadFile: jest.fn(),
      uploadFile: jest.fn(),
      createSignedUrl: jest.fn(),
      deleteFile: jest.fn(),
    };

    aiProvider = {
      analyzeDocument: jest.fn(),
    };

    mapper = new InspectionMapper();

    service = new InspectionsService(
      inspectionsRepository,
      preparationsRepository,
      storageService,
      aiProvider,
      mapper,
    );
  });

  describe('runInspection', () => {
    it('throws NotFoundException if preparation is not found', async () => {
      preparationsRepository.findById.mockResolvedValue(null);

      await expect(
        service.runInspection(PREPARATION_ID, USER_ID, {
          expectedDataVersion: 1,
          consent: {
            accepted: true,
            noticeVersion: '1.0',
            purpose: 'document_inspection',
          },
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if preparation is archived', async () => {
      preparationsRepository.findById.mockResolvedValue(
        makeMockPreparation({ status: PreparationStatus.ARCHIVED }),
      );

      await expect(
        service.runInspection(PREPARATION_ID, USER_ID, {
          expectedDataVersion: 1,
          consent: {
            accepted: true,
            noticeVersion: '1.0',
            purpose: 'document_inspection',
          },
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException on expectedDataVersion mismatch', async () => {
      preparationsRepository.findById.mockResolvedValue(
        makeMockPreparation({ currentDataVersion: 2 }),
      );

      await expect(
        service.runInspection(PREPARATION_ID, USER_ID, {
          expectedDataVersion: 1,
          consent: {
            accepted: true,
            noticeVersion: '1.0',
            purpose: 'document_inspection',
          },
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('returns existing run when idempotency key is matched', async () => {
      const prep = makeMockPreparation();
      preparationsRepository.findById.mockResolvedValue(prep);

      const existingRun: InspectionRunWithRuleVersion = {
        id: RUN_ID,
        preparationId: PREPARATION_ID,
        userId: USER_ID,
        guideVersionId: GUIDE_VERSION_ID,
        ruleVersionId: RULE_VERSION_ID,
        dataVersion: 1,
        status: InspectionStatus.COMPLETED,
        engineVersion: 'gemini-ocr-v1',
        modelVersion: 'gemini-3.5-flash-lite',
        inputSnapshotJson: {
          idempotency_key: 'idem-123',
          document_versions: [],
        },
        summaryJson: null,
        failureCode: null,
        queuedAt: new Date(),
        startedAt: new Date(),
        completedAt: new Date(),
        ruleVersion: { id: RULE_VERSION_ID, versionNumber: 1 },
      };

      inspectionsRepository.findByIdempotencyKey.mockResolvedValue(existingRun);

      const result = await service.runInspection(
        PREPARATION_ID,
        USER_ID,
        {
          expectedDataVersion: 1,
          consent: {
            accepted: true,
            noticeVersion: '1.0',
            purpose: 'document_inspection',
          },
        },
        'idem-123',
      );

      expect(result.id).toBe(RUN_ID);
      expect(inspectionsRepository.createRun).not.toHaveBeenCalled();
    });

    it('executes inspection workflow and creates findings for documents', async () => {
      const prep = makeMockPreparation();
      preparationsRepository.findById.mockResolvedValue(prep);
      inspectionsRepository.failStaleRuns.mockResolvedValue(0);
      inspectionsRepository.findActiveRun.mockResolvedValue(null);

      preparationsRepository.findRequirementsForRule.mockResolvedValue({
        id: RULE_VERSION_ID,
        versionNumber: 1,
        requirements: [
          {
            id: REQ_ID,
            requirementCode: 'REQ_KTP',
            title: 'KTP Elektronik',
            description: 'Foto KTP',
            isMandatory: true,
            conditionJson: null,
            source: {
              id: 'src-1',
              title: 'Aturan Dukcapil',
              url: 'https://dukcapil.go.id',
            },
          },
        ],
      } as any);

      preparationsRepository.findQuestionsForService.mockResolvedValue([]);

      const createdRun: InspectionRunWithRuleVersion = {
        id: RUN_ID,
        preparationId: PREPARATION_ID,
        userId: USER_ID,
        guideVersionId: GUIDE_VERSION_ID,
        ruleVersionId: RULE_VERSION_ID,
        dataVersion: 1,
        status: InspectionStatus.RUNNING,
        engineVersion: 'gemini-ocr-v1',
        modelVersion: null,
        inputSnapshotJson: {},
        summaryJson: null,
        failureCode: null,
        queuedAt: new Date(),
        startedAt: new Date(),
        completedAt: null,
        ruleVersion: { id: RULE_VERSION_ID, versionNumber: 1 },
      };

      inspectionsRepository.createRun.mockResolvedValue(createdRun);
      storageService.downloadFile.mockResolvedValue(Buffer.from('mock-bytes'));

      aiProvider.analyzeDocument.mockResolvedValue({
        document_type: 'REQ_KTP',
        readable: true,
        confidence: 0.95,
        fields: [{ name: 'nik', value: '3171012345678901', confidence: 0.95 }],
        issues: [],
        modelVersion: 'gemini-2.5-flash',
      });

      const updatedRun: InspectionRunWithRuleVersion = {
        ...createdRun,
        status: InspectionStatus.COMPLETED,
        modelVersion: 'gemini-2.5-flash',
        completedAt: new Date(),
        summaryJson: {
          title: 'Semua dokumen siap diajukan',
          description:
            'Dokumen terbaca dengan baik dan konsisten dengan isian formulir.',
          open_findings_count: 0,
          must_fix_count: 0,
          needs_confirmation_count: 0,
          informational_count: 0,
          documents_processed: 1,
          documents_failed: 0,
          documents_skipped: 0,
        },
      };

      inspectionsRepository.updateRun.mockResolvedValue(updatedRun);

      const result = await service.runInspection(PREPARATION_ID, USER_ID, {
        expectedDataVersion: 1,
        consent: {
          accepted: true,
          noticeVersion: '1.0',
          purpose: 'document_inspection',
        },
      });

      expect(result.id).toBe(RUN_ID);
      expect(result.status).toBe('completed');
      expect(result.result).toBe('ready_initial_check');
      expect(storageService.downloadFile).toHaveBeenCalledWith(
        'preparations/ktp.jpg',
      );
      expect(aiProvider.analyzeDocument).toHaveBeenCalled();
      expect(
        inspectionsRepository.updatePreparationStatus,
      ).toHaveBeenCalledWith(
        PREPARATION_ID,
        PreparationStatus.READY_INITIAL_CHECK,
      );
    });
  });

  describe('recordCorrection', () => {
    it('records user correction and updates resolution status', async () => {
      const mockFinding: FindingWithRelations = {
        id: FINDING_ID,
        inspectionRunId: RUN_ID,
        requirementId: REQ_ID,
        documentVersionId: DOC_ID,
        findingCode: 'NAME_MISMATCH',
        severity: FindingSeverity.WARNING,
        category: 'data_mismatch',
        title: 'Nama berbeda',
        explanation: 'Nama pada dokumen berbeda.',
        evidenceJson: { quoted_text: 'Budi' },
        suggestedActionsJson: {},
        readingConfidence: 0.9,
        resolutionStatus: FindingResolutionStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
        documentVersion: {
          id: DOC_ID,
          versionNumber: 1,
          originalFilename: 'ktp.jpg',
        },
        requirement: {
          id: REQ_ID,
          ruleVersionId: RULE_VERSION_ID,
          sourceId: 'src-1',
          requirementCode: 'REQ_KTP',
          title: 'KTP',
          description: 'Foto KTP',
          isMandatory: true,
          conditionJson: null,
          displayOrder: 1,
          requirementType: 'GENERAL',
          source: { id: 'src-1', title: 'Aturan', url: 'https://example.com' },
        },
        inspectionRun: {
          id: RUN_ID,
          preparationId: PREPARATION_ID,
          userId: USER_ID,
          guideVersionId: GUIDE_VERSION_ID,
          ruleVersionId: RULE_VERSION_ID,
          dataVersion: 1,
          status: InspectionStatus.COMPLETED,
          engineVersion: 'gemini-ocr-v1',
          modelVersion: 'gemini-3.5-flash-lite',
          inputSnapshotJson: {},
          summaryJson: null,
          failureCode: null,
          queuedAt: new Date(),
          startedAt: new Date(),
          completedAt: new Date(),
          ruleVersion: { id: RULE_VERSION_ID, versionNumber: 1 },
        },
        userCorrections: [],
      };

      inspectionsRepository.findFinding.mockResolvedValue(mockFinding);
      inspectionsRepository.createCorrection.mockResolvedValue({} as any);
      inspectionsRepository.updateFindingResolution.mockResolvedValue(
        {} as any,
      );
      inspectionsRepository.listFindings.mockResolvedValue([
        {
          ...mockFinding,
          resolutionStatus: FindingResolutionStatus.CORRECTED,
        },
      ]);

      const result = await service.recordCorrection(
        PREPARATION_ID,
        FINDING_ID,
        USER_ID,
        {
          correctedValue: 'Budi Setiawan',
          note: 'Sesuai dengan akta lahir',
        },
      );

      expect(result.success).toBe(true);
      expect(inspectionsRepository.createCorrection).toHaveBeenCalledWith({
        findingId: FINDING_ID,
        userId: USER_ID,
        originalValueJson: { quoted_text: 'Budi' },
        correctedValueJson: { corrected_value: 'Budi Setiawan' },
        correctionNote: 'Sesuai dengan akta lahir',
      });
      expect(
        inspectionsRepository.updateFindingResolution,
      ).toHaveBeenCalledWith(FINDING_ID, FindingResolutionStatus.CORRECTED);
      expect(
        inspectionsRepository.updatePreparationStatus,
      ).toHaveBeenCalledWith(
        PREPARATION_ID,
        PreparationStatus.READY_INITIAL_CHECK,
      );
    });
  });
});
