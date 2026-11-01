import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApplicationStatus, Prisma, StatusSourceType } from '../generated/prisma/client';
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

  async getSummary(officerUserId: string): Promise<{
    total_assigned: number;
    pending_review: number;
    in_review: number;
    needs_correction: number;
    completed: number;
  }> {
    const activeAssignments = await this.prisma.officerAssignment.findMany({
      where: { officerUserId, endedAt: null },
      include: {
        application: {
          select: { statusSummary: true },
        },
      },
    });

    let pending_review = 0;
    let in_review = 0;
    let needs_correction = 0;
    let completed = 0;

    for (const a of activeAssignments) {
      const s = a.application.statusSummary;
      if (
        s === ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED ||
        s === ApplicationStatus.ACCEPTED
      ) {
        pending_review++;
      } else if (
        s === ApplicationStatus.VERIFICATION ||
        s === ApplicationStatus.PROCESSING
      ) {
        in_review++;
      } else if (s === ApplicationStatus.NEEDS_CORRECTION) {
        needs_correction++;
      } else if (
        s === ApplicationStatus.COMPLETED ||
        s === ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN
      ) {
        completed++;
      }
    }

    return {
      total_assigned: activeAssignments.length,
      pending_review,
      in_review,
      needs_correction,
      completed,
    };
  }

  async assignOfficer(
    applicationId: string,
    officerUserId: string,
    assignerUserId: string,
    reason?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.officerAssignment.updateMany({
        where: {
          applicationId,
          endedAt: null,
        },
        data: {
          endedAt: new Date(),
          assignmentStatus: 'transferred',
        },
      });

      const newAssignment = await tx.officerAssignment.create({
        data: {
          applicationId,
          officerUserId,
          assignmentStatus: 'active',
          assignedAt: new Date(),
        },
      });

      await tx.auditEvent.create({
        data: {
          actorUserId: assignerUserId,
          actorRole: 'system',
          action: 'OFFICER_ASSIGNMENT_TRANSFER',
          objectType: 'application',
          objectId: applicationId,
          requestId: randomUUID(),
          outcome: 'success',
          metadataJson: {
            assignedOfficerId: officerUserId,
            reason: reason ?? 'Penugasan petugas pengajuan.',
          },
        },
      });

      return newAssignment;
    });
  }

  async saveEvaluation(
    applicationId: string,
    officerUserId: string,
    evaluationJson: Prisma.InputJsonValue,
  ): Promise<StatusEventWithActor> {
    return this.prisma.statusEvent.create({
      data: {
        applicationId,
        actorUserId: officerUserId,
        statusCode: ApplicationStatus.VERIFICATION,
        sourceType: StatusSourceType.OFFICER,
        sourceLabel: 'Petugas — Penilaian Berkas Sementara',
        description: 'Petugas menyimpan penilaian sementara berkas.',
        occurredAt: new Date(),
        metadataJson: {
          evaluation_draft: evaluationJson,
        },
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

  async getLatestEvaluation(applicationId: string): Promise<Prisma.JsonValue | null> {
    const event = await this.prisma.statusEvent.findFirst({
      where: {
        applicationId,
        sourceType: StatusSourceType.OFFICER,
      },
      orderBy: { occurredAt: 'desc' },
      select: { metadataJson: true },
    });
    if (!event || typeof event.metadataJson !== 'object' || event.metadataJson === null) {
      return null;
    }
    const meta = event.metadataJson as Record<string, unknown>;
    return (meta.evaluation_draft ?? meta.revision_request ?? null) as Prisma.JsonValue;
  }
}
