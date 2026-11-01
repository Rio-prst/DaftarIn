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
import { AssignOfficerDto } from './dto/assign-officer.dto';
import { CreateGuideVersionDto } from './dto/create-guide-version.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { ListAdminServicesQueryDto } from './dto/list-admin-services.query.dto';
import { ListAuditEventsQueryDto } from './dto/list-audit-events.query.dto';
import { ManageRoleAssignmentDto } from './dto/manage-role-assignment.dto';
import { PublishGuideVersionDto } from './dto/publish-guide-version.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PauseServiceDto } from './dto/pause-service.dto';
import { ResolveEscalationDto } from './dto/resolve-escalation.dto';
import {
  ADMIN_SERVICE,
  type IAdminService,
} from './interfaces/admin.service.interface';

@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    @Inject(ADMIN_SERVICE)
    private readonly adminService: IAdminService,
  ) {}

  @Get('services')
  async listServices(@Query() query: ListAdminServicesQueryDto) {
    const result = await this.adminService.listServices(query);
    return new Response({
      data: result.data,
      meta: result.meta,
    });
  }

  @Post('services')
  @HttpCode(HttpStatus.CREATED)
  async createService(
    @CurrentUser() admin: AuthenticatedUser,
    @Body() dto: CreateServiceDto,
  ) {
    const data = await this.adminService.createService(admin.id, dto);
    return new Response({
      data,
    });
  }

  @Patch('services/:id')
  async updateService(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    const data = await this.adminService.updateService(admin.id, id, dto);
    return new Response({
      data,
    });
  }

  @Post('services/:id/guide-versions')
  @HttpCode(HttpStatus.CREATED)
  async createGuideVersion(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateGuideVersionDto,
  ) {
    const data = await this.adminService.createGuideVersion(admin.id, id, dto);
    return new Response({
      data,
    });
  }

  @Post('guide-versions/:id/publish')
  @HttpCode(HttpStatus.OK)
  async publishGuideVersion(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PublishGuideVersionDto,
  ) {
    const data = await this.adminService.publishGuideVersion(admin.id, id, dto);
    return new Response({
      data,
    });
  }

  @Get('officers')
  async listOfficers(
    @Query('page') page = 1,
    @Query('page_size') pageSize = 20,
  ) {
    const result = await this.adminService.listOfficers({
      page: Number(page) || 1,
      page_size: Number(pageSize) || 20,
    });
    return new Response({
      data: result.data,
      meta: result.meta,
    });
  }

  @Patch('users/:userId/role-assignments')
  async manageRoleAssignments(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: ManageRoleAssignmentDto,
  ) {
    const data = await this.adminService.manageRoleAssignments(
      admin.id,
      userId,
      dto,
    );
    return new Response({
      data,
    });
  }

  @Post('assignments')
  @HttpCode(HttpStatus.CREATED)
  async assignOfficer(
    @CurrentUser() admin: AuthenticatedUser,
    @Body() dto: AssignOfficerDto,
  ) {
    const data = await this.adminService.assignOfficerToApplication(
      admin.id,
      dto,
    );
    return new Response({
      data,
    });
  }

  @Get('audit-events')
  async listAuditEvents(@Query() query: ListAuditEventsQueryDto) {
    const result = await this.adminService.listAuditEvents(query);
    return new Response({
      data: result.data,
      meta: result.meta,
    });
  }

  @Post('services/:id/pause')
  @HttpCode(HttpStatus.OK)
  async pauseService(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PauseServiceDto,
  ) {
    const data = await this.adminService.pauseService(admin.id, id, dto);
    return new Response({ data });
  }

  @Post('services/:id/resume')
  @HttpCode(HttpStatus.OK)
  async resumeService(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.adminService.resumeService(admin.id, id);
    return new Response({ data });
  }

  @Post('escalations/:id/resolve')
  @HttpCode(HttpStatus.OK)
  async resolveEscalation(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResolveEscalationDto,
  ) {
    const data = await this.adminService.resolveEscalation(admin.id, id, dto);
    return new Response({ data });
  }
}
