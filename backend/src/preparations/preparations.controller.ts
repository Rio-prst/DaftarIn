import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Response } from '../common/response/response';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { PreparationStatus } from '../generated/prisma/client';
import { ArchivePreparationDto } from './dto/archive-preparation.dto';
import { CreatePreparationDto } from './dto/create-preparation.dto';
import { ListPreparationsQueryDto } from './dto/list-preparations.query.dto';
import { UpdatePreparationDto } from './dto/update-preparation.dto';
import {
  PREPARATIONS_SERVICE,
  type IPreparationsService,
} from './interfaces/preparations.service.interface';

function parsePreparationStatus(
  status?: string,
): PreparationStatus | undefined {
  if (!status) return undefined;
  const upper = status.toUpperCase();
  if (upper in PreparationStatus) {
    return upper as PreparationStatus;
  }
  if (status === 'needs_review') return PreparationStatus.NEEDS_CONFIRMATION;
  if (status === 'needs_new_inspection')
    return PreparationStatus.RECHECK_REQUIRED;
  return undefined;
}

@Roles('citizen')
@Controller('preparations')
export class PreparationsController {
  constructor(
    @Inject(PREPARATIONS_SERVICE)
    private readonly preparationsService: IPreparationsService,
  ) {}

  @Get()
  async list(
    @Query() query: ListPreparationsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.preparationsService.listPreparations({
      userId: user.id,
      status: parsePreparationStatus(query.status),
      serviceId: query.service_id,
      page: query.page,
      pageSize: query.page_size,
      sort: query.sort,
      order: query.order,
    });

    return new Response({
      data: result.data,
      meta: result.meta,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreatePreparationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const detail = await this.preparationsService.createPreparation({
      userId: user.id,
      serviceId: dto.service_id,
      guideVersionId: '',
      internalReference: '',
      answers: (dto.answers ?? []).map((a) => ({
        questionId: a.question_id,
        value: a.value,
      })),
    });

    return new Response({
      data: detail,
    });
  }

  @Get(':preparationId')
  async get(
    @Param('preparationId', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const detail = await this.preparationsService.getPreparation(id, user.id);

    return new Response({
      data: detail,
    });
  }

  @Patch(':preparationId')
  async update(
    @Param('preparationId', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePreparationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const updated = await this.preparationsService.updatePreparation({
      id,
      userId: user.id,
      nextDataVersion: 1,
      expectedDataVersion: dto.expected_data_version,
      answers: dto.answers?.map((a) => ({
        questionId: a.question_id,
        value: a.value,
      })),
    });

    return new Response({
      data: updated,
    });
  }

  @Post(':preparationId/archive')
  @HttpCode(HttpStatus.OK)
  async archive(
    @Param('preparationId', ParseUUIDPipe) id: string,
    @Body() _dto: ArchivePreparationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const archived = await this.preparationsService.archivePreparation(
      id,
      user.id,
    );

    return new Response({
      data: archived,
    });
  }

  @Get(':preparationId/requirements')
  async getRequirements(
    @Param('preparationId', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.preparationsService.getPreparationRequirements(
      id,
      user.id,
    );

    return new Response({
      data: result,
    });
  }
}
