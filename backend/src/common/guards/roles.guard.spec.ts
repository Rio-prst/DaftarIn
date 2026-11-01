import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

type RequestWithUser = {
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

describe('RolesGuard', () => {
  let getAllAndOverride: jest.Mock;
  let guard: RolesGuard;

  beforeEach(() => {
    getAllAndOverride = jest.fn();
    guard = new RolesGuard({
      getAllAndOverride,
    } as unknown as Reflector);
  });

  it('allows routes without required roles', () => {
    getAllAndOverride.mockReturnValue(undefined);
    const request: RequestWithUser = {};

    expect(guard.canActivate(makeContext(request))).toBe(true);
  });

  it('allows routes with an empty required role list', () => {
    getAllAndOverride.mockReturnValue([]);
    const request: RequestWithUser = {};

    expect(guard.canActivate(makeContext(request))).toBe(true);
  });

  it('rejects a protected route without an authenticated user', () => {
    getAllAndOverride.mockReturnValue(['officer']);
    const request: RequestWithUser = {};

    expect(() => guard.canActivate(makeContext(request))).toThrow(
      ForbiddenException,
    );
  });

  it('allows a user with one of the required roles', () => {
    getAllAndOverride.mockReturnValue(['officer', 'admin']);
    const request: RequestWithUser = {
      user: {
        id: 'user-1',
        role: 'officer',
        sessionId: 'session-1',
      },
    };

    expect(guard.canActivate(makeContext(request))).toBe(true);
  });

  it('rejects a user without a required role', () => {
    getAllAndOverride.mockReturnValue(['admin']);
    const request: RequestWithUser = {
      user: {
        id: 'user-1',
        role: 'citizen',
        sessionId: 'session-1',
      },
    };

    expect(() => guard.canActivate(makeContext(request))).toThrow(
      ForbiddenException,
    );
  });
});
