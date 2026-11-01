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
}
