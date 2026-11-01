import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Response } from '../common/response/response';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { AdminListDto, ChangeAccessDto } from './admin.dto';
import { AdminService } from './admin.service';

@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}
  @Get('users')
  async users(@Query() query: AdminListDto) {
    return new Response({ data: await this.service.users(query) });
  }
  @Get('agencies')
  async agencies() {
    return new Response({ data: await this.service.agencies() });
  }
  @Get('audit')
  async audit(@Query() query: AdminListDto) {
    return new Response({ data: await this.service.audit(query) });
  }
  @Patch('users/:id/access')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(204)
  async changeAccess(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeAccessDto,
    @Req() request: Request & { requestId?: string },
  ) {
    await this.service.changeAccess(actor, id, dto, request.requestId ?? '');
  }
}
