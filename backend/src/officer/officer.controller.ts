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
  Put,
  Query,
  Res,
} from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Response } from '../common/response/response';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { CreateOfficerEventDto } from './dto/create-officer-event.dto';
import { EvaluationDraftDto } from './dto/evaluation-draft.dto';
import { SubmitDecisionDto } from './dto/submit-decision.dto';
import { CreateOfficerEscalationDto } from './dto/create-escalation.dto';
import { ListAssignmentsQueryDto } from './dto/list-assignments.query.dto';
import {
  OFFICER_SERVICE,
  type IOfficerService,
} from './interfaces/officer.service.interface';

@Roles('officer')
@Controller('officer')
export class OfficerController {
  constructor(
    @Inject(OFFICER_SERVICE)
    private readonly officerService: IOfficerService,
  ) {}

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

  @Get('applications/:applicationId/documents')
  async getDocuments(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.officerService.getApplicationDocuments(
      applicationId,
      user.id,
    );
    return new Response({
      data,
    });
  }

  @Get('applications/:applicationId/documents/:documentId/content')
  async getDocumentContent(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Query('redirect') redirect: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: ExpressResponse,
  ) {
    const signedUrl =
      await this.officerService.getApplicationDocumentContentUrl(
        applicationId,
        documentId,
        user.id,
      );

    if (redirect === 'false') {
      return res.status(HttpStatus.OK).json(
        new Response({
          data: {
            url: signedUrl,
            expires_in_seconds: 300,
          },
        }),
      );
    }

    return res.redirect(HttpStatus.FOUND, signedUrl);
  }

  @Put('applications/:applicationId/evaluation-draft')
  @HttpCode(HttpStatus.OK)
  async saveEvaluationDraft(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() dto: EvaluationDraftDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.officerService.saveEvaluationDraft(
      applicationId,
      user.id,
      dto,
    );
    return new Response({ data });
  }

  @Post('applications/:applicationId/decisions')
  @HttpCode(HttpStatus.OK)
  async submitDecision(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() dto: SubmitDecisionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.officerService.submitDecision(
      applicationId,
      user.id,
      dto,
    );
    return new Response({ data });
  }

  @Post('applications/:applicationId/escalations')
  @HttpCode(HttpStatus.CREATED)
  async createEscalation(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() dto: CreateOfficerEscalationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.officerService.createEscalation(
      applicationId,
      user.id,
      dto,
    );
    return new Response({ data });
  }
}
