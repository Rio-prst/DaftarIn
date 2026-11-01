import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { PrismaService } from '../../prisma/prisma.service';

type RequestWithUser = {
  cookies?: {
    access_token?: string;
  };
  user?: {
    id: string;
    role: string;
    sessionId: string;
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
  let guard: JwtAuthGuard;
  let findUnique: jest.Mock;

  beforeEach(() => {
    verifyAsync = jest.fn();
    getAllAndOverride = jest.fn();
    findUnique = jest.fn().mockResolvedValue({
      userId: 'user-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60000),
      user: {
        accountStatus: 'ACTIVE',
        deletedAt: null,
        userRoles: [
          {
            isActive: true,
            validFrom: null,
            validUntil: null,
            role: { roleCode: 'citizen' },
          },
        ],
      },
    });

    guard = new JwtAuthGuard(
      { verifyAsync } as unknown as JwtService,
      { getAllAndOverride } as unknown as Reflector,
      { refreshSession: { findUnique } } as unknown as PrismaService,
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

  it('attaches the authenticated user to the request', async () => {
    getAllAndOverride.mockReturnValue(false);
    verifyAsync.mockResolvedValue({
      sub: 'user-1',
      role: 'citizen',
      session_id: 'session-1',
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

  it('rejects a valid JWT immediately when its session has been revoked', async () => {
    verifyAsync.mockResolvedValue({
      sub: 'user-1',
      role: 'citizen',
      session_id: 'session-1',
    });
    findUnique.mockResolvedValue({
      userId: 'user-1',
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 60000),
      user: {
        accountStatus: 'ACTIVE',
        deletedAt: null,
        userRoles: [
          {
            isActive: true,
            validFrom: null,
            validUntil: null,
            role: { roleCode: 'citizen' },
          },
        ],
      },
    });
    const request: RequestWithUser = {
      cookies: { access_token: 'signed-access-token' },
    };
    await expect(
      guard.canActivate(makeContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(request.user).toBeUndefined();
  });
  it('rejects a stale JWT role after the role assignment was removed', async () => {
    verifyAsync.mockResolvedValue({
      sub: 'user-1',
      role: 'admin',
      session_id: 'session-1',
    });
    const request: RequestWithUser = {
      cookies: { access_token: 'signed-access-token' },
    };
    await expect(
      guard.canActivate(makeContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(request.user).toBeUndefined();
  });
  it('does not authorize a session belonging to a different account', async () => {
    verifyAsync.mockResolvedValue({
      sub: 'different-user',
      role: 'citizen',
      session_id: 'session-1',
    });
    const request: RequestWithUser = {
      cookies: { access_token: 'signed-access-token' },
    };
    await expect(
      guard.canActivate(makeContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
