import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AccountStatus } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type {
  AuthenticatedUser,
  JwtAccessPayload,
} from '../types/authenticated-user';

type RequestWithUser = Request & { user?: AuthenticatedUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = (typeof request.header === 'function' ? request.header('authorization') : request.headers?.[ 'authorization' ]) || (request.headers?.[ 'authorization' ] as string | undefined);
    const bearerToken =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : undefined;
    const token =
      (request.cookies?.access_token as string | undefined) || bearerToken;

    if (!token) {
      throw new UnauthorizedException('Autentikasi dibutuhkan');
    }

    let payload: JwtAccessPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtAccessPayload>(token);
    } catch {
      throw new UnauthorizedException(
        'Sesi tidak valid atau sudah kedaluwarsa',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        accountStatus: true,
        deletedAt: true,
        userRoles: {
          where: { isActive: true },
          select: {
            role: {
              select: {
                roleCode: true,
              },
            },
          },
        },
      },
    });

    const blockedStatuses: AccountStatus[] = [
      AccountStatus.SUSPENDED,
      AccountStatus.DELETION_REQUESTED,
      AccountStatus.DELETED,
    ];

    if (
      !user ||
      user.deletedAt ||
      blockedStatuses.includes(user.accountStatus)
    ) {
      throw new ForbiddenException('Akun tidak aktif');
    }

    if (payload.session_id) {
      const session = await this.prisma.refreshSession.findUnique({
        where: { id: payload.session_id },
        select: {
          revokedAt: true,
          expiresAt: true,
        },
      });

      if (
        !session ||
        session.revokedAt ||
        session.expiresAt.getTime() <= Date.now()
      ) {
        throw new UnauthorizedException(
          'Sesi tidak valid atau sudah kedaluwarsa',
        );
      }
    }

    const activeRole =
      user.userRoles[0]?.role.roleCode ?? payload.role ?? 'citizen';

    request.user = {
      id: payload.sub,
      role: activeRole,
      sessionId: payload.session_id,
    };

    return true;
  }
}
