import type {
  AnswerVersion,
  DocumentVersion,
  GuideVersion,
  InspectionRun,
  Preparation,
  PreparationStatus,
  Region,
  Requirement,
  RequirementRuleVersion,
  Service,
  ServiceQuestion,
} from '../../generated/prisma/client';

export const PREPARATIONS_REPOSITORY = Symbol('PREPARATIONS_REPOSITORY');

export type PreparationWithRelations = Preparation & {
  service: Service & {
    region: Region;
  };
  guideVersion: GuideVersion;
  answerVersions: (AnswerVersion & {
    question: ServiceQuestion;
  })[];
  documentVersions: DocumentVersion[];
  inspectionRuns: InspectionRun[];
};

export type ListPreparationsRepositoryInput = {
  userId: string;
  status?: PreparationStatus;
  serviceId?: string;
  page: number;
  pageSize: number;
  sort: 'created_at' | 'updated_at' | 'status';
  order: 'asc' | 'desc';
};

export type CreatePreparationRepositoryInput = {
  userId: string;
  serviceId: string;
  guideVersionId: string;
  internalReference: string;
  answers: {
    questionId: string;
    value: unknown;
  }[];
};

export type UpdatePreparationAnswersRepositoryInput = {
  id: string;
  expectedDataVersion?: number;
  nextDataVersion: number;
  answers?: {
    questionId: string;
    value: unknown;
  }[];
  nextStatus?: PreparationStatus;
};

export interface IPreparationsRepository {
  findById(
    id: string,
    userId: string,
  ): Promise<PreparationWithRelations | null>;
  list(
    input: ListPreparationsRepositoryInput,
  ): Promise<{ items: PreparationWithRelations[]; total: number }>;
  create(
    input: CreatePreparationRepositoryInput,
  ): Promise<PreparationWithRelations>;
  updateAnswers(
    input: UpdatePreparationAnswersRepositoryInput,
  ): Promise<PreparationWithRelations>;
  archive(id: string, userId: string): Promise<PreparationWithRelations>;
  findLatestPublishedGuide(
    serviceId: string,
    versionNumber?: number,
  ): Promise<(GuideVersion & { service: Service }) | null>;
  findRequirementsForRule(serviceId: string): Promise<
    | (RequirementRuleVersion & {
        requirements: (Requirement & {
          source: { id: string; title: string; url: string };
        })[];
      })
    | null
  >;
  findQuestionsForService(serviceId: string): Promise<ServiceQuestion[]>;
  restore(id: string, userId: string): Promise<PreparationWithRelations>;
  delete(id: string, userId: string): Promise<void>;
  countSubmissions(id: string): Promise<number>;
}
