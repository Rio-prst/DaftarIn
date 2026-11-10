import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Response } from '../common/response/response';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { ListFindingsQueryDto } from './dto/list-findings-query.dto';
import { RecordCorrectionDto } from './dto/record-correction.dto';
import {
  INSPECTIONS_SERVICE,
  type IInspectionsService,
} from './interfaces/inspections.service.interface';

@Roles('citizen')
@Controller('preparations/:preparationId')
export class InspectionsController {
  constructor(
    @Inject(INSPECTIONS_SERVICE)
    private readonly inspectionsService: IInspectionsService,
  ) {}

  @Post('inspections')
  @HttpCode(HttpStatus.CREATED)
  async runInspection(
    @Param('preparationId', ParseUUIDPipe) preparationId: string,
    @Body() dto: CreateInspectionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const result = await this.inspectionsService.runInspection(
      preparationId,
      user.id,
      {
        expectedDataVersion: dto.expected_data_version ?? 1,
        documentVersions: dto.document_versions?.map((d) => ({
          documentId: d.document_id,
          version: d.version,
        })),
        consent: {
          accepted: dto.consent?.accepted ?? true,
          noticeVersion: dto.consent?.notice_version ?? '1.0',
          purpose: dto.consent?.purpose ?? 'document_inspection',
        },
      },
      idempotencyKey,
    );

    return new Response({
      data: result,
    });
  }

  @Get('inspections')
  async listInspections(
    @Param('preparationId', ParseUUIDPipe) preparationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const runs = await this.inspectionsService.listInspections(
      preparationId,
      user.id,
    );

    return new Response({
      data: runs,
    });
  }

  @Get('inspections/:inspectionId')
  async getInspection(
    @Param('preparationId', ParseUUIDPipe) preparationId: string,
    @Param('inspectionId', ParseUUIDPipe) inspectionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const run = await this.inspectionsService.getInspection(
      preparationId,
      inspectionId,
      user.id,
    );

    return new Response({
      data: run,
    });
  }

  @Get('inspections/:inspectionId/findings')
  async listFindings(
    @Param('preparationId', ParseUUIDPipe) preparationId: string,
    @Param('inspectionId', ParseUUIDPipe) inspectionId: string,
    @Query() query: ListFindingsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.inspectionsService.listFindings(
      preparationId,
      inspectionId,
      user.id,
      {
        status: query.status,
        category: query.category,
        actionLevel: query.action_level,
        page: query.page,
        pageSize: query.page_size,
      },
    );

    return new Response({
      data: result.data,
      meta: result.meta,
    });
  }

  @Post('findings/:findingId/corrections')
  @HttpCode(HttpStatus.OK)
  async recordCorrection(
    @Param('preparationId', ParseUUIDPipe) preparationId: string,
    @Param('findingId', ParseUUIDPipe) findingId: string,
    @Body() dto: RecordCorrectionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.inspectionsService.recordCorrection(
      preparationId,
      findingId,
      user.id,
      {
        correctedValue: dto.corrected_value,
        note: dto.note,
      },
    );

    return new Response({
      data: result,
    });
  }
}
