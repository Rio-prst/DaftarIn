import { Test, type TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import {
  APPLICATIONS_SERVICE,
  type ApplicationDetailView,
  type ApplicationTimelineResult,
  type IApplicationsService,
  type ListApplicationsResult,
  type StatusEventView,
} from './interfaces/applications.service.interface';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let mockService: jest.Mocked<IApplicationsService>;

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid-1',
    role: 'citizen',
    sessionId: 'session-uuid-1',
  };

  const mockDetail: ApplicationDetailView = {
    id: 'app-uuid-1',
    internal_reference: 'APP-2026-TEST1234',
    service_id: 'service-uuid-1',
    service: {
      id: 'service-uuid-1',
      name: 'Pembuatan KTP',
      category: 'Kependudukan',
      slug: 'pembuatan-ktp',
    },
    agency: {
      id: 'agency-uuid-1',
      name: 'Disdukcapil',
      agency_type: 'DINAS',
    },
    preparation_id: null,
    preparation: null,
    official_application_number: 'OFFICIAL-123',
    official_number_source: 'citizen_reported',
    submitted_at: '2026-10-28T08:00:00.000Z',
    channel: { type: 'online' },
    source_mode: 'citizen_recorded',
    current_status: 'citizen_recorded_unconfirmed',
    simulation: false,
    created_at: '2026-10-28T08:00:00.000Z',
    updated_at: '2026-10-28T08:00:00.000Z',
    citizen_notes: 'Catatan awal',
    latest_event: null,
  };

  beforeEach(async () => {
    mockService = {
      createApplication: jest.fn(),
      listApplications: jest.fn(),
      getApplication: jest.fn(),
      getTimeline: jest.fn(),
      addCitizenNote: jest.fn(),
      confirmResultReceived: jest.fn(),
      linkPreparation: jest.fn(),
      submitPreparation: jest.fn(),
      resubmitApplication: jest.fn(),
      listSubmissions: jest.fn(),
      getSubmissionDetail: jest.fn(),
      withdrawApplication: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: APPLICATIONS_SERVICE,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('returns list of applications with metadata', async () => {
      const mockResult: ListApplicationsResult = {
        data: [mockDetail],
        meta: {
          page: 1,
          page_size: 20,
          total_items: 1,
          total_pages: 1,
        },
      };
      mockService.listApplications.mockResolvedValue(mockResult);

      const response = await controller.list(
        { page: 1, page_size: 20, sort: 'updated_at', order: 'desc' },
        mockUser,
      );

      expect(response.data).toEqual([mockDetail]);
      expect(response.meta?.total_items).toBe(1);
    });
  });

  describe('create', () => {
    it('creates an application and returns created response', async () => {
      mockService.createApplication.mockResolvedValue(mockDetail);

      const response = await controller.create(
        {
          service_id: 'service-uuid-1',
          channel: { type: 'online' },
          official_application_number: 'OFFICIAL-123',
        },
        mockUser,
      );

      expect(response.data).toEqual(mockDetail);
      expect(mockService.createApplication).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          service_id: 'service-uuid-1',
        }),
      );
    });
  });

  describe('get', () => {
    it('returns detail of single application', async () => {
      mockService.getApplication.mockResolvedValue(mockDetail);

      const response = await controller.get(mockDetail.id, mockUser);

      expect(response.data).toEqual(mockDetail);
      expect(mockService.getApplication).toHaveBeenCalledWith(
        mockDetail.id,
        mockUser.id,
      );
    });
  });

  describe('getTimeline', () => {
    it('returns timeline of events', async () => {
      const mockTimeline: ApplicationTimelineResult = {
        application_id: mockDetail.id,
        source_mode: 'citizen_recorded',
        official_updates_available: false,
        message: 'Belum ada pembaruan dari instansi yang tercatat.',
        events: [],
      };
      mockService.getTimeline.mockResolvedValue(mockTimeline);

      const response = await controller.getTimeline(mockDetail.id, mockUser);

      expect(response.data).toEqual(mockTimeline);
      expect(mockService.getTimeline).toHaveBeenCalledWith(
        mockDetail.id,
        mockUser.id,
      );
    });
  });

  describe('addCitizenNote', () => {
    it('adds a note event and returns it', async () => {
      const mockEvent: StatusEventView = {
        id: 'event-id-1',
        application_id: mockDetail.id,
        event_type: 'citizen_note',
        status: 'processing',
        source_type: 'citizen',
        source_label: 'Catatan warga',
        occurred_at: '2026-10-29T00:00:00.000Z',
        recorded_at: '2026-10-29T00:00:00.000Z',
        actor: { id: mockUser.id, name: 'Warga' },
        note: 'Diminta datang lagi besok.',
        simulation: false,
        correction_of_event_id: null,
      };
      mockService.addCitizenNote.mockResolvedValue(mockEvent);

      const response = await controller.addCitizenNote(
        mockDetail.id,
        { note: 'Diminta datang lagi besok.' },
        mockUser,
      );

      expect(response.data).toEqual(mockEvent);
    });
  });

  describe('confirmResultReceived', () => {
    it('confirms result received and returns updated detail', async () => {
      const updatedDetail = {
        ...mockDetail,
        current_status: 'result_received_by_citizen',
      };
      mockService.confirmResultReceived.mockResolvedValue(updatedDetail);

      const response = await controller.confirmResultReceived(
        mockDetail.id,
        { note: 'Berkas diterima lengkap.', acknowledgement_confirmed: true },
        mockUser,
      );

      expect(response.data).toEqual(updatedDetail);
    });
  });

  describe('linkPreparation', () => {
    it('links preparation and returns updated detail', async () => {
      const updatedDetail = {
        ...mockDetail,
        preparation_id: 'prep-uuid-1',
      };
      mockService.linkPreparation.mockResolvedValue(updatedDetail);

      const response = await controller.linkPreparation(
        mockDetail.id,
        { preparation_id: 'prep-uuid-1' },
        mockUser,
      );

      expect(response.data).toEqual(updatedDetail);
    });
  });
});
