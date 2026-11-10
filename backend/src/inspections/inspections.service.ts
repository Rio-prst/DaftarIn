import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  FindingResolutionStatus,
  FindingSeverity,
  InspectionStatus,
  PreparationStatus,
} from '../generated/prisma/client';
import { PREPARATIONS_REPOSITORY } from '../preparations/interfaces/preparations.repository.interface';
import type { IPreparationsRepository } from '../preparations/interfaces/preparations.repository.interface';
import { STORAGE_SERVICE } from '../storage/interfaces/storage.service.interface';
import type { IStorageService } from '../storage/interfaces/storage.service.interface';
import { InspectionMapper } from './inspection.mapper';
import {
  INSPECTION_AI_PROVIDER,
  type IInspectionAiProvider,
  type InspectionAnswerInput,
} from './interfaces/inspection-ai.interface';
import {
  INSPECTIONS_REPOSITORY,
  type CreateFindingRepositoryInput,
  type IInspectionsRepository,
} from './interfaces/inspections.repository.interface';
import {
  type CreateInspectionServiceInput,
  type IInspectionsService,
  type InspectionFindingsResult,
  type InspectionRunView,
  type InspectionSummaryView,
  type ListInspectionFindingsInput,
  type RecordInspectionCorrectionInput,
} from './interfaces/inspections.service.interface';

@Injectable()
export class InspectionsService implements IInspectionsService {
  private readonly logger = new Logger(InspectionsService.name);

  constructor(
    @Inject(INSPECTIONS_REPOSITORY)
    private readonly inspectionsRepository: IInspectionsRepository,
    @Inject(PREPARATIONS_REPOSITORY)
    private readonly preparationsRepository: IPreparationsRepository,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
    @Inject(INSPECTION_AI_PROVIDER)
    private readonly aiProvider: IInspectionAiProvider,
    private readonly mapper: InspectionMapper,
  ) {}

  async runInspection(
    preparationId: string,
    userId: string,
    input: CreateInspectionServiceInput,
    idempotencyKey?: string,
  ): Promise<InspectionRunView> {
    const prep = await this.preparationsRepository.findById(
      preparationId,
      userId,
    );
    if (!prep) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }
    if (prep.status === PreparationStatus.ARCHIVED) {
      throw new BadRequestException('Persiapan telah diarsipkan.');
    }
    if (
      input.expectedDataVersion !== undefined &&
      input.expectedDataVersion !== prep.currentDataVersion
    ) {
      throw new ConflictException(
        'Versi data persiapan sudah berubah. Muat ulang halaman.',
      );
    }

    if (idempotencyKey) {
      const existing = await this.inspectionsRepository.findByIdempotencyKey(
        preparationId,
        idempotencyKey,
      );
      if (existing) {
        return this.mapper.mapRunToView(existing, prep.currentDataVersion);
      }
    }

    // Mark stale runs before checking active
    await this.inspectionsRepository.failStaleRuns(
      preparationId,
      new Date(Date.now() - 5 * 60 * 1000),
    );

    const activeRun =
      await this.inspectionsRepository.findActiveRun(preparationId);
    if (activeRun) {
      return this.mapper.mapRunToView(activeRun, prep.currentDataVersion);
    }

    const ruleVersion =
      await this.preparationsRepository.findRequirementsForRule(prep.serviceId);
    if (!ruleVersion) {
      throw new BadRequestException(
        'Aturan persyaratan belum dikonfigurasi untuk layanan ini.',
      );
    }

    const questions = await this.preparationsRepository.findQuestionsForService(
      prep.serviceId,
    );
    const questionById = new Map(questions.map((q) => [q.id, q]));

    const currentAnswers = prep.answerVersions.filter(
      (a) => a.dataVersion === prep.currentDataVersion,
    );

    const answersInput: InspectionAnswerInput[] = currentAnswers.map((a) => {
      const q = questionById.get(a.questionId);
      const val =
        typeof a.answerJson === 'object' &&
        a.answerJson !== null &&
        'value' in a.answerJson
          ? (a.answerJson as { value: unknown }).value
          : a.answerJson;
      let stringValue = '';
      if (
        typeof val === 'string' ||
        typeof val === 'number' ||
        typeof val === 'boolean'
      ) {
        stringValue = String(val);
      } else if (val) {
        stringValue = JSON.stringify(val);
      }
      return {
        questionKey: q?.questionKey ?? a.questionId,
        label: q?.label ?? a.questionId,
        value: stringValue,
      };
    });

    const answersByQuestionKey = new Map<string, unknown>();
    for (const a of currentAnswers) {
      const q = questionById.get(a.questionId);
      if (q) {
        const val =
          typeof a.answerJson === 'object' &&
          a.answerJson !== null &&
          'value' in a.answerJson
            ? (a.answerJson as { value: unknown }).value
            : a.answerJson;
        answersByQuestionKey.set(q.questionKey, val);
      }
    }

    const activeDocsByType = new Map<
      string,
      (typeof prep.documentVersions)[0]
    >();
    for (const doc of prep.documentVersions) {
      if (!activeDocsByType.has(doc.documentType)) {
        activeDocsByType.set(doc.documentType, doc);
      }
    }

    const activeDocsSnapshot = Array.from(activeDocsByType.values()).map(
      (doc) => ({
        document_id: doc.id,
        version: doc.versionNumber,
        document_type: doc.documentType,
        original_filename: doc.originalFilename,
      }),
    );

    const inputSnapshotJson = {
      idempotency_key: idempotencyKey ?? null,
      data_version: prep.currentDataVersion,
      guide_version: prep.guideVersion.versionNumber,
      rule_version: ruleVersion.versionNumber,
      document_versions: activeDocsSnapshot.map((d) => ({
        document_id: d.document_id,
        version: d.version,
      })),
      consent: input.consent,
    };

    const createdRun = await this.inspectionsRepository.createRun({
      preparationId,
      userId,
      guideVersionId: prep.guideVersionId,
      ruleVersionId: ruleVersion.id,
      dataVersion: prep.currentDataVersion,
      engineVersion: 'gemini-ocr-v1',
      inputSnapshotJson,
    });

    await this.inspectionsRepository.updatePreparationStatus(
      preparationId,
      PreparationStatus.INSPECTING,
    );

    const findingsToCreate: CreateFindingRepositoryInput[] = [];
    let docsProcessed = 0;
    let docsFailed = 0;
    let docsSkipped = 0;
    let lastModelVersion: string | null = null;

    try {
      for (const req of ruleVersion.requirements) {
        const condition = (req.conditionJson ?? { type: 'always' }) as Record<
          string,
          unknown
        >;
        const conditionType = condition.type ?? 'always';

        let isApplicable = false;
        if (conditionType === 'always') {
          isApplicable = true;
        } else if (conditionType === 'conditional') {
          if (typeof condition.question_key === 'string') {
            const ans = answersByQuestionKey.get(condition.question_key);
            if (
              (typeof ans === 'string' ||
                typeof ans === 'number' ||
                typeof ans === 'boolean') &&
              String(ans).toLowerCase() ===
                String(condition.equals).toLowerCase()
            ) {
              isApplicable = true;
            }
          }
        }

        if (!isApplicable) {
          continue;
        }

        const matchedDoc =
          activeDocsByType.get(req.requirementCode) ??
          activeDocsByType.get(req.id);

        if (!matchedDoc) {
          if (req.isMandatory) {
            findingsToCreate.push({
              inspectionRunId: createdRun.id,
              requirementId: req.id,
              documentVersionId: null,
              findingCode: 'DOCUMENT_MISSING',
              severity: FindingSeverity.BLOCKING,
              category: 'completeness',
              title: `Berkas "${req.title}" belum diunggah`,
              explanation: `Dokumen persyaratan "${req.title}" wajib disertakan namun belum ada berkas yang diunggah.`,
              evidenceJson: {
                field: 'document',
                requirement_code: req.requirementCode,
                missing: true,
              },
              suggestedActionsJson: {
                type: 'upload_document',
                label: 'Unggah berkas persyaratan',
              },
              readingConfidence: 1.0,
              resolutionStatus: FindingResolutionStatus.OPEN,
            });
          }
          docsSkipped++;
          continue;
        }

        try {
          const buffer = await this.storageService.downloadFile(
            matchedDoc.storageKey,
          );
          const aiResult = await this.aiProvider.analyzeDocument({
            documentVersionId: matchedDoc.id,
            documentType: matchedDoc.documentType,
            mimeType: matchedDoc.detectedMimeType,
            filename: matchedDoc.originalFilename,
            buffer,
            requirement: {
              id: req.id,
              code: req.requirementCode,
              title: req.title,
              description: req.description,
              required: req.isMandatory,
            },
            answers: answersInput,
          });

          lastModelVersion = aiResult.modelVersion;
          docsProcessed++;
          await this.inspectionsRepository.updateDocumentProcessingStatus(
            matchedDoc.id,
            'COMPLETED',
          );

          if (!aiResult.readable) {
            findingsToCreate.push({
              inspectionRunId: createdRun.id,
              requirementId: req.id,
              documentVersionId: matchedDoc.id,
              findingCode: 'DOCUMENT_UNREADABLE',
              severity: FindingSeverity.BLOCKING,
              category: 'readability',
              title: 'Dokumen tidak terbaca dengan jelas',
              explanation:
                'Berkas dokumen buram, terpotong, atau resolusi tidak memadai untuk dibaca.',
              evidenceJson: {
                page: 1,
                field: 'document',
                readable: false,
                confidence: aiResult.confidence,
              },
              suggestedActionsJson: {
                type: 'replace_document',
                label: 'Unggah ulang dokumen dengan kualitas lebih baik',
                target: { document_id: matchedDoc.id },
              },
              readingConfidence: aiResult.confidence,
              resolutionStatus: FindingResolutionStatus.OPEN,
            });
          }

          for (const issue of aiResult.issues) {
            findingsToCreate.push({
              inspectionRunId: createdRun.id,
              requirementId: req.id,
              documentVersionId: matchedDoc.id,
              findingCode: issue.code,
              severity:
                issue.severity === 'BLOCKING'
                  ? FindingSeverity.BLOCKING
                  : issue.severity === 'WARNING'
                    ? FindingSeverity.WARNING
                    : FindingSeverity.INFO,
              category: issue.category,
              title: issue.title,
              explanation: issue.explanation,
              evidenceJson: {
                page: issue.page ?? 1,
                field: issue.field ?? null,
                quoted_text: issue.quoted_text ?? null,
                confidence: issue.confidence ?? aiResult.confidence,
              },
              suggestedActionsJson: {
                type: 'correct_issue',
                label: issue.suggested_action ?? 'Periksa kembali dokumen ini',
                target: { document_id: matchedDoc.id },
              },
              readingConfidence: issue.confidence ?? aiResult.confidence,
              resolutionStatus: FindingResolutionStatus.OPEN,
            });
          }
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Provider unavailable';
          this.logger.warn(
            `Pemeriksaan AI untuk dokumen ${matchedDoc.id} tidak berhasil: ${errorMessage}`,
          );
          docsFailed++;
          await this.inspectionsRepository.updateDocumentProcessingStatus(
            matchedDoc.id,
            'FAILED',
          );

          findingsToCreate.push({
            inspectionRunId: createdRun.id,
            requirementId: req.id,
            documentVersionId: matchedDoc.id,
            findingCode: 'AI_INSPECTION_UNAVAILABLE',
            severity: FindingSeverity.WARNING,
            category: 'technical',
            title: 'Pemeriksaan otomatis dokumen belum selesai',
            explanation:
              'Dokumen belum dapat diperiksa otomatis oleh sistem AI/OCR. Dokumen akan diperiksa secara manual oleh petugas.',
            evidenceJson: {
              document_id: matchedDoc.id,
              error: errorMessage,
            },
            suggestedActionsJson: {
              type: 'manual_verification',
              label: 'Lanjutkan ke tinjauan petugas',
              target: { document_id: matchedDoc.id },
            },
            readingConfidence: 0.5,
            resolutionStatus: FindingResolutionStatus.OPEN,
          });
        }
      }

      await this.inspectionsRepository.createFindings(findingsToCreate);

      const mustFixCount = findingsToCreate.filter(
        (f) => f.severity === FindingSeverity.BLOCKING,
      ).length;
      const needsConfirmationCount = findingsToCreate.filter(
        (f) => f.severity === FindingSeverity.WARNING,
      ).length;
      const informationalCount = findingsToCreate.filter(
        (f) => f.severity === FindingSeverity.INFO,
      ).length;

      const summaryJson: InspectionSummaryView = {
        title:
          mustFixCount > 0
            ? 'Perlu perbaikan sebelum pengajuan'
            : needsConfirmationCount > 0
              ? 'Pemeriksaan selesai dengan beberapa catatan'
              : 'Semua dokumen siap diajukan',
        description:
          mustFixCount > 0
            ? `Ditemukan ${mustFixCount} temuan wajib yang perlu diperbaiki.`
            : needsConfirmationCount > 0
              ? `Ditemukan ${needsConfirmationCount} catatan untuk dikonfirmasi.`
              : 'Dokumen terbaca dengan baik dan konsisten dengan isian formulir.',
        open_findings_count: findingsToCreate.length,
        must_fix_count: mustFixCount,
        needs_confirmation_count: needsConfirmationCount,
        informational_count: informationalCount,
        documents_processed: docsProcessed,
        documents_failed: docsFailed,
        documents_skipped: docsSkipped,
      };

      const nextPrepStatus =
        mustFixCount > 0
          ? PreparationStatus.NEEDS_COMPLETION
          : needsConfirmationCount > 0
            ? PreparationStatus.NEEDS_CONFIRMATION
            : PreparationStatus.READY_INITIAL_CHECK;

      await this.inspectionsRepository.updatePreparationStatus(
        preparationId,
        nextPrepStatus,
      );

      const completedRun = await this.inspectionsRepository.updateRun(
        createdRun.id,
        {
          status: InspectionStatus.COMPLETED,
          modelVersion: lastModelVersion ?? 'gemini-3.5-flash-lite',
          summaryJson,
          completedAt: new Date(),
        },
      );

      return this.mapper.mapRunToView(completedRun, prep.currentDataVersion);
    } catch (error: unknown) {
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Gagal menjalankan inspeksi pada persiapan ${preparationId}`,
        errorStack,
      );
      await this.inspectionsRepository.updateRun(createdRun.id, {
        status: InspectionStatus.FAILED,
        failureCode: error instanceof Error ? error.name : 'INSPECTION_FAILED',
        completedAt: new Date(),
      });
      await this.inspectionsRepository.updatePreparationStatus(
        preparationId,
        PreparationStatus.INSPECTION_INCOMPLETE,
      );
      throw error;
    }
  }

  async listInspections(
    preparationId: string,
    userId: string,
  ): Promise<InspectionRunView[]> {
    const prep = await this.preparationsRepository.findById(
      preparationId,
      userId,
    );
    if (!prep) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }

    const runs = await this.inspectionsRepository.listRuns(preparationId);
    return runs.map((r) =>
      this.mapper.mapRunToView(r, prep.currentDataVersion),
    );
  }

  async getInspection(
    preparationId: string,
    inspectionId: string,
    userId: string,
  ): Promise<InspectionRunView> {
    const prep = await this.preparationsRepository.findById(
      preparationId,
      userId,
    );
    if (!prep) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }

    const run = await this.inspectionsRepository.findRunById(
      preparationId,
      inspectionId,
      userId,
    );
    if (!run) {
      throw new NotFoundException('Data pemeriksaan tidak ditemukan.');
    }

    return this.mapper.mapRunToView(run, prep.currentDataVersion);
  }

  async listFindings(
    preparationId: string,
    inspectionId: string,
    userId: string,
    input: ListInspectionFindingsInput,
  ): Promise<InspectionFindingsResult> {
    const prep = await this.preparationsRepository.findById(
      preparationId,
      userId,
    );
    if (!prep) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }

    const run = await this.inspectionsRepository.findRunById(
      preparationId,
      inspectionId,
      userId,
    );
    if (!run) {
      throw new NotFoundException('Data pemeriksaan tidak ditemukan.');
    }

    const allFindings =
      await this.inspectionsRepository.listFindings(inspectionId);

    const filtered = allFindings.filter((finding) => {
      if (input.status) {
        const mappedStatus = this.mapper.mapFindingStatus(
          finding.resolutionStatus,
        );
        if (
          mappedStatus.toLowerCase() !== input.status.toLowerCase() &&
          finding.resolutionStatus.toLowerCase() !== input.status.toLowerCase()
        ) {
          return false;
        }
      }

      if (input.category) {
        if (finding.category.toLowerCase() !== input.category.toLowerCase()) {
          return false;
        }
      }

      if (input.actionLevel) {
        const mappedLevel = this.mapper.mapFindingActionLevel(finding.severity);
        if (
          mappedLevel.toLowerCase() !== input.actionLevel.toLowerCase() &&
          finding.severity.toLowerCase() !== input.actionLevel.toLowerCase()
        ) {
          return false;
        }
      }

      return true;
    });

    const page = Math.max(1, input.page);
    const pageSize = Math.max(1, input.pageSize);
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      data: paged.map((f) => this.mapper.mapFindingToView(f)),
      meta: {
        page,
        page_size: pageSize,
        total_items: totalItems,
        total_pages: totalPages,
      },
    };
  }

  async recordCorrection(
    preparationId: string,
    findingId: string,
    userId: string,
    input: RecordInspectionCorrectionInput,
  ): Promise<{ success: boolean; message: string }> {
    const finding = await this.inspectionsRepository.findFinding(
      preparationId,
      findingId,
      userId,
    );
    if (!finding) {
      throw new NotFoundException('Temuan pemeriksaan tidak ditemukan.');
    }

    await this.inspectionsRepository.createCorrection({
      findingId,
      userId,
      originalValueJson: finding.evidenceJson ?? {},
      correctedValueJson: { corrected_value: input.correctedValue },
      correctionNote: input.note ?? null,
    });

    await this.inspectionsRepository.updateFindingResolution(
      findingId,
      FindingResolutionStatus.CORRECTED,
    );

    // Refresh remaining findings for the run to evaluate preparation status
    const allFindings = await this.inspectionsRepository.listFindings(
      finding.inspectionRunId,
    );
    const openBlocking = allFindings.filter(
      (f) =>
        f.id !== findingId &&
        f.severity === FindingSeverity.BLOCKING &&
        f.resolutionStatus === FindingResolutionStatus.OPEN,
    ).length;
    const openWarning = allFindings.filter(
      (f) =>
        f.id !== findingId &&
        f.severity === FindingSeverity.WARNING &&
        f.resolutionStatus === FindingResolutionStatus.OPEN,
    ).length;

    if (openBlocking === 0 && openWarning === 0) {
      await this.inspectionsRepository.updatePreparationStatus(
        preparationId,
        PreparationStatus.READY_INITIAL_CHECK,
      );
    } else if (openBlocking === 0) {
      await this.inspectionsRepository.updatePreparationStatus(
        preparationId,
        PreparationStatus.NEEDS_CONFIRMATION,
      );
    }

    return {
      success: true,
      message: 'Koreksi temuan berhasil dicatat.',
    };
  }
}
