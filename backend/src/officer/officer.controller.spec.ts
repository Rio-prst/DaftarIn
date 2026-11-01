import { Test, type TestingModule } from '@nestjs/testing';
import { OfficerController } from './officer.controller';
import {
  OFFICER_SERVICE,
  type IOfficerService,
  type ListAssignmentsResult,
  type OfficerApplicationDetailView,
  type OfficerEventResultView,
} from './interfaces/officer.service.interface';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

describe('OfficerController', () => {
  let controller: OfficerController;
  let mockService: jest.Mocked<IOfficerService>;

  const mockUser: AuthenticatedUser = {
    id: 'officer-uuid-1',
    role: 'officer',
    sessionId: 'session-uuid-1',
  };

  beforeEach(async () => {
    mockService = {
      listAssignments: jest.fn(),
      getApplicationDetail: jest.fn(),
      createEvent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfficerController],
      providers: [
        {
          provide: OFFICER_SERVICE,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<OfficerController>(OfficerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listAssignments', () => {
    it('returns assigned applications', async () => {
      const mockResult: ListAssignmentsResult = {
        data: [
          {
            id: 'assign-1',
            application_id: 'app-1',
            internal_reference: 'APP-2026-1234',
            official_application_number: null,
            service: { id: 's-1', name: 'KTP', category: 'Dukcapil' },
            agency: { id: 'a-1', name: 'Disdukcapil' },
            citizen: { id: 'c-1', name: 'Warga' },
            current_status: 'citizen_recorded_unconfirmed',
            assigned_at: '2026-10-29T08:00:00Z',
          },
        ],
        meta: {
          page: 1,
          page_size: 20,
          total_items: 1,
          total_pages: 1,
        },
      };

      mockService.listAssignments.mockResolvedValue(mockResult);

      const response = await controller.listAssignments(
        { page: 1, page_size: 20 },
        mockUser,
      );

      expect(response.data).toEqual(mockResult.data);
      expect(response.meta?.total_items).toBe(1);
    });
  });

  describe('getApplication', () => {
    it('returns application detail', async () => {
      const mockDetail: OfficerApplicationDetailView = {
        id: 'app-1',
        internal_reference: 'APP-2026-1234',
        official_application_number: null,
        service: {
          id: 's-1',
          name: 'KTP',
          category: 'Dukcapil',
          slug: 'ktp',
        },
        agency: { id: 'a-1', name: 'Disdukcapil' },
        citizen: { id: 'c-1', name: 'Warga' },
        submitted_at: '2026-10-28T08:00:00Z',
        current_status: 'citizen_recorded_unconfirmed',
        timeline: [],
        allowed_actions: ['verify', 'request_revision'],
      };

      mockService.getApplicationDetail.mockResolvedValue(mockDetail);

      const response = await controller.getApplication('app-1', mockUser);

      expect(response.data).toEqual(mockDetail);
      expect(mockService.getApplicationDetail).toHaveBeenCalledWith(
        'app-1',
        mockUser.id,
      );
    });
  });

  describe('createEvent', () => {
    it('creates officer event and returns result', async () => {
      const mockResult: OfficerEventResultView = {
        id: 'event-1',
        application_id: 'app-1',
        event_type: 'status_changed',
        status: 'verification',
        source_type: 'officer',
        source_label: 'Petugas yang ditugaskan',
        occurred_at: '2026-10-29T08:00:00Z',
        recorded_at: '2026-10-29T08:00:00Z',
        simulation: false,
      };

      mockService.createEvent.mockResolvedValue(mockResult);

      const response = await controller.createEvent(
        'app-1',
        {
          event_type: 'status_changed',
          status: 'verification',
          note: 'Diverifikasi',
        },
        mockUser,
      );

      expect(response.data).toEqual(mockResult);
    });
  });
});
