import { Injectable } from '@nestjs/common';
import {
  GuideVersionStatus,
  PreparationStatus,
  Prisma,
  RuleVersionStatus,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreatePreparationRepositoryInput,
  IPreparationsRepository,
  ListPreparationsRepositoryInput,
  PreparationWithRelations,
  UpdatePreparationAnswersRepositoryInput,
} from './interfaces/preparations.repository.interface';

const preparationInclude = {
  service: {
    include: {
      region: true,
    },
  },
  guideVersion: true,
  answerVersions: {
    include: {
      question: true,
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
  documentVersions: {
    where: {
      deletedAt: null,
    },
    orderBy: {
      versionNumber: 'desc' as const,
    },
  },
  inspectionRuns: {
    orderBy: {
      queuedAt: 'desc' as const,
    },
    take: 5,
  },
};

@Injectable()
export class PreparationsRepository implements IPreparationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    userId: string,
  ): Promise<PreparationWithRelations | null> {
    const record = await this.prisma.preparation.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: preparationInclude,
    });

    return record;
  }

  async list(
    input: ListPreparationsRepositoryInput,
  ): Promise<{ items: PreparationWithRelations[]; total: number }> {
    const where = {
      userId: input.userId,
      deletedAt: null,
      ...(input.status
        ? { status: input.status }
        : { status: { not: PreparationStatus.ARCHIVED } }),
      ...(input.serviceId ? { serviceId: input.serviceId } : {}),
    };

    const sortField =
      input.sort === 'created_at'
        ? 'createdAt'
        : input.sort === 'status'
          ? 'status'
          : 'updatedAt';

    const [items, total] = await Promise.all([
      this.prisma.preparation.findMany({
        where,
        include: preparationInclude,
        orderBy: {
          [sortField]: input.order,
        },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prisma.preparation.count({ where }),
    ]);

    return {
      items: items,
      total,
    };
  }

  async create(
    input: CreatePreparationRepositoryInput,
  ): Promise<PreparationWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const prep = await tx.preparation.create({
        data: {
          userId: input.userId,
          serviceId: input.serviceId,
          guideVersionId: input.guideVersionId,
          internalReference: input.internalReference,
          status: PreparationStatus.DRAFT,
          currentDataVersion: 1,
          version: 1,
        },
      });

      if (input.answers.length > 0) {
        await tx.answerVersion.createMany({
          data: input.answers.map((answer) => ({
            preparationId: prep.id,
            questionId: answer.questionId,
            dataVersion: 1,
            answerJson: {
              value: answer.value as Prisma.InputJsonValue,
            },
            valueOrigin: 'citizen_entered',
            createdById: input.userId,
          })),
        });
      }

      const created = await tx.preparation.findUniqueOrThrow({
        where: { id: prep.id },
        include: preparationInclude,
      });

      return created;
    });
  }

  async updateAnswers(
    input: UpdatePreparationAnswersRepositoryInput,
  ): Promise<PreparationWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      await tx.preparation.update({
        where: { id: input.id },
        data: {
          currentDataVersion: input.nextDataVersion,
          version: { increment: 1 },
          ...(input.nextStatus ? { status: input.nextStatus } : {}),
        },
      });

      if (input.answers && input.answers.length > 0) {
        await tx.answerVersion.createMany({
          data: input.answers.map((answer) => ({
            preparationId: input.id,
            questionId: answer.questionId,
            dataVersion: input.nextDataVersion,
            answerJson: {
              value: answer.value as Prisma.InputJsonValue,
            },
            valueOrigin: 'citizen_entered',
          })),
        });
      }

      const updated = await tx.preparation.findUniqueOrThrow({
        where: { id: input.id },
        include: preparationInclude,
      });

      return updated;
    });
  }

  async archive(id: string, userId: string): Promise<PreparationWithRelations> {
    const updated = await this.prisma.preparation.update({
      where: {
        id,
        userId,
      },
      data: {
        status: PreparationStatus.ARCHIVED,
        archivedAt: new Date(),
      },
      include: preparationInclude,
    });

    return updated;
  }

  async findLatestPublishedGuide(serviceId: string, versionNumber?: number) {
    return this.prisma.guideVersion.findFirst({
      where: {
        serviceId,
        status: GuideVersionStatus.PUBLISHED,
        ...(versionNumber ? { versionNumber } : {}),
      },
      orderBy: {
        versionNumber: 'desc',
      },
      include: {
        service: true,
      },
    });
  }

  async findRequirementsForRule(serviceId: string) {
    return this.prisma.requirementRuleVersion.findFirst({
      where: {
        serviceId,
        status: RuleVersionStatus.PUBLISHED,
      },
      orderBy: {
        versionNumber: 'desc',
      },
      include: {
        requirements: {
          orderBy: {
            displayOrder: 'asc',
          },
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
      },
    });
  }

  async findQuestionsForService(serviceId: string) {
    return this.prisma.serviceQuestion.findMany({
      where: {
        serviceId,
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }
}
