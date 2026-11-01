import { ConflictException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import type {
  AdminServiceWithRelations,
  IAdminRepository,
} from './interfaces/admin.repository.interface';
import { GuideVersionStatus } from '../generated/prisma/client';

describe('AdminService', () => {
  let service: AdminService;
  let mockRepository: jest.Mocked<IAdminRepository>;

  const adminUserId = 'admin-uuid-1';
  const serviceId = 'service-uuid-1';
  const agencyId = 'agency-uuid-1';
  const regionId = 'region-uuid-1';

  const mockServiceRecord: AdminServiceWithRelations = {
    id: serviceId,
    name: 'Perekaman KTP Baru',
    slug: 'perekaman-ktp-baru',
    category: 'Kependudukan',
    summary: 'Layanan pencatatan KTP elektronik baru.',
    agencyId,
    regionId,
    publicationStatus: 'PUBLISHED',
    publishedAt: new Date('2026-10-20T08:00:00Z'),
    createdAt: new Date('2026-10-20T08:00:00Z'),
    updatedAt: new Date('2026-10-20T08:00:00Z'),
    agency: {
      id: agencyId,
      name: 'Disdukcapil',
    },
    region: {
      id: regionId,
      name: 'Kota Bandung',
    },
    guideVersions: [
      {
        id: 'guide-uuid-1',
        serviceId,
        versionNumber: 1,
        status: GuideVersionStatus.PUBLISHED,
        procedureJson: [],
        officialCostJson: null,
        officialDurationJson: null,
        applicationChannelsJson: null,
        sourceReviewedAt: null,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: adminUserId,
      },
    ],
  };

  beforeEach(() => {
    mockRepository = {
      listServices: jest.fn(),
      findServiceById: jest.fn(),
      findServiceBySlug: jest.fn(),
      createService: jest.fn(),
      updateService: jest.fn(),
      findLatestGuideVersionNumber: jest.fn(),
      createGuideVersion: jest.fn(),
      findGuideVersionById: jest.fn(),
      publishGuideVersion: jest.fn(),
      listOfficers: jest.fn(),
      findRoleByCode: jest.fn(),
      findUserById: jest.fn(),
      updateUserRoleAssignments: jest.fn(),
      createOfficerAssignment: jest.fn(),
      recordAuditEvent: jest.fn(),
      listAuditEvents: jest.fn(),
    };

    service = new AdminService(mockRepository);
  });

  describe('createService', () => {
    it('creates service and logs audit event', async () => {
      mockRepository.findServiceBySlug.mockResolvedValue(null);
      mockRepository.createService.mockResolvedValue(mockServiceRecord);
      mockRepository.recordAuditEvent.mockResolvedValue({} as any);

      const result = await service.createService(adminUserId, {
        name: 'Perekaman KTP Baru',
        slug: 'perekaman-ktp-baru',
        category: 'Kependudukan',
        agency_id: agencyId,
        region_id: regionId,
      });

      expect(result.id).toBe(serviceId);
      expect(mockRepository.recordAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'create_service',
          objectType: 'service',
          objectId: serviceId,
        }),
      );
    });

    it('throws ConflictException if slug already exists', async () => {
      mockRepository.findServiceBySlug.mockResolvedValue(mockServiceRecord);

      await expect(
        service.createService(adminUserId, {
          name: 'Perekaman KTP Baru',
          slug: 'perekaman-ktp-baru',
          category: 'Kependudukan',
          agency_id: agencyId,
          region_id: regionId,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateService', () => {
    it('updates service metadata and records audit event', async () => {
      mockRepository.findServiceById.mockResolvedValue(mockServiceRecord);
      mockRepository.updateService.mockResolvedValue({
        ...mockServiceRecord,
        name: 'Perekaman KTP-el',
      });
      mockRepository.recordAuditEvent.mockResolvedValue({} as any);

      const result = await service.updateService(adminUserId, serviceId, {
        name: 'Perekaman KTP-el',
      });

      expect(result.name).toBe('Perekaman KTP-el');
      expect(mockRepository.recordAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update_service',
          objectType: 'service',
        }),
      );
    });

    it('throws NotFoundException if service not found', async () => {
      mockRepository.findServiceById.mockResolvedValue(null);

      await expect(
        service.updateService(adminUserId, 'non-existent', {
          name: 'Perekaman KTP-el',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createGuideVersion', () => {
    it('auto-increments version number and creates draft', async () => {
      mockRepository.findServiceById.mockResolvedValue(mockServiceRecord);
      mockRepository.findLatestGuideVersionNumber.mockResolvedValue(2);
      mockRepository.createGuideVersion.mockResolvedValue({
        id: 'guide-uuid-3',
        serviceId,
        versionNumber: 3,
        status: GuideVersionStatus.DRAFT,
        procedureJson: [],
        officialCostJson: null,
        officialDurationJson: null,
        applicationChannelsJson: null,
        sourceReviewedAt: null,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: adminUserId,
      });
      mockRepository.recordAuditEvent.mockResolvedValue({} as any);

      const result = await service.createGuideVersion(adminUserId, serviceId, {
        procedure_steps: [
          { step: 1, title: 'Datang', description: 'Bawa berkas' },
        ],
      });

      expect(result.version_number).toBe(3);
      expect(result.status).toBe('draft');
      expect(mockRepository.recordAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'create_guide_version',
          objectId: 'guide-uuid-3',
        }),
      );
    });
  });

  describe('publishGuideVersion', () => {
    it('publishes guide version and logs audit event', async () => {
      mockRepository.findGuideVersionById.mockResolvedValue({
        id: 'guide-uuid-1',
        serviceId,
        versionNumber: 1,
        status: GuideVersionStatus.DRAFT,
        procedureJson: [],
        officialCostJson: null,
        officialDurationJson: null,
        applicationChannelsJson: null,
        sourceReviewedAt: null,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: adminUserId,
      });

      mockRepository.publishGuideVersion.mockResolvedValue({
        id: 'guide-uuid-1',
        serviceId,
        versionNumber: 1,
        status: GuideVersionStatus.PUBLISHED,
        procedureJson: [],
        officialCostJson: null,
        officialDurationJson: null,
        applicationChannelsJson: null,
        sourceReviewedAt: null,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: adminUserId,
      });

      mockRepository.recordAuditEvent.mockResolvedValue({} as any);

      const result = await service.publishGuideVersion(
        adminUserId,
        'guide-uuid-1',
        {
          confirm_sources_reviewed: true,
          change_summary: 'Revisi sumber permen',
        },
      );

      expect(result.status).toBe('published');
      expect(mockRepository.recordAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'publish_guide_version',
        }),
      );
    });
  });

  describe('manageRoleAssignments', () => {
    it('updates role assignments and logs audit event', async () => {
      mockRepository.findUserById.mockResolvedValue({
        id: 'target-user-1',
      } as any);
      mockRepository.updateUserRoleAssignments.mockResolvedValue([
        { id: 'ur-1' } as any,
      ]);
      mockRepository.recordAuditEvent.mockResolvedValue({} as any);

      const result = await service.manageRoleAssignments(
        adminUserId,
        'target-user-1',
        {
          assignments: [{ role: 'officer', active: true }],
        },
      );

      expect(result.updated_count).toBe(1);
      expect(mockRepository.recordAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update_user_roles',
          objectId: 'target-user-1',
        }),
      );
    });
  });

  describe('assignOfficerToApplication', () => {
    it('creates officer assignment and records audit', async () => {
      mockRepository.createOfficerAssignment.mockResolvedValue({
        id: 'assign-1',
      } as any);
      mockRepository.recordAuditEvent.mockResolvedValue({} as any);

      const result = await service.assignOfficerToApplication(adminUserId, {
        application_id: 'app-1',
        officer_user_id: 'officer-1',
      });

      expect(result.assignment_id).toBe('assign-1');
      expect(mockRepository.recordAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'assign_officer',
          objectId: 'assign-1',
        }),
      );
    });
  });
});
