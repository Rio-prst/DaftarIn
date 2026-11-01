import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import {
  AccountStatus,
  ApplicationStatus,
  GuideVersionStatus,
  ServicePublicationStatus,
  StatusSourceType,
  SubmissionChannel,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OfficerRepository } from './officer.repository';

const CITIZEN_USER_ID = 'c1111111-1111-4111-8111-111111111111';
const OFFICER_USER_ID = 'c2222222-2222-4222-8222-222222222222';
const UNASSIGNED_OFFICER_ID = 'c3333333-3333-4333-8333-333333333333';
const REGION_ID = 'c4444444-4444-4444-8444-444444444444';
const AGENCY_ID = 'c5555555-5555-4555-8555-555555555555';
const SERVICE_ID = 'c6666666-6666-4666-8666-666666666666';
const GUIDE_VERSION_ID = 'c7777777-7777-4777-8777-777777777777';
const APPLICATION_ID = 'c8888888-8888-4888-8888-888888888888';
const ASSIGNMENT_ID = 'c9999999-9999-4999-8999-999999999999';

let prisma: PrismaService;
let repository: OfficerRepository;

async function cleanFixtures(): Promise<void> {
  if (!prisma) return;

  await prisma.notification.deleteMany({
    where: {
      userId: { in: [CITIZEN_USER_ID, OFFICER_USER_ID, UNASSIGNED_OFFICER_ID] },
    },
  });

  await prisma.officerAssignment.deleteMany({
    where: {
      officerUserId: { in: [OFFICER_USER_ID, UNASSIGNED_OFFICER_ID] },
    },
  });

  await prisma.statusEvent.deleteMany({
    where: {
      applicationId: APPLICATION_ID,
    },
  });

  await prisma.applicationRecord.deleteMany({
    where: {
      id: APPLICATION_ID,
    },
  });

  await prisma.guideVersion.deleteMany({
    where: { serviceId: SERVICE_ID },
  });

  await prisma.service.deleteMany({
    where: { id: SERVICE_ID },
  });

  await prisma.agency.deleteMany({
    where: { id: AGENCY_ID },
  });

  await prisma.region.deleteMany({
    where: { id: REGION_ID },
  });

  await prisma.user.deleteMany({
    where: {
      id: { in: [CITIZEN_USER_ID, OFFICER_USER_ID, UNASSIGNED_OFFICER_ID] },
    },
  });
}

async function seedFixtures(): Promise<void> {
  await prisma.user.createMany({
    data: [
      {
        id: CITIZEN_USER_ID,
        email: 'officer-test-citizen@example.com',
        displayName: 'Warga Binaan',
        authProvider: 'local',
        accountStatus: AccountStatus.ACTIVE,
      },
      {
        id: OFFICER_USER_ID,
        email: 'officer-test-officer@example.com',
        displayName: 'Petugas Loket',
        authProvider: 'local',
        accountStatus: AccountStatus.ACTIVE,
      },
      {
        id: UNASSIGNED_OFFICER_ID,
        email: 'officer-test-unassigned@example.com',
        displayName: 'Petugas Lain',
        authProvider: 'local',
        accountStatus: AccountStatus.ACTIVE,
      },
    ],
  });

  await prisma.region.create({
    data: {
      id: REGION_ID,
      code: 'REG-OFFICER-01',
      name: 'Kota Surabaya',
      regionType: 'KOTA',
    },
  });

  await prisma.agency.create({
    data: {
      id: AGENCY_ID,
      regionId: REGION_ID,
      name: 'Dinas Sosial Surabaya',
      agencyType: 'DINAS',
    },
  });

  await prisma.service.create({
    data: {
      id: SERVICE_ID,
      agencyId: AGENCY_ID,
      regionId: REGION_ID,
      slug: 'layanan-bantuan-sosial',
      name: 'Layanan Bantuan Sosial',
      category: 'Sosial',
      publicationStatus: ServicePublicationStatus.PUBLISHED,
    },
  });

  await prisma.guideVersion.create({
    data: {
      id: GUIDE_VERSION_ID,
      serviceId: SERVICE_ID,
      versionNumber: 1,
      status: GuideVersionStatus.PUBLISHED,
      procedureJson: [{ step: 1, title: 'Prosedur', description: 'Deskripsi' }],
    },
  });

  await prisma.applicationRecord.create({
    data: {
      id: APPLICATION_ID,
      userId: CITIZEN_USER_ID,
      serviceId: SERVICE_ID,
      agencyId: AGENCY_ID,
      internalReference: 'APP-2026-OFFTEST',
      officialReference: 'REG-OFF-001',
      submittedDate: new Date('2026-10-28T08:00:00Z'),
      submissionChannel: SubmissionChannel.ONLINE_PORTAL,
      sourceMode: StatusSourceType.CITIZEN_REPORT,
      statusSummary: ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
    },
  });

  await prisma.officerAssignment.create({
    data: {
      id: ASSIGNMENT_ID,
      applicationId: APPLICATION_ID,
      officerUserId: OFFICER_USER_ID,
      assignmentStatus: 'ACTIVE',
    },
  });
}

describe('OfficerRepository Integration', () => {
  jest.setTimeout(30_000);

  beforeAll(async () => {
    const config = new ConfigService({
      DATABASE_URL: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
    });
    prisma = new PrismaService(config);
    repository = new OfficerRepository(prisma);

    await cleanFixtures();
    await seedFixtures();
  });

  afterAll(async () => {
    await cleanFixtures();
    await prisma.$disconnect();
  });

  it('finds assignment and lists assignments for assigned officer', async () => {
    const assignment = await repository.findAssignment(
      APPLICATION_ID,
      OFFICER_USER_ID,
    );
    expect(assignment).not.toBeNull();
    expect(assignment?.id).toBe(ASSIGNMENT_ID);

    const unassigned = await repository.findAssignment(
      APPLICATION_ID,
      UNASSIGNED_OFFICER_ID,
    );
    expect(unassigned).toBeNull();

    const list = await repository.listAssignments({
      officerUserId: OFFICER_USER_ID,
      page: 1,
      pageSize: 10,
    });
    expect(list.items).toHaveLength(1);
    expect(list.total).toBe(1);
    expect(list.items[0].application.user.displayName).toBe('Warga Binaan');
  });

  it('retrieves application detail with full relations', async () => {
    const detail = await repository.findApplicationDetail(APPLICATION_ID);
    expect(detail).not.toBeNull();
    expect(detail?.service.name).toBe('Layanan Bantuan Sosial');
    expect(detail?.agency.name).toBe('Dinas Sosial Surabaya');
    expect(detail?.user.displayName).toBe('Warga Binaan');
  });

  it('creates an officer event, updates application status, and creates notification for citizen in a transaction', async () => {
    const event = await repository.createOfficerEvent({
      applicationId: APPLICATION_ID,
      actorUserId: OFFICER_USER_ID,
      statusCode: ApplicationStatus.VERIFICATION,
      sourceType: StatusSourceType.OFFICER,
      sourceLabel: 'Petugas yang ditugaskan',
      description: 'Berkas sedang diverifikasi petugas dinas',
      occurredAt: new Date('2026-10-29T08:00:00Z'),
      citizenUserId: CITIZEN_USER_ID,
      notification: {
        notificationType: 'application_status_updated',
        title: 'Status Pengajuan Diperbarui',
        body: 'Pengajuan bantuan sosial Anda sedang diverifikasi petugas.',
        targetPath: `/applications/${APPLICATION_ID}`,
      },
    });

    expect(event.id).toBeDefined();
    expect(event.statusCode).toBe(ApplicationStatus.VERIFICATION);
    expect(event.actor?.displayName).toBe('Petugas Loket');

    // Verify application statusSummary and sourceMode updated
    const updatedApp = await prisma.applicationRecord.findUnique({
      where: { id: APPLICATION_ID },
    });
    expect(updatedApp?.statusSummary).toBe(ApplicationStatus.VERIFICATION);
    expect(updatedApp?.sourceMode).toBe(StatusSourceType.OFFICER);

    // Verify in-app notification created for citizen
    const notifs = await prisma.notification.findMany({
      where: { userId: CITIZEN_USER_ID, applicationId: APPLICATION_ID },
    });
    expect(notifs).toHaveLength(1);
    expect(notifs[0].title).toBe('Status Pengajuan Diperbarui');
    expect(notifs[0].readAt).toBeNull();
  });
});
