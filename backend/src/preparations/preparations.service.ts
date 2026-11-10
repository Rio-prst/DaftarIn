import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PreparationStatus } from '../generated/prisma/client';
import {
  PREPARATIONS_REPOSITORY,
  type IPreparationsRepository,
  type ListPreparationsRepositoryInput,
  type PreparationWithRelations,
  type UpdatePreparationAnswersRepositoryInput,
} from './interfaces/preparations.repository.interface';
import {
  type IPreparationsService,
  type CreatePreparationServiceInput,
  type ListPreparationsResult,
  type PreparationAnswerView,
  type PreparationDetailView,
  type PreparationDocumentSummaryView,
  type PreparationItemView,
  type PreparationRequirementView,
  type PreparationRequirementsResult,
} from './interfaces/preparations.service.interface';

@Injectable()
export class PreparationsService implements IPreparationsService {
  constructor(
    @Inject(PREPARATIONS_REPOSITORY)
    private readonly repository: IPreparationsRepository,
  ) {}

  async listPreparations(
    input: ListPreparationsRepositoryInput,
  ): Promise<ListPreparationsResult> {
    const { items, total } = await this.repository.list(input);

    return {
      data: items.map((item) => this.mapToItemView(item)),
      meta: {
        page: input.page,
        page_size: input.pageSize,
        total_items: total,
        total_pages: Math.ceil(total / input.pageSize),
      },
    };
  }

  async createPreparation(
    input: CreatePreparationServiceInput,
  ): Promise<PreparationDetailView> {
    const guide = await this.repository.findLatestPublishedGuide(
      input.serviceId,
      input.guideVersion,
    );

    if (!guide) {
      throw new NotFoundException(
        'Layanan tidak ditemukan atau belum memiliki panduan aktif.',
      );
    }

    if (input.regionId && guide.service.regionId !== input.regionId) {
      throw new BadRequestException(
        'Layanan tidak tersedia di wilayah yang dipilih.',
      );
    }

    const year = new Date().getFullYear();
    const randomHex = randomBytes(4).toString('hex').toUpperCase();
    const internalReference = 'PREP-' + year + '-' + randomHex;

    const record = await this.repository.create({
      userId: input.userId,
      serviceId: input.serviceId,
      guideVersionId: guide.id,
      internalReference,
      answers: input.answers,
    });

    return this.mapToDetailView(record);
  }

  async getPreparation(
    id: string,
    userId: string,
  ): Promise<PreparationDetailView> {
    const record = await this.repository.findById(id, userId);

    if (!record) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }

    return this.mapToDetailView(record);
  }

  async updatePreparation(
    input: UpdatePreparationAnswersRepositoryInput & {
      userId: string;
      expectedDataVersion?: number;
    },
  ): Promise<PreparationDetailView> {
    const record = await this.repository.findById(input.id, input.userId);

    if (!record) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }

    if (
      input.expectedDataVersion !== undefined &&
      input.expectedDataVersion !== record.currentDataVersion
    ) {
      throw new ConflictException(
        'Versi data persiapan sudah berubah (VERSION_CONFLICT). Muat ulang persiapan sebelum menyimpan.',
      );
    }

    const hasNewAnswers = input.answers && input.answers.length > 0;
    const nextDataVersion = hasNewAnswers
      ? record.currentDataVersion + 1
      : record.currentDataVersion;

    let nextStatus: PreparationStatus | undefined = undefined;
    if (hasNewAnswers && record.inspectionRuns.length > 0) {
      nextStatus = PreparationStatus.RECHECK_REQUIRED;
    }

    const updated = await this.repository.updateAnswers({
      id: input.id,
      expectedDataVersion: input.expectedDataVersion,
      nextDataVersion,
      answers: input.answers,
      nextStatus,
    });

    return this.mapToDetailView(updated);
  }

  async archivePreparation(
    id: string,
    userId: string,
  ): Promise<PreparationDetailView> {
    const record = await this.repository.findById(id, userId);

    if (!record) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }

    const archived = await this.repository.archive(id, userId);
    return this.mapToDetailView(archived);
  }

  async getPreparationRequirements(
    id: string,
    userId: string,
  ): Promise<PreparationRequirementsResult> {
    const record = await this.repository.findById(id, userId);

    if (!record) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }

    const ruleVersion = await this.repository.findRequirementsForRule(
      record.serviceId,
    );
    const questions = await this.repository.findQuestionsForService(
      record.serviceId,
    );

    const requirements = ruleVersion?.requirements ?? [];

    const currentAnswers = record.answerVersions.filter(
      (a) => a.dataVersion === record.currentDataVersion,
    );

    const questionById = new Map(questions.map((q) => [q.id, q]));

    const answersByQuestionId = new Map(
      currentAnswers.map((a) => {
        const val =
          typeof a.answerJson === 'object' &&
          a.answerJson !== null &&
          'value' in a.answerJson
            ? (a.answerJson as { value: unknown }).value
            : a.answerJson;
        return [a.questionId, val];
      }),
    );

    const answersByQuestionKey = new Map<string, unknown>();
    for (const [qId, val] of answersByQuestionId.entries()) {
      const q = questionById.get(qId);
      if (q) {
        answersByQuestionKey.set(q.questionKey, val);
      }
    }

    const activeDocuments = new Map<
      string,
      (typeof record.documentVersions)[0]
    >();
    for (const doc of record.documentVersions) {
      if (!activeDocuments.has(doc.documentType)) {
        activeDocuments.set(doc.documentType, doc);
      }
    }

    const requirementViews: PreparationRequirementView[] = [];

    for (const req of requirements) {
      const condition = (req.conditionJson ?? { type: 'always' }) as Record<
        string,
        unknown
      >;
      const conditionType = condition.type ?? 'always';

      let isIncluded = false;
      let reason = 'Persyaratan umum layanan.';

      if (conditionType === 'always') {
        isIncluded = true;
      } else if (conditionType === 'conditional') {
        if (typeof condition.question_key === 'string') {
          const ans = answersByQuestionKey.get(condition.question_key);
          if (
            ans !== undefined &&
            (typeof ans === 'string' ||
              typeof ans === 'number' ||
              typeof ans === 'boolean') &&
            String(ans).toLowerCase() === String(condition.equals).toLowerCase()
          ) {
            isIncluded = true;
            reason = 'Berdasarkan jawaban kondisi yang dipilih.';
          }
        }

        if (!isIncluded) {
          for (const q of questions) {
            const validation = q.validationJson as Record<
              string,
              unknown
            > | null;
            const effects = Array.isArray(validation?.requirements_effect)
              ? (validation.requirements_effect as string[])
              : [];

            if (
              effects.includes(req.id) ||
              effects.includes(req.requirementCode)
            ) {
              const answerValue = answersByQuestionId.get(q.id);
              if (
                answerValue !== undefined &&
                this.isAffirmative(answerValue)
              ) {
                isIncluded = true;
                reason = 'Berdasarkan jawaban kondisi yang dipilih.';
                break;
              }
            }
          }
        }
      }

      if (isIncluded) {
        const matchedDoc =
          activeDocuments.get(req.requirementCode) ??
          activeDocuments.get(req.id);

        requirementViews.push({
          requirement_id: req.id,
          code: req.requirementCode,
          name: req.title,
          description: req.description,
          required: req.isMandatory,
          reason,
          fulfilled: Boolean(matchedDoc),
          sources: [
            {
              id: req.source.id,
              title: req.source.title,
              url: req.source.url,
            },
          ],
          document: matchedDoc
            ? {
                id: matchedDoc.id,
                version: matchedDoc.versionNumber,
                filename: matchedDoc.originalFilename,
              }
            : null,
        });
      }
    }

    return {
      preparation_id: record.id,
      requirements: requirementViews,
      change_notice: null,
    };
  }

  private mapToItemView(record: PreparationWithRelations): PreparationItemView {
    const latestInspection = record.inspectionRuns[0] ?? null;
    const isStale =
      latestInspection !== null &&
      latestInspection.dataVersion < record.currentDataVersion;

    const readiness = isStale
      ? 'stale'
      : latestInspection !== null
        ? this.mapInspectionToReadiness(latestInspection.status, record.status)
        : 'not_assessed';

    return {
      id: record.id,
      internal_reference: record.internalReference,
      status: this.mapStatusToContract(record.status),
      readiness,
      service: {
        id: record.service.id,
        name: record.service.name,
        slug: record.service.slug,
      },
      region: {
        id: record.service.region.id,
        name: record.service.region.name,
      },
      guide_version: record.guideVersion.versionNumber,
      data_version: record.currentDataVersion,
      latest_inspection_id: latestInspection?.id ?? null,
      created_at: record.createdAt.toISOString(),
      updated_at: record.updatedAt.toISOString(),
    };
  }

  private mapToDetailView(
    record: PreparationWithRelations,
  ): PreparationDetailView {
    const latestInspection = record.inspectionRuns[0] ?? null;
    const isStale =
      latestInspection !== null &&
      latestInspection.dataVersion < record.currentDataVersion;

    const readiness = isStale
      ? 'stale'
      : latestInspection !== null
        ? this.mapInspectionToReadiness(latestInspection.status, record.status)
        : 'not_assessed';

    const currentAnswers = record.answerVersions.filter(
      (a) => a.dataVersion === record.currentDataVersion,
    );

    const answers: PreparationAnswerView[] = currentAnswers.map((a) => {
      const val =
        typeof a.answerJson === 'object' &&
        a.answerJson !== null &&
        'value' in a.answerJson
          ? (a.answerJson as { value: unknown }).value
          : a.answerJson;

      return {
        question_id: a.questionId,
        question_key: a.question.questionKey,
        label: a.question.label,
        value: val,
      };
    });

    const activeDocMap = new Map<string, (typeof record.documentVersions)[0]>();
    for (const doc of record.documentVersions) {
      if (!activeDocMap.has(doc.documentType)) {
        activeDocMap.set(doc.documentType, doc);
      }
    }

    const documents: PreparationDocumentSummaryView[] = [
      ...activeDocMap.values(),
    ].map((doc) => ({
      id: doc.id,
      document_type: doc.documentType,
      active_version: doc.versionNumber,
      original_filename: doc.originalFilename,
      file_size_bytes: Number(doc.fileSizeBytes),
      status: doc.processingStatus,
    }));

    return {
      id: record.id,
      internal_reference: record.internalReference,
      owner_id: record.userId,
      service_id: record.service.id,
      region_id: record.service.region.id,
      guide_version: record.guideVersion.versionNumber,
      status: this.mapStatusToContract(record.status),
      data_version: record.currentDataVersion,
      active_inspection_id: latestInspection?.id ?? null,
      latest_inspection_id: latestInspection?.id ?? null,
      readiness,
      is_archived: record.status === PreparationStatus.ARCHIVED,
      is_stale: isStale,
      service: {
        id: record.service.id,
        name: record.service.name,
        slug: record.service.slug,
      },
      region: {
        id: record.service.region.id,
        name: record.service.region.name,
      },
      answers,
      documents,
      created_at: record.createdAt.toISOString(),
      updated_at: record.updatedAt.toISOString(),
    };
  }

  private mapStatusToContract(status: PreparationStatus): string {
    switch (status) {
      case PreparationStatus.DRAFT:
        return 'draft';
      case PreparationStatus.QUEUED:
        return 'queued';
      case PreparationStatus.INSPECTING:
        return 'inspecting';
      case PreparationStatus.NEEDS_COMPLETION:
        return 'needs_completion';
      case PreparationStatus.NEEDS_CONFIRMATION:
        return 'needs_review';
      case PreparationStatus.READY_INITIAL_CHECK:
        return 'ready_initial_check';
      case PreparationStatus.INSPECTION_INCOMPLETE:
        return 'inspection_incomplete';
      case PreparationStatus.RECHECK_REQUIRED:
        return 'needs_new_inspection';
      case PreparationStatus.ARCHIVED:
        return 'archived';
      default:
        return 'draft';
    }
  }

  private mapInspectionToReadiness(
    status: string,
    prepStatus?: PreparationStatus,
  ): string {
    switch (status) {
      case 'COMPLETED':
        if (prepStatus === PreparationStatus.NEEDS_COMPLETION) {
          return 'needs_completion';
        }
        if (prepStatus === PreparationStatus.NEEDS_CONFIRMATION) {
          return 'needs_review';
        }
        if (prepStatus === PreparationStatus.INSPECTION_INCOMPLETE) {
          return 'inspection_incomplete';
        }
        return 'ready_initial_check';
      case 'QUEUED':
      case 'RUNNING':
        return 'inspecting';
      case 'FAILED':
        return 'inspection_incomplete';
      default:
        return 'not_assessed';
    }
  }

  private isAffirmative(value: unknown): boolean {
    if (value === true || value === 'true') {
      return true;
    }
    if (typeof value === 'string' && value.trim() !== '' && value !== 'false') {
      return true;
    }
    if (Array.isArray(value) && value.length > 0) {
      return true;
    }
    if (typeof value === 'number') {
      return true;
    }
    return false;
  }

  async restorePreparation(
    id: string,
    userId: string,
  ): Promise<PreparationDetailView> {
    const record = await this.repository.findById(id, userId);
    if (!record) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }
    const restored = await this.repository.restore(id, userId);
    return this.mapToDetailView(restored);
  }

  async deletePreparation(
    id: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    const record = await this.repository.findById(id, userId);
    if (!record) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }

    const subCount = await this.repository.countSubmissions(id);
    if (subCount > 0) {
      throw new ConflictException(
        'Draf persiapan yang telah disubmit ke tinjauan pendamping tidak dapat dihapus.',
      );
    }

    await this.repository.delete(id, userId);
    return {
      success: true,
      message: 'Draf persiapan berhasil dihapus.',
    };
  }
}
