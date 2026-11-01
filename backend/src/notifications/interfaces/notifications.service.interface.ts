import type { ListNotificationsQueryDto } from '../dto/list-notifications.query.dto';

export const NOTIFICATIONS_SERVICE = Symbol('NOTIFICATIONS_SERVICE');

export interface NotificationView {
  id: string;
  type: string;
  title: string;
  body: string;
  target_path: string | null;
  related_resource: {
    type: 'application';
    id: string;
  } | null;
  is_read: boolean;
  created_at: string;
}

export interface ListNotificationsResult {
  data: NotificationView[];
  meta: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}

export interface INotificationsService {
  listNotifications(
    userId: string,
    query: ListNotificationsQueryDto,
  ): Promise<ListNotificationsResult>;
  markAsRead(id: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  countUnread(userId: string): Promise<number>;
}
