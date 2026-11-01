import {
  Body,
  Controller,
  Get,
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
import { ConfirmResultReceivedDto } from './dto/confirm-result-received.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { CreateCitizenNoteDto } from './dto/create-citizen-note.dto';
import { LinkPreparationDto } from './dto/link-preparation.dto';
import { ListApplicationsQueryDto } from './dto/list-applications.query.dto';
import {
  APPLICATIONS_SERVICE,
  type IApplicationsService,
} from './interfaces/applications.service.interface';

@Roles('citizen')
@Controller('applications')
export class ApplicationsController {
  constructor(
    @Inject(APPLICATIONS_SERVICE)
    private readonly applicationsService: IApplicationsService,
  ) {}

  @Get()
  async list(
    @Query() query: ListApplicationsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.applicationsService.listApplications(
      user.id,
      query,
    );

    return new Response({
      data: result.data,
      meta: result.meta,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateApplicationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.applicationsService.createApplication(user.id, dto);

    return new Response({
      data,
    });
  }

  @Get(':id')
  async get(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.applicationsService.getApplication(id, user.id);

    return new Response({
      data,
    });
  }

  @Get(':id/timeline')
  async getTimeline(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.applicationsService.getTimeline(id, user.id);

    return new Response({
      data,
    });
  }

  @Post(':id/citizen-notes')
  @HttpCode(HttpStatus.CREATED)
  async addCitizenNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCitizenNoteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.applicationsService.addCitizenNote(
      id,
      user.id,
      dto,
    );

    return new Response({
      data,
    });
  }

  @Post(':id/confirm-result-received')
  @HttpCode(HttpStatus.CREATED)
  async confirmResultReceived(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmResultReceivedDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.applicationsService.confirmResultReceived(
      id,
      user.id,
      dto,
    );

    return new Response({
      data,
    });
  }

  @Post(':id/link-preparation')
  @HttpCode(HttpStatus.OK)
  async linkPreparation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LinkPreparationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.applicationsService.linkPreparation(
      id,
      user.id,
      dto.preparation_id,
    );

    return new Response({
      data,
    });
  }

  @Post(':id/resubmit-revision')
  @HttpCode(HttpStatus.OK)
  async resubmitRevision(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { note?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.applicationsService.resubmitRevision(
      id,
      user.id,
      body.note,
    );

    return new Response({
      data,
    });
  }

  @Post(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  async withdraw(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.applicationsService.withdrawApplication(
      id,
      user.id,
      body.reason,
    );

    return new Response({
      data,
    });
  }

  @Post(':id/official-submission')
  @HttpCode(HttpStatus.OK)
  async recordOfficialSubmission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: {
      official_number?: string;
      channel?: string;
      submission_date?: string;
      receipt_number?: string;
      note?: string;
    },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.applicationsService.recordOfficialSubmission(
      id,
      user.id,
      body,
    );

    return new Response({
      data,
    });
  }
}
