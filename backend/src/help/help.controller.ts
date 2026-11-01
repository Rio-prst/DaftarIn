import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Response } from '../common/response/response';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import {
  CreateHelpReplyDto,
  CreateHelpRequestDto,
} from './dto/create-help-request.dto';
import { HelpService } from './help.service';

@Controller('help-requests')
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  @Roles('citizen', 'admin')
  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.helpService.list(user.id, user.role);
    return new Response({ data });
  }

  @Roles('citizen', 'admin')
  @Get(':id')
  async get(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.helpService.getById(id, user.id, user.role);
    return new Response({ data });
  }

  @Roles('citizen')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateHelpRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.helpService.create(user.id, dto);
    return new Response({ data });
  }

  @Roles('citizen', 'admin')
  @Post(':id/replies')
  @HttpCode(HttpStatus.CREATED)
  async reply(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateHelpReplyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.helpService.createReply(
      id,
      user.id,
      user.role,
      dto,
    );
    return new Response({ data });
  }
}
