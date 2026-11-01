import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { AccountStatus } from '../generated/prisma/client';
import { SessionAlreadyRotatedError } from './errors/session-already-rotated.error';
import { AuthService } from './auth.service';
import type {
  AuthRefreshSession,
  AuthUser,
  CreateRefreshSessionInput,
  RefreshSessionRecord,
  RotateRefreshSessionInput,
} from './interfaces/auth.repository.interface';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const bcryptMock = bcrypt as unknown as {
  hash: jest.Mock;
  compare: jest.Mock;
};

const ACCESS_TTL_SECONDS = 900;
const REFRESH_TTL_DAYS = 7;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'user-1',
    displayName: 'Budi',
    email: 'budi@example.com',
    phone: null,
    authProvider: 'local',
    passwordHash: 'hashed-password',
    accountStatus: AccountStatus.ACTIVE,
    emailVerifiedAt: null,
    lastLoginAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
    userRoles: [
      {
        id: 'user-role-1',
        userId: 'user-1',
        roleId: 'role-1',
        agencyId: null,
        regionId: null,
        assignedById: null,
        validFrom: null,
        validUntil: null,
        isActive: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        role: {
          id: 'role-1',
          roleCode: 'citizen',
          roleName: 'Citizen',
          description: null,
        },
      },
    ],
    ...overrides,
  };
}

function makeSession(
  overrides: Partial<RefreshSessionRecord> = {},
): RefreshSessionRecord {
  return {
    id: 'session-1',
    userId: 'user-1',
    tokenHash: 'a'.repeat(64),
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    replacedBySessionId: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    lastUsedAt: null,
    ...overrides,
  };
}

function makeRefreshSession(
  user: AuthUser,
  overrides: Partial<RefreshSessionRecord> = {},
): AuthRefreshSession {
  return {
    ...makeSession({ userId: user.id, ...overrides }),
    user,
  };
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

describe('AuthService', () => {
  let repository: {
    findUserByEmail: jest.Mock;
    findUserById: jest.Mock;
    createCitizenUser: jest.Mock;
    touchLastLogin: jest.Mock;
    createRefreshSession: jest.Mock;
    findRefreshSessionByTokenHash: jest.Mock;
    rotateRefreshSession: jest.Mock;
    revokeRefreshSession: jest.Mock;
    revokeRefreshSessionByTokenHash: jest.Mock;
    revokeAllUserSessions: jest.Mock;
  };
  let signAsync: jest.Mock;
  let configGet: jest.Mock;
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();

    repository = {
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
      createCitizenUser: jest.fn(),
      touchLastLogin: jest.fn(),
      createRefreshSession: jest.fn(),
      findRefreshSessionByTokenHash: jest.fn(),
      rotateRefreshSession: jest.fn(),
      revokeRefreshSession: jest.fn(),
      revokeRefreshSessionByTokenHash: jest.fn(),
      revokeAllUserSessions: jest.fn(),
    };

    signAsync = jest.fn().mockResolvedValue('access-token');
    configGet = jest.fn((key: string) => {
      const values: Record<string, string> = {
        JWT_ACCESS_TTL: '15m',
        REFRESH_TOKEN_TTL_DAYS: String(REFRESH_TTL_DAYS),
      };

      return values[key];
    });

    bcryptMock.hash.mockResolvedValue('hashed-password');
    bcryptMock.compare.mockResolvedValue(true);

    service = new AuthService(
      repository,
      { signAsync } as unknown as JwtService,
      { get: configGet } as unknown as ConfigService,
    );
  });

  describe('register', () => {
    it('normalizes email, hashes password, and creates a citizen user', async () => {
      const user = makeUser();
      repository.findUserByEmail.mockResolvedValue(null);
      repository.createCitizenUser.mockResolvedValue(user);

      const result = await service.register({
        displayName: 'Budi',
        email: '  BUDI@Example.com ',
        password: 'secret123',
      });

      expect(repository.findUserByEmail).toHaveBeenCalledWith(
        'budi@example.com',
      );
      expect(bcryptMock.hash).toHaveBeenCalledWith('secret123', 12);
      expect(repository.createCitizenUser).toHaveBeenCalledWith({
        displayName: 'Budi',
        email: 'budi@example.com',
        passwordHash: 'hashed-password',
      });
      expect(result.verificationRequired).toBe(false);
      expect(result.user).toEqual({
        id: 'user-1',
        display_name: 'Budi',
        email: 'budi@example.com',
        email_verified: false,
        roles: ['citizen'],
        status: 'active',
      });
    });

    it('rejects an email that is already registered', async () => {
      repository.findUserByEmail.mockResolvedValue(makeUser());

      await expect(
        service.register({
          displayName: 'Budi',
          email: 'budi@example.com',
          password: 'secret123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(repository.createCitizenUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('creates a session and returns access and refresh tokens', async () => {
      const user = makeUser();
      repository.findUserByEmail.mockResolvedValue(user);
      repository.createRefreshSession.mockResolvedValue(
        makeSession({ userId: user.id }),
      );

      const result = await service.login({
        email: ' BUDI@Example.com ',
        password: 'secret123',
      });

      expect(repository.findUserByEmail).toHaveBeenCalledWith(
        'budi@example.com',
      );
      expect(bcryptMock.compare).toHaveBeenCalledWith(
        'secret123',
        'hashed-password',
      );
      expect(repository.touchLastLogin).toHaveBeenCalledWith(user.id);
      expect(repository.createRefreshSession).toHaveBeenCalledTimes(1);

      const [createSessionInput] = repository.createRefreshSession.mock
        .calls[0] as [CreateRefreshSessionInput];

      expect(createSessionInput.userId).toBe(user.id);
      expect(createSessionInput.tokenHash).toMatch(/^[a-f0-9]{64}$/);
      expect(createSessionInput.expiresAt).toBeInstanceOf(Date);
      expect(signAsync).toHaveBeenCalledWith(
        {
          sub: user.id,
          role: 'citizen',
          session_id: 'session-1',
        },
        { expiresIn: ACCESS_TTL_SECONDS },
      );
      expect(result.tokens.accessToken).toBe('access-token');
      expect(result.tokens.refreshToken).toEqual(expect.any(String));
      expect(result.tokens.accessTokenMaxAgeMs).toBe(ACCESS_TTL_SECONDS * 1000);
      expect(result.tokens.refreshTokenMaxAgeMs).toBe(
        REFRESH_TTL_DAYS * DAY_IN_MS,
      );
    });

    it('rejects an unknown email with invalid credentials', async () => {
      repository.findUserByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'missing@example.com',
          password: 'secret123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(repository.createRefreshSession).not.toHaveBeenCalled();
    });

    it('rejects a wrong password with invalid credentials', async () => {
      repository.findUserByEmail.mockResolvedValue(makeUser());
      bcryptMock.compare.mockResolvedValue(false);

      await expect(
        service.login({
          email: 'budi@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(repository.touchLastLogin).not.toHaveBeenCalled();
      expect(repository.createRefreshSession).not.toHaveBeenCalled();
    });

    it('rejects an inactive account', async () => {
      repository.findUserByEmail.mockResolvedValue(
        makeUser({ accountStatus: AccountStatus.SUSPENDED }),
      );

      await expect(
        service.login({
          email: 'budi@example.com',
          password: 'secret123',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(bcryptMock.compare).not.toHaveBeenCalled();
      expect(repository.createRefreshSession).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('rotates a valid refresh session and signs a new access token', async () => {
      const user = makeUser();
      const currentSession = makeRefreshSession(user);
      const nextSession = makeSession({ id: 'session-2', userId: user.id });
      repository.findRefreshSessionByTokenHash.mockResolvedValue(
        currentSession,
      );
      repository.rotateRefreshSession.mockResolvedValue(nextSession);

      const result = await service.refresh('refresh-token');

      expect(repository.findRefreshSessionByTokenHash).toHaveBeenCalledWith(
        hashToken('refresh-token'),
      );
      expect(repository.rotateRefreshSession).toHaveBeenCalledTimes(1);

      const [rotateInput] = repository.rotateRefreshSession.mock.calls[0] as [
        RotateRefreshSessionInput,
      ];

      expect(rotateInput.currentSessionId).toBe(currentSession.id);
      expect(rotateInput.userId).toBe(user.id);
      expect(rotateInput.tokenHash).toMatch(/^[a-f0-9]{64}$/);
      expect(rotateInput.expiresAt).toBeInstanceOf(Date);
      expect(signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ session_id: 'session-2' }),
        { expiresIn: ACCESS_TTL_SECONDS },
      );
      expect(result.tokens.refreshToken).toEqual(expect.any(String));
    });

    it('rejects a missing refresh token', async () => {
      await expect(service.refresh()).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(repository.findRefreshSessionByTokenHash).not.toHaveBeenCalled();
    });

    it('rejects an unknown refresh token', async () => {
      repository.findRefreshSessionByTokenHash.mockResolvedValue(null);

      await expect(service.refresh('unknown-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(repository.rotateRefreshSession).not.toHaveBeenCalled();
    });

    it('revokes all sessions when a revoked token is reused', async () => {
      const user = makeUser();
      repository.findRefreshSessionByTokenHash.mockResolvedValue(
        makeRefreshSession(user, { revokedAt: new Date() }),
      );

      await expect(service.refresh('reused-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(repository.revokeAllUserSessions).toHaveBeenCalledWith(user.id);
      expect(repository.rotateRefreshSession).not.toHaveBeenCalled();
    });

    it('revokes an expired session and rejects it', async () => {
      const user = makeUser();
      repository.findRefreshSessionByTokenHash.mockResolvedValue(
        makeRefreshSession(user, {
          expiresAt: new Date(Date.now() - 1_000),
        }),
      );

      await expect(service.refresh('expired-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(repository.revokeRefreshSession).toHaveBeenCalledWith('session-1');
      expect(repository.rotateRefreshSession).not.toHaveBeenCalled();
    });

    it('revokes all sessions when rotation detects a race', async () => {
      const user = makeUser();
      repository.findRefreshSessionByTokenHash.mockResolvedValue(
        makeRefreshSession(user),
      );
      repository.rotateRefreshSession.mockRejectedValue(
        new SessionAlreadyRotatedError(),
      );

      await expect(service.refresh('racing-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(repository.revokeAllUserSessions).toHaveBeenCalledWith(user.id);
    });
  });

  describe('logout', () => {
    it('revokes the refresh session matching the token hash', async () => {
      await service.logout('refresh-token');

      expect(repository.revokeRefreshSessionByTokenHash).toHaveBeenCalledWith(
        hashToken('refresh-token'),
      );
    });

    it('does nothing when there is no refresh token', async () => {
      await service.logout();

      expect(repository.revokeRefreshSessionByTokenHash).not.toHaveBeenCalled();
    });
  });

  describe('me', () => {
    it('returns the authenticated user view', async () => {
      repository.findUserById.mockResolvedValue(makeUser());

      const result = await service.me('user-1');

      expect(repository.findUserById).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({
        id: 'user-1',
        display_name: 'Budi',
        email: 'budi@example.com',
        email_verified: false,
        roles: ['citizen'],
        status: 'active',
      });
    });

    it('rejects an unknown user', async () => {
      repository.findUserById.mockResolvedValue(null);

      await expect(service.me('missing-user')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects a deleted account', async () => {
      repository.findUserById.mockResolvedValue(
        makeUser({ deletedAt: new Date() }),
      );

      await expect(service.me('deleted-user')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });
});
