import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  ApplicationStatus,
  StatusSourceType,
} from '../generated/prisma/client';
import {
  STORAGE_SERVICE,
  type IStorageService,
} from '../storage/interfaces/storage.service.interface';
import type { CreateOfficerEventDto } from './dto/create-officer-event.dto';
import type { EvaluationDraftDto } from './dto/evaluation-draft.dto';
import type { SubmitDecisionDto } from './dto/submit-decision.dto';
import type { CreateOfficerEscalationDto } from './dto/create-escalation.dto';
import type { ListAssignmentsQueryDto } from './dto/list-assignments.query.dto';
import {
  OFFICER_REPOSITORY,
  type IOfficerRepository,
} from './interfaces/officer.repository.interface';
import {
  type IOfficerService,
  type ListAssignmentsResult,
  type OfficerApplicationDetailView,
  type OfficerAssignmentItemView,
  type OfficerDocumentItemView,
  type OfficerEventResultView,
} from './interfaces/officer.service.interface';

@Injectable()
export class OfficerService implements IOfficerService {
  constructor(
    @Inject(OFFICER_REPOSITORY)
    private readonly repository: IOfficerRepository,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async listAssignments(
    officerUserId: string,
    query: ListAssignmentsQueryDto,
  ): Promise<ListAssignmentsResult> {
    const { items, total } = await this.repository.listAssignments({
      officerUserId,
      status: query.status,
      page: query.page,
      pageSize: query.page_size,
    });

    const data: OfficerAssignmentItemView[] = items.map((item) => ({
      id: item.id,
      application_id: item.applicationId,
      internal_reference: item.application.internalReference,
      official_application_number: item.application.officialReference,
      service: {
        id: item.application.service.id,
        name: item.application.service.name,
        category: item.application.service.category,
      },
      agency: {
        id: item.application.agency.id,
        name: item.application.agency.name,
      },
      citizen: {
        id: item.application.user.id,
        name: item.application.user.displayName,
      },
      current_status: item.application.statusSummary.toLowerCase(),
      review_status: item.application.reviewStatus.toLowerCase(),
      assigned_at: item.assignedAt.toISOString(),
    }));

    return {
      data,
      meta: {
        page: query.page,
        page_size: query.page_size,
        total_items: total,
        total_pages: Math.ceil(total / query.page_size),
      },
    };
  }

  async getApplicationDetail(
    applicationId: string,
    officerUserId: string,
  ): Promise<OfficerApplicationDetailView> {
    const assignment = await this.repository.findAssignment(
      applicationId,
      officerUserId,
    );
    if (!assignment) {
      throw new ForbiddenException(
        'Anda tidak memiliki penugasan aktif untuk pengajuan ini.',
      );
    }

    const app = await this.repository.findApplicationDetail(applicationId);
    if (!app) {
      throw new NotFoundException('Pengajuan tidak ditemukan.');
    }

    const allowedActions = this.computeAllowedActions(app.statusSummary);
    const snapshot = await this.repository.findLatestSubmissionSnapshot(applicationId);
    const review = snapshot?.submissionReviews?.[0];

    return {
      id: app.id,
      internal_reference: app.internalReference,
      official_application_number: app.officialReference,
      service: {
        id: app.service.id,
        name: app.service.name,
        category: app.service.category,
        slug: app.service.slug,
      },
      agency: {
        id: app.agency.id,
        name: app.agency.name,
      },
      citizen: {
        id: app.user.id,
        name: app.user.displayName,
      },
      submitted_at: app.submittedDate?.toISOString() ?? null,
      current_status: app.statusSummary.toLowerCase(),
      timeline: app.statusEvents.map((e) => ({
        id: e.id,
        event_type:
          e.statusCode === ApplicationStatus.NEEDS_CORRECTION
            ? 'revision_requested'
            : 'status_changed',
        status: e.statusCode.toLowerCase(),
        source_type: e.sourceType.toLowerCase(),
        source_label: e.sourceLabel,
        occurred_at: e.occurredAt.toISOString(),
        recorded_at: e.recordedAt.toISOString(),
        note: e.description,
        actor: e.actor
          ? {
              id: e.actor.id,
              name: e.actor.displayName,
            }
          : null,
      })),
      allowed_actions: allowedActions,
      review_status: app.reviewStatus.toLowerCase(),
      snapshot: snapshot ? {
        id: snapshot.id, application_id: applicationId,
        preparation_id: snapshot.preparationId, version_number: snapshot.versionNumber,
        submitted_at: snapshot.submittedAt.toISOString(), service: snapshot.serviceSnapshotJson,
        applicant: snapshot.applicantSnapshotJson, answers: snapshot.answersSnapshotJson,
        documents: snapshot.documentsSnapshotJson, required_slots: snapshot.requiredSlotsJson,
        reviews: [],
      } : null,
      evaluation: {
        overall_notes: review?.overallNotes || '',
        items: (review?.itemAssessments || []).map((item: any) => ({
          item_id: item.itemId, item_type: item.itemType, verdict: item.verdict, note: item.note,
        })),
      },
    };
  }

  async createEvent(
    applicationId: string,
    officerUserId: string,
    dto: CreateOfficerEventDto,
  ): Promise<OfficerEventResultView> {
    const assignment = await this.repository.findAssignment(
      applicationId,
      officerUserId,
    );
    if (!assignment) {
      throw new ForbiddenException(
        'Anda tidak memiliki penugasan aktif untuk pengajuan ini.',
      );
    }

    const app = await this.repository.findApplicationDetail(applicationId);
    if (!app) {
      throw new NotFoundException('Pengajuan tidak ditemukan.');
    }

    const statusCode = this.mapStatusToEnum(dto.status);

    if (
      statusCode === ApplicationStatus.NEEDS_CORRECTION &&
      !dto.revision_request
    ) {
      throw new BadRequestException(
        'revision_request wajib diisi ketika status needs_correction.',
      );
    }

    let notifTitle = 'Status Pengajuan Diperbarui';
    let notifBody =
      dto.note || 'Petugas telah memperbarui status pengajuan Anda.';
    let notifType = 'application_status_updated';

    if (statusCode === ApplicationStatus.NEEDS_CORRECTION) {
      notifTitle = 'Permintaan Revisi Dokumen';
      notifBody =
        dto.revision_request?.reason || 'Mohon perbaiki berkas pengajuan Anda.';
      notifType = 'revision_recorded';
    } else if (statusCode === ApplicationStatus.COMPLETED) {
      notifTitle = 'Pengajuan Selesai Diproses';
      notifBody = dto.note || 'Pengajuan resmi Anda telah selesai diproses.';
    }

    const occurredAt = dto.occurred_at ? new Date(dto.occurred_at) : new Date();

    const event = await this.repository.createOfficerEvent({
      applicationId,
      actorUserId: officerUserId,
      statusCode,
      sourceType: StatusSourceType.OFFICER,
      sourceLabel: 'Petugas yang ditugaskan',
      description: dto.note?.trim() || null,
      revisionReason: dto.revision_request?.reason || null,
      occurredAt,
      metadataJson: {
        revision_request: dto.revision_request ?? null,
        completion_info: dto.completion_info ?? null,
      },
      citizenUserId: app.userId,
      notification: {
        notificationType: notifType,
        title: notifTitle,
        body: notifBody,
        targetPath: `/applications/${applicationId}`,
      },
    });

    return {
      id: event.id,
      application_id: applicationId,
      event_type: dto.event_type,
      status: statusCode.toLowerCase(),
      source_type: 'officer',
      source_label: 'Petugas yang ditugaskan',
      occurred_at: event.occurredAt.toISOString(),
      recorded_at: event.recordedAt.toISOString(),
      revision_request: dto.revision_request ?? null,
      simulation: false,
    };
  }

  async getApplicationDocuments(
    applicationId: string,
    officerUserId: string,
  ): Promise<OfficerDocumentItemView[]> {
    const assignment = await this.repository.findAssignment(
      applicationId,
      officerUserId,
    );
    if (!assignment) {
      throw new ForbiddenException(
        'Anda tidak memiliki penugasan aktif untuk pengajuan ini.',
      );
    }

    const docs = await this.repository.findApplicationDocuments(applicationId);

    const latestByType = new Map<string, (typeof docs)[number]>();
    for (const doc of docs) {
      if (!latestByType.has(doc.documentType)) {
        latestByType.set(doc.documentType, doc);
      }
    }

    return Array.from(latestByType.values()).map((doc) => ({
      id: doc.id,
      document_type: doc.documentType,
      display_name: doc.originalFilename,
      version_number: doc.versionNumber,
      mime_type: doc.detectedMimeType,
      size_bytes: Number(doc.fileSizeBytes),
      uploaded_at: doc.uploadedAt.toISOString(),
    }));
  }

  async getApplicationDocumentContentUrl(
    applicationId: string,
    documentId: string,
    officerUserId: string,
  ): Promise<string> {
    const assignment = await this.repository.findAssignment(
      applicationId,
      officerUserId,
    );
    if (!assignment) {
      throw new ForbiddenException(
        'Anda tidak memiliki penugasan aktif untuk pengajuan ini.',
      );
    }

    const doc = await this.repository.findApplicationDocument(
      applicationId,
      documentId,
    );
    if (!doc) {
      throw new NotFoundException('Dokumen tidak ditemukan.');
    }

    return this.storageService.createSignedUrl(doc.storageKey, 300);
  }

  private mapStatusToEnum(status: string): ApplicationStatus {
    switch (status) {
      case 'accepted':
        return ApplicationStatus.ACCEPTED;
      case 'verification':
        return ApplicationStatus.VERIFICATION;
      case 'needs_correction':
        return ApplicationStatus.NEEDS_CORRECTION;
      case 'processing':
        return ApplicationStatus.PROCESSING;
      case 'completed':
        return ApplicationStatus.COMPLETED;
      default:
        throw new BadRequestException(
          `Status ${status} tidak valid untuk petugas.`,
        );
    }
  }

  private computeAllowedActions(status: ApplicationStatus): string[] {
    switch (status) {
      case ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED:
        return ['accept', 'verify', 'request_revision'];
      case ApplicationStatus.ACCEPTED:
        return ['verify', 'request_revision'];
      case ApplicationStatus.VERIFICATION:
        return ['process', 'request_revision'];
      case ApplicationStatus.NEEDS_CORRECTION:
        return ['verify'];
      case ApplicationStatus.PROCESSING:
        return ['complete', 'request_revision'];
      default:
        return [];
    }
  }

  async saveEvaluationDraft(
    applicationId: string,
    officerUserId: string,
    dto: EvaluationDraftDto,
  ): Promise<any> {
    const assignment = await this.repository.findAssignment(
      applicationId,
      officerUserId,
    );
    if (!assignment) {
      throw new ForbiddenException(
        'Anda tidak memiliki penugasan aktif untuk pengajuan ini.',
      );
    }

    const snapshot =
      await this.repository.findLatestSubmissionSnapshot(applicationId);
    if (!snapshot) {
      throw new NotFoundException('Snapshot pengajuan tidak ditemukan.');
    }

    return this.repository.saveEvaluationDraft({
      submissionSnapshotId: snapshot.id,
      officerUserId,
      overallNotes: dto.overall_notes,
      items: dto.items.map((i) => ({
        itemType: i.item_type,
        itemId: i.item_id,
        verdict: i.verdict,
        note: i.note,
      })),
    });
  }

  async submitDecision(
    applicationId: string,
    officerUserId: string,
    dto: SubmitDecisionDto,
  ): Promise<any> {
    const assignment = await this.repository.findAssignment(
      applicationId,
      officerUserId,
    );
    if (!assignment) {
      throw new ForbiddenException(
        'Anda tidak memiliki penugasan aktif untuk pengajuan ini.',
      );
    }

    const snapshot =
      await this.repository.findLatestSubmissionSnapshot(applicationId);
    if (!snapshot) {
      throw new NotFoundException('Snapshot pengajuan tidak ditemukan.');
    }

    if (
      dto.expected_version !== undefined &&
      dto.expected_version !== snapshot.versionNumber
    ) {
      throw new ConflictException(
        'Versi pengajuan telah diperbarui oleh pemohon (VERSION_CONFLICT). Muat ulang pengajuan.',
      );
    }

    const expected = new Set(['FORM_DATA:form_data', ...(Array.isArray(snapshot.documentsSnapshotJson) ? snapshot.documentsSnapshotJson.map((doc: any) => 'DOCUMENT:' + doc.document_version_id) : [])]);
    const seen = new Set<string>();
    for (const item of dto.items) {
      const key = item.item_type + ':' + item.item_id;
      if (!expected.has(key) || seen.has(key)) throw new BadRequestException('Item penilaian tidak sesuai kiriman atau duplikat.');
      seen.add(key);
      if (item.verdict !== 'SESUAI' && item.note.trim().length < 5) throw new BadRequestException('Catatan perbaikan wajib dijelaskan pada setiap bagian bermasalah.');
    }
    if (seen.size !== expected.size) throw new BadRequestException('Nilai data pemohon dan seluruh berkas kiriman.');
    if (!dto.overall_notes || dto.overall_notes.trim().length < 5) throw new BadRequestException('Ringkasan tinjauan wajib diisi minimal 5 karakter.');

    if (dto.decision === 'approved_for_submission') {
      const hasIssues = dto.items.some((i) => i.verdict !== 'SESUAI');
      if (hasIssues) {
        throw new BadRequestException(
          'Semua item wajib berstatus SESUAI untuk menyetujui pengajuan ke tahap berikutnya.',
        );
      }
    } else if (dto.decision === 'revision_requested') {
      const hasIssues = dto.items.some((i) => i.verdict !== 'SESUAI');
      if (!hasIssues) {
        throw new BadRequestException(
          'Minimal satu item harus berstatus PERLU_PERBAIKAN atau TIDAK_SESUAI untuk meminta revisi.',
        );
      }
    }

    return this.repository.submitDecision({
      submissionSnapshotId: snapshot.id,
      applicationId,
      officerUserId,
      decision: dto.decision,
      overallNotes: dto.overall_notes,
      revisionDueAt: dto.revision_due_at ? new Date(dto.revision_due_at) : null,
      items: dto.items.map((i) => ({
        itemType: i.item_type,
        itemId: i.item_id,
        verdict: i.verdict,
        note: i.note,
      })),
    });
  }

  async createEscalation(
    applicationId: string,
    officerUserId: string,
    dto: CreateOfficerEscalationDto,
  ): Promise<any> {
    const assignment = await this.repository.findAssignment(
      applicationId,
      officerUserId,
    );
    if (!assignment) {
      throw new ForbiddenException(
        'Anda tidak memiliki penugasan aktif untuk pengajuan ini.',
      );
    }

    return this.repository.createEscalation({
      applicationId,
      officerUserId,
      reason: dto.reason,
      targetRole: dto.target_role ?? 'admin',
    });
  }
}
