import { Injectable } from '@nestjs/common';
import {
  GuideVersionStatus,
  RuleVersionStatus,
  ServicePublicationStatus,
  type Prisma,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  ICatalogRepository,
  ListRegionsInput,
  ListServicesInput,
  PaginatedResult,
  RegionRecord,
  ServiceGuideRecord,
  ServiceListRecord,
  ServiceQuestionsRecord,
  ServiceSourcesRecord,
} from './interfaces/catalog.repository.interface';

const ACTIVE_GUIDE_INCLUDE = {
  where: { status: GuideVersionStatus.PUBLISHED },
  orderBy: { versionNumber: 'desc' },
  take: 1,
  include: {
    guideSections: {
      include: {
        guideSourceLinks: {
          include: {
            source: true,
          },
        },
      },
    },
  },
} as const;

const ACTIVE_RULE_INCLUDE = {
  where: { status: RuleVersionStatus.PUBLISHED },
  orderBy: { versionNumber: 'desc' },
  take: 1,
  include: {
    requirements: {
      orderBy: { displayOrder: 'asc' },
      include: {
        source: true,
      },
    },
  },
} as const;

const SERVICE_LIST_INCLUDE = {
  agency: true,
  region: true,
  guideVersions: ACTIVE_GUIDE_INCLUDE,
} as const satisfies Prisma.ServiceInclude;

const SERVICE_GUIDE_INCLUDE = {
  agency: true,
  region: true,
  guideVersions: ACTIVE_GUIDE_INCLUDE,
  requirementRuleVersions: ACTIVE_RULE_INCLUDE,
} as const satisfies Prisma.ServiceInclude;

const SERVICE_QUESTIONS_INCLUDE = {
  requirementRuleVersions: {
    where: { status: RuleVersionStatus.PUBLISHED },
    orderBy: { versionNumber: 'desc' },
    take: 1,
  },
  serviceQuestions: {
    where: {
      isActive: true,
      isPublicNonpersonal: true,
    },
    orderBy: { displayOrder: 'asc' },
  },
} as const satisfies Prisma.ServiceInclude;

const SERVICE_SOURCES_INCLUDE = {
  guideVersions: ACTIVE_GUIDE_INCLUDE,
  requirementRuleVersions: ACTIVE_RULE_INCLUDE,
} as const satisfies Prisma.ServiceInclude;

@Injectable()
export class CatalogRepository implements ICatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listRegions(
    input: ListRegionsInput,
  ): Promise<PaginatedResult<RegionRecord>> {
    const where: Prisma.RegionWhereInput = {
      isActive: true,
    };

    if (input.parentId) {
      where.parentRegionId = input.parentId;
    }

    if (input.type) {
      where.regionType = input.type;
    }

    if (input.q) {
      where.OR = [
        {
          name: {
            contains: input.q,
            mode: 'insensitive',
          },
        },
        {
          code: {
            contains: input.q,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.region.count({ where }),
      this.prisma.region.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
    ]);

    return { items, total };
  }

  async listServices(
    input: ListServicesInput,
  ): Promise<PaginatedResult<ServiceListRecord>> {
    const where: Prisma.ServiceWhereInput = {
      publicationStatus: ServicePublicationStatus.PUBLISHED,
    };

    if (input.regionId) {
      where.regionId = input.regionId;
    }

    if (input.categoryId) {
      where.category = {
        equals: input.categoryId,
        mode: 'insensitive',
      };
    }

    if (input.q) {
      where.OR = [
        {
          name: {
            contains: input.q,
            mode: 'insensitive',
          },
        },
        {
          summary: {
            contains: input.q,
            mode: 'insensitive',
          },
        },
        {
          slug: {
            contains: input.q,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.service.count({ where }),
      this.prisma.service.findMany({
        where,
        orderBy: this.serviceOrderBy(input.sort, input.order),
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        include: SERVICE_LIST_INCLUDE,
      }),
    ]);

    return { items, total };
  }

  async findServiceById(id: string): Promise<ServiceListRecord | null> {
    return this.prisma.service.findFirst({
      where: {
        id,
        publicationStatus: ServicePublicationStatus.PUBLISHED,
      },
      include: SERVICE_LIST_INCLUDE,
    });
  }

  async findServiceGuideById(id: string): Promise<ServiceGuideRecord | null> {
    return this.prisma.service.findFirst({
      where: {
        id,
        publicationStatus: ServicePublicationStatus.PUBLISHED,
      },
      include: SERVICE_GUIDE_INCLUDE,
    });
  }

  async findServiceQuestionsById(
    id: string,
  ): Promise<ServiceQuestionsRecord | null> {
    return this.prisma.service.findFirst({
      where: {
        id,
        publicationStatus: ServicePublicationStatus.PUBLISHED,
      },
      include: SERVICE_QUESTIONS_INCLUDE,
    });
  }

  async findServiceSourcesById(
    id: string,
  ): Promise<ServiceSourcesRecord | null> {
    return this.prisma.service.findFirst({
      where: {
        id,
        publicationStatus: ServicePublicationStatus.PUBLISHED,
      },
      include: SERVICE_SOURCES_INCLUDE,
    });
  }

  private serviceOrderBy(
    sort: ListServicesInput['sort'],
    order: ListServicesInput['order'],
  ): Prisma.ServiceOrderByWithRelationInput {
    if (sort === 'name') {
      return { name: order };
    }

    if (sort === 'created_at') {
      return { createdAt: order };
    }

    return { publishedAt: order };
  }
}
