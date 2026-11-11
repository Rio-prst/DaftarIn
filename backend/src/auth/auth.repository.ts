import { Injectable } from '@nestjs/common';
import {
  AccountStatus,
  type AccountToken,
  type AccountTokenType,
  type Prisma,
} from '../generated/prisma/client';
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
  CreateAccountTokenInput,
} from './interfaces/auth.repository.interface';

const ACTIVE_ROLES_INCLUDE = {
  userRoles: {
    where: { isActive: true },
    include: { role: true },
  },
} as const satisfies Prisma.UserInclude;

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<AuthUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: ACTIVE_ROLES_INCLUDE,
    });
  }

  async findUserById(id: string): Promise<AuthUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: ACTIVE_ROLES_INCLUDE,
    });
  }

  async createCitizenUser(input: CreateAuthUserInput): Promise<AuthUser> {
    const identity = input.identity;
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
          ...(identity && {
            phone: identity.phone,
            identity: {
              create: {
                nik: identity.nik,
                familyCardNumber: identity.familyCardNumber,
                privacyNoticeVersion: identity.privacyNoticeVersion,
                photoStorageKey: identity.photoStorageKey,
              },
            },
          }),
          userRoles: {
            create: {
              roleId: citizenRole.id,
            },
          },
        },
        include: ACTIVE_ROLES_INCLUDE,
      });
    });
  }

  async touchLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
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
          include: ACTIVE_ROLES_INCLUDE,
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

  async createAccountToken(
    input: CreateAccountTokenInput,
  ): Promise<AccountToken> {
    return this.prisma.accountToken.create({
      data: input,
    });
  }

  async findAccountToken(
    tokenHash: string,
    type: AccountTokenType,
  ): Promise<(AccountToken & { user: AuthUser }) | null> {
    return this.prisma.accountToken.findFirst({
      where: {
        tokenHash,
        type,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          include: ACTIVE_ROLES_INCLUDE,
        },
      },
    });
  }

  async markAccountTokenUsed(tokenId: string): Promise<void> {
    await this.prisma.accountToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });
  }

  async updateUserPassword(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async verifyUserEmail(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: AccountStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
    });
  }
}
