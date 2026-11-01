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

    try {
      const payload =
        await this.jwtService.verifyAsync<JwtAccessPayload>(token);

      request.user = {
        id: payload.sub,
        role: payload.role,
        sessionId: payload.session_id,
      };

      return true;
    } catch {
      throw new UnauthorizedException(
        'Sesi tidak valid atau sudah kedaluwarsa',
      );
    }
  }
}
