import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DASHBOARD_SERVICE } from './interfaces/dashboard.service.interface';

@Module({
  controllers: [DashboardController],
  providers: [
    {
      provide: DASHBOARD_SERVICE,
      useClass: DashboardService,
    },
  ],
  exports: [DASHBOARD_SERVICE],
})
export class DashboardModule {}
