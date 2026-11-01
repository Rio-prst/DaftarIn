import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  GuideVersionStatus,
  RuleVersionStatus,
  ServicePublicationStatus,
} from '../generated/prisma/client';
import type {
  EvaluateNeedsInput,
  EvaluateNeedsResult,
  INeedsService,
  RequiredDocumentView,
} from './interfaces/needs.service.interface';

@Injectable()
export class NeedsService implements INeedsService {
  constructor(private readonly prisma: PrismaService) {}

  async evaluateNeeds(input: EvaluateNeedsInput): Promise<EvaluateNeedsResult> {
    const service = await this.prisma.service.findFirst({
      where: {
        id: input.serviceId,
        regionId: input.regionId,
        publicationStatus: ServicePublicationStatus.PUBLISHED,
      },
      include: {
        guideVersions: {
          where: { status: GuideVersionStatus.PUBLISHED },
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
        requirementRuleVersions: {
          where: { status: RuleVersionStatus.PUBLISHED },
          orderBy: { versionNumber: 'desc' },
          take: 1,
          include: {
            requirements: {
              orderBy: { displayOrder: 'asc' },
              include: { source: true },
            },
          },
        },
        serviceQuestions: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(
        'Layanan tidak ditemukan atau belum dipublikasikan.',
      );
    }

    const ruleVersion = service.requirementRuleVersions[0] ?? null;
    const requirements = ruleVersion?.requirements ?? [];
    const questions = service.serviceQuestions;

    const questionById = new Map(questions.map((q) => [q.id, q]));

    const answersByQuestionId = new Map(
      input.answers.map((a) => [a.questionId, a.value]),
    );

    const answersByQuestionKey = new Map<string, unknown>();
    for (const answer of input.answers) {
      const q = questionById.get(answer.questionId);
      if (q) {
        answersByQuestionKey.set(q.questionKey, answer.value);
      }
    }

    const requiredDocs: RequiredDocumentView[] = [];

    for (const req of requirements) {
      const condition = (req.conditionJson ?? { type: 'always' }) as Record<
        string,
        unknown
      >;
      const conditionType = condition.type ?? 'always';

      let isIncluded = false;
      let reason = 'Persyaratan umum layanan.';

      if (conditionType === 'always') {
        isIncluded = true;
      } else if (conditionType === 'conditional') {
        if (typeof condition.question_key === 'string') {
          const ans = answersByQuestionKey.get(condition.question_key);
          if (
            ans !== undefined &&
            (typeof ans === 'string' ||
              typeof ans === 'number' ||
              typeof ans === 'boolean') &&
            String(ans).toLowerCase() === String(condition.equals).toLowerCase()
          ) {
            isIncluded = true;
            reason = 'Berdasarkan jawaban kondisi yang dipilih.';
          }
        }

        if (!isIncluded) {
          for (const q of questions) {
            const validation = q.validationJson as Record<
              string,
              unknown
            > | null;
            const effects = Array.isArray(validation?.requirements_effect)
              ? (validation.requirements_effect as string[])
              : [];

            const affectsThis =
              effects.includes(req.id) || effects.includes(req.requirementCode);

            if (affectsThis) {
              const answerValue = answersByQuestionId.get(q.id);
              if (
                answerValue !== undefined &&
                this.isAffirmative(answerValue)
              ) {
                isIncluded = true;
                reason = 'Berdasarkan jawaban kondisi yang dipilih.';
                break;
              }
            }
          }
        }
      }

      if (isIncluded) {
        requiredDocs.push({
          requirement_id: req.id,
          name: req.title,
          required: req.isMandatory,
          reason,
          sources: [
            {
              id: req.source.id,
              title: req.source.title,
              url: req.source.url,
            },
          ],
        });
      }
    }

    return {
      service_id: service.id,
      region_id: input.regionId,
      questionnaire_version: ruleVersion?.versionNumber ?? 1,
      required_documents: requiredDocs,
      changed_requirements: [],
      next_action: {
        type: 'start_preparation',
        requires_authentication: true,
      },
    };
  }

  private isAffirmative(value: unknown): boolean {
    if (value === true || value === 'true') {
      return true;
    }
    if (typeof value === 'string' && value.trim() !== '' && value !== 'false') {
      return true;
    }
    if (Array.isArray(value) && value.length > 0) {
      return true;
    }
    if (typeof value === 'number') {
      return true;
    }
    return false;
  }
}
