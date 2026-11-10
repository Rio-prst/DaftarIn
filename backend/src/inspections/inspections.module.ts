import { Module } from '@nestjs/common';
import { PreparationsModule } from '../preparations/preparations.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { InspectionMapper } from './inspection.mapper';
import { InspectionsController } from './inspections.controller';
import { InspectionsRepository } from './inspections.repository';
import { InspectionsService } from './inspections.service';
import { INSPECTION_AI_PROVIDER } from './interfaces/inspection-ai.interface';
import { INSPECTIONS_REPOSITORY } from './interfaces/inspections.repository.interface';
import { INSPECTIONS_SERVICE } from './interfaces/inspections.service.interface';
import { GeminiInspectionProvider } from './providers/gemini-inspection.provider';

@Module({
  imports: [PrismaModule, StorageModule, PreparationsModule],
  controllers: [InspectionsController],
  providers: [
    InspectionMapper,
    {
      provide: INSPECTIONS_REPOSITORY,
      useClass: InspectionsRepository,
    },
    {
      provide: INSPECTIONS_SERVICE,
      useClass: InspectionsService,
    },
    {
      provide: INSPECTION_AI_PROVIDER,
      useClass: GeminiInspectionProvider,
    },
  ],
  exports: [
    INSPECTIONS_SERVICE,
    INSPECTIONS_REPOSITORY,
    INSPECTION_AI_PROVIDER,
  ],
})
export class InspectionsModule {}
