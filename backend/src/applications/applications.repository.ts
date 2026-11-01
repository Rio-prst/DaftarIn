import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus, Prisma } from '../generated/prisma/client';
import type {
  AddStatusEventRepositoryInput,
  ApplicationRecordWithRelations,
  CreateApplicationRepositoryInput,
  IApplicationsRepository,
  ListApplicationsRepositoryInput,
  StatusEventWithActor,
} from './interfaces/applications.repository.interface';

@Injectable()
export class ApplicationsRepository implements IApplicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    input: CreateApplicationRepositoryInput,
  ): Promise<ApplicationRecordWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const record = await tx.applicationRecord.create({
        data: {
          userId: input.userId,
          serviceId: input.serviceId,
          agencyId: input.agencyId,
          preparationId: input.preparationId ?? null,
          internalReference: input.internalReference,
          officialReference: input.officialReference ?? null,
          submittedDate: input.submittedDate ?? null,
          submissionChannel: input.submissionChannel,
          sourceMode: input.sourceMode,
          statusSummary: input.statusSummary,
          citizenNotes: input.citizenNotes ?? null,
        },
      });

      await tx.statusEvent.create({
        data: {
          applicationId: record.id,
          actorUserId: input.userId,
          statusCode: input.initialEvent.statusCode,
          sourceType: input.initialEvent.sourceType,
          sourceLabel: input.initialEvent.sourceLabel,
          description: input.initialEvent.description ?? null,
          occurredAt: input.initialEvent.occurredAt,
          metadataJson: input.initialEvent.metadataJson ?? Prisma.DbNull,
        },
      });

      // Auto-assign active officer for this agency or any active officer
      const officerRole = await tx.userRole.findFirst({
        where: {
          agencyId: input.agencyId,
          role: { roleCode: 'officer' },
          user: { accountStatus: 'ACTIVE' },
        },
        select: { userId: true },
      });

      const targetOfficerId =
        officerRole?.userId ??
        (
          await tx.userRole.findFirst({
            where: {
              role: { roleCode: 'officer' },
              user: { accountStatus: 'ACTIVE' },
            },
            select: { userId: true },
          })
        )?.userId;

      if (targetOfficerId) {
        await tx.officerAssignment.create({
          data: {
            applicationId: record.id,
            officerUserId: targetOfficerId,
            assignmentStatus: 'active',
            assignedAt: input.submittedDate ?? new Date(),
          },
        });
      }

      return tx.applicationRecord.findUniqueOrThrow({
        where: { id: record.id },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              category: true,
              slug: true,
            },
          },
          agency: {
            select: {
              id: true,
              name: true,
              agencyType: true,
            },
          },
          preparation: {
            select: {
              id: true,
              internalReference: true,
              status: true,
            },
          },
          statusEvents: {
            orderBy: {
              occurredAt: 'desc',
            },
            take: 1,
          },
        },
      });
    });
  }

  async findById(
    id: string,
    userId?: string,
  ): Promise<ApplicationRecordWithRelations | null> {
    return this.prisma.applicationRecord.findFirst({
      where: {
        id,
        ...(userId ? { userId } : {}),
        archivedAt: null,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            category: true,
            slug: true,
          },
        },
        agency: {
          select: {
            id: true,
            name: true,
            agencyType: true,
          },
        },
        preparation: {
          select: {
            id: true,
            internalReference: true,
            status: true,
          },
        },
        statusEvents: {
          orderBy: {
            occurredAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  async list(input: ListApplicationsRepositoryInput): Promise<{
    items: ApplicationRecordWithRelations[];
    total: number;
  }> {
    const where: Prisma.ApplicationRecordWhereInput = {
      userId: input.userId,
      archivedAt: null,
      ...(input.serviceId ? { serviceId: input.serviceId } : {}),
      ...(input.status ? { statusSummary: input.status } : {}),
      ...(input.sourceMode ? { sourceMode: input.sourceMode } : {}),
    };

    const orderBy: Prisma.ApplicationRecordOrderByWithRelationInput = {
      created_at: { createdAt: input.order },
      updated_at: { updatedAt: input.order },
      submitted_date: { submittedDate: input.order },
      status: { statusSummary: input.order },
    }[input.sort];

    const [items, total] = await Promise.all([
      this.prisma.applicationRecord.findMany({
        where,
        orderBy,
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              category: true,
              slug: true,
            },
          },
          agency: {
            select: {
              id: true,
              name: true,
              agencyType: true,
            },
          },
          preparation: {
            select: {
              id: true,
              internalReference: true,
              status: true,
            },
          },
          statusEvents: {
            orderBy: {
              occurredAt: 'desc',
            },
            take: 1,
          },
        },
      }),
      this.prisma.applicationRecord.count({ where }),
    ]);

    return { items, total };
  }

  async addStatusEvent(
    input: AddStatusEventRepositoryInput,
  ): Promise<StatusEventWithActor> {
    return this.prisma.statusEvent.create({
      data: {
        applicationId: input.applicationId,
        actorUserId: input.actorUserId ?? null,
        statusCode: input.statusCode,
        sourceType: input.sourceType,
        sourceLabel: input.sourceLabel,
        description: input.description ?? null,
        occurredAt: input.occurredAt,
        metadataJson: input.metadataJson ?? Prisma.DbNull,
      },
      include: {
        actor: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });
  }

  async listStatusEvents(
    applicationId: string,
  ): Promise<StatusEventWithActor[]> {
    return this.prisma.statusEvent.findMany({
      where: { applicationId },
      orderBy: [{ occurredAt: 'asc' }, { recordedAt: 'asc' }],
      include: {
        actor: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });
  }

  async updateStatus(
    applicationId: string,
    status: ApplicationStatus,
  ): Promise<ApplicationRecordWithRelations> {
    return this.prisma.applicationRecord.update({
      where: { id: applicationId },
      data: { statusSummary: status },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            category: true,
            slug: true,
          },
        },
        agency: {
          select: {
            id: true,
            name: true,
            agencyType: true,
          },
        },
        preparation: {
          select: {
            id: true,
            internalReference: true,
            status: true,
          },
        },
        statusEvents: {
          orderBy: {
            occurredAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  async linkPreparation(
    applicationId: string,
    preparationId: string,
  ): Promise<ApplicationRecordWithRelations> {
    return this.prisma.applicationRecord.update({
      where: { id: applicationId },
      data: { preparationId },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            category: true,
            slug: true,
          },
        },
        agency: {
          select: {
            id: true,
            name: true,
            agencyType: true,
          },
        },
        preparation: {
          select: {
            id: true,
            internalReference: true,
            status: true,
          },
        },
        statusEvents: {
          orderBy: {
            occurredAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  async updateOfficialSubmission(
    id: string,
    data: {
      officialNumber?: string | null;
      channel?: string | null;
      submittedDate?: Date | null;
      citizenNotes?: string | null;
      statusSummary?: ApplicationStatus;
    },
  ): Promise<ApplicationRecordWithRelations> {
    return this.prisma.applicationRecord.update({
      where: { id },
      data: {
        ...(data.officialNumber !== undefined
          ? { officialReference: data.officialNumber }
          : {}),
        ...(data.submittedDate ? { submittedDate: data.submittedDate } : {}),
        ...(data.citizenNotes !== undefined
          ? { citizenNotes: data.citizenNotes }
          : {}),
        ...(data.statusSummary ? { statusSummary: data.statusSummary } : {}),
      },
      include: {
        service: {
          select: { id: true, name: true, category: true, slug: true },
        },
        agency: {
          select: { id: true, name: true, agencyType: true },
        },
        preparation: {
          select: { id: true, internalReference: true, status: true },
        },
        statusEvents: {
          orderBy: { occurredAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async findServiceById(
    serviceId: string,
  ): Promise<{ id: string; agencyId: string; name: string } | null> {
    return this.prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        agencyId: true,
        name: true,
      },
    });
  }

  async findPreparationById(
    preparationId: string,
    userId: string,
  ) {
    return this.prisma.preparation.findFirst({
      where: {
        id: preparationId,
        userId,
      },
      include: {
        answerVersions: {
          include: {
            question: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        documentVersions: {
          where: { deletedAt: null },
          orderBy: { versionNumber: 'desc' },
        },
      },
    });
  }
}
