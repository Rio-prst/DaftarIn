import type { Notification } from '../../generated/prisma/client';

export const NOTIFICATIONS_REPOSITORY = Symbol('NOTIFICATIONS_REPOSITORY');

export interface ListNotificationsRepositoryInput {
  userId: string;
  isRead?: boolean;
  type?: string;
  page: number;
  pageSize: number;
}

export interface CreateNotificationRepositoryInput {
  userId: string;
  applicationId?: string | null;
  notificationType: string;
  title: string;
  body: string;
  targetPath?: string | null;
}

export interface INotificationsRepository {
  list(
    input: ListNotificationsRepositoryInput,
  ): Promise<{ items: Notification[]; total: number }>;
  findById(id: string, userId: string): Promise<Notification | null>;
  markAsRead(id: string, userId: string): Promise<Notification | null>;
  markAllAsRead(userId: string): Promise<number>;
  countUnread(userId: string): Promise<number>;
  create(input: CreateNotificationRepositoryInput): Promise<Notification>;
}
