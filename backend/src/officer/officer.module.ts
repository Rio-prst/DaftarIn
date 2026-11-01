import { Module } from '@nestjs/common';
import { OfficerController } from './officer.controller';
import { OfficerRepository } from './officer.repository';
import { OfficerService } from './officer.service';
import { OFFICER_REPOSITORY } from './interfaces/officer.repository.interface';
import { OFFICER_SERVICE } from './interfaces/officer.service.interface';

@Module({
  controllers: [OfficerController],
  providers: [
    {
      provide: OFFICER_REPOSITORY,
      useClass: OfficerRepository,
    },
    {
      provide: OFFICER_SERVICE,
      useClass: OfficerService,
    },
  ],
  exports: [OFFICER_SERVICE, OFFICER_REPOSITORY],
})
export class OfficerModule {}
