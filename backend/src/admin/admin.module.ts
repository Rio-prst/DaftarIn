import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';
import { ADMIN_REPOSITORY } from './interfaces/admin.repository.interface';
import { ADMIN_SERVICE } from './interfaces/admin.service.interface';

@Module({
  controllers: [AdminController],
  providers: [
    {
      provide: ADMIN_REPOSITORY,
      useClass: AdminRepository,
    },
    {
      provide: ADMIN_SERVICE,
      useClass: AdminService,
    },
  ],
  exports: [ADMIN_SERVICE, ADMIN_REPOSITORY],
})
export class AdminModule {}
