import { NotFoundException } from '@nestjs/common';
import type { Notification } from '../generated/prisma/client';
import type { INotificationsRepository } from './interfaces/notifications.repository.interface';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockRepository: jest.Mocked<INotificationsRepository>;

  const userId = 'user-uuid-1';
  const mockNotification: Notification = {
    id: 'notif-uuid-1',
    userId,
    applicationId: 'app-uuid-1',
    notificationType: 'inspection_completed',
    title: 'Pemeriksaan selesai',
    body: 'Hasil berkas Anda telah tersedia.',
    targetPath: '/preparations/prep-1',
    createdAt: new Date('2026-10-29T08:00:00Z'),
    readAt: null,
    deliveredAt: new Date('2026-10-29T08:00:00Z'),
  };

  beforeEach(() => {
    mockRepository = {
      list: jest.fn(),
      findById: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      countUnread: jest.fn(),
      create: jest.fn(),
    };

    service = new NotificationsService(mockRepository);
  });

  describe('listNotifications', () => {
    it('returns mapped paginated list of notifications', async () => {
      mockRepository.list.mockResolvedValue({
        items: [mockNotification],
        total: 1,
      });

      const result = await service.listNotifications(userId, {
        page: 1,
        page_size: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(mockNotification.id);
      expect(result.data[0].is_read).toBe(false);
      expect(result.data[0].related_resource?.id).toBe('app-uuid-1');
    });
  });

  describe('markAsRead', () => {
    it('successfully marks notification as read', async () => {
      mockRepository.markAsRead.mockResolvedValue({
        ...mockNotification,
        readAt: new Date(),
      });

      await expect(
        service.markAsRead(mockNotification.id, userId),
      ).resolves.not.toThrow();

      expect(mockRepository.markAsRead).toHaveBeenCalledWith(
        mockNotification.id,
        userId,
      );
    });

    it('throws NotFoundException if notification does not exist', async () => {
      mockRepository.markAsRead.mockResolvedValue(null);

      await expect(service.markAsRead('non-existent', userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('marks all notifications as read', async () => {
      mockRepository.markAllAsRead.mockResolvedValue(5);

      await expect(service.markAllAsRead(userId)).resolves.not.toThrow();
      expect(mockRepository.markAllAsRead).toHaveBeenCalledWith(userId);
    });
  });

  describe('countUnread', () => {
    it('returns unread count from repository', async () => {
      mockRepository.countUnread.mockResolvedValue(3);

      const count = await service.countUnread(userId);
      expect(count).toBe(3);
    });
  });
});
