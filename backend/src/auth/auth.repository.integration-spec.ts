import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { AccountStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthRepository } from './auth.repository';
import { SessionAlreadyRotatedError } from './errors/session-already-rotated.error';
import type {
  AuthUser,
  RefreshSessionRecord,
} from './interfaces/auth.repository.interface';

const TEST_EMAIL_PREFIX = 'auth-repository-integration-';
const DAY_IN_MS = 24 * 60 * 60 * 1000;

let sequence = 0;
let prisma: PrismaService;
let repository: AuthRepository;

function createTestEmail(label: string): string {
  sequence += 1;

  return `${TEST_EMAIL_PREFIX}${label}-${Date.now()}-${sequence}@example.com`;
}

function createTokenHash(label: string): string {
  sequence += 1;

  return createHash('sha256')
    .update(`${label}-${Date.now()}-${sequence}`)
    .digest('hex');
}

async function createUser(label: string): Promise<AuthUser> {
  return repository.createCitizenUser({
    displayName: 'Integration User',
    email: createTestEmail(label),
    passwordHash: 'password-hash',
  });
}

async function createSession(
  user: AuthUser,
  label: string,
): Promise<RefreshSessionRecord> {
  return repository.createRefreshSession({
    userId: user.id,
    tokenHash: createTokenHash(label),
    expiresAt: new Date(Date.now() + DAY_IN_MS),
  });
}

async function cleanTestUsers(): Promise<void> {
  if (!prisma) {
    return;
  }

  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: TEST_EMAIL_PREFIX,
      },
    },
  });
}

describe('AuthRepository integration', () => {
  beforeAll(async () => {
    const databaseUrl = process.env.DATABASE_URL_TEST;

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL_TEST wajib diisi untuk integration test repository.',
      );
    }

    const configService = {
      get: () => 1,
      getOrThrow: (key: string) => {
        if (key !== 'DATABASE_URL') {
          throw new Error(`Config ${key} tidak tersedia untuk test.`);
        }

        return databaseUrl;
      },
    } as unknown as ConfigService;

    prisma = new PrismaService(configService);
    await prisma.$connect();
    repository = new AuthRepository(prisma);
  });

  beforeEach(async () => {
    await cleanTestUsers();
  });

  afterAll(async () => {
    await cleanTestUsers();

    if (prisma) {
      await prisma.$disconnect();
    }
  });

  it('creates a citizen user and finds it by email', async () => {
    const user = await createUser('create');
    const found = await repository.findUserByEmail(user.email);

    expect(user.accountStatus).toBe(AccountStatus.ACTIVE);
    expect(user.userRoles).toHaveLength(1);
    expect(user.userRoles[0].role.roleCode).toBe('citizen');
    expect(found).toMatchObject({
      id: user.id,
      email: user.email,
      displayName: 'Integration User',
      passwordHash: 'password-hash',
      accountStatus: AccountStatus.ACTIVE,
    });
    expect(found?.userRoles[0]?.role.roleCode).toBe('citizen');
  });

  it('returns null when a user email does not exist', async () => {
    const found = await repository.findUserByEmail(createTestEmail('missing'));

    expect(found).toBeNull();
  });

  it('only includes active roles when finding a user', async () => {
    const user = await createUser('roles');
    await prisma.userRole.updateMany({
      where: { userId: user.id },
      data: { isActive: false },
    });

    const found = await repository.findUserByEmail(user.email);

    expect(found?.userRoles).toHaveLength(0);
  });

  it('updates the last login timestamp', async () => {
    const user = await createUser('login');

    expect(user.lastLoginAt).toBeNull();

    await repository.touchLastLogin(user.id);

    const found = await repository.findUserById(user.id);
    expect(found?.lastLoginAt).toBeInstanceOf(Date);
  });

  it('creates a refresh session and finds it by token hash', async () => {
    const user = await createUser('session');
    const session = await createSession(user, 'session');

    const found = await repository.findRefreshSessionByTokenHash(
      session.tokenHash,
    );

    expect(found).toMatchObject({
      id: session.id,
      userId: user.id,
      tokenHash: session.tokenHash,
      revokedAt: null,
      replacedBySessionId: null,
    });
    expect(found?.user.id).toBe(user.id);
    expect(found?.user.userRoles[0]?.role.roleCode).toBe('citizen');
  });

  it('rotates a refresh session inside a transaction', async () => {
    const user = await createUser('rotate');
    const oldSession = await createSession(user, 'rotate-old');
    const nextTokenHash = createTokenHash('rotate-new');

    const nextSession = await repository.rotateRefreshSession({
      currentSessionId: oldSession.id,
      userId: user.id,
      tokenHash: nextTokenHash,
      expiresAt: new Date(Date.now() + 2 * DAY_IN_MS),
    });

    const oldRecord = await prisma.refreshSession.findUnique({
      where: { id: oldSession.id },
    });
    const nextRecord =
      await repository.findRefreshSessionByTokenHash(nextTokenHash);

    expect(nextSession.id).not.toBe(oldSession.id);
    expect(oldRecord?.revokedAt).toBeInstanceOf(Date);
    expect(oldRecord?.replacedBySessionId).toBe(nextSession.id);
    expect(nextRecord?.id).toBe(nextSession.id);
  });

  it('rejects a second rotation of the same refresh session', async () => {
    const user = await createUser('race');
    const oldSession = await createSession(user, 'race-old');
    const firstTokenHash = createTokenHash('race-first');
    const secondTokenHash = createTokenHash('race-second');

    await repository.rotateRefreshSession({
      currentSessionId: oldSession.id,
      userId: user.id,
      tokenHash: firstTokenHash,
      expiresAt: new Date(Date.now() + DAY_IN_MS),
    });

    await expect(
      repository.rotateRefreshSession({
        currentSessionId: oldSession.id,
        userId: user.id,
        tokenHash: secondTokenHash,
        expiresAt: new Date(Date.now() + DAY_IN_MS),
      }),
    ).rejects.toBeInstanceOf(SessionAlreadyRotatedError);

    const secondRecord =
      await repository.findRefreshSessionByTokenHash(secondTokenHash);
    expect(secondRecord).toBeNull();
  });

  it('revokes a refresh session by id', async () => {
    const user = await createUser('revoke-id');
    const session = await createSession(user, 'revoke-id');

    await repository.revokeRefreshSession(session.id);

    const record = await prisma.refreshSession.findUnique({
      where: { id: session.id },
    });
    expect(record?.revokedAt).toBeInstanceOf(Date);
  });

  it('revokes a refresh session by token hash', async () => {
    const user = await createUser('revoke-hash');
    const session = await createSession(user, 'revoke-hash');

    await repository.revokeRefreshSessionByTokenHash(session.tokenHash);

    const record = await repository.findRefreshSessionByTokenHash(
      session.tokenHash,
    );
    expect(record?.revokedAt).toBeInstanceOf(Date);
  });

  it('revokes every active refresh session for one user', async () => {
    const user = await createUser('revoke-all');
    const otherUser = await createUser('revoke-all-other');
    await createSession(user, 'revoke-all-1');
    await createSession(user, 'revoke-all-2');
    const otherSession = await createSession(otherUser, 'revoke-all-other');

    await repository.revokeAllUserSessions(user.id);

    const ownSessions = await prisma.refreshSession.findMany({
      where: { userId: user.id },
    });
    const otherRecord = await prisma.refreshSession.findUnique({
      where: { id: otherSession.id },
    });

    expect(ownSessions).toHaveLength(2);
    expect(ownSessions.every((session) => session.revokedAt !== null)).toBe(
      true,
    );
    expect(otherRecord?.revokedAt).toBeNull();
  });
});
