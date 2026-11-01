import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Response } from '../../common/response/response';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import {
  CreateFamilyMemberDto,
  UpdateFamilyMemberDto,
} from './dto/create-family-member.dto';
import { FamilyService } from './family.service';

@Roles('citizen')
@Controller('account/family-members')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.familyService.list(user.id);
    return new Response({ data });
  }

  @Get(':id')
  async get(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.familyService.getById(id, user.id);
    return new Response({ data });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateFamilyMemberDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.familyService.create(user.id, dto);
    return new Response({ data });
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFamilyMemberDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.familyService.update(id, user.id, dto);
    return new Response({ data });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.familyService.delete(id, user.id);
  }
}
