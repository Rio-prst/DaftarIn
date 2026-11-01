import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  mapGuide,
  mapQuestions,
  mapRegion,
  mapServiceDetail,
  mapServiceSummary,
  mapSources,
} from './catalog.mapper';
import {
  CATALOG_REPOSITORY,
  type ICatalogRepository,
  type ListRegionsInput,
  type ListServicesInput,
} from './interfaces/catalog.repository.interface';
import type {
  GuideView,
  ICatalogService,
  QuestionsView,
  RegionListResult,
  ServiceDetailView,
  ServiceListResult,
  SourcesView,
} from './interfaces/catalog.service.interface';

@Injectable()
export class CatalogService implements ICatalogService {
  constructor(
    @Inject(CATALOG_REPOSITORY)
    private readonly catalogRepository: ICatalogRepository,
  ) {}

  async listRegions(input: ListRegionsInput): Promise<RegionListResult> {
    const result = await this.catalogRepository.listRegions(input);

    return {
      data: result.items.map(mapRegion),
      meta: this.paginationMeta(input.page, input.pageSize, result.total),
    };
  }

  async listServices(input: ListServicesInput): Promise<ServiceListResult> {
    const result = await this.catalogRepository.listServices(input);

    return {
      data: result.items.map(mapServiceSummary),
      meta: this.paginationMeta(input.page, input.pageSize, result.total),
    };
  }

  async getService(serviceId: string): Promise<ServiceDetailView> {
    const service = await this.catalogRepository.findServiceById(serviceId);

    if (!service) {
      throw new NotFoundException('Layanan tidak ditemukan.');
    }

    return mapServiceDetail(service);
  }

  async getServiceGuide(serviceId: string): Promise<GuideView> {
    const service =
      await this.catalogRepository.findServiceGuideById(serviceId);

    if (!service) {
      throw new NotFoundException('Layanan tidak ditemukan.');
    }

    if (service.guideVersions.length === 0) {
      throw new NotFoundException('Panduan layanan belum tersedia.');
    }

    return mapGuide(service);
  }

  async getServiceQuestions(serviceId: string): Promise<QuestionsView> {
    const service =
      await this.catalogRepository.findServiceQuestionsById(serviceId);

    if (!service) {
      throw new NotFoundException('Layanan tidak ditemukan.');
    }

    return mapQuestions(service);
  }

  async getServiceSources(serviceId: string): Promise<SourcesView> {
    const service =
      await this.catalogRepository.findServiceSourcesById(serviceId);

    if (!service) {
      throw new NotFoundException('Layanan tidak ditemukan.');
    }

    return mapSources(service);
  }

  private paginationMeta(page: number, pageSize: number, totalItems: number) {
    return {
      page,
      page_size: pageSize,
      total_items: totalItems,
      total_pages: Math.ceil(totalItems / pageSize),
    };
  }
}
