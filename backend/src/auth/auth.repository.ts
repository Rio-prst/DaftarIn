import { Injectable } from '@nestjs/common';
import { AccountStatus, type Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SessionAlreadyRotatedError } from './errors/session-already-rotated.error';
import type {
  AuthRefreshSession,
  AuthUser,
  CreateAuthUserInput,
  CreateRefreshSessionInput,
  IAuthRepository,
  RefreshSessionRecord,
  RotateRefreshSessionInput,
} from './interfaces/auth.repository.interface';

const activeRolesInclude = () =>
  ({
    userRoles: {
      where: {
        isActive: true,
        AND: [
          { OR: [{ validFrom: null }, { validFrom: { lte: new Date() } }] },
          { OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }] },
        ],
      },
      include: { role: true },
    },
  }) as const satisfies Prisma.UserInclude;

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<AuthUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: activeRolesInclude(),
    });
  }

  async findUserById(id: string): Promise<AuthUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: activeRolesInclude(),
    });
  }

  async createCitizenUser(input: CreateAuthUserInput): Promise<AuthUser> {
    return this.prisma.$transaction(async (transaction) => {
      const citizenRole = await transaction.role.upsert({
        where: { roleCode: 'citizen' },
        update: {},
        create: {
          roleCode: 'citizen',
          roleName: 'Citizen',
        },
      });

      return transaction.user.create({
        data: {
          displayName: input.displayName,
          email: input.email,
          authProvider: 'local',
          passwordHash: input.passwordHash,
          accountStatus: AccountStatus.ACTIVE,
          consentRecords: {
            create: {
              purposeCode: 'account_registration',
              noticeVersion: '2026-11-01',
              isAccepted: true,
              consentedAt: new Date(),
              metadataJson: {},
            },
          },
          userRoles: {
            create: {
              roleId: citizenRole.id,
            },
          },
        },
        include: activeRolesInclude(),
      });
    });
  }

  async touchLastLogin(userId: string): Promise<void> {
    // Login metadata must not invalidate a profile/access edit in another session.
    await this.prisma.$executeRaw`
      UPDATE "users" SET "lastLoginAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${userId}::uuid
    `;
  }

  async createRefreshSession(
    input: CreateRefreshSessionInput,
  ): Promise<RefreshSessionRecord> {
    return this.prisma.refreshSession.create({
      data: input,
    });
  }

  async findRefreshSessionByTokenHash(
    tokenHash: string,
  ): Promise<AuthRefreshSession | null> {
    return this.prisma.refreshSession.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: activeRolesInclude(),
        },
      },
    });
  }

  async rotateRefreshSession(
    input: RotateRefreshSessionInput,
  ): Promise<RefreshSessionRecord> {
    return this.prisma.$transaction(async (transaction) => {
      const now = new Date();
      const revoked = await transaction.refreshSession.updateMany({
        where: {
          id: input.currentSessionId,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: { revokedAt: now },
      });

      if (revoked.count !== 1) {
        throw new SessionAlreadyRotatedError();
      }

      const newSession = await transaction.refreshSession.create({
        data: {
          userId: input.userId,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
        },
      });

      await transaction.refreshSession.update({
        where: { id: input.currentSessionId },
        data: { replacedBySessionId: newSession.id },
      });

      return newSession;
    });
  }

  async revokeRefreshSession(sessionId: string): Promise<void> {
    await this.prisma.refreshSession.updateMany({
      where: {
        id: sessionId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async revokeRefreshSessionByTokenHash(tokenHash: string): Promise<void> {
    await this.prisma.refreshSession.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.prisma.refreshSession.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }
}
