import type { ListServicesQueryDto } from './dto/list-services.query.dto';
import type { ICatalogService } from './interfaces/catalog.service.interface';
import { RegionsController } from './regions.controller';
import { ServicesController } from './services.controller';

function makeCatalogService(): jest.Mocked<ICatalogService> {
  return {
    listRegions: jest.fn(),
    listServices: jest.fn(),
    getService: jest.fn(),
    getServiceGuide: jest.fn(),
    getServiceQuestions: jest.fn(),
    getServiceSources: jest.fn(),
  };
}

describe('Catalog controllers', () => {
  let catalogService: jest.Mocked<ICatalogService>;

  beforeEach(() => {
    catalogService = makeCatalogService();
  });

  it('passes region query parameters to the service', async () => {
    const controller = new RegionsController(catalogService);
    catalogService.listRegions.mockResolvedValue({
      data: [],
      meta: {
        page: 2,
        page_size: 10,
        total_items: 0,
        total_pages: 0,
      },
    });

    const result = await controller.list({
      q: 'Kota',
      parent_id: '11111111-1111-4111-8111-111111111111',
      type: 'city',
      page: 2,
      page_size: 10,
    });

    expect(catalogService.listRegions).toHaveBeenCalledWith({
      q: 'Kota',
      parentId: '11111111-1111-4111-8111-111111111111',
      type: 'city',
      page: 2,
      pageSize: 10,
    });
    expect(result.data).toEqual([]);
  });

  it('passes service query parameters to the service', async () => {
    const controller = new ServicesController(catalogService);
    catalogService.listServices.mockResolvedValue({
      data: [],
      meta: {
        page: 1,
        page_size: 20,
        total_items: 0,
        total_pages: 0,
      },
    });

    await controller.list({
      q: 'Kartu Keluarga',
      region_id: '11111111-1111-4111-8111-111111111111',
      category_id: 'Administrasi Kependudukan',
      page: 1,
      page_size: 20,
      sort: 'name',
      order: 'asc',
    } as unknown as ListServicesQueryDto);

    expect(catalogService.listServices).toHaveBeenCalledWith({
      q: 'Kartu Keluarga',
      regionId: '11111111-1111-4111-8111-111111111111',
      categoryId: 'Administrasi Kependudukan',
      page: 1,
      pageSize: 20,
      sort: 'name',
      order: 'asc',
    });
  });

  it('wraps service detail in the response envelope', async () => {
    const controller = new ServicesController(catalogService);
    const detail = {
      id: 'service-1',
      slug: 'layanan-contoh',
      name: 'Layanan Contoh',
      summary: null,
      agency: {
        id: 'agency-1',
        name: 'Dinas Contoh',
        region_id: 'region-1',
        description: null,
        channels: [],
      },
      region: {
        id: 'region-1',
        name: 'Kota Contoh',
        type: 'city',
        parent_id: null,
      },
      category: {
        id: 'Administrasi Kependudukan',
        name: 'Administrasi Kependudukan',
      },
      publication_status: 'published',
      current_guide_version: 1,
      source_health: 'available' as const,
      reviewed_at: null,
      channels: [],
      published_at: null,
    };
    catalogService.getService.mockResolvedValue(detail);

    const result = await controller.getService(
      '11111111-1111-4111-8111-111111111111',
    );

    expect(catalogService.getService).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
    );
    expect(result.data).toEqual(detail);
  });
});
