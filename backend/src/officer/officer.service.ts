import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationStatus,
  StatusSourceType,
} from '../generated/prisma/client';
import type { CreateOfficerEventDto } from './dto/create-officer-event.dto';
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
  type OfficerEventResultView,
  type OfficerSummaryView,
} from './interfaces/officer.service.interface';

@Injectable()
export class OfficerService implements IOfficerService {
  constructor(
    @Inject(OFFICER_REPOSITORY)
    private readonly repository: IOfficerRepository,
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

    // Extract snapshot if present in status events
    let snapshot: unknown = undefined;
    for (const e of app.statusEvents) {
      if (
        e.metadataJson &&
        typeof e.metadataJson === 'object' &&
        'snapshot' in (e.metadataJson as Record<string, unknown>)
      ) {
        snapshot = (e.metadataJson as Record<string, unknown>).snapshot;
        break;
      }
    }

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
      snapshot,
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

    // Validate state transition against allowed_actions!
    const allowedActions = this.computeAllowedActions(app.statusSummary);
    const attemptedAction = this.mapStatusToAction(statusCode);

    if (!allowedActions.includes(attemptedAction)) {
      throw new BadRequestException(
        `Transisi status ke '${dto.status}' (aksi: '${attemptedAction}') tidak diizinkan dari status saat ini: '${app.statusSummary.toLowerCase()}'. Aksi yang diizinkan: [${allowedActions.join(', ')}].`,
      );
    }

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

  async getSummary(officerUserId: string): Promise<OfficerSummaryView> {
    return this.repository.getSummary(officerUserId);
  }

  async saveEvaluation(
    applicationId: string,
    officerUserId: string,
    evaluation: unknown,
  ): Promise<{ message: string }> {
    const assignment = await this.repository.findAssignment(
      applicationId,
      officerUserId,
    );
    if (!assignment) {
      throw new ForbiddenException(
        'Anda tidak memiliki penugasan aktif untuk pengajuan ini.',
      );
    }

    await this.repository.saveEvaluation(
      applicationId,
      officerUserId,
      evaluation as any,
    );
    return { message: 'Penilaian sementara berkas berhasil disimpan.' };
  }

  async getEvaluation(
    applicationId: string,
    officerUserId: string,
  ): Promise<unknown> {
    const assignment = await this.repository.findAssignment(
      applicationId,
      officerUserId,
    );
    if (!assignment) {
      throw new ForbiddenException(
        'Anda tidak memiliki penugasan aktif untuk pengajuan ini.',
      );
    }

    const evaluation = await this.repository.getLatestEvaluation(applicationId);
    return evaluation;
  }

  async assignOfficer(
    applicationId: string,
    targetOfficerUserId: string,
    assignerUserId: string,
    reason?: string,
  ): Promise<{ message: string; assignment_id: string }> {
    const assignment = await this.repository.assignOfficer(
      applicationId,
      targetOfficerUserId,
      assignerUserId,
      reason,
    );

    return {
      message: 'Petugas berhasil ditugaskan ke pengajuan.',
      assignment_id: assignment.id,
    };
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

  private mapStatusToAction(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.ACCEPTED:
        return 'accept';
      case ApplicationStatus.VERIFICATION:
        return 'verify';
      case ApplicationStatus.NEEDS_CORRECTION:
        return 'request_revision';
      case ApplicationStatus.PROCESSING:
        return 'process';
      case ApplicationStatus.COMPLETED:
        return 'complete';
      default:
        return 'unknown';
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
}
