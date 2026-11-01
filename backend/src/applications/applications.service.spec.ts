import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  ApplicationStatus,
  StatusSourceType,
  SubmissionChannel,
} from '../generated/prisma/client';
import { ApplicationsService } from './applications.service';
import type {
  ApplicationRecordWithRelations,
  IApplicationsRepository,
  StatusEventWithActor,
} from './interfaces/applications.repository.interface';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let mockRepository: jest.Mocked<IApplicationsRepository>;

  const userId = '11111111-1111-1111-1111-111111111111';
  const serviceId = '22222222-2222-2222-2222-222222222222';
  const agencyId = '33333333-3333-3333-3333-333333333333';
  const prepId = '44444444-4444-4444-4444-444444444444';
  const appId = '55555555-5555-5555-5555-555555555555';

  const mockAppRecord: ApplicationRecordWithRelations = {
    id: appId,
    userId,
    serviceId,
    agencyId,
    preparationId: null,
    internalReference: 'APP-2026-ABCD1234',
    officialReference: 'REG-OFFICIAL-123',
    submittedDate: new Date('2026-10-28T08:00:00Z'),
    submissionChannel: SubmissionChannel.ONLINE_PORTAL,
    sourceMode: StatusSourceType.CITIZEN_REPORT,
    statusSummary: ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
    reviewStatus: 'SUBMITTED' as any,
    citizenNotes: 'Pengajuan dicatat sendiri.',
    version: 1,
    createdAt: new Date('2026-10-28T08:00:00Z'),
    updatedAt: new Date('2026-10-28T08:00:00Z'),
    archivedAt: null,
    service: {
      id: serviceId,
      name: 'Pembuatan KTP',
      category: 'Kependudukan',
      slug: 'pembuatan-ktp',
    },
    agency: {
      id: agencyId,
      name: 'Disdukcapil Kota Bandung',
      agencyType: 'DINAS',
    },
    preparation: null,
    statusEvents: [
      {
        id: '66666666-6666-6666-6666-666666666666',
        applicationId: appId,
        actorUserId: userId,
        statusCode: ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
        sourceType: StatusSourceType.CITIZEN_REPORT,
        sourceLabel: 'Dicatat warga — belum terkonfirmasi instansi',
        description: 'Pengajuan dicatat sendiri.',
        revisionReason: null,
        nextAction: null,
        occurredAt: new Date('2026-10-28T08:00:00Z'),
        recordedAt: new Date('2026-10-28T08:00:00Z'),
        metadataJson: null,
      },
    ],
  };

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      addStatusEvent: jest.fn(),
      listStatusEvents: jest.fn(),
      updateStatus: jest.fn(),
      linkPreparation: jest.fn(),
      findServiceById: jest.fn(),
      updateReviewStatus: jest.fn(),
      findPreparationForSubmission: jest.fn(),
      findUserForSubmission: jest.fn(),
      findFamilyMember: jest.fn(),
      findPreparationById: jest.fn(),
      createSubmissionSnapshot: jest.fn(),
      findSubmissionSnapshots: jest.fn(),
      findSubmissionSnapshotByVersion: jest.fn(),
      findLatestSubmissionVersion: jest.fn(),
      withdrawApplication: jest.fn(),
    };

    service = new ApplicationsService(mockRepository);
  });

  describe('createApplication', () => {
    it('creates an application record with initial status event successfully', async () => {
      mockRepository.findServiceById.mockResolvedValue({
        id: serviceId,
        agencyId,
        name: 'Pembuatan KTP',
      });
      mockRepository.create.mockResolvedValue(mockAppRecord);

      const result = await service.createApplication(userId, {
        service_id: serviceId,
        channel: { type: 'online' },
        official_application_number: 'REG-OFFICIAL-123',
        note: 'Pengajuan dicatat sendiri.',
        submitted_at: '2026-10-28T08:00:00.000Z',
      });

      expect(mockRepository.findServiceById).toHaveBeenCalledWith(serviceId);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          serviceId,
          agencyId,
          officialReference: 'REG-OFFICIAL-123',
          submissionChannel: SubmissionChannel.ONLINE_PORTAL,
          sourceMode: StatusSourceType.CITIZEN_REPORT,
          statusSummary: ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
        }),
      );
      expect(result.id).toBe(appId);
      expect(result.internal_reference).toBe('APP-2026-ABCD1234');
      expect(result.channel.type).toBe('online');
    });

    it('validates linked preparation and succeeds if valid', async () => {
      mockRepository.findServiceById.mockResolvedValue({
        id: serviceId,
        agencyId,
        name: 'Pembuatan KTP',
      });
      mockRepository.findPreparationById.mockResolvedValue({
        id: prepId,
        serviceId,
        userId,
        archivedAt: null,
        deletedAt: null,
      });
      mockRepository.create.mockResolvedValue({
        ...mockAppRecord,
        preparationId: prepId,
      });

      const result = await service.createApplication(userId, {
        service_id: serviceId,
        preparation_id: prepId,
        channel: { type: 'in_person' },
      });

      expect(result.preparation_id).toBe(prepId);
    });

    it('throws NotFoundException if service does not exist', async () => {
      mockRepository.findServiceById.mockResolvedValue(null);

      await expect(
        service.createApplication(userId, {
          service_id: serviceId,
          channel: { type: 'online' },
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if preparation does not match service', async () => {
      mockRepository.findServiceById.mockResolvedValue({
        id: serviceId,
        agencyId,
        name: 'Pembuatan KTP',
      });
      mockRepository.findPreparationById.mockResolvedValue({
        id: prepId,
        serviceId: 'other-service-id',
        userId,
        archivedAt: null,
        deletedAt: null,
      });

      await expect(
        service.createApplication(userId, {
          service_id: serviceId,
          preparation_id: prepId,
          channel: { type: 'online' },
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listApplications', () => {
    it('returns paginated list of applications', async () => {
      mockRepository.list.mockResolvedValue({
        items: [mockAppRecord],
        total: 1,
      });

      const result = await service.listApplications(userId, {
        page: 1,
        page_size: 20,
        sort: 'updated_at',
        order: 'desc',
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total_items).toBe(1);
      expect(result.data[0].id).toBe(appId);
    });
  });

  describe('getApplication', () => {
    it('returns detail of application if found', async () => {
      mockRepository.findById.mockResolvedValue(mockAppRecord);

      const result = await service.getApplication(appId, userId);

      expect(result.id).toBe(appId);
      expect(result.service.name).toBe('Pembuatan KTP');
    });

    it('throws NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getApplication(appId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTimeline', () => {
    it('returns events and indicates official updates unavailable when only citizen events', async () => {
      mockRepository.findById.mockResolvedValue(mockAppRecord);
      const mockEvent: StatusEventWithActor = {
        id: 'event-1',
        applicationId: appId,
        actorUserId: userId,
        statusCode: ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
        sourceType: StatusSourceType.CITIZEN_REPORT,
        sourceLabel: 'Dicatat warga — belum terkonfirmasi instansi',
        description: 'Dicatat warga',
        revisionReason: null,
        nextAction: null,
        occurredAt: new Date('2026-10-28T08:00:00Z'),
        recordedAt: new Date('2026-10-28T08:00:00Z'),
        metadataJson: null,
        actor: { id: userId, displayName: 'Warga' },
      };
      mockRepository.listStatusEvents.mockResolvedValue([mockEvent]);

      const result = await service.getTimeline(appId, userId);

      expect(result.application_id).toBe(appId);
      expect(result.official_updates_available).toBe(false);
      expect(result.events).toHaveLength(1);
    });

    it('indicates official updates available when officer event present', async () => {
      mockRepository.findById.mockResolvedValue(mockAppRecord);
      const mockOfficerEvent: StatusEventWithActor = {
        id: 'event-2',
        applicationId: appId,
        actorUserId: 'officer-id',
        statusCode: ApplicationStatus.VERIFICATION,
        sourceType: StatusSourceType.OFFICER,
        sourceLabel: 'Petugas loket',
        description: 'Dokumen sedang diverifikasi',
        revisionReason: null,
        nextAction: null,
        occurredAt: new Date('2026-10-29T08:00:00Z'),
        recordedAt: new Date('2026-10-29T08:00:00Z'),
        metadataJson: null,
        actor: { id: 'officer-id', displayName: 'Petugas' },
      };
      mockRepository.listStatusEvents.mockResolvedValue([mockOfficerEvent]);

      const result = await service.getTimeline(appId, userId);

      expect(result.official_updates_available).toBe(true);
      expect(result.message).toContain('Terdapat pembaruan resmi');
    });
  });

  describe('addCitizenNote', () => {
    it('creates a status event for citizen note', async () => {
      mockRepository.findById.mockResolvedValue(mockAppRecord);
      mockRepository.addStatusEvent.mockResolvedValue({
        id: 'event-note-1',
        applicationId: appId,
        actorUserId: userId,
        statusCode: ApplicationStatus.PROCESSING,
        sourceType: StatusSourceType.CITIZEN_REPORT,
        sourceLabel: 'Catatan warga',
        description: 'Petugas meminta tunggu 3 hari kerja.',
        revisionReason: null,
        nextAction: null,
        occurredAt: new Date('2026-10-29T00:00:00Z'),
        recordedAt: new Date('2026-10-29T00:00:00Z'),
        metadataJson: null,
        actor: { id: userId, displayName: 'Warga' },
      });

      const result = await service.addCitizenNote(appId, userId, {
        note: 'Petugas meminta tunggu 3 hari kerja.',
        reported_status: 'processing',
      });

      expect(result.event_type).toBe('citizen_note');
      expect(result.note).toBe('Petugas meminta tunggu 3 hari kerja.');
    });
  });

  describe('confirmResultReceived', () => {
    it('updates application to RESULT_RECEIVED_BY_CITIZEN and creates event', async () => {
      mockRepository.findById.mockResolvedValueOnce(mockAppRecord);
      mockRepository.updateStatus.mockResolvedValue({
        ...mockAppRecord,
        statusSummary: ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN,
      });
      mockRepository.addStatusEvent.mockResolvedValue({
        id: 'event-done-1',
        applicationId: appId,
        actorUserId: userId,
        statusCode: ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN,
        sourceType: StatusSourceType.CITIZEN_REPORT,
        sourceLabel: 'Warga mengonfirmasi penerimaan hasil',
        description: 'KTP sudah saya ambil di kantor camat.',
        revisionReason: null,
        nextAction: null,
        occurredAt: new Date(),
        recordedAt: new Date(),
        metadataJson: null,
        actor: { id: userId, displayName: 'Warga' },
      });
      mockRepository.findById.mockResolvedValueOnce({
        ...mockAppRecord,
        statusSummary: ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN,
      });

      const result = await service.confirmResultReceived(appId, userId, {
        note: 'KTP sudah saya ambil di kantor camat.',
        acknowledgement_confirmed: true,
      });

      expect(mockRepository.updateStatus).toHaveBeenCalledWith(
        appId,
        ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN,
        'REG-OFFICIAL-123',
      );
      expect(result.current_status).toBe('result_received_by_citizen');
    });
  });

  describe('linkPreparation', () => {
    it('links preparation to application successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockAppRecord);
      mockRepository.findPreparationById.mockResolvedValue({
        id: prepId,
        serviceId,
        userId,
        archivedAt: null,
        deletedAt: null,
      });
      mockRepository.linkPreparation.mockResolvedValue({
        ...mockAppRecord,
        preparationId: prepId,
      });

      const result = await service.linkPreparation(appId, userId, prepId);

      expect(mockRepository.linkPreparation).toHaveBeenCalledWith(
        appId,
        prepId,
      );
      expect(result.preparation_id).toBe(prepId);
    });

    it('rejects if preparation belongs to different service', async () => {
      mockRepository.findById.mockResolvedValue(mockAppRecord);
      mockRepository.findPreparationById.mockResolvedValue({
        id: prepId,
        serviceId: 'different-service',
        userId,
        archivedAt: null,
        deletedAt: null,
      });

      await expect(
        service.linkPreparation(appId, userId, prepId),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
