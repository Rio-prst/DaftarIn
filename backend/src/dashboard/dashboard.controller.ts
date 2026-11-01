import { Controller, Get, Inject } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Response } from '../common/response/response';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import {
  DASHBOARD_SERVICE,
  type IDashboardService,
} from './interfaces/dashboard.service.interface';

@Roles('citizen')
@Controller('dashboard')
export class DashboardController {
  constructor(
    @Inject(DASHBOARD_SERVICE)
    private readonly dashboardService: IDashboardService,
  ) {}

  @Get()
  async get(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.dashboardService.getCitizenDashboard(user.id);
    return new Response({
      data,
    });
  }
}
