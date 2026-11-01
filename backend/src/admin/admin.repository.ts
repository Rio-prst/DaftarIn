import { Injectable } from '@nestjs/common';
import { GuideVersionStatus, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  AdminServiceWithRelations,
  CreateGuideVersionRepositoryInput,
  CreateServiceRepositoryInput,
  IAdminRepository,
  ListAdminServicesRepositoryInput,
  ListAuditEventsRepositoryInput,
  OfficerWithRoles,
  RecordAuditEventInput,
  RoleAssignmentInput,
  UpdateServiceRepositoryInput,
} from './interfaces/admin.repository.interface';

@Injectable()
export class AdminRepository implements IAdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listServices(
    input: ListAdminServicesRepositoryInput,
  ): Promise<{ items: AdminServiceWithRelations[]; total: number }> {
    const where: Prisma.ServiceWhereInput = {
      ...(input.q
        ? {
            OR: [
              { name: { contains: input.q, mode: 'insensitive' } },
              { slug: { contains: input.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(input.publicationStatus
        ? { publicationStatus: input.publicationStatus }
        : {}),
      ...(input.regionId ? { regionId: input.regionId } : {}),
      ...(input.agencyId ? { agencyId: input.agencyId } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        include: {
          agency: {
            select: {
              id: true,
              name: true,
            },
          },
          region: {
            select: {
              id: true,
              name: true,
            },
          },
          guideVersions: {
            orderBy: {
              versionNumber: 'desc',
            },
            take: 1,
          },
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return { items, total };
  }

  async findServiceById(id: string): Promise<AdminServiceWithRelations | null> {
    return this.prisma.service.findUnique({
      where: { id },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
        region: {
          select: {
            id: true,
            name: true,
          },
        },
        guideVersions: {
          orderBy: {
            versionNumber: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  async findServiceBySlug(slug: string) {
    return this.prisma.service.findUnique({
      where: { slug },
    });
  }

  async createService(
    input: CreateServiceRepositoryInput,
  ): Promise<AdminServiceWithRelations> {
    const record = await this.prisma.service.create({
      data: {
        name: input.name,
        slug: input.slug,
        category: input.category,
        agencyId: input.agencyId,
        regionId: input.regionId,
        summary: input.summary ?? null,
      },
    });

    return this.findServiceById(
      record.id,
    ) as Promise<AdminServiceWithRelations>;
  }

  async updateService(
    id: string,
    input: UpdateServiceRepositoryInput,
  ): Promise<AdminServiceWithRelations> {
    await this.prisma.service.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.category ? { category: input.category } : {}),
        ...(input.summary !== undefined ? { summary: input.summary } : {}),
        ...(input.publicationStatus
          ? { publicationStatus: input.publicationStatus }
          : {}),
      },
    });

    return this.findServiceById(id) as Promise<AdminServiceWithRelations>;
  }

  async findLatestGuideVersionNumber(serviceId: string): Promise<number> {
    const latest = await this.prisma.guideVersion.findFirst({
      where: { serviceId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    });
    return latest?.versionNumber ?? 0;
  }

  async createGuideVersion(input: CreateGuideVersionRepositoryInput) {
    return this.prisma.guideVersion.create({
      data: {
        serviceId: input.serviceId,
        versionNumber: input.versionNumber,
        status: GuideVersionStatus.DRAFT,
        procedureJson: input.procedureJson,
        officialCostJson: input.officialCostJson ?? Prisma.DbNull,
        officialDurationJson: input.officialDurationJson ?? Prisma.DbNull,
        sourceReviewedAt: input.sourceReviewedAt ?? null,
        createdById: input.createdById ?? null,
      },
    });
  }

  async findGuideVersionById(id: string) {
    return this.prisma.guideVersion.findUnique({
      where: { id },
    });
  }

  async publishGuideVersion(
    guideVersionId: string,
    serviceId: string,
    publishedAt: Date,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Archive previously published version
      await tx.guideVersion.updateMany({
        where: {
          serviceId,
          status: GuideVersionStatus.PUBLISHED,
        },
        data: {
          status: GuideVersionStatus.ARCHIVED,
        },
      });

      // Publish the targeted guide version
      const published = await tx.guideVersion.update({
        where: { id: guideVersionId },
        data: {
          status: GuideVersionStatus.PUBLISHED,
          publishedAt,
        },
      });

      // Also ensure the service is marked as PUBLISHED
      await tx.service.update({
        where: { id: serviceId },
        data: {
          publicationStatus: 'PUBLISHED',
          publishedAt,
        },
      });

      return published;
    });
  }

  async listOfficers(query: {
    page: number;
    pageSize: number;
  }): Promise<{ items: OfficerWithRoles[]; total: number }> {
    const where: Prisma.UserWhereInput = {
      userRoles: {
        some: {
          role: {
            roleCode: 'officer',
          },
          isActive: true,
        },
      },
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { displayName: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          userRoles: {
            include: {
              role: true,
              agency: { select: { id: true, name: true } },
              region: { select: { id: true, name: true } },
            },
          },
          officerAssignments: {
            where: { endedAt: null },
            select: { id: true, applicationId: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async findRoleByCode(code: string) {
    return this.prisma.role.findUnique({
      where: { roleCode: code },
    });
  }

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async updateUserRoleAssignments(
    userId: string,
    assignments: RoleAssignmentInput[],
    assignedById: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of assignments) {
        const role = await tx.role.findUnique({
          where: { roleCode: item.roleCode },
        });
        if (!role) continue;

        const existing = await tx.userRole.findFirst({
          where: {
            userId,
            roleId: role.id,
          },
        });

        if (existing) {
          await tx.userRole.update({
            where: { id: existing.id },
            data: {
              agencyId: item.agencyId ?? null,
              regionId: item.regionId ?? null,
              isActive: item.isActive,
              assignedById,
            },
          });
        } else {
          await tx.userRole.create({
            data: {
              userId,
              roleId: role.id,
              agencyId: item.agencyId ?? null,
              regionId: item.regionId ?? null,
              isActive: item.isActive,
              assignedById,
            },
          });
        }
      }

      return tx.userRole.findMany({
        where: { userId },
        include: {
          role: true,
        },
      });
    });
  }

  async createOfficerAssignment(applicationId: string, officerUserId: string) {
    return this.prisma.officerAssignment.create({
      data: {
        applicationId,
        officerUserId,
        assignmentStatus: 'ACTIVE',
      },
    });
  }

  async recordAuditEvent(input: RecordAuditEventInput) {
    return this.prisma.auditEvent.create({
      data: {
        actorUserId: input.actorUserId ?? null,
        actorRole: input.actorRole,
        action: input.action,
        objectType: input.objectType,
        objectId: input.objectId,
        requestId: input.requestId ?? 'system',
        outcome: input.outcome,
        metadataJson: input.metadataJson,
      },
    });
  }

  async listAuditEvents(input: ListAuditEventsRepositoryInput) {
    const where: Prisma.AuditEventWhereInput = {
      ...(input.actorId ? { actorUserId: input.actorId } : {}),
      ...(input.action ? { action: input.action } : {}),
      ...(input.objectType ? { objectType: input.objectType } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.auditEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prisma.auditEvent.count({ where }),
    ]);

    return { items, total };
  }
}
