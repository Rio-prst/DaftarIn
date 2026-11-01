import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import {
  CompanionReviewStatus,
  ServiceAvailability,
} from '../generated/prisma/client';
import {
  assertValidApplicationTransition,
  assertValidReviewTransition,
} from '../common/utils/application-state-machine';
import type {
  CreateResubmissionDto,
  CreateSubmissionDto,
} from './dto/create-submission.dto';
import type { WithdrawApplicationDto } from './dto/withdraw-application.dto';
import type {
  SubmissionSnapshotDetailView,
  SubmissionSnapshotItemView,
} from './interfaces/applications.service.interface';
import {
  ApplicationStatus,
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
        sourceLabel: 'Dicatat warga — belum terkonfirmasi instansi',
        description: dto.note?.trim() || 'Pengajuan dicatat oleh warga.',
        occurredAt: submittedDate,
        metadataJson: { channel: dto.channel },
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

    // Idempotent return if already confirmed
    if (record.statusSummary === ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN) {
      return this.mapToDetailView(record);
    }

    assertValidApplicationTransition(
      record.statusSummary,
      ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN,
    );

    const occurredAt = dto.received_at ? new Date(dto.received_at) : new Date();

    await this.repository.updateStatus(
      id,
      ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN,
      dto.official_reference_number ?? record.officialReference,
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
      metadataJson: {
        channel: dto.channel ?? record.submissionChannel.toLowerCase(),
        official_reference_number:
          dto.official_reference_number ?? record.officialReference,
        acknowledgement_confirmed: dto.acknowledgement_confirmed ?? true,
        proof_document_id: dto.proof_document_id ?? null,
      },
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
    };
  }
  async submitPreparation(
    preparationId: string,
    userId: string,
    dto: CreateSubmissionDto,
  ): Promise<SubmissionSnapshotDetailView> {
    const prep = await this.repository.findPreparationForSubmission(
      preparationId,
      userId,
    );
    if (!prep) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }

    if (prep.service.availability === 'PAUSED') {
      throw new ForbiddenException(
        `Layanan sedang dijeda sementara oleh instansi: ${prep.service.pausedReason || 'Dalam pemeliharaan'}`,
      );
    }

    const user = await this.repository.findUserForSubmission(userId);

    let applicantSnapshot: any = {
      subject_type: 'myself',
      user_id: user.id,
      display_name: user.displayName,
      email: user.email,
      phone: user.phone,
    };

    if (dto.family_member_id) {
      const fam = await this.repository.findFamilyMember(
        dto.family_member_id,
        userId,
      );
      if (!fam) {
        throw new NotFoundException('Data anggota keluarga tidak ditemukan.');
      }
      applicantSnapshot = {
        subject_type: 'family_member',
        family_member_id: fam.id,
        full_name: fam.fullName,
        relationship: fam.relationship,
        nik: fam.nik,
        birth_date: fam.birthDate?.toISOString() ?? null,
        gender: fam.gender,
        manager: {
          user_id: user.id,
          display_name: user.displayName,
          email: user.email,
        },
      };
    }

    const serviceSnapshot = {
      id: prep.service.id,
      name: prep.service.name,
      slug: prep.service.slug,
      category: prep.service.category,
      agency: {
        id: prep.service.agency.id,
        name: prep.service.agency.name,
      },
      region: {
        id: prep.service.region.id,
        name: prep.service.region.name,
      },
      guide_version: prep.guideVersion.versionNumber,
    };

    const latestAnswersMap = new Map<string, any>();
    for (const a of prep.answerVersions) {
      if (!latestAnswersMap.has(a.questionId)) {
        latestAnswersMap.set(a.questionId, {
          question_id: a.questionId,
          question_key: a.question.questionKey,
          label: a.question.label,
          value: (a.answerJson as any)?.value ?? a.answerJson,
        });
      }
    }
    const answersSnapshot = Array.from(latestAnswersMap.values());

    const latestDocsMap = new Map<string, any>();
    for (const d of prep.documentVersions) {
      if (!latestDocsMap.has(d.documentType)) {
        latestDocsMap.set(d.documentType, {
          document_type: d.documentType,
          document_version_id: d.id,
          version_number: d.versionNumber,
          storage_key: d.storageKey,
          original_filename: d.originalFilename,
          mime_type: d.detectedMimeType,
          file_size_bytes: Number(d.fileSizeBytes),
          checksum_sha256: d.checksumSha256,
        });
      }
    }
    const documentsSnapshot = Array.from(latestDocsMap.values());

    let app = prep.applicationRecords?.[0];
    if (!app) {
      const year = new Date().getFullYear();
      const randomHex = randomBytes(4).toString('hex').toUpperCase();
      const internalReference = `APP-${year}-${randomHex}`;

      app = await this.repository.create({
        userId,
        serviceId: prep.serviceId,
        agencyId: dto.agency_id ?? prep.service.agencyId,
        preparationId: prep.id,
        internalReference,
        submissionChannel: SubmissionChannel.ONLINE_PORTAL,
        sourceMode: StatusSourceType.CITIZEN_REPORT,
        statusSummary: ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
        reviewStatus: CompanionReviewStatus.SUBMITTED,
        citizenNotes: dto.citizen_note ?? null,
        initialEvent: {
          statusCode: ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
          sourceType: StatusSourceType.CITIZEN_REPORT,
          sourceLabel: 'Warga mengirimkan berkas persiapan',
          description:
            dto.citizen_note ||
            'Berkas persiapan dikirim untuk tinjauan pendamping DaftarIn.',
          occurredAt: new Date(),
        },
      });
    } else {
      await this.repository.updateReviewStatus(
        app.id,
        CompanionReviewStatus.SUBMITTED,
      );
    }

    const versionNumber =
      (await this.repository.findLatestSubmissionVersion(app.id)) + 1;

    const snapshot = await this.repository.createSubmissionSnapshot({
      applicationId: app.id,
      preparationId: prep.id,
      versionNumber,
      conditionKey: null,
      serviceSnapshotJson: serviceSnapshot,
      applicantSnapshotJson: applicantSnapshot,
      answersSnapshotJson: answersSnapshot,
      documentsSnapshotJson: documentsSnapshot,
      requiredSlotsJson: [],
      citizenNote: dto.citizen_note ?? null,
      changesSummary: null,
      consentVersion: dto.consent_version ?? 'v1.0',
      consentedAt: new Date(),
    });

    return this.mapToSubmissionDetailView(snapshot);
  }

  async resubmitApplication(
    applicationId: string,
    userId: string,
    dto: CreateResubmissionDto,
  ): Promise<SubmissionSnapshotDetailView> {
    const app = await this.repository.findById(applicationId, userId);
    if (!app) {
      throw new NotFoundException('Pengajuan tidak ditemukan.');
    }

    if (!app.preparationId) {
      throw new BadRequestException(
        'Pengajuan ini tidak memiliki draf persiapan terkait.',
      );
    }

    const prep = await this.repository.findPreparationForSubmission(
      app.preparationId,
      userId,
    );
    if (!prep) {
      throw new NotFoundException('Draf persiapan tidak ditemukan.');
    }

    const answersMap = new Map<string, any>();
    for (const a of prep.answerVersions) {
      if (!answersMap.has(a.questionId)) {
        answersMap.set(a.questionId, {
          question_id: a.questionId,
          question_key: a.question.questionKey,
          label: a.question.label,
          value: (a.answerJson as any)?.value ?? a.answerJson,
        });
      }
    }

    const docsMap = new Map<string, any>();
    for (const d of prep.documentVersions) {
      if (!docsMap.has(d.documentType)) {
        docsMap.set(d.documentType, {
          document_type: d.documentType,
          document_version_id: d.id,
          version_number: d.versionNumber,
          storage_key: d.storageKey,
          original_filename: d.originalFilename,
          mime_type: d.detectedMimeType,
          file_size_bytes: Number(d.fileSizeBytes),
          checksum_sha256: d.checksumSha256,
        });
      }
    }

    const user = await this.repository.findUserForSubmission(userId);
    const applicantSnapshot = {
      subject_type: 'myself',
      user_id: user.id,
      display_name: user.displayName,
      email: user.email,
    };

    const serviceSnapshot = {
      id: prep.service.id,
      name: prep.service.name,
      slug: prep.service.slug,
      category: prep.service.category,
      agency: { id: prep.service.agency.id, name: prep.service.agency.name },
      region: { id: prep.service.region.id, name: prep.service.region.name },
      guide_version: prep.guideVersion.versionNumber,
    };

    const nextVersion =
      (await this.repository.findLatestSubmissionVersion(applicationId)) + 1;

    const snapshot = await this.repository.createSubmissionSnapshot({
      applicationId,
      preparationId: prep.id,
      versionNumber: nextVersion,
      conditionKey: null,
      serviceSnapshotJson: serviceSnapshot,
      applicantSnapshotJson: applicantSnapshot,
      answersSnapshotJson: Array.from(answersMap.values()),
      documentsSnapshotJson: Array.from(docsMap.values()),
      requiredSlotsJson: [],
      citizenNote: dto.citizen_note ?? null,
      changesSummary: dto.changes_summary,
      consentVersion: dto.consent_version ?? 'v1.0',
      consentedAt: new Date(),
    });

    await this.repository.updateReviewStatus(
      applicationId,
      CompanionReviewStatus.SUBMITTED,
    );

    await this.repository.addStatusEvent({
      applicationId,
      actorUserId: userId,
      statusCode: app.statusSummary,
      sourceType: StatusSourceType.CITIZEN_REPORT,
      sourceLabel: `Warga mengirimkan perbaikan (Revisi v${nextVersion})`,
      description: dto.changes_summary,
      occurredAt: new Date(),
      metadataJson: {
        submission_version: nextVersion,
        changes_summary: dto.changes_summary,
      },
    });

    return this.mapToSubmissionDetailView(snapshot);
  }

  async listSubmissions(
    applicationId: string,
    userId: string,
  ): Promise<SubmissionSnapshotItemView[]> {
    const app = await this.repository.findById(applicationId, userId);
    if (!app) {
      throw new NotFoundException('Pengajuan tidak ditemukan.');
    }

    const snapshots =
      await this.repository.findSubmissionSnapshots(applicationId);
    return snapshots.map((s) => this.mapToSubmissionItemView(s));
  }

  async getSubmissionDetail(
    applicationId: string,
    versionNumber: number,
    userId: string,
  ): Promise<SubmissionSnapshotDetailView> {
    const app = await this.repository.findById(applicationId, userId);
    if (!app) {
      throw new NotFoundException('Pengajuan tidak ditemukan.');
    }

    const snapshot = await this.repository.findSubmissionSnapshotByVersion(
      applicationId,
      versionNumber,
    );
    if (!snapshot) {
      throw new NotFoundException(
        `Snapshot kiriman versi ${versionNumber} tidak ditemukan.`,
      );
    }

    return this.mapToSubmissionDetailView(snapshot);
  }

  async withdrawApplication(
    applicationId: string,
    userId: string,
    dto: WithdrawApplicationDto,
  ): Promise<ApplicationDetailView> {
    const app = await this.repository.findById(applicationId, userId);
    if (!app) {
      throw new NotFoundException('Pengajuan tidak ditemukan.');
    }

    if (app.statusSummary === ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN) {
      throw new BadRequestException(
        'Pengajuan yang sudah selesai diterima hasilnya tidak dapat ditarik kembali.',
      );
    }

    const updated = await this.repository.withdrawApplication(
      applicationId,
      userId,
      dto.reason,
    );

    return this.mapToDetailView(updated);
  }

  private mapToSubmissionItemView(s: any): SubmissionSnapshotItemView {
    return {
      id: s.id,
      application_id: s.applicationId,
      preparation_id: s.preparationId,
      version_number: s.versionNumber,
      submitted_at: s.submittedAt.toISOString(),
      citizen_note: s.citizenNote,
      changes_summary: s.changesSummary,
      consent_version: s.consentVersion,
      reviews: (s.submissionReviews || []).map((r: any) => ({
        id: r.id,
        review_status: r.reviewStatus.toLowerCase(),
        overall_notes: r.overallNotes,
        decided_at: r.decidedAt?.toISOString() ?? null,
        officer: {
          id: r.officer?.id,
          name: r.officer?.displayName,
        },
        assessments: (r.itemAssessments || []).map((ia: any) => ({
          item_id: ia.itemId,
          item_type: ia.itemType.toLowerCase(),
          verdict: ia.verdict.toLowerCase(),
          note: ia.note,
          target_action: ia.targetAction,
        })),
      })),
    };
  }

  private mapToSubmissionDetailView(s: any): SubmissionSnapshotDetailView {
    return {
      ...this.mapToSubmissionItemView(s),
      service: s.serviceSnapshotJson,
      applicant: s.applicantSnapshotJson,
      answers: s.answersSnapshotJson as any[],
      documents: s.documentsSnapshotJson as any[],
      required_slots: s.requiredSlotsJson,
    };
  }
}
