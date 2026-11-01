import { Injectable } from '@nestjs/common';
import {
  ApplicationStatus,
  CompanionReviewStatus,
  Prisma,
  StatusSourceType,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  AddStatusEventRepositoryInput,
  ApplicationRecordWithRelations,
  CreateApplicationRepositoryInput,
  CreateSubmissionSnapshotRepositoryInput,
  IApplicationsRepository,
  ListApplicationsRepositoryInput,
  StatusEventWithActor,
} from './interfaces/applications.repository.interface';

const applicationInclude = {
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
      occurredAt: 'desc' as const,
    },
    take: 1,
  },
};

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
          reviewStatus: input.reviewStatus ?? CompanionReviewStatus.SUBMITTED,
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

      return tx.applicationRecord.findUniqueOrThrow({
        where: { id: record.id },
        include: applicationInclude,
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
      },
      include: applicationInclude,
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

    const sortField =
      input.sort === 'submitted_date'
        ? 'submittedDate'
        : input.sort === 'status'
          ? 'statusSummary'
          : input.sort === 'updated_at'
            ? 'updatedAt'
            : 'createdAt';

    const [items, total] = await Promise.all([
      this.prisma.applicationRecord.findMany({
        where,
        include: applicationInclude,
        orderBy: {
          [sortField]: input.order,
        },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
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
      orderBy: { occurredAt: 'asc' },
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
    officialReference?: string | null,
  ): Promise<ApplicationRecordWithRelations> {
    return this.prisma.applicationRecord.update({
      where: { id: applicationId },
      data: {
        statusSummary: status,
        ...(officialReference !== undefined ? { officialReference } : {}),
      },
      include: applicationInclude,
    });
  }

  async updateReviewStatus(
    applicationId: string,
    reviewStatus: CompanionReviewStatus,
  ): Promise<ApplicationRecordWithRelations> {
    return this.prisma.applicationRecord.update({
      where: { id: applicationId },
      data: {
        reviewStatus,
      },
      include: applicationInclude,
    });
  }

  async linkPreparation(
    applicationId: string,
    preparationId: string,
  ): Promise<ApplicationRecordWithRelations> {
    return this.prisma.applicationRecord.update({
      where: { id: applicationId },
      data: { preparationId },
      include: applicationInclude,
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
  ): Promise<{
    id: string;
    serviceId: string;
    userId: string;
    archivedAt: Date | null;
    deletedAt: Date | null;
  } | null> {
    return this.prisma.preparation.findFirst({
      where: {
        id: preparationId,
        userId,
      },
      select: {
        id: true,
        serviceId: true,
        userId: true,
        archivedAt: true,
        deletedAt: true,
      },
    });
  }

  async findPreparationForSubmission(preparationId: string, userId: string) {
    return this.prisma.preparation.findFirst({
      where: {
        id: preparationId,
        userId,
        deletedAt: null,
      },
      include: {
        service: {
          include: { agency: true, region: true, serviceQuestions: { where: { isActive: true } } },
        },
        guideVersion: true,
        answerVersions: {
          include: { question: true },
          orderBy: { createdAt: 'desc' },
        },
        documentVersions: {
          where: { deletedAt: null },
          orderBy: { versionNumber: 'desc' },
        },
        applicationRecords: true,
      },
    });
  }

  async findUserForSubmission(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        email: true,
        phone: true,
      },
    });
  }

  async findFamilyMember(familyMemberId: string, userId: string) {
    return this.prisma.familyMember.findFirst({
      where: { id: familyMemberId, userId, deletedAt: null },
    });
  }

  async createSubmissionSnapshot(
    input: CreateSubmissionSnapshotRepositoryInput,
  ) {
    return this.prisma.submissionSnapshot.create({
      data: {
        applicationId: input.applicationId,
        preparationId: input.preparationId,
        versionNumber: input.versionNumber,
        conditionKey: input.conditionKey ?? null,
        serviceSnapshotJson: input.serviceSnapshotJson,
        applicantSnapshotJson: input.applicantSnapshotJson,
        answersSnapshotJson: input.answersSnapshotJson,
        documentsSnapshotJson: input.documentsSnapshotJson,
        requiredSlotsJson: input.requiredSlotsJson,
        citizenNote: input.citizenNote ?? null,
        changesSummary: input.changesSummary ?? null,
        consentVersion: input.consentVersion,
        consentedAt: input.consentedAt,
      },
      include: {
        submissionReviews: {
          include: {
            officer: { select: { id: true, displayName: true } },
            itemAssessments: true,
          },
        },
      },
    });
  }

  async findSubmissionSnapshots(applicationId: string) {
    return this.prisma.submissionSnapshot.findMany({
      where: { applicationId },
      orderBy: { versionNumber: 'desc' },
      include: {
        submissionReviews: {
          include: {
            officer: { select: { id: true, displayName: true } },
            itemAssessments: true,
          },
        },
      },
    });
  }

  async findSubmissionSnapshotByVersion(
    applicationId: string,
    versionNumber: number,
  ) {
    return this.prisma.submissionSnapshot.findUnique({
      where: {
        applicationId_versionNumber: {
          applicationId,
          versionNumber,
        },
      },
      include: {
        submissionReviews: {
          include: {
            officer: { select: { id: true, displayName: true } },
            itemAssessments: true,
          },
        },
      },
    });
  }

  async findLatestSubmissionVersion(applicationId: string): Promise<number> {
    const latest = await this.prisma.submissionSnapshot.findFirst({
      where: { applicationId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    });
    return latest?.versionNumber ?? 0;
  }

  async withdrawApplication(
    applicationId: string,
    userId: string,
    reason: string,
  ): Promise<ApplicationRecordWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const app = await tx.applicationRecord.update({
        where: { id: applicationId },
        data: {
          reviewStatus: CompanionReviewStatus.WITHDRAWN,
        },
      });

      await tx.officerAssignment.updateMany({
        where: {
          applicationId,
          endedAt: null,
        },
        data: {
          endedAt: new Date(),
          assignmentStatus: 'ENDED_WITHDRAWN',
        },
      });

      await tx.statusEvent.create({
        data: {
          applicationId,
          actorUserId: userId,
          statusCode: app.statusSummary,
          sourceType: StatusSourceType.CITIZEN_REPORT,
          sourceLabel: 'Warga menarik pengajuan tinjauan',
          description: `Pengajuan tinjauan ditarik oleh warga: ${reason}`,
          occurredAt: new Date(),
        },
      });

      return tx.applicationRecord.findUniqueOrThrow({
        where: { id: applicationId },
        include: applicationInclude,
      });
    });
  }
}
