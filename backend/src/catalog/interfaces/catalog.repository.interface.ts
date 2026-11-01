import type { Prisma, Region } from '../../generated/prisma/client';

export const CATALOG_REPOSITORY = Symbol('CATALOG_REPOSITORY');

export type PaginatedResult<T> = {
  items: T[];
  total: number;
};

export type RegionRecord = Region;

export type ServiceListRecord = Prisma.ServiceGetPayload<{
  include: {
    agency: true;
    region: true;
    guideVersions: {
      include: {
        guideSections: {
          include: {
            guideSourceLinks: {
              include: {
                source: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export type ServiceGuideRecord = Prisma.ServiceGetPayload<{
  include: {
    agency: true;
    region: true;
    guideVersions: {
      include: {
        guideSections: {
          include: {
            guideSourceLinks: {
              include: {
                source: true;
              };
            };
          };
        };
      };
    };
    requirementRuleVersions: {
      include: {
        requirements: {
          include: {
            source: true;
          };
        };
      };
    };
  };
}>;

export type ServiceQuestionsRecord = Prisma.ServiceGetPayload<{
  include: {
    requirementRuleVersions: true;
    serviceQuestions: true;
  };
}>;

export type ServiceSourcesRecord = Prisma.ServiceGetPayload<{
  include: {
    guideVersions: {
      include: {
        guideSections: {
          include: {
            guideSourceLinks: {
              include: {
                source: true;
              };
            };
          };
        };
      };
    };
    requirementRuleVersions: {
      include: {
        requirements: {
          include: {
            source: true;
          };
        };
      };
    };
  };
}>;

export type ListRegionsInput = {
  q?: string;
  parentId?: string;
  type?: string;
  page: number;
  pageSize: number;
};

export type ListServicesInput = {
  q?: string;
  regionId?: string;
  categoryId?: string;
  page: number;
  pageSize: number;
  sort: 'name' | 'published_at' | 'created_at';
  order: 'asc' | 'desc';
};

export interface ICatalogRepository {
  listRegions(input: ListRegionsInput): Promise<PaginatedResult<RegionRecord>>;
  listServices(
    input: ListServicesInput,
  ): Promise<PaginatedResult<ServiceListRecord>>;
  findServiceById(id: string): Promise<ServiceListRecord | null>;
  findServiceGuideById(id: string): Promise<ServiceGuideRecord | null>;
  findServiceQuestionsById(id: string): Promise<ServiceQuestionsRecord | null>;
  findServiceSourcesById(id: string): Promise<ServiceSourcesRecord | null>;
}
