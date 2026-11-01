import { Test, type TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import {
  ADMIN_SERVICE,
  type AdminServiceItemView,
  type IAdminService,
} from './interfaces/admin.service.interface';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

describe('AdminController', () => {
  let controller: AdminController;
  let mockService: jest.Mocked<IAdminService>;

  const mockAdmin: AuthenticatedUser = {
    id: 'admin-uuid-1',
    role: 'admin',
    sessionId: 'session-uuid-1',
  };

  const mockServiceItem: AdminServiceItemView = {
    id: 'service-1',
    name: 'KTP Baru',
    slug: 'ktp-baru',
    category: 'Kependudukan',
    summary: 'Pembuatan KTP',
    agency: { id: 'a-1', name: 'Dinas' },
    region: { id: 'r-1', name: 'Bandung' },
    publication_status: 'draft',
    latest_guide_version: null,
    created_at: '2026-10-20T08:00:00Z',
    updated_at: '2026-10-20T08:00:00Z',
  };

  beforeEach(async () => {
    mockService = {
      listServices: jest.fn(),
      createService: jest.fn(),
      updateService: jest.fn(),
      createGuideVersion: jest.fn(),
      publishGuideVersion: jest.fn(),
      listOfficers: jest.fn(),
      manageRoleAssignments: jest.fn(),
      assignOfficerToApplication: jest.fn(),
      listAuditEvents: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: ADMIN_SERVICE,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listServices', () => {
    it('returns services list with metadata', async () => {
      mockService.listServices.mockResolvedValue({
        data: [mockServiceItem],
        meta: { page: 1, page_size: 20, total_items: 1, total_pages: 1 },
      });

      const response = await controller.listServices({
        page: 1,
        page_size: 20,
      });

      expect(response.data).toEqual([mockServiceItem]);
      expect(response.meta?.total_items).toBe(1);
    });
  });

  describe('createService', () => {
    it('creates service and returns created response', async () => {
      mockService.createService.mockResolvedValue(mockServiceItem);

      const response = await controller.createService(mockAdmin, {
        name: 'KTP Baru',
        slug: 'ktp-baru',
        category: 'Kependudukan',
        agency_id: 'a-1',
        region_id: 'r-1',
      });

      expect(response.data).toEqual(mockServiceItem);
      expect(mockService.createService).toHaveBeenCalledWith(
        mockAdmin.id,
        expect.objectContaining({ slug: 'ktp-baru' }),
      );
    });
  });

  describe('publishGuideVersion', () => {
    it('publishes guide version', async () => {
      mockService.publishGuideVersion.mockResolvedValue({
        guide_version_id: 'gv-1',
        service_id: 's-1',
        version_number: 1,
        status: 'published',
        published_at: '2026-10-20T08:00:00Z',
      });

      const response = await controller.publishGuideVersion(mockAdmin, 'gv-1', {
        confirm_sources_reviewed: true,
        change_summary: 'Publishing version 1',
      });

      expect(response.data.status).toBe('published');
    });
  });

  describe('manageRoleAssignments', () => {
    it('updates role assignments', async () => {
      mockService.manageRoleAssignments.mockResolvedValue({
        message: 'Penugasan peran berhasil diperbarui.',
        updated_count: 1,
      });

      const response = await controller.manageRoleAssignments(
        mockAdmin,
        'user-target-1',
        {
          assignments: [{ role: 'officer', active: true }],
        },
      );

      expect(response.data.updated_count).toBe(1);
    });
  });
});
