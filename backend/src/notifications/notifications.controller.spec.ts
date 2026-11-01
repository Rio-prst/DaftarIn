import { Test, type TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import {
  NOTIFICATIONS_SERVICE,
  type INotificationsService,
  type ListNotificationsResult,
} from './interfaces/notifications.service.interface';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let mockService: jest.Mocked<INotificationsService>;

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid-1',
    role: 'citizen',
    sessionId: 'session-uuid-1',
  };

  beforeEach(async () => {
    mockService = {
      listNotifications: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      countUnread: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NOTIFICATIONS_SERVICE,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('returns notifications response', async () => {
      const mockResult: ListNotificationsResult = {
        data: [
          {
            id: 'notif-1',
            type: 'inspection_completed',
            title: 'Selesai',
            body: 'Isi notifikasi',
            target_path: '/prep/1',
            related_resource: null,
            is_read: false,
            created_at: '2026-10-29T08:00:00Z',
          },
        ],
        meta: {
          page: 1,
          page_size: 20,
          total_items: 1,
          total_pages: 1,
        },
      };
      mockService.listNotifications.mockResolvedValue(mockResult);

      const response = await controller.list(
        { page: 1, page_size: 20 },
        mockUser,
      );

      expect(response.data).toEqual(mockResult.data);
      expect(response.meta?.total_items).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('marks single notification as read', async () => {
      mockService.markAsRead.mockResolvedValue();

      await expect(
        controller.markAsRead('notif-1', mockUser),
      ).resolves.not.toThrow();
      expect(mockService.markAsRead).toHaveBeenCalledWith(
        'notif-1',
        mockUser.id,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('marks all notifications as read', async () => {
      mockService.markAllAsRead.mockResolvedValue();

      await expect(controller.markAllAsRead(mockUser)).resolves.not.toThrow();
      expect(mockService.markAllAsRead).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
