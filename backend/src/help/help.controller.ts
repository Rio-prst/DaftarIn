import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Response } from '../common/response/response';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { HelpService } from './help.service';

@Roles('citizen', 'officer', 'admin')
@Controller('help')
export class HelpController {
  constructor(private readonly service: HelpService) {}

  @Get('requests')
  async list(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.service.list(user);
    return new Response({ data });
  }

  @Post('requests')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { topic: string; body: string; applicationId?: string },
  ) {
    const data = await this.service.create(user, body);
    return new Response({ data });
  }

  @Get('requests/:id')
  async get(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.service.get(id, user);
    return new Response({ data });
  }

  @Post('requests/:id/messages')
  @HttpCode(HttpStatus.OK)
  async reply(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { text: string; close?: boolean },
  ) {
    const data = await this.service.reply(id, user, body);
    return new Response({ data });
  }
}
