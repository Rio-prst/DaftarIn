import {
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Response } from '../common/response/response';
import { ListServicesQueryDto } from './dto/list-services.query.dto';
import { CATALOG_SERVICE } from './interfaces/catalog.service.interface';
import type { ICatalogService } from './interfaces/catalog.service.interface';

@Public()
@Controller('services')
export class ServicesController {
  constructor(
    @Inject(CATALOG_SERVICE)
    private readonly catalogService: ICatalogService,
  ) {}

  @Get()
  async list(@Query() query: ListServicesQueryDto) {
    const result = await this.catalogService.listServices({
      q: query.q,
      regionId: query.region_id,
      categoryId: query.category_id,
      page: query.page,
      pageSize: query.page_size,
      sort: query.sort,
      order: query.order,
    });

    return new Response({
      data: result.data,
      meta: result.meta,
    });
  }

  @Get(':serviceId')
  async getService(@Param('serviceId', new ParseUUIDPipe()) serviceId: string) {
    return new Response({
      data: await this.catalogService.getService(serviceId),
    });
  }

  @Get(':serviceId/guide')
  async getGuide(@Param('serviceId', new ParseUUIDPipe()) serviceId: string) {
    return new Response({
      data: await this.catalogService.getServiceGuide(serviceId),
    });
  }

  @Get(':serviceId/questions')
  async getQuestions(
    @Param('serviceId', new ParseUUIDPipe()) serviceId: string,
  ) {
    return new Response({
      data: await this.catalogService.getServiceQuestions(serviceId),
    });
  }

  @Get(':serviceId/sources')
  async getSources(@Param('serviceId', new ParseUUIDPipe()) serviceId: string) {
    return new Response({
      data: await this.catalogService.getServiceSources(serviceId),
    });
  }
}
