import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
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
    const token = request.cookies?.access_token as string | undefined;

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
    if (!payload.sub || !payload.session_id || !payload.role) {
      throw new UnauthorizedException('Sesi tidak valid.');
    }
    const session = await this.prisma.refreshSession.findUnique({
      where: { id: payload.session_id },
      select: {
        userId: true,
        revokedAt: true,
        expiresAt: true,
        user: {
          select: {
            deletedAt: true,
            accountStatus: true,
            userRoles: {
              select: {
                isActive: true,
                validFrom: true,
                validUntil: true,
                role: { select: { roleCode: true } },
              },
            },
          },
        },
      },
    });
    const now = new Date();
    const roleIsActive = session?.user.userRoles.some(
      (role) =>
        role.isActive &&
        role.role.roleCode === payload.role &&
        (!role.validFrom || role.validFrom <= now) &&
        (!role.validUntil || role.validUntil > now),
    );
    if (
      !session ||
      session.userId !== payload.sub ||
      session.revokedAt ||
      session.expiresAt <= now ||
      session.user.deletedAt ||
      ['SUSPENDED', 'DELETION_REQUESTED', 'DELETED'].includes(
        session.user.accountStatus,
      ) ||
      !roleIsActive
    ) {
      throw new UnauthorizedException('Sesi tidak valid atau sudah dicabut.');
    }
    request.user = {
      id: payload.sub,
      role: payload.role,
      sessionId: payload.session_id,
    };
    return true;
  }
}
