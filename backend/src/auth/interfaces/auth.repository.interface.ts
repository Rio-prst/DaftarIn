import type {
  AccountToken,
  AccountTokenType,
  Prisma,
} from '../../generated/prisma/client';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export type AuthUser = Prisma.UserGetPayload<{
  include: {
    userRoles: {
      include: {
        role: true;
      };
    };
  };
}>;

export type RefreshSessionRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedBySessionId: string | null;
  createdAt: Date;
  lastUsedAt: Date | null;
};

export type AuthRefreshSession = RefreshSessionRecord & {
  user: AuthUser;
};

export type CreateAuthUserInput = {
  displayName: string;
  email: string;
  passwordHash: string;
  identity?: {
    phone: string;
    nik: string;
    familyCardNumber: string;
    privacyNoticeVersion: string;
    photoStorageKey: string;
  };
};

export type CreateRefreshSessionInput = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export type RotateRefreshSessionInput = {
  currentSessionId: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export type CreateAccountTokenInput = {
  userId: string;
  tokenHash: string;
  type: AccountTokenType;
  expiresAt: Date;
};

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<AuthUser | null>;
  findUserById(id: string): Promise<AuthUser | null>;
  createCitizenUser(input: CreateAuthUserInput): Promise<AuthUser>;
  touchLastLogin(userId: string): Promise<void>;
  createRefreshSession(
    input: CreateRefreshSessionInput,
  ): Promise<RefreshSessionRecord>;
  findRefreshSessionByTokenHash(
    tokenHash: string,
  ): Promise<AuthRefreshSession | null>;
  rotateRefreshSession(
    input: RotateRefreshSessionInput,
  ): Promise<RefreshSessionRecord>;
  revokeRefreshSession(sessionId: string): Promise<void>;
  revokeRefreshSessionByTokenHash(tokenHash: string): Promise<void>;
  revokeAllUserSessions(userId: string): Promise<void>;
  createAccountToken(input: CreateAccountTokenInput): Promise<AccountToken>;
  findAccountToken(
    tokenHash: string,
    type: AccountTokenType,
  ): Promise<(AccountToken & { user: AuthUser }) | null>;
  markAccountTokenUsed(tokenId: string): Promise<void>;
  updateUserPassword(userId: string, passwordHash: string): Promise<void>;
  verifyUserEmail(userId: string): Promise<void>;
}
