import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Notification, Prisma } from '../generated/prisma/client';
import type {
  CreateNotificationRepositoryInput,
  INotificationsRepository,
  ListNotificationsRepositoryInput,
} from './interfaces/notifications.repository.interface';

@Injectable()
export class NotificationsRepository implements INotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    input: ListNotificationsRepositoryInput,
  ): Promise<{ items: Notification[]; total: number }> {
    const where: Prisma.NotificationWhereInput = {
      userId: input.userId,
      ...(input.isRead !== undefined
        ? input.isRead
          ? { readAt: { not: null } }
          : { readAt: null }
        : {}),
      ...(input.type ? { notificationType: input.type } : {}),
    };

    const items = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Math.max(1, Number(input.page) || 1) - 1) * Math.max(1, Number(input.pageSize) || 20),
      take: Math.max(1, Number(input.pageSize) || 20),
    });
    const total = await this.prisma.notification.count({ where });

    return { items, total };
  }

  async findById(id: string, userId: string): Promise<Notification | null> {
    return this.prisma.notification.findFirst({
      where: { id, userId },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification | null> {
    const notif = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notif) return null;

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: notif.readAt ?? new Date() },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return result.count;
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  async create(
    input: CreateNotificationRepositoryInput,
  ): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: input.userId,
        applicationId: input.applicationId ?? null,
        notificationType: input.notificationType,
        title: input.title,
        body: input.body,
        targetPath: input.targetPath ?? null,
      },
    });
  }
}
