import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { AccountStatus, GuideVersionStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminRepository } from './admin.repository';

const ADMIN_USER_ID = 'a1111111-1111-4111-8111-111111111111';
const CANDIDATE_OFFICER_ID = 'a2222222-2222-4222-8222-222222222222';
const REGION_ID = 'a3333333-3333-4333-8333-333333333333';
const AGENCY_ID = 'a4444444-4444-4444-8444-444444444444';
const SERVICE_ID = 'a5555555-5555-4555-8555-555555555555';
const ROLE_OFFICER_ID = 'a6666666-6666-4666-8666-666666666666';

let prisma: PrismaService;
let repository: AdminRepository;

async function cleanFixtures(): Promise<void> {
  if (!prisma) return;

  await prisma.auditEvent.deleteMany({
    where: {
      actorUserId: ADMIN_USER_ID,
    },
  });

  await prisma.userRole.deleteMany({
    where: {
      userId: { in: [ADMIN_USER_ID, CANDIDATE_OFFICER_ID] },
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
      id: { in: [ADMIN_USER_ID, CANDIDATE_OFFICER_ID] },
    },
  });

  await prisma.role.deleteMany({
    where: { id: ROLE_OFFICER_ID },
  });
}

async function seedFixtures(): Promise<void> {
  await prisma.user.createMany({
    data: [
      {
        id: ADMIN_USER_ID,
        email: 'admin-integ@example.com',
        displayName: 'Administrator Integ',
        authProvider: 'local',
        accountStatus: AccountStatus.ACTIVE,
      },
      {
        id: CANDIDATE_OFFICER_ID,
        email: 'officer-cand@example.com',
        displayName: 'Calon Petugas',
        authProvider: 'local',
        accountStatus: AccountStatus.ACTIVE,
      },
    ],
  });

  // Ensure 'officer' role exists
  const existingRole = await prisma.role.findUnique({
    where: { roleCode: 'officer' },
  });
  if (!existingRole) {
    await prisma.role.create({
      data: {
        id: ROLE_OFFICER_ID,
        roleCode: 'officer',
        roleName: 'Petugas Instansi',
        description: 'Petugas verifikator berkas',
      },
    });
  }

  await prisma.region.create({
    data: {
      id: REGION_ID,
      code: 'REG-ADMIN-01',
      name: 'Kota Semarang',
      regionType: 'KOTA',
    },
  });

  await prisma.agency.create({
    data: {
      id: AGENCY_ID,
      regionId: REGION_ID,
      name: 'Dinas Penanaman Modal',
      agencyType: 'DINAS',
    },
  });
}

describe('AdminRepository Integration', () => {
  jest.setTimeout(30_000);

  beforeAll(async () => {
    const config = new ConfigService({
      DATABASE_URL: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
    });
    prisma = new PrismaService(config);
    repository = new AdminRepository(prisma);

    await cleanFixtures();
    await seedFixtures();
  });

  afterAll(async () => {
    await cleanFixtures();
    await prisma.$disconnect();
  });

  it('creates and lists services with pagination and search', async () => {
    const service = await repository.createService({
      name: 'Izin Usaha Mikro Kecil',
      slug: 'izin-usaha-mikro-kecil',
      category: 'Perizinan',
      agencyId: AGENCY_ID,
      regionId: REGION_ID,
      summary: 'Layanan izin usaha bagi UMK',
    });

    expect(service.id).toBeDefined();
    expect(service.slug).toBe('izin-usaha-mikro-kecil');
    expect(service.agency.name).toBe('Dinas Penanaman Modal');

    // Update ID to match fixture tracking
    await prisma.service.update({
      where: { id: service.id },
      data: { id: SERVICE_ID },
    });

    const list = await repository.listServices({
      q: 'Mikro',
      page: 1,
      pageSize: 10,
    });

    expect(list.items.length).toBeGreaterThanOrEqual(1);
    expect(list.total).toBeGreaterThanOrEqual(1);
  });

  it('creates a guide version with auto-increment and publishes it in a transaction', async () => {
    const latestNum = await repository.findLatestGuideVersionNumber(SERVICE_ID);
    expect(latestNum).toBe(0);

    const guideV1 = await repository.createGuideVersion({
      serviceId: SERVICE_ID,
      versionNumber: 1,
      procedureJson: [
        { step: 1, title: 'Daftar online', description: 'Isi formulir' },
      ],
      createdById: ADMIN_USER_ID,
    });
    expect(guideV1.versionNumber).toBe(1);
    expect(guideV1.status).toBe(GuideVersionStatus.DRAFT);

    // Publish v1
    const publishedV1 = await repository.publishGuideVersion(
      guideV1.id,
      SERVICE_ID,
      new Date(),
    );
    expect(publishedV1.status).toBe(GuideVersionStatus.PUBLISHED);

    // Create v2
    const guideV2 = await repository.createGuideVersion({
      serviceId: SERVICE_ID,
      versionNumber: 2,
      procedureJson: [
        { step: 1, title: 'Daftar OSS', description: 'Gunakan portal OSS' },
      ],
      createdById: ADMIN_USER_ID,
    });

    // Publish v2 -> v1 must be archived
    const publishedV2 = await repository.publishGuideVersion(
      guideV2.id,
      SERVICE_ID,
      new Date(),
    );
    expect(publishedV2.status).toBe(GuideVersionStatus.PUBLISHED);

    // Check v1 is archived
    const checkV1 = await repository.findGuideVersionById(guideV1.id);
    expect(checkV1?.status).toBe(GuideVersionStatus.ARCHIVED);
  });

  it('updates user role assignments and lists active officers', async () => {
    const updated = await repository.updateUserRoleAssignments(
      CANDIDATE_OFFICER_ID,
      [
        {
          roleCode: 'officer',
          agencyId: AGENCY_ID,
          regionId: REGION_ID,
          isActive: true,
        },
      ],
      ADMIN_USER_ID,
    );

    expect(updated.length).toBeGreaterThanOrEqual(1);

    const officersList = await repository.listOfficers({
      page: 1,
      pageSize: 10,
    });

    const candidateFound = officersList.items.find(
      (o) => o.id === CANDIDATE_OFFICER_ID,
    );
    expect(candidateFound).toBeDefined();
    expect(candidateFound?.displayName).toBe('Calon Petugas');
  });

  it('records audit events and lists them', async () => {
    const audit = await repository.recordAuditEvent({
      actorUserId: ADMIN_USER_ID,
      actorRole: 'admin',
      action: 'publish_guide_version',
      objectType: 'guide_version',
      objectId: 'test-gv-id',
      outcome: 'SUCCESS',
      metadataJson: { change: 'Test audit' },
    });

    expect(audit.id).toBeDefined();
    expect(audit.action).toBe('publish_guide_version');

    const list = await repository.listAuditEvents({
      actorId: ADMIN_USER_ID,
      page: 1,
      pageSize: 10,
    });

    expect(list.items.length).toBeGreaterThanOrEqual(1);
    expect(list.total).toBeGreaterThanOrEqual(1);
  });
});
