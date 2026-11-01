import { Controller, Get, Inject, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Response } from '../common/response/response';
import { ListRegionsQueryDto } from './dto/list-regions.query.dto';
import { CATALOG_SERVICE } from './interfaces/catalog.service.interface';
import type { ICatalogService } from './interfaces/catalog.service.interface';

@Public()
@Controller('regions')
export class RegionsController {
  constructor(
    @Inject(CATALOG_SERVICE)
    private readonly catalogService: ICatalogService,
  ) {}

  @Get()
  async list(@Query() query: ListRegionsQueryDto) {
    const result = await this.catalogService.listRegions({
      q: query.q,
      parentId: query.parent_id,
      type: query.type,
      page: query.page,
      pageSize: query.page_size,
    });

    return new Response({
      data: result.data,
      meta: result.meta,
    });
  }
}
