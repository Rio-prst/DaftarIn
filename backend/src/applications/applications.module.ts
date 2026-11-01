import { forwardRef } from '@nestjs/common';
import { PreparationsModule } from '../preparations/preparations.module';
import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsRepository } from './applications.repository';
import { ApplicationsService } from './applications.service';
import { APPLICATIONS_REPOSITORY } from './interfaces/applications.repository.interface';
import { APPLICATIONS_SERVICE } from './interfaces/applications.service.interface';

@Module({
  imports: [forwardRef(() => PreparationsModule)],
  controllers: [ApplicationsController],
  providers: [
    {
      provide: APPLICATIONS_REPOSITORY,
      useClass: ApplicationsRepository,
    },
    {
      provide: APPLICATIONS_SERVICE,
      useClass: ApplicationsService,
    },
  ],
  exports: [APPLICATIONS_SERVICE, APPLICATIONS_REPOSITORY],
})
export class ApplicationsModule {}
