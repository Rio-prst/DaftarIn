import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateOfficerEventRepositoryInput,
  IOfficerRepository,
  ListOfficerAssignmentsRepositoryInput,
  OfficerApplicationDetailWithRelations,
  OfficerAssignmentWithRelations,
  StatusEventWithActor,
} from './interfaces/officer.repository.interface';

@Injectable()
export class OfficerRepository implements IOfficerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAssignment(applicationId: string, officerUserId: string) {
    return this.prisma.officerAssignment.findFirst({
      where: {
        applicationId,
        officerUserId,
        endedAt: null,
      },
    });
  }

  async listAssignments(
    input: ListOfficerAssignmentsRepositoryInput,
  ): Promise<{ items: OfficerAssignmentWithRelations[]; total: number }> {
    const where: Prisma.OfficerAssignmentWhereInput = {
      officerUserId: input.officerUserId,
      endedAt: null,
      ...(input.status ? { assignmentStatus: input.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.officerAssignment.findMany({
        where,
        orderBy: { assignedAt: 'desc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        include: {
          application: {
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
                },
              },
              user: {
                select: {
                  id: true,
                  displayName: true,
                },
              },
              statusEvents: {
                orderBy: {
                  occurredAt: 'desc',
                },
                take: 1,
              },
            },
          },
        },
      }),
      this.prisma.officerAssignment.count({ where }),
    ]);

    return { items, total };
  }

  async findApplicationDetail(
    applicationId: string,
  ): Promise<OfficerApplicationDetailWithRelations | null> {
    return this.prisma.applicationRecord.findUnique({
      where: { id: applicationId },
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
          },
        },
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
        statusEvents: {
          orderBy: {
            occurredAt: 'asc',
          },
          include: {
            actor: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
  }

  async createOfficerEvent(
    input: CreateOfficerEventRepositoryInput,
  ): Promise<StatusEventWithActor> {
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.statusEvent.create({
        data: {
          applicationId: input.applicationId,
          actorUserId: input.actorUserId,
          statusCode: input.statusCode,
          sourceType: input.sourceType,
          sourceLabel: input.sourceLabel,
          description: input.description ?? null,
          revisionReason: input.revisionReason ?? null,
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

      await tx.applicationRecord.update({
        where: { id: input.applicationId },
        data: {
          statusSummary: input.statusCode,
          sourceMode: input.sourceType,
        },
      });

      await tx.notification.create({
        data: {
          userId: input.citizenUserId,
          applicationId: input.applicationId,
          notificationType: input.notification.notificationType,
          title: input.notification.title,
          body: input.notification.body,
          targetPath: input.notification.targetPath,
        },
      });

      return event;
    });
  }
}
