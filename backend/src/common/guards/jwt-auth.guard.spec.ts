import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus } from '../../generated/prisma/client';
import type { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';

type RequestWithUser = {
  cookies?: {
    access_token?: string;
  };
  user?: {
    id: string;
    role: string;
    sessionId?: string;
  };
};

const handler = () => undefined;

class TestController {}

function makeContext(request: RequestWithUser): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => TestController,
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let verifyAsync: jest.Mock;
  let getAllAndOverride: jest.Mock;
  let findUniqueUser: jest.Mock;
  let findUniqueSession: jest.Mock;
  let guard: JwtAuthGuard;

  beforeEach(() => {
    verifyAsync = jest.fn();
    getAllAndOverride = jest.fn();
    findUniqueUser = jest.fn();
    findUniqueSession = jest.fn();

    const prismaMock = {
      user: { findUnique: findUniqueUser },
      refreshSession: { findUnique: findUniqueSession },
    } as unknown as PrismaService;

    guard = new JwtAuthGuard(
      { verifyAsync } as unknown as JwtService,
      { getAllAndOverride } as unknown as Reflector,
      prismaMock,
    );
  });

  it('allows public routes without a token', async () => {
    getAllAndOverride.mockReturnValue(true);
    const request: RequestWithUser = {};

    await expect(guard.canActivate(makeContext(request))).resolves.toBe(true);

    expect(verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects a protected route without an access token', async () => {
    getAllAndOverride.mockReturnValue(false);
    const request: RequestWithUser = { cookies: {} };

    await expect(
      guard.canActivate(makeContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(verifyAsync).not.toHaveBeenCalled();
  });

  it('attaches the authenticated user to the request when user and session are valid', async () => {
    getAllAndOverride.mockReturnValue(false);
    verifyAsync.mockResolvedValue({
      sub: 'user-1',
      role: 'citizen',
      session_id: 'session-1',
    });
    findUniqueUser.mockResolvedValue({
      accountStatus: AccountStatus.ACTIVE,
      deletedAt: null,
      userRoles: [{ role: { roleCode: 'citizen' } }],
    });
    findUniqueSession.mockResolvedValue({
      revokedAt: null,
      expiresAt: new Date(Date.now() + 100000),
    });

    const request: RequestWithUser = {
      cookies: { access_token: 'access-token' },
    };

    await expect(guard.canActivate(makeContext(request))).resolves.toBe(true);

    expect(verifyAsync).toHaveBeenCalledWith('access-token');
    expect(request.user).toEqual({
      id: 'user-1',
      role: 'citizen',
      sessionId: 'session-1',
    });
  });

  it('rejects an invalid access token', async () => {
    getAllAndOverride.mockReturnValue(false);
    verifyAsync.mockRejectedValue(new Error('invalid token'));
    const request: RequestWithUser = {
      cookies: { access_token: 'invalid-token' },
    };

    await expect(
      guard.canActivate(makeContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(request.user).toBeUndefined();
  });

  it('throws ForbiddenException if user is suspended or deleted', async () => {
    getAllAndOverride.mockReturnValue(false);
    verifyAsync.mockResolvedValue({
      sub: 'user-1',
      role: 'citizen',
    });
    findUniqueUser.mockResolvedValue({
      accountStatus: AccountStatus.SUSPENDED,
      deletedAt: null,
      userRoles: [],
    });

    const request: RequestWithUser = {
      cookies: { access_token: 'access-token' },
    };

    await expect(
      guard.canActivate(makeContext(request)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws UnauthorizedException if refresh session is revoked', async () => {
    getAllAndOverride.mockReturnValue(false);
    verifyAsync.mockResolvedValue({
      sub: 'user-1',
      role: 'citizen',
      session_id: 'session-1',
    });
    findUniqueUser.mockResolvedValue({
      accountStatus: AccountStatus.ACTIVE,
      deletedAt: null,
      userRoles: [],
    });
    findUniqueSession.mockResolvedValue({
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 100000),
    });

    const request: RequestWithUser = {
      cookies: { access_token: 'access-token' },
    };

    await expect(
      guard.canActivate(makeContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
