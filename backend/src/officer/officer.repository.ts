import { Injectable } from '@nestjs/common';
import {
  ApplicationStatus,
  AssessmentItemType,
  AssessmentVerdict,
  CompanionReviewStatus,
  DocumentVersion,
  Prisma,
  StatusSourceType,
  SubmissionReviewStatus,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateOfficerEventRepositoryInput,
  IOfficerRepository,
  ListOfficerAssignmentsRepositoryInput,
  OfficerApplicationDetailWithRelations,
  OfficerAssignmentWithRelations,
  StatusEventWithActor,
  SaveEvaluationDraftInput,
  SubmitDecisionInput,
  CreateEscalationInput,
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

  async findApplicationDocuments(
    applicationId: string,
  ): Promise<DocumentVersion[]> {
    const app = await this.prisma.applicationRecord.findUnique({
      where: { id: applicationId },
      select: { preparationId: true },
    });

    if (!app?.preparationId) {
      return [];
    }

    return this.prisma.documentVersion.findMany({
      where: {
        preparationId: app.preparationId,
        deletedAt: null,
      },
      orderBy: {
        versionNumber: 'desc',
      },
    });
  }

  async findApplicationDocument(
    applicationId: string,
    documentId: string,
  ): Promise<DocumentVersion | null> {
    const app = await this.prisma.applicationRecord.findUnique({
      where: { id: applicationId },
      select: { preparationId: true },
    });

    if (!app?.preparationId) {
      return null;
    }

    return this.prisma.documentVersion.findFirst({
      where: {
        id: documentId,
        preparationId: app.preparationId,
        deletedAt: null,
      },
    });
  }

  async findLatestSubmissionSnapshot(applicationId: string) {
    return this.prisma.submissionSnapshot.findFirst({
      where: { applicationId },
      orderBy: { versionNumber: 'desc' },
      include: {
        submissionReviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            itemAssessments: true,
          },
        },
      },
    });
  }

  async saveEvaluationDraft(input: SaveEvaluationDraftInput) {
    return this.prisma.$transaction(async (tx) => {
      let review = await tx.submissionReview.findFirst({
        where: {
          submissionSnapshotId: input.submissionSnapshotId,
          officerUserId: input.officerUserId,
        },
      });

      if (!review) {
        review = await tx.submissionReview.create({
          data: {
            submissionSnapshotId: input.submissionSnapshotId,
            officerUserId: input.officerUserId,
            reviewStatus: SubmissionReviewStatus.DRAFT,
            overallNotes: input.overallNotes ?? null,
          },
        });
      } else {
        review = await tx.submissionReview.update({
          where: { id: review.id },
          data: {
            overallNotes: input.overallNotes ?? null,
          },
        });
      }

      await tx.itemAssessment.deleteMany({
        where: { submissionReviewId: review.id },
      });

      if (input.items.length > 0) {
        await tx.itemAssessment.createMany({
          data: input.items.map((item) => ({
            submissionReviewId: review.id,
            itemType: item.itemType as AssessmentItemType,
            itemId: item.itemId,
            verdict: item.verdict as AssessmentVerdict,
            note: item.note ?? '',
          })),
        });
      }

      return tx.submissionReview.findUniqueOrThrow({
        where: { id: review.id },
        include: { itemAssessments: true },
      });
    });
  }

  async submitDecision(input: SubmitDecisionInput) {
    return this.prisma.$transaction(async (tx) => {
      const isApproved = input.decision === 'approved_for_submission';
      const subReviewStatus = isApproved
        ? SubmissionReviewStatus.COMPLETED
        : SubmissionReviewStatus.NEEDS_REVISION;

      const compStatus = isApproved
        ? CompanionReviewStatus.REVIEW_COMPLETED
        : CompanionReviewStatus.REVISION_REQUESTED;

      const appStatus = isApproved
        ? ApplicationStatus.ACCEPTED
        : ApplicationStatus.NEEDS_CORRECTION;

      let review = await tx.submissionReview.findFirst({
        where: {
          submissionSnapshotId: input.submissionSnapshotId,
          officerUserId: input.officerUserId,
        },
      });

      if (!review) {
        review = await tx.submissionReview.create({
          data: {
            submissionSnapshotId: input.submissionSnapshotId,
            officerUserId: input.officerUserId,
            reviewStatus: subReviewStatus,
            decidedAt: new Date(),
            overallNotes: input.overallNotes ?? null,
          },
        });
      } else {
        review = await tx.submissionReview.update({
          where: { id: review.id },
          data: {
            reviewStatus: subReviewStatus,
            decidedAt: new Date(),
            overallNotes: input.overallNotes ?? null,
          },
        });
      }

      await tx.itemAssessment.deleteMany({
        where: { submissionReviewId: review.id },
      });

      if (input.items.length > 0) {
        await tx.itemAssessment.createMany({
          data: input.items.map((item) => ({
            submissionReviewId: review.id,
            itemType: item.itemType as AssessmentItemType,
            itemId: item.itemId,
            verdict: item.verdict as AssessmentVerdict,
            note: item.note ?? '',
          })),
        });
      }

      // reviewStatus is tracked on submission_review and application_record

      const app = await tx.applicationRecord.update({
        where: { id: input.applicationId },
        data: {
          reviewStatus: compStatus,
          statusSummary: appStatus,
          version: { increment: 1 },
        },
        include: { user: true },
      });

      const eventDescription = isApproved
        ? 'Hasil tinjauan berkas pendamping: Disetujui untuk diajukan ke instansi.'
        : input.overallNotes || 'Permintaan perbaikan berkas dari pendamping.';

      await tx.statusEvent.create({
        data: {
          applicationId: input.applicationId,
          actorUserId: input.officerUserId,
          statusCode: appStatus,
          sourceType: StatusSourceType.OFFICER,
          sourceLabel: 'Pendamping (DaftarIn)',
          description: eventDescription,
          revisionReason: !isApproved ? input.overallNotes : null,
          occurredAt: new Date(),
          metadataJson: {
            decision: input.decision,
            itemsCount: input.items.length,
          },
        },
      });

      const notificationTitle = isApproved
        ? 'Tinjauan Pendamping Selesai'
        : 'Perbaikan Berkas Diperlukan';
      const notificationBody = isApproved
        ? 'Berkas Anda telah diperiksa dan disetujui untuk diajukan ke instansi resmi.'
        : 'Pendamping meminta perbaikan pada berkas pengajuan Anda. Silakan periksa catatan revisi.';
      const targetPath = isApproved
        ? `/applications/${input.applicationId}`
        : `/applications/${input.applicationId}/revisions`;

      await tx.notification.create({
        data: {
          userId: app.userId,
          applicationId: input.applicationId,
          notificationType: isApproved
            ? 'companion_approved'
            : 'companion_revision',
          title: notificationTitle,
          body: notificationBody,
          targetPath,
        },
      });

      return {
        decision: input.decision,
        reviewStatus: subReviewStatus,
        decidedAt: new Date(),
        application_id: input.applicationId,
      };
    });
  }

  async createEscalation(input: CreateEscalationInput) {
    return this.prisma.$transaction(async (tx) => {
      const escalation = await tx.officerEscalation.create({
        data: {
          applicationId: input.applicationId,
          officerUserId: input.officerUserId,
          reason: input.reason,
          urgency: 'NORMAL',
          status: 'OPEN',
        },
      });

      await tx.statusEvent.create({
        data: {
          applicationId: input.applicationId,
          actorUserId: input.officerUserId,
          statusCode: ApplicationStatus.VERIFICATION,
          sourceType: StatusSourceType.OFFICER,
          sourceLabel: 'Petugas Pendamping',
          description: `Eskalasi ke ${input.targetRole}: ${input.reason}`,
          occurredAt: new Date(),
          metadataJson: { escalationId: escalation.id },
        },
      });

      return escalation;
    });
  }
}
