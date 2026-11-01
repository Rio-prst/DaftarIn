import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationStatus,
  StatusSourceType,
} from '../generated/prisma/client';
import { OfficerService } from './officer.service';
import type {
  IOfficerRepository,
  OfficerApplicationDetailWithRelations,
  OfficerAssignmentWithRelations,
  StatusEventWithActor,
} from './interfaces/officer.repository.interface';

describe('OfficerService', () => {
  let service: OfficerService;
  let mockRepository: jest.Mocked<IOfficerRepository>;

  const officerUserId = 'officer-uuid-1';
  const citizenUserId = 'citizen-uuid-1';
  const applicationId = 'app-uuid-1';
  const assignmentId = 'assign-uuid-1';

  const mockAssignment: OfficerAssignmentWithRelations = {
    id: assignmentId,
    applicationId,
    officerUserId,
    assignmentStatus: 'ACTIVE',
    assignedAt: new Date('2026-10-29T08:00:00Z'),
    endedAt: null,
    application: {
      id: applicationId,
      userId: citizenUserId,
      serviceId: 'service-1',
      agencyId: 'agency-1',
      preparationId: null,
      internalReference: 'APP-2026-1234',
      officialReference: 'REG-123',
      submittedDate: new Date('2026-10-28T08:00:00Z'),
      submissionChannel: 'ONLINE_PORTAL',
      sourceMode: 'CITIZEN_REPORT',
      statusSummary: ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
      citizenNotes: null,
      version: 1,
      createdAt: new Date('2026-10-28T08:00:00Z'),
      updatedAt: new Date('2026-10-28T08:00:00Z'),
      archivedAt: null,
      service: {
        id: 'service-1',
        name: 'Pembuatan KTP',
        category: 'Kependudukan',
        slug: 'pembuatan-ktp',
      },
      agency: {
        id: 'agency-1',
        name: 'Disdukcapil',
      },
      user: {
        id: citizenUserId,
        displayName: 'Warga Satu',
      },
      statusEvents: [
        {
          id: 'event-1',
          applicationId,
          actorUserId: citizenUserId,
          statusCode: ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
          sourceType: 'CITIZEN_REPORT',
          sourceLabel: 'Dicatat warga',
          description: 'Awal',
          revisionReason: null,
          nextAction: null,
          occurredAt: new Date('2026-10-28T08:00:00Z'),
          recordedAt: new Date('2026-10-28T08:00:00Z'),
          metadataJson: null,
        },
      ],
    },
  };

  const mockAppDetail: OfficerApplicationDetailWithRelations = {
    ...mockAssignment.application,
    statusEvents: [
      {
        id: 'event-1',
        applicationId,
        actorUserId: citizenUserId,
        statusCode: ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
        sourceType: 'CITIZEN_REPORT',
        sourceLabel: 'Dicatat warga',
        description: 'Awal',
        revisionReason: null,
        nextAction: null,
        occurredAt: new Date('2026-10-28T08:00:00Z'),
        recordedAt: new Date('2026-10-28T08:00:00Z'),
        metadataJson: null,
        actor: {
          id: citizenUserId,
          displayName: 'Warga Satu',
        },
      },
    ],
  };

  beforeEach(() => {
    mockRepository = {
      findAssignment: jest.fn(),
      listAssignments: jest.fn(),
      findApplicationDetail: jest.fn(),
      createOfficerEvent: jest.fn(),
    };

    service = new OfficerService(mockRepository);
  });

  describe('listAssignments', () => {
    it('returns paginated list of assigned applications', async () => {
      mockRepository.listAssignments.mockResolvedValue({
        items: [mockAssignment],
        total: 1,
      });

      const result = await service.listAssignments(officerUserId, {
        page: 1,
        page_size: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(assignmentId);
      expect(result.data[0].citizen.name).toBe('Warga Satu');
    });
  });

  describe('getApplicationDetail', () => {
    it('returns application detail and computed allowed actions if assigned', async () => {
      mockRepository.findAssignment.mockResolvedValue(mockAssignment);
      mockRepository.findApplicationDetail.mockResolvedValue(mockAppDetail);

      const result = await service.getApplicationDetail(
        applicationId,
        officerUserId,
      );

      expect(result.id).toBe(applicationId);
      expect(result.allowed_actions).toContain('verify');
      expect(result.timeline).toHaveLength(1);
    });

    it('throws ForbiddenException if officer is not assigned to application', async () => {
      mockRepository.findAssignment.mockResolvedValue(null);

      await expect(
        service.getApplicationDetail(applicationId, officerUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException if application not found', async () => {
      mockRepository.findAssignment.mockResolvedValue(mockAssignment);
      mockRepository.findApplicationDetail.mockResolvedValue(null);

      await expect(
        service.getApplicationDetail(applicationId, officerUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createEvent', () => {
    it('creates verification event and notification successfully', async () => {
      mockRepository.findAssignment.mockResolvedValue(mockAssignment);
      mockRepository.findApplicationDetail.mockResolvedValue(mockAppDetail);

      const mockEvent: StatusEventWithActor = {
        id: 'event-officer-1',
        applicationId,
        actorUserId: officerUserId,
        statusCode: ApplicationStatus.VERIFICATION,
        sourceType: StatusSourceType.OFFICER,
        sourceLabel: 'Petugas yang ditugaskan',
        description: 'Berkas diverifikasi',
        revisionReason: null,
        nextAction: null,
        occurredAt: new Date('2026-10-29T08:00:00Z'),
        recordedAt: new Date('2026-10-29T08:00:00Z'),
        metadataJson: null,
        actor: {
          id: officerUserId,
          displayName: 'Petugas Satu',
        },
      };

      mockRepository.createOfficerEvent.mockResolvedValue(mockEvent);

      const result = await service.createEvent(applicationId, officerUserId, {
        event_type: 'status_changed',
        status: 'verification',
        note: 'Berkas diverifikasi',
      });

      expect(result.status).toBe('verification');
      expect(mockRepository.createOfficerEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationId,
          statusCode: ApplicationStatus.VERIFICATION,
          sourceType: StatusSourceType.OFFICER,
          citizenUserId,
        }),
      );
    });

    it('creates revision_requested event when needs_correction and validates revision_request', async () => {
      mockRepository.findAssignment.mockResolvedValue(mockAssignment);
      mockRepository.findApplicationDetail.mockResolvedValue(mockAppDetail);

      const mockEvent: StatusEventWithActor = {
        id: 'event-rev-1',
        applicationId,
        actorUserId: officerUserId,
        statusCode: ApplicationStatus.NEEDS_CORRECTION,
        sourceType: StatusSourceType.OFFICER,
        sourceLabel: 'Petugas yang ditugaskan',
        description: 'Kurang jelas',
        revisionReason: 'KTP buram',
        nextAction: null,
        occurredAt: new Date('2026-10-29T08:00:00Z'),
        recordedAt: new Date('2026-10-29T08:00:00Z'),
        metadataJson: null,
        actor: {
          id: officerUserId,
          displayName: 'Petugas Satu',
        },
      };

      mockRepository.createOfficerEvent.mockResolvedValue(mockEvent);

      const result = await service.createEvent(applicationId, officerUserId, {
        event_type: 'revision_requested',
        status: 'needs_correction',
        revision_request: {
          reason: 'KTP buram',
          actions: [{ type: 'upload_document', label: 'Upload ulang KTP' }],
        },
      });

      expect(result.event_type).toBe('revision_requested');
      expect(result.status).toBe('needs_correction');
      expect(result.revision_request?.reason).toBe('KTP buram');
    });

    it('rejects needs_correction without revision_request', async () => {
      mockRepository.findAssignment.mockResolvedValue(mockAssignment);
      mockRepository.findApplicationDetail.mockResolvedValue(mockAppDetail);

      await expect(
        service.createEvent(applicationId, officerUserId, {
          event_type: 'revision_requested',
          status: 'needs_correction',
          revision_request: null,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
