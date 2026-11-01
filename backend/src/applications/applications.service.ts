import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import {
  ApplicationStatus,
  Prisma,
  StatusSourceType,
  SubmissionChannel,
} from '../generated/prisma/client';
import type { CreateApplicationDto } from './dto/create-application.dto';
import type { ListApplicationsQueryDto } from './dto/list-applications.query.dto';
import type { CreateCitizenNoteDto } from './dto/create-citizen-note.dto';
import type { ConfirmResultReceivedDto } from './dto/confirm-result-received.dto';
import {
  APPLICATIONS_REPOSITORY,
  type ApplicationRecordWithRelations,
  type IApplicationsRepository,
  type StatusEventWithActor,
} from './interfaces/applications.repository.interface';
import {
  type ApplicationChannelView,
  type ApplicationDetailView,
  type ApplicationItemView,
  type ApplicationTimelineResult,
  type IApplicationsService,
  type ListApplicationsResult,
  type StatusEventView,
} from './interfaces/applications.service.interface';

@Injectable()
export class ApplicationsService implements IApplicationsService {
  constructor(
    @Inject(APPLICATIONS_REPOSITORY)
    private readonly repository: IApplicationsRepository,
  ) {}

  async createApplication(
    userId: string,
    dto: CreateApplicationDto,
  ): Promise<ApplicationDetailView> {
    const service = await this.repository.findServiceById(dto.service_id);
    if (!service) {
      throw new NotFoundException('Layanan tidak ditemukan.');
    }

    let snapshot: Record<string, unknown> | null = null;

    if (dto.preparation_id) {
      const prep = await this.repository.findPreparationById(
        dto.preparation_id,
        userId,
      );
      if (!prep || prep.archivedAt || prep.deletedAt) {
        throw new NotFoundException(
          'Persiapan berkas tidak ditemukan atau telah diarsipkan.',
        );
      }
      if (prep.serviceId !== dto.service_id) {
        throw new BadRequestException(
          'Persiapan berkas tidak cocok dengan layanan yang dipilih.',
        );
      }

      // Assemble immutable snapshot of preparation at the moment of submission
      snapshot = {
        preparation_id: prep.id,
        preparation_reference: prep.internalReference,
        version: prep.version,
        data_version: prep.currentDataVersion,
        submitted_at: (dto.submitted_at ? new Date(dto.submitted_at) : new Date()).toISOString(),
        answers: (prep.answerVersions ?? []).map((a: any) => ({
          question_id: a.questionId,
          question_key: a.question?.questionKey,
          label: a.question?.label,
          value: a.answerJson,
        })),
        documents: (prep.documentVersions ?? []).map((d: any) => ({
          id: d.id,
          document_type: d.documentType,
          version_number: d.versionNumber,
          original_filename: d.originalFilename,
          storage_key: d.storageKey,
          file_size_bytes: d.fileSizeBytes.toString(),
          checksum_sha256: d.checksumSha256,
        })),
      };
    }

    const year = new Date().getFullYear();
    const randomHex = randomBytes(4).toString('hex').toUpperCase();
    const internalReference = `APP-${year}-${randomHex}`;

    const submissionChannel = this.mapChannelToEnum(dto.channel.type);
    const submittedDate = dto.submitted_at
      ? new Date(dto.submitted_at)
      : new Date();

    const record = await this.repository.create({
      userId,
      serviceId: dto.service_id,
      agencyId: service.agencyId,
      preparationId: dto.preparation_id ?? null,
      internalReference,
      officialReference: dto.official_application_number?.trim() || null,
      submittedDate,
      submissionChannel,
      sourceMode: StatusSourceType.CITIZEN_REPORT,
      statusSummary: ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
      citizenNotes: dto.note?.trim() || null,
      initialEvent: {
        statusCode: ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
        sourceType: StatusSourceType.CITIZEN_REPORT,
        sourceLabel: 'Dicatat warga — diajukan untuk tinjauan pendamping',
        description: dto.note?.trim() || 'Pengajuan dicatat oleh warga.',
        occurredAt: submittedDate,
        metadataJson: {
          channel: dto.channel,
          snapshot,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    return this.mapToDetailView(record);
  }

  async listApplications(
    userId: string,
    query: ListApplicationsQueryDto,
  ): Promise<ListApplicationsResult> {
    const statusEnum = query.status
      ? (query.status.toUpperCase() as ApplicationStatus)
      : undefined;
    const sourceModeEnum = query.source_mode
      ? (query.source_mode.toUpperCase() as StatusSourceType)
      : undefined;

    const { items, total } = await this.repository.list({
      userId,
      serviceId: query.service_id,
      status:
        statusEnum && Object.values(ApplicationStatus).includes(statusEnum)
          ? statusEnum
          : undefined,
      sourceMode:
        sourceModeEnum &&
        Object.values(StatusSourceType).includes(sourceModeEnum)
          ? sourceModeEnum
          : undefined,
      page: query.page,
      pageSize: query.page_size,
      sort: query.sort,
      order: query.order,
    });

    return {
      data: items.map((item) => this.mapToItemView(item)),
      meta: {
        page: query.page,
        page_size: query.page_size,
        total_items: total,
        total_pages: Math.ceil(total / query.page_size),
      },
    };
  }

  async getApplication(
    id: string,
    userId: string,
  ): Promise<ApplicationDetailView> {
    const record = await this.repository.findById(id, userId);
    if (!record) {
      throw new NotFoundException('Catatan pengajuan tidak ditemukan.');
    }
    return this.mapToDetailView(record);
  }

  async getTimeline(
    id: string,
    userId: string,
  ): Promise<ApplicationTimelineResult> {
    const record = await this.repository.findById(id, userId);
    if (!record) {
      throw new NotFoundException('Catatan pengajuan tidak ditemukan.');
    }

    const events = await this.repository.listStatusEvents(id);
    const mappedEvents = events.map((event) =>
      this.mapToStatusEventView(event),
    );

    const officialUpdatesAvailable = events.some(
      (e) =>
        e.sourceType !== StatusSourceType.CITIZEN_REPORT &&
        e.sourceType !== StatusSourceType.SIMULATION,
    );

    return {
      application_id: record.id,
      source_mode: this.mapSourceModeToString(record.sourceMode),
      official_updates_available: officialUpdatesAvailable,
      message: officialUpdatesAvailable
        ? 'Terdapat pembaruan resmi dari instansi terkait.'
        : 'Belum ada pembaruan dari instansi yang tercatat.',
      events: mappedEvents,
    };
  }

  async addCitizenNote(
    id: string,
    userId: string,
    dto: CreateCitizenNoteDto,
  ): Promise<StatusEventView> {
    const record = await this.repository.findById(id, userId);
    if (!record) {
      throw new NotFoundException('Catatan pengajuan tidak ditemukan.');
    }

    const statusCode = dto.reported_status
      ? (dto.reported_status.toUpperCase() as ApplicationStatus)
      : record.statusSummary;

    const occurredAt = dto.occurred_at ? new Date(dto.occurred_at) : new Date();

    const event = await this.repository.addStatusEvent({
      applicationId: id,
      actorUserId: userId,
      statusCode: Object.values(ApplicationStatus).includes(statusCode)
        ? statusCode
        : record.statusSummary,
      sourceType: StatusSourceType.CITIZEN_REPORT,
      sourceLabel: 'Catatan warga',
      description: dto.note.trim(),
      occurredAt,
    });

    return this.mapToStatusEventView(event);
  }

  async confirmResultReceived(
    id: string,
    userId: string,
    dto: ConfirmResultReceivedDto,
  ): Promise<ApplicationDetailView> {
    const record = await this.repository.findById(id, userId);
    if (!record) {
      throw new NotFoundException('Catatan pengajuan tidak ditemukan.');
    }

    const occurredAt = dto.received_at ? new Date(dto.received_at) : new Date();

    await this.repository.updateStatus(
      id,
      ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN,
    );

    await this.repository.addStatusEvent({
      applicationId: id,
      actorUserId: userId,
      statusCode: ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN,
      sourceType: StatusSourceType.CITIZEN_REPORT,
      sourceLabel: 'Warga mengonfirmasi penerimaan hasil',
      description:
        dto.note?.trim() ||
        'Warga mengonfirmasi bahwa hasil pengajuan telah diterima.',
      occurredAt,
    });

    const updated = await this.repository.findById(id, userId);
    return this.mapToDetailView(updated!);
  }

  async linkPreparation(
    id: string,
    userId: string,
    preparationId: string,
  ): Promise<ApplicationDetailView> {
    const record = await this.repository.findById(id, userId);
    if (!record) {
      throw new NotFoundException('Catatan pengajuan tidak ditemukan.');
    }

    const prep = await this.repository.findPreparationById(
      preparationId,
      userId,
    );
    if (!prep || prep.archivedAt || prep.deletedAt) {
      throw new NotFoundException(
        'Persiapan berkas tidak ditemukan atau telah diarsipkan.',
      );
    }

    if (prep.serviceId !== record.serviceId) {
      throw new BadRequestException(
        'Persiapan berkas tidak cocok dengan layanan pada pengajuan ini.',
      );
    }

    const updated = await this.repository.linkPreparation(id, preparationId);
    return this.mapToDetailView(updated);
  }

  async resubmitRevision(
    id: string,
    userId: string,
    note?: string,
  ): Promise<ApplicationDetailView> {
    const record = await this.repository.findById(id, userId);
    if (!record) {
      throw new NotFoundException('Pengajuan tidak ditemukan.');
    }

    if (record.statusSummary !== ApplicationStatus.NEEDS_CORRECTION) {
      throw new BadRequestException(
        'Pengajuan hanya dapat direvisi ketika status memerlukan perbaikan (needs_correction).',
      );
    }

    let revisionSnapshot: Record<string, unknown> | null = null;
    if (record.preparationId) {
      const prep = await this.repository.findPreparationById(
        record.preparationId,
        userId,
      );
      if (prep) {
        revisionSnapshot = {
          preparation_id: prep.id,
          version: prep.version,
          data_version: prep.currentDataVersion,
          resubmitted_at: new Date().toISOString(),
          answers: (prep.answerVersions ?? []).map((a: any) => ({
            question_id: a.questionId,
            value: a.answerJson,
          })),
          documents: (prep.documentVersions ?? []).map((d: any) => ({
            id: d.id,
            document_type: d.documentType,
            version_number: d.versionNumber,
            original_filename: d.originalFilename,
          })),
        };
      }
    }

    await this.repository.updateStatus(id, ApplicationStatus.VERIFICATION);

    await this.repository.addStatusEvent({
      applicationId: id,
      actorUserId: userId,
      statusCode: ApplicationStatus.VERIFICATION,
      sourceType: StatusSourceType.CITIZEN_REPORT,
      sourceLabel: 'Revisi diajukan warga',
      description: note?.trim() || 'Warga telah mengirimkan berkas hasil perbaikan.',
      occurredAt: new Date(),
      metadataJson: {
        revision_snapshot: revisionSnapshot,
      } as unknown as Prisma.InputJsonValue,
    });

    const updated = await this.repository.findById(id, userId);
    return this.mapToDetailView(updated!);
  }

  async withdrawApplication(
    id: string,
    userId: string,
    reason?: string,
  ): Promise<ApplicationDetailView> {
    const record = await this.repository.findById(id, userId);
    if (!record) {
      throw new NotFoundException('Pengajuan tidak ditemukan.');
    }

    if (
      record.statusSummary === ApplicationStatus.COMPLETED ||
      record.statusSummary === ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN
    ) {
      throw new BadRequestException(
        'Pengajuan yang telah selesai diproses tidak dapat ditarik.',
      );
    }

    await this.repository.addStatusEvent({
      applicationId: id,
      actorUserId: userId,
      statusCode: ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
      sourceType: StatusSourceType.CITIZEN_REPORT,
      sourceLabel: 'Permohonan ditarik oleh warga',
      description: reason?.trim() || 'Warga menarik permohonan tinjauan pendamping.',
      occurredAt: new Date(),
    });

    const updated = await this.repository.findById(id, userId);
    return this.mapToDetailView(updated!);
  }

  async recordOfficialSubmission(
    id: string,
    userId: string,
    dto: {
      official_number?: string;
      channel?: string;
      submission_date?: string;
      receipt_number?: string;
      note?: string;
    },
  ): Promise<ApplicationDetailView> {
    const record = await this.repository.findById(id, userId);
    if (!record) {
      throw new NotFoundException('Pengajuan tidak ditemukan.');
    }

    const submittedDate = dto.submission_date
      ? new Date(dto.submission_date)
      : new Date();

    const updated = await this.repository.updateOfficialSubmission(id, {
      officialNumber: dto.official_number || dto.receipt_number,
      channel: dto.channel,
      submittedDate,
      citizenNotes: dto.note,
      statusSummary: ApplicationStatus.PROCESSING,
    });

    await this.repository.addStatusEvent({
      applicationId: id,
      actorUserId: userId,
      statusCode: ApplicationStatus.PROCESSING,
      sourceType: StatusSourceType.CITIZEN_REPORT,
      sourceLabel: 'Pengajuan resmi dicatat warga',
      description:
        dto.note?.trim() ||
        `Warga mencatat nomor pengajuan resmi instansi: ${dto.official_number || 'Tercatat'}`,
      occurredAt: submittedDate,
      metadataJson: {
        receipt_number: dto.receipt_number,
        official_channel: dto.channel,
      },
    });

    return this.mapToDetailView(updated);
  }

  // --- Helpers ---

  private mapChannelToEnum(
    type: 'online' | 'in_person' | 'email' | 'other',
  ): SubmissionChannel {
    switch (type) {
      case 'online':
        return SubmissionChannel.ONLINE_PORTAL;
      case 'in_person':
        return SubmissionChannel.IN_PERSON;
      case 'email':
        return SubmissionChannel.EMAIL;
      default:
        return SubmissionChannel.OTHER;
    }
  }

  private mapEnumToChannel(channel: SubmissionChannel): ApplicationChannelView {
    switch (channel) {
      case SubmissionChannel.ONLINE_PORTAL:
        return { type: 'online', label: 'Portal online resmi' };
      case SubmissionChannel.IN_PERSON:
        return { type: 'in_person', label: 'Loket tatap muka' };
      case SubmissionChannel.EMAIL:
        return { type: 'email', label: 'Surat elektronik / email' };
      default:
        return { type: 'other', label: 'Kanal lainnya' };
    }
  }

  private mapSourceModeToString(sourceMode: StatusSourceType): string {
    switch (sourceMode) {
      case StatusSourceType.CITIZEN_REPORT:
        return 'citizen_recorded';
      case StatusSourceType.OFFICER:
        return 'officer_recorded';
      case StatusSourceType.INTEGRATION:
        return 'official_integration';
      case StatusSourceType.SIMULATION:
        return 'simulation';
      default:
        return String(sourceMode).toLowerCase();
    }
  }

  private mapStatusEventToString(sourceType: StatusSourceType): string {
    switch (sourceType) {
      case StatusSourceType.CITIZEN_REPORT:
        return 'citizen';
      case StatusSourceType.OFFICER:
        return 'officer';
      case StatusSourceType.INTEGRATION:
        return 'official_integration';
      case StatusSourceType.SIMULATION:
        return 'simulation';
      default:
        return String(sourceType).toLowerCase();
    }
  }

  private mapToItemView(
    record: ApplicationRecordWithRelations,
  ): ApplicationItemView {
    const officialNumberSource: ApplicationItemView['official_number_source'] =
      record.officialReference
        ? record.sourceMode === StatusSourceType.OFFICER
          ? 'officer_verified'
          : 'citizen_reported'
        : 'not_provided';

    let snapshot: unknown = undefined;
    for (const e of record.statusEvents ?? []) {
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
      id: record.id,
      internal_reference: record.internalReference,
      service_id: record.serviceId,
      service: {
        id: record.service.id,
        name: record.service.name,
        category: record.service.category,
        slug: record.service.slug,
      },
      agency: {
        id: record.agency.id,
        name: record.agency.name,
        agency_type: record.agency.agencyType,
      },
      preparation_id: record.preparationId,
      preparation: record.preparation
        ? {
            id: record.preparation.id,
            internal_reference: record.preparation.internalReference,
            status: record.preparation.status.toLowerCase(),
          }
        : null,
      official_application_number: record.officialReference,
      official_number_source: officialNumberSource,
      submitted_at: record.submittedDate?.toISOString() ?? null,
      channel: this.mapEnumToChannel(record.submissionChannel),
      source_mode: this.mapSourceModeToString(record.sourceMode),
      current_status: record.statusSummary.toLowerCase(),
      simulation: record.sourceMode === StatusSourceType.SIMULATION,
      created_at: record.createdAt.toISOString(),
      updated_at: record.updatedAt.toISOString(),
      snapshot,
    };
  }

  private mapToDetailView(
    record: ApplicationRecordWithRelations,
  ): ApplicationDetailView {
    const itemView = this.mapToItemView(record);
    const latestEvent = record.statusEvents?.[0]
      ? this.mapToStatusEventView({
          ...record.statusEvents[0],
          actor: null,
        })
      : null;

    return {
      ...itemView,
      citizen_notes: record.citizenNotes,
      latest_event: latestEvent,
    };
  }

  private mapToStatusEventView(event: StatusEventWithActor): StatusEventView {
    let eventType = 'status_changed';
    if (event.statusCode === ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN) {
      eventType = 'result_received';
    } else if (event.sourceLabel.toLowerCase().includes('catatan')) {
      eventType = 'citizen_note';
    } else if (event.sourceLabel.toLowerCase().includes('dicatat warga')) {
      eventType = 'application_recorded';
    } else if (event.sourceLabel.toLowerCase().includes('revisi')) {
      eventType = 'revision_resubmitted';
    }

    return {
      id: event.id,
      application_id: event.applicationId,
      event_type: eventType,
      status: event.statusCode.toLowerCase(),
      source_type: this.mapStatusEventToString(event.sourceType),
      source_label: event.sourceLabel,
      occurred_at: event.occurredAt.toISOString(),
      recorded_at: event.recordedAt.toISOString(),
      actor: event.actor
        ? {
            id: event.actor.id,
            name: event.actor.displayName,
          }
        : null,
      note: event.description,
      simulation: event.sourceType === StatusSourceType.SIMULATION,
      correction_of_event_id: null,
      metadata: event.metadataJson,
    };
  }
}
