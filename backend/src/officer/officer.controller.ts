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
import { CreateOfficerEventDto } from './dto/create-officer-event.dto';
import { ListAssignmentsQueryDto } from './dto/list-assignments.query.dto';
import {
  OFFICER_SERVICE,
  type IOfficerService,
} from './interfaces/officer.service.interface';

@Roles('officer', 'admin')
@Controller('officer')
export class OfficerController {
  constructor(
    @Inject(OFFICER_SERVICE)
    private readonly officerService: IOfficerService,
  ) {}

  @Get('summary')
  async getSummary(@CurrentUser() user: AuthenticatedUser) {
    const summary = await this.officerService.getSummary(user.id);
    return new Response({
      data: summary,
    });
  }

  @Get('assignments')
  async listAssignments(
    @Query() query: ListAssignmentsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.officerService.listAssignments(user.id, query);
    return new Response({
      data: result.data,
      meta: result.meta,
    });
  }

  @Get('applications/:applicationId')
  async getApplication(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.officerService.getApplicationDetail(
      applicationId,
      user.id,
    );
    return new Response({
      data,
    });
  }

  @Post('applications/:applicationId/events')
  @HttpCode(HttpStatus.CREATED)
  async createEvent(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() dto: CreateOfficerEventDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.officerService.createEvent(
      applicationId,
      user.id,
      dto,
    );
    return new Response({
      data,
    });
  }

  @Post('applications/:applicationId/evaluation')
  @HttpCode(HttpStatus.OK)
  async saveEvaluation(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.officerService.saveEvaluation(
      applicationId,
      user.id,
      body,
    );
    return new Response({
      data: result,
    });
  }

  @Get('applications/:applicationId/evaluation')
  async getEvaluation(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.officerService.getEvaluation(
      applicationId,
      user.id,
    );
    return new Response({
      data,
    });
  }

  @Post('applications/:applicationId/assign')
  @HttpCode(HttpStatus.OK)
  async assign(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() body: { officer_user_id: string; reason?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.officerService.assignOfficer(
      applicationId,
      body.officer_user_id,
      user.id,
      body.reason,
    );
    return new Response({
      data: result,
    });
  }
}
