import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response as ExpressResponse } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { Response } from '../common/response/response';
import { AccountService } from './account.service';
import {
  ChangePasswordDto,
  UpdatePreferencesDto,
  UpdateProfileDto,
} from './account.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly service: AccountService) {}
  @Get() async profile(@CurrentUser() actor: AuthenticatedUser) {
    return new Response({ data: await this.service.profile(actor) });
  }
  @Patch('profile') async updateProfile(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
    @Req() req: Request & { requestId?: string },
  ) {
    return new Response({
      data: await this.service.updateProfile(actor, dto, req.requestId || ''),
    });
  }
  @Post('password')
  @HttpCode(204)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async changePassword(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request & { requestId?: string },
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    await this.service.changePassword(actor, dto, req.requestId || '');
    const options = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax' as const,
      path: '/',
      ...(process.env.COOKIE_DOMAIN && process.env.COOKIE_DOMAIN !== 'localhost'
        ? { domain: process.env.COOKIE_DOMAIN }
        : {}),
    };
    res.clearCookie('access_token', options);
    res.clearCookie('refresh_token', options);
  }
  @Get('sessions') async sessions(@CurrentUser() actor: AuthenticatedUser) {
    return new Response({ data: await this.service.sessions(actor) });
  }
  @Delete('sessions/:id')
  @HttpCode(204)
  async revoke(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request & { requestId?: string },
  ) {
    await this.service.revokeSession(actor, id, req.requestId || '');
  }
  @Get('preferences') async preferences(
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return new Response({ data: await this.service.preferences(actor) });
  }
  @Patch('preferences') async updatePreferences(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return new Response({
      data: await this.service.updatePreferences(actor, dto),
    });
  }
}
