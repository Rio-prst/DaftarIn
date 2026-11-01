import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PREPARATIONS_REPOSITORY } from './interfaces/preparations.repository.interface';
import { PREPARATIONS_SERVICE } from './interfaces/preparations.service.interface';
import { PreparationsController } from './preparations.controller';
import { PreparationsRepository } from './preparations.repository';
import { PreparationsService } from './preparations.service';

@Module({
  imports: [PrismaModule],
  controllers: [PreparationsController],
  providers: [
    {
      provide: PREPARATIONS_REPOSITORY,
      useClass: PreparationsRepository,
    },
    {
      provide: PREPARATIONS_SERVICE,
      useClass: PreparationsService,
    },
  ],
  exports: [PREPARATIONS_SERVICE, PREPARATIONS_REPOSITORY],
})
export class PreparationsModule {}
