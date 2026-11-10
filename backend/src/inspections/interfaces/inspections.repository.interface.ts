import type {
  Finding,
  FindingResolutionStatus,
  FindingSeverity,
  InspectionRun,
  InspectionStatus,
  PreparationStatus,
  Prisma,
  Requirement,
  UserCorrection,
} from '../../generated/prisma/client';

export const INSPECTIONS_REPOSITORY = Symbol('INSPECTIONS_REPOSITORY');

export type InspectionRunWithRuleVersion = InspectionRun & {
  ruleVersion: {
    id: string;
    versionNumber: number;
  };
};

export type FindingWithRelations = Finding & {
  documentVersion: {
    id: string;
    versionNumber: number;
    originalFilename: string;
  } | null;
  requirement: Requirement & {
    source: {
      id: string;
      title: string;
      url: string;
    };
  };
  inspectionRun: InspectionRunWithRuleVersion;
  userCorrections: UserCorrection[];
};

export type CreateInspectionRunRepositoryInput = {
  preparationId: string;
  userId: string;
  guideVersionId: string;
  ruleVersionId: string;
  dataVersion: number;
  engineVersion: string;
  inputSnapshotJson: Prisma.InputJsonValue;
};

export type UpdateInspectionRunRepositoryInput = {
  status?: InspectionStatus;
  modelVersion?: string | null;
  summaryJson?: Prisma.InputJsonValue;
  failureCode?: string | null;
  startedAt?: Date;
  completedAt?: Date;
};

export type CreateFindingRepositoryInput = {
  inspectionRunId: string;
  requirementId: string;
  documentVersionId?: string | null;
  findingCode: string;
  severity: FindingSeverity;
  category: string;
  title: string;
  explanation: string;
  evidenceJson: Prisma.InputJsonValue;
  suggestedActionsJson: Prisma.InputJsonValue;
  readingConfidence?: number | null;
  resolutionStatus: FindingResolutionStatus;
};

export type CreateUserCorrectionRepositoryInput = {
  findingId: string;
  userId: string;
  originalValueJson: Prisma.InputJsonValue;
  correctedValueJson: Prisma.InputJsonValue;
  correctionNote?: string | null;
};

export interface IInspectionsRepository {
  findActiveRun(
    preparationId: string,
  ): Promise<InspectionRunWithRuleVersion | null>;
  findByIdempotencyKey(
    preparationId: string,
    idempotencyKey: string,
  ): Promise<InspectionRunWithRuleVersion | null>;
  createRun(
    input: CreateInspectionRunRepositoryInput,
  ): Promise<InspectionRunWithRuleVersion>;
  updateRun(
    inspectionRunId: string,
    input: UpdateInspectionRunRepositoryInput,
  ): Promise<InspectionRunWithRuleVersion>;
  findRunById(
    preparationId: string,
    inspectionRunId: string,
    userId: string,
  ): Promise<InspectionRunWithRuleVersion | null>;
  listRuns(preparationId: string): Promise<InspectionRunWithRuleVersion[]>;
  failStaleRuns(preparationId: string, before: Date): Promise<number>;
  createFindings(input: CreateFindingRepositoryInput[]): Promise<void>;
  listFindings(inspectionRunId: string): Promise<FindingWithRelations[]>;
  findFinding(
    preparationId: string,
    findingId: string,
    userId: string,
  ): Promise<FindingWithRelations | null>;
  createCorrection(
    input: CreateUserCorrectionRepositoryInput,
  ): Promise<UserCorrection>;
  updateFindingResolution(
    findingId: string,
    resolutionStatus: FindingResolutionStatus,
  ): Promise<Finding>;
  updateDocumentProcessingStatus(
    documentVersionId: string,
    processingStatus: string,
  ): Promise<void>;
  updatePreparationStatus(
    preparationId: string,
    status: PreparationStatus,
  ): Promise<void>;
}
