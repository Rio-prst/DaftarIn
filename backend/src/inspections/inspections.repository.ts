import { Injectable } from '@nestjs/common';
import {
  FindingResolutionStatus,
  InspectionStatus,
  PreparationStatus,
  type Finding,
  type UserCorrection,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateFindingRepositoryInput,
  CreateInspectionRunRepositoryInput,
  CreateUserCorrectionRepositoryInput,
  FindingWithRelations,
  IInspectionsRepository,
  InspectionRunWithRuleVersion,
  UpdateInspectionRunRepositoryInput,
} from './interfaces/inspections.repository.interface';

const findingInclude = {
  documentVersion: {
    select: {
      id: true,
      versionNumber: true,
      originalFilename: true,
    },
  },
  requirement: {
    include: {
      source: {
        select: {
          id: true,
          title: true,
          url: true,
        },
      },
    },
  },
  inspectionRun: {
    include: {
      ruleVersion: {
        select: {
          id: true,
          versionNumber: true,
        },
      },
    },
  },
  userCorrections: {
    orderBy: {
      createdAt: 'desc' as const,
    },
    take: 1,
  },
};

const runInclude = {
  ruleVersion: {
    select: {
      id: true,
      versionNumber: true,
    },
  },
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

@Injectable()
export class InspectionsRepository implements IInspectionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveRun(
    preparationId: string,
  ): Promise<InspectionRunWithRuleVersion | null> {
    return this.prisma.inspectionRun.findFirst({
      where: {
        preparationId,
        status: {
          in: [InspectionStatus.QUEUED, InspectionStatus.RUNNING],
        },
      },
      include: runInclude,
      orderBy: {
        queuedAt: 'desc',
      },
    });
  }

  async findByIdempotencyKey(
    preparationId: string,
    idempotencyKey: string,
  ): Promise<InspectionRunWithRuleVersion | null> {
    const runs = await this.prisma.inspectionRun.findMany({
      where: { preparationId },
      include: runInclude,
      orderBy: { queuedAt: 'desc' },
      take: 20,
    });

    return (
      runs.find(
        (run) =>
          asRecord(run.inputSnapshotJson).idempotency_key === idempotencyKey,
      ) ?? null
    );
  }

  async createRun(
    input: CreateInspectionRunRepositoryInput,
  ): Promise<InspectionRunWithRuleVersion> {
    return this.prisma.inspectionRun.create({
      data: {
        preparationId: input.preparationId,
        userId: input.userId,
        guideVersionId: input.guideVersionId,
        ruleVersionId: input.ruleVersionId,
        dataVersion: input.dataVersion,
        status: InspectionStatus.RUNNING,
        engineVersion: input.engineVersion,
        inputSnapshotJson: input.inputSnapshotJson,
        startedAt: new Date(),
      },
      include: runInclude,
    });
  }

  async updateRun(
    inspectionRunId: string,
    input: UpdateInspectionRunRepositoryInput,
  ): Promise<InspectionRunWithRuleVersion> {
    return this.prisma.inspectionRun.update({
      where: { id: inspectionRunId },
      data: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.modelVersion !== undefined
          ? { modelVersion: input.modelVersion }
          : {}),
        ...(input.summaryJson !== undefined
          ? { summaryJson: input.summaryJson }
          : {}),
        ...(input.failureCode !== undefined
          ? { failureCode: input.failureCode }
          : {}),
        ...(input.startedAt ? { startedAt: input.startedAt } : {}),
        ...(input.completedAt ? { completedAt: input.completedAt } : {}),
      },
      include: runInclude,
    });
  }

  async findRunById(
    preparationId: string,
    inspectionRunId: string,
    userId: string,
  ): Promise<InspectionRunWithRuleVersion | null> {
    return this.prisma.inspectionRun.findFirst({
      where: {
        id: inspectionRunId,
        preparationId,
        userId,
      },
      include: runInclude,
    });
  }

  async listRuns(
    preparationId: string,
  ): Promise<InspectionRunWithRuleVersion[]> {
    return this.prisma.inspectionRun.findMany({
      where: { preparationId },
      include: runInclude,
      orderBy: { queuedAt: 'desc' },
      take: 20,
    });
  }

  async failStaleRuns(preparationId: string, before: Date): Promise<number> {
    const result = await this.prisma.inspectionRun.updateMany({
      where: {
        preparationId,
        status: {
          in: [InspectionStatus.QUEUED, InspectionStatus.RUNNING],
        },
        queuedAt: { lt: before },
      },
      data: {
        status: InspectionStatus.FAILED,
        failureCode: 'INSPECTION_STALE',
        completedAt: new Date(),
      },
    });

    return result.count;
  }

  async createFindings(input: CreateFindingRepositoryInput[]): Promise<void> {
    if (input.length === 0) return;
    await this.prisma.finding.createMany({
      data: input.map((finding) => ({
        inspectionRunId: finding.inspectionRunId,
        requirementId: finding.requirementId,
        documentVersionId: finding.documentVersionId ?? null,
        findingCode: finding.findingCode,
        severity: finding.severity,
        category: finding.category,
        title: finding.title,
        explanation: finding.explanation,
        evidenceJson: finding.evidenceJson,
        suggestedActionsJson: finding.suggestedActionsJson,
        readingConfidence: finding.readingConfidence ?? null,
        resolutionStatus: finding.resolutionStatus,
      })),
    });
  }

  async listFindings(inspectionRunId: string): Promise<FindingWithRelations[]> {
    return this.prisma.finding.findMany({
      where: { inspectionRunId },
      include: findingInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findFinding(
    preparationId: string,
    findingId: string,
    userId: string,
  ): Promise<FindingWithRelations | null> {
    return this.prisma.finding.findFirst({
      where: {
        id: findingId,
        inspectionRun: {
          preparationId,
          userId,
        },
      },
      include: findingInclude,
    });
  }

  async createCorrection(
    input: CreateUserCorrectionRepositoryInput,
  ): Promise<UserCorrection> {
    return this.prisma.userCorrection.create({
      data: {
        findingId: input.findingId,
        userId: input.userId,
        originalValueJson: input.originalValueJson,
        correctedValueJson: input.correctedValueJson,
        correctionNote: input.correctionNote ?? null,
      },
    });
  }

  async updateFindingResolution(
    findingId: string,
    resolutionStatus: FindingResolutionStatus,
  ): Promise<Finding> {
    return this.prisma.finding.update({
      where: { id: findingId },
      data: { resolutionStatus },
    });
  }

  async updateDocumentProcessingStatus(
    documentVersionId: string,
    processingStatus: string,
  ): Promise<void> {
    await this.prisma.documentVersion.updateMany({
      where: { id: documentVersionId },
      data: { processingStatus },
    });
  }

  async updatePreparationStatus(
    preparationId: string,
    status: PreparationStatus,
  ): Promise<void> {
    await this.prisma.preparation.updateMany({
      where: {
        id: preparationId,
        status: { not: PreparationStatus.ARCHIVED },
      },
      data: { status },
    });
  }
}
