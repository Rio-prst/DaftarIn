import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { AccountStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsRepository } from './notifications.repository';

const USER_ID = 'b1111111-1111-4111-8111-111111111111';
const OTHER_USER_ID = 'b1111111-1111-4111-8111-111111111112';

let prisma: PrismaService;
let repository: NotificationsRepository;

async function cleanFixtures(): Promise<void> {
  if (!prisma) return;

  await prisma.notification.deleteMany({
    where: {
      userId: { in: [USER_ID, OTHER_USER_ID] },
    },
  });

  await prisma.user.deleteMany({
    where: { id: { in: [USER_ID, OTHER_USER_ID] } },
  });
}

async function seedFixtures(): Promise<void> {
  await prisma.user.createMany({
    data: [
      {
        id: USER_ID,
        email: 'notif-user@example.com',
        displayName: 'User Notif Test',
        authProvider: 'local',
        accountStatus: AccountStatus.ACTIVE,
      },
      {
        id: OTHER_USER_ID,
        email: 'notif-other@example.com',
        displayName: 'Other Notif Test',
        authProvider: 'local',
        accountStatus: AccountStatus.ACTIVE,
      },
    ],
  });
}

describe('NotificationsRepository Integration', () => {
  jest.setTimeout(30_000);

  beforeAll(async () => {
    const config = new ConfigService({
      DATABASE_URL: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
    });
    prisma = new PrismaService(config);
    repository = new NotificationsRepository(prisma);

    await cleanFixtures();
    await seedFixtures();
  });

  afterAll(async () => {
    await cleanFixtures();
    await prisma.$disconnect();
  });

  it('creates notifications and lists them with unread filtering', async () => {
    const notif1 = await repository.create({
      userId: USER_ID,
      notificationType: 'inspection_completed',
      title: 'Pemeriksaan Berkas Selesai',
      body: 'Berkas KTP Anda telah selesai diperiksa.',
      targetPath: '/preparations/test-1',
    });

    const notif2 = await repository.create({
      userId: USER_ID,
      notificationType: 'status_changed',
      title: 'Status Pengajuan Diperbarui',
      body: 'Pengajuan sedang diverifikasi.',
    });

    expect(notif1.id).toBeDefined();
    expect(notif2.id).toBeDefined();

    const unreadCount = await repository.countUnread(USER_ID);
    expect(unreadCount).toBe(2);

    const listResult = await repository.list({
      userId: USER_ID,
      page: 1,
      pageSize: 10,
    });
    expect(listResult.items.length).toBe(2);
    expect(listResult.total).toBe(2);
  });

  it('marks a single notification as read and isolates from other users', async () => {
    const notifs = await repository.list({
      userId: USER_ID,
      page: 1,
      pageSize: 1,
    });
    const targetNotif = notifs.items[0];

    // Other user cannot mark it as read
    const otherResult = await repository.markAsRead(
      targetNotif.id,
      OTHER_USER_ID,
    );
    expect(otherResult).toBeNull();

    // Owner marks as read
    const updated = await repository.markAsRead(targetNotif.id, USER_ID);
    expect(updated).not.toBeNull();
    expect(updated?.readAt).not.toBeNull();

    const unreadCount = await repository.countUnread(USER_ID);
    expect(unreadCount).toBe(1);
  });

  it('marks all remaining notifications as read', async () => {
    const updatedCount = await repository.markAllAsRead(USER_ID);
    expect(updatedCount).toBe(1);

    const unreadCount = await repository.countUnread(USER_ID);
    expect(unreadCount).toBe(0);
  });
});
