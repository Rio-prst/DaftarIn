import { Module } from '@nestjs/common';
import { PreparationsModule } from '../preparations/preparations.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { DocumentsController } from './documents.controller';
import { DocumentsRepository } from './documents.repository';
import { DocumentsService } from './documents.service';
import { DOCUMENTS_REPOSITORY } from './interfaces/documents.repository.interface';
import { DOCUMENTS_SERVICE } from './interfaces/documents.service.interface';

@Module({
  imports: [PrismaModule, StorageModule, PreparationsModule],
  controllers: [DocumentsController],
  providers: [
    {
      provide: DOCUMENTS_REPOSITORY,
      useClass: DocumentsRepository,
    },
    {
      provide: DOCUMENTS_SERVICE,
      useClass: DocumentsService,
    },
  ],
  exports: [DOCUMENTS_SERVICE, DOCUMENTS_REPOSITORY],
})
export class DocumentsModule {}
