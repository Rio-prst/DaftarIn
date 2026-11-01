import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import {
  AccountStatus,
  ApplicationStatus,
  GuideVersionStatus,
  PreparationStatus,
  ServicePublicationStatus,
  StatusSourceType,
  SubmissionChannel,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationsRepository } from './applications.repository';

const USER_ID = 'f1111111-1111-4111-8111-111111111111';
const OTHER_USER_ID = 'f1111111-1111-4111-8111-111111111112';
const REGION_ID = 'f2222222-2222-4222-8222-222222222222';
const AGENCY_ID = 'f3333333-3333-4333-8333-333333333333';
const SERVICE_ID = 'f4444444-4444-4444-8444-444444444444';
const GUIDE_VERSION_ID = 'f5555555-5555-4555-8555-555555555555';
const PREPARATION_ID = 'f6666666-6666-4666-8666-666666666666';

let prisma: PrismaService;
let repository: ApplicationsRepository;

async function cleanFixtures(): Promise<void> {
  if (!prisma) return;

  await prisma.statusEvent.deleteMany({
    where: {
      application: {
        userId: { in: [USER_ID, OTHER_USER_ID] },
      },
    },
  });

  await prisma.applicationRecord.deleteMany({
    where: {
      userId: { in: [USER_ID, OTHER_USER_ID] },
    },
  });

  await prisma.preparation.deleteMany({
    where: {
      userId: { in: [USER_ID, OTHER_USER_ID] },
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
    where: { id: { in: [USER_ID, OTHER_USER_ID] } },
  });
}

async function seedFixtures(): Promise<void> {
  await prisma.user.createMany({
    data: [
      {
        id: USER_ID,
        email: 'app-user@example.com',
        displayName: 'Warga App Test',
        authProvider: 'local',
        accountStatus: AccountStatus.ACTIVE,
      },
      {
        id: OTHER_USER_ID,
        email: 'app-other@example.com',
        displayName: 'Other User Test',
        authProvider: 'local',
        accountStatus: AccountStatus.ACTIVE,
      },
    ],
  });

  await prisma.region.create({
    data: {
      id: REGION_ID,
      code: 'REG-APP-01',
      name: 'Kota Bandung',
      regionType: 'KOTA',
    },
  });

  await prisma.agency.create({
    data: {
      id: AGENCY_ID,
      regionId: REGION_ID,
      name: 'Dinas Kependudukan Bandung',
      agencyType: 'DINAS',
    },
  });

  await prisma.service.create({
    data: {
      id: SERVICE_ID,
      agencyId: AGENCY_ID,
      regionId: REGION_ID,
      slug: 'layanan-app-test',
      name: 'Layanan Pengajuan Test',
      category: 'Kependudukan',
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

  await prisma.preparation.create({
    data: {
      id: PREPARATION_ID,
      userId: USER_ID,
      serviceId: SERVICE_ID,
      guideVersionId: GUIDE_VERSION_ID,
      internalReference: 'PREP-2026-TESTAPP',
      status: PreparationStatus.DRAFT,
    },
  });
}

describe('ApplicationsRepository Integration', () => {
  jest.setTimeout(30_000);

  beforeAll(async () => {
    const config = new ConfigService({
      DATABASE_URL: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
    });
    prisma = new PrismaService(config);
    repository = new ApplicationsRepository(prisma);

    await cleanFixtures();
    await seedFixtures();
  });

  afterAll(async () => {
    await cleanFixtures();
    await prisma.$disconnect();
  });

  it('creates an application record with initial status event in a transaction', async () => {
    const record = await repository.create({
      userId: USER_ID,
      serviceId: SERVICE_ID,
      agencyId: AGENCY_ID,
      internalReference: 'APP-2026-INTEG01',
      officialReference: 'REG-INT-001',
      submittedDate: new Date('2026-10-28T08:00:00Z'),
      submissionChannel: SubmissionChannel.ONLINE_PORTAL,
      sourceMode: StatusSourceType.CITIZEN_REPORT,
      statusSummary: ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
      citizenNotes: 'Catatan pengajuan',
      initialEvent: {
        statusCode: ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
        sourceType: StatusSourceType.CITIZEN_REPORT,
        sourceLabel: 'Dicatat warga — belum terkonfirmasi instansi',
        description: 'Catatan pengajuan',
        occurredAt: new Date('2026-10-28T08:00:00Z'),
      },
    });

    expect(record.id).toBeDefined();
    expect(record.internalReference).toBe('APP-2026-INTEG01');
    expect(record.officialReference).toBe('REG-INT-001');
    expect(record.service.name).toBe('Layanan Pengajuan Test');
    expect(record.agency.name).toBe('Dinas Kependudukan Bandung');
    expect(record.statusEvents).toHaveLength(1);
    expect(record.statusEvents[0].statusCode).toBe(
      ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED,
    );
  });

  it('finds an application by id and checks user isolation', async () => {
    const found = await repository.findById(
      (
        await prisma.applicationRecord.findFirstOrThrow({
          where: { userId: USER_ID },
        })
      ).id,
      USER_ID,
    );
    expect(found).not.toBeNull();
    expect(found?.userId).toBe(USER_ID);

    // Other user cannot find it
    const otherFound = await repository.findById(found!.id, OTHER_USER_ID);
    expect(otherFound).toBeNull();
  });

  it('lists applications with pagination and filters', async () => {
    const result = await repository.list({
      userId: USER_ID,
      page: 1,
      pageSize: 10,
      sort: 'updated_at',
      order: 'desc',
    });

    expect(result.items.length).toBeGreaterThanOrEqual(1);
    expect(result.total).toBeGreaterThanOrEqual(1);
  });

  it('adds status events and lists them ordered chronologically', async () => {
    const app = await prisma.applicationRecord.findFirstOrThrow({
      where: { userId: USER_ID },
    });

    const event = await repository.addStatusEvent({
      applicationId: app.id,
      actorUserId: USER_ID,
      statusCode: ApplicationStatus.PROCESSING,
      sourceType: StatusSourceType.CITIZEN_REPORT,
      sourceLabel: 'Catatan warga',
      description: 'Menunggu konfirmasi pengambilan',
      occurredAt: new Date('2026-10-29T10:00:00Z'),
    });

    expect(event.id).toBeDefined();
    expect(event.statusCode).toBe(ApplicationStatus.PROCESSING);

    const timeline = await repository.listStatusEvents(app.id);
    expect(timeline.length).toBeGreaterThanOrEqual(2);
    // Chronological order: first event occurred on 28th, second on 29th
    expect(timeline[0].occurredAt.getTime()).toBeLessThanOrEqual(
      timeline[1].occurredAt.getTime(),
    );
  });

  it('updates application status and links preparation', async () => {
    const app = await prisma.applicationRecord.findFirstOrThrow({
      where: { userId: USER_ID },
    });

    const updatedStatus = await repository.updateStatus(
      app.id,
      ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN,
    );
    expect(updatedStatus.statusSummary).toBe(
      ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN,
    );

    const updatedLink = await repository.linkPreparation(
      app.id,
      PREPARATION_ID,
    );
    expect(updatedLink.preparationId).toBe(PREPARATION_ID);
    expect(updatedLink.preparation?.internalReference).toBe(
      'PREP-2026-TESTAPP',
    );
  });

  it('finds service and preparation by id', async () => {
    const service = await repository.findServiceById(SERVICE_ID);
    expect(service).not.toBeNull();
    expect(service?.agencyId).toBe(AGENCY_ID);

    const prep = await repository.findPreparationById(PREPARATION_ID, USER_ID);
    expect(prep).not.toBeNull();
    expect(prep?.serviceId).toBe(SERVICE_ID);
  });
});
