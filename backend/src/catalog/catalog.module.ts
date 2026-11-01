import { Module } from '@nestjs/common';
import { CatalogRepository } from './catalog.repository';
import { CatalogService } from './catalog.service';
import { CATALOG_REPOSITORY } from './interfaces/catalog.repository.interface';
import { CATALOG_SERVICE } from './interfaces/catalog.service.interface';
import { RegionsController } from './regions.controller';
import { ServicesController } from './services.controller';

@Module({
  controllers: [RegionsController, ServicesController],
  providers: [
    {
      provide: CATALOG_REPOSITORY,
      useClass: CatalogRepository,
    },
    {
      provide: CATALOG_SERVICE,
      useClass: CatalogService,
    },
  ],
})
export class CatalogModule {}
