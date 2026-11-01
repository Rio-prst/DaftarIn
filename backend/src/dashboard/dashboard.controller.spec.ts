import { Test, type TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import {
  DASHBOARD_SERVICE,
  type CitizenDashboardView,
  type IDashboardService,
} from './interfaces/dashboard.service.interface';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

describe('DashboardController', () => {
  let controller: DashboardController;
  let mockService: jest.Mocked<IDashboardService>;

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid-1',
    role: 'citizen',
    sessionId: 'session-uuid-1',
  };

  beforeEach(async () => {
    mockService = {
      getCitizenDashboard: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DASHBOARD_SERVICE,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get', () => {
    it('returns dashboard data for current citizen', async () => {
      const mockDashboard: CitizenDashboardView = {
        preparations: {
          draft: 2,
          needs_completion: 1,
          needs_review: 0,
          ready_initial_check: 1,
        },
        applications: {
          active: 1,
          needs_correction: 0,
        },
        open_findings_count: 1,
        unread_notifications_count: 2,
        recent_items: [],
      };

      mockService.getCitizenDashboard.mockResolvedValue(mockDashboard);

      const response = await controller.get(mockUser);

      expect(response.data).toEqual(mockDashboard);
      expect(mockService.getCitizenDashboard).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
