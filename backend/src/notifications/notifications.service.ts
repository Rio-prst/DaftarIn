import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Notification } from '../generated/prisma/client';
import type { ListNotificationsQueryDto } from './dto/list-notifications.query.dto';
import {
  NOTIFICATIONS_REPOSITORY,
  type INotificationsRepository,
} from './interfaces/notifications.repository.interface';
import {
  type INotificationsService,
  type ListNotificationsResult,
  type NotificationView,
} from './interfaces/notifications.service.interface';

@Injectable()
export class NotificationsService implements INotificationsService {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY)
    private readonly repository: INotificationsRepository,
  ) {}

  async listNotifications(
    userId: string,
    query: ListNotificationsQueryDto,
  ): Promise<ListNotificationsResult> {
    const isRead =
      query.is_read !== undefined ? query.is_read === 'true' : undefined;

    const { items, total } = await this.repository.list({
      userId,
      isRead,
      type: query.type,
      page: query.page,
      pageSize: query.page_size,
    });

    return {
      data: items.map((item) => this.mapToView(item)),
      meta: {
        page: query.page,
        page_size: query.page_size,
        total_items: total,
        total_pages: Math.ceil(total / query.page_size),
      },
    };
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    const updated = await this.repository.markAsRead(id, userId);
    if (!updated) {
      throw new NotFoundException('Notifikasi tidak ditemukan.');
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository.markAllAsRead(userId);
  }

  async countUnread(userId: string): Promise<number> {
    return this.repository.countUnread(userId);
  }

  private mapToView(item: Notification): NotificationView {
    return {
      id: item.id,
      type: item.notificationType,
      title: item.title,
      body: item.body,
      target_path: item.targetPath,
      related_resource: item.applicationId
        ? {
            type: 'application',
            id: item.applicationId,
          }
        : null,
      is_read: item.readAt !== null,
      created_at: item.createdAt.toISOString(),
    };
  }
}
