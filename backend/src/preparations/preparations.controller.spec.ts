import type { AuthenticatedUser } from '../common/types/authenticated-user';
import type { IPreparationsService } from './interfaces/preparations.service.interface';
import { PreparationsController } from './preparations.controller';

const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const PREPARATION_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const SERVICE_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const REGION_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

const mockUser: AuthenticatedUser = {
  id: USER_ID,
  role: 'citizen',
  sessionId: 'session-1',
};

function makePreparationsService(): jest.Mocked<IPreparationsService> {
  return {
    listPreparations: jest.fn(),
    createPreparation: jest.fn(),
    getPreparation: jest.fn(),
    updatePreparation: jest.fn(),
    archivePreparation: jest.fn(),
    getPreparationRequirements: jest.fn(),
  };
}

describe('PreparationsController', () => {
  let preparationsService: jest.Mocked<IPreparationsService>;
  let controller: PreparationsController;

  beforeEach(() => {
    preparationsService = makePreparationsService();
    controller = new PreparationsController(preparationsService);
  });

  it('passes list query parameters to the service', async () => {
    preparationsService.listPreparations.mockResolvedValue({
      data: [],
      meta: {
        page: 1,
        page_size: 20,
        total_items: 0,
        total_pages: 0,
      },
    });

    const result = await controller.list(
      {
        page: 1,
        page_size: 20,
        sort: 'updated_at',
        order: 'desc',
      },
      mockUser,
    );

    expect(preparationsService.listPreparations).toHaveBeenCalledWith({
      userId: USER_ID,
      status: undefined,
      serviceId: undefined,
      page: 1,
      pageSize: 20,
      sort: 'updated_at',
      order: 'desc',
    });
    expect(result.data).toEqual([]);
  });

  it('passes create preparation payload to the service', async () => {
    const detail = {
      id: PREPARATION_ID,
      internal_reference: 'PREP-2026-000001',
      owner_id: USER_ID,
      service_id: SERVICE_ID,
      region_id: REGION_ID,
      guide_version: 1,
      status: 'draft',
      data_version: 1,
      active_inspection_id: null,
      latest_inspection_id: null,
      readiness: 'not_assessed',
      is_archived: false,
      is_stale: false,
      service: { id: SERVICE_ID, name: 'Layanan Uji', slug: 'layanan-uji' },
      region: { id: REGION_ID, name: 'Kota Uji' },
      answers: [],
      documents: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    preparationsService.createPreparation.mockResolvedValue(detail);

    const result = await controller.create(
      {
        service_id: SERVICE_ID,
        region_id: REGION_ID,
        answers: [],
      },
      mockUser,
    );

    expect(preparationsService.createPreparation).toHaveBeenCalledWith({
      userId: USER_ID,
      serviceId: SERVICE_ID,
      guideVersionId: '',
      internalReference: '',
      answers: [],
    });
    expect(result.data).toEqual(detail);
  });

  it('passes get preparation by id to the service', async () => {
    preparationsService.getPreparation.mockResolvedValue({} as any);

    await controller.get(PREPARATION_ID, mockUser);

    expect(preparationsService.getPreparation).toHaveBeenCalledWith(
      PREPARATION_ID,
      USER_ID,
    );
  });

  it('passes update preparation payload to the service', async () => {
    preparationsService.updatePreparation.mockResolvedValue({} as any);

    await controller.update(
      PREPARATION_ID,
      {
        expected_data_version: 1,
        answers: [],
      },
      mockUser,
    );

    expect(preparationsService.updatePreparation).toHaveBeenCalledWith({
      id: PREPARATION_ID,
      userId: USER_ID,
      nextDataVersion: 1,
      expectedDataVersion: 1,
      answers: [],
    });
  });

  it('passes archive preparation to the service', async () => {
    preparationsService.archivePreparation.mockResolvedValue({} as any);

    await controller.archive(PREPARATION_ID, {}, mockUser);

    expect(preparationsService.archivePreparation).toHaveBeenCalledWith(
      PREPARATION_ID,
      USER_ID,
    );
  });

  it('passes get requirements to the service', async () => {
    preparationsService.getPreparationRequirements.mockResolvedValue({
      preparation_id: PREPARATION_ID,
      requirements: [],
      change_notice: null,
    });

    const result = await controller.getRequirements(PREPARATION_ID, mockUser);

    expect(preparationsService.getPreparationRequirements).toHaveBeenCalledWith(
      PREPARATION_ID,
      USER_ID,
    );
    expect(result.data.preparation_id).toBe(PREPARATION_ID);
  });
});
