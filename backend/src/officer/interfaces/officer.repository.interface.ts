import type {
  ApplicationStatus,
  DocumentVersion,
  OfficerAssignment,
  Prisma,
  StatusSourceType,
} from '../../generated/prisma/client';

export const OFFICER_REPOSITORY = Symbol('OFFICER_REPOSITORY');

export type OfficerAssignmentWithRelations =
  Prisma.OfficerAssignmentGetPayload<{
    include: {
      application: {
        include: {
          service: {
            select: {
              id: true;
              name: true;
              category: true;
              slug: true;
            };
          };
          agency: {
            select: {
              id: true;
              name: true;
            };
          };
          user: {
            select: {
              id: true;
              displayName: true;
            };
          };
          statusEvents: {
            orderBy: {
              occurredAt: 'desc';
            };
            take: 1;
          };
        };
      };
    };
  }>;

export type OfficerApplicationDetailWithRelations =
  Prisma.ApplicationRecordGetPayload<{
    include: {
      service: {
        select: {
          id: true;
          name: true;
          category: true;
          slug: true;
        };
      };
      agency: {
        select: {
          id: true;
          name: true;
        };
      };
      user: {
        select: {
          id: true;
          displayName: true;
        };
      };
      statusEvents: {
        orderBy: {
          occurredAt: 'asc';
        };
        include: {
          actor: {
            select: {
              id: true;
              displayName: true;
            };
          };
        };
      };
    };
  }>;

export type StatusEventWithActor = Prisma.StatusEventGetPayload<{
  include: {
    actor: {
      select: {
        id: true;
        displayName: true;
      };
    };
  };
}>;

export interface CreateOfficerEventRepositoryInput {
  applicationId: string;
  actorUserId: string;
  statusCode: ApplicationStatus;
  sourceType: StatusSourceType;
  sourceLabel: string;
  description?: string | null;
  revisionReason?: string | null;
  occurredAt: Date;
  metadataJson?: Prisma.InputJsonValue;
  citizenUserId: string;
  notification: {
    notificationType: string;
    title: string;
    body: string;
    targetPath: string;
  };
}

export interface ListOfficerAssignmentsRepositoryInput {
  officerUserId: string;
  status?: string;
  page: number;
  pageSize: number;
}

export interface SaveEvaluationDraftInput {
  submissionSnapshotId: string;
  officerUserId: string;
  overallNotes?: string | null;
  items: Array<{
    itemType: 'DOCUMENT' | 'FORM_DATA';
    itemId: string;
    verdict: 'SESUAI' | 'PERLU_PERBAIKAN' | 'BELUM_DAPAT_DIPERIKSA';
    note?: string | null;
  }>;
}

export interface SubmitDecisionInput {
  submissionSnapshotId: string;
  applicationId: string;
  officerUserId: string;
  decision: 'approved_for_submission' | 'revision_requested';
  overallNotes?: string | null;
  revisionDueAt?: Date | null;
  items: Array<{
    itemType: 'DOCUMENT' | 'FORM_DATA';
    itemId: string;
    verdict: 'SESUAI' | 'PERLU_PERBAIKAN' | 'BELUM_DAPAT_DIPERIKSA';
    note?: string | null;
  }>;
}

export interface CreateEscalationInput {
  applicationId: string;
  officerUserId: string;
  reason: string;
  targetRole: string;
}

export interface IOfficerRepository {
  findAssignment(
    applicationId: string,
    officerUserId: string,
  ): Promise<OfficerAssignment | null>;
  listAssignments(input: ListOfficerAssignmentsRepositoryInput): Promise<{
    items: OfficerAssignmentWithRelations[];
    total: number;
  }>;
  findApplicationDetail(
    applicationId: string,
  ): Promise<OfficerApplicationDetailWithRelations | null>;
  createOfficerEvent(
    input: CreateOfficerEventRepositoryInput,
  ): Promise<StatusEventWithActor>;
  findApplicationDocuments(applicationId: string): Promise<DocumentVersion[]>;
  findApplicationDocument(
    applicationId: string,
    documentId: string,
  ): Promise<DocumentVersion | null>;
  findLatestSubmissionSnapshot(applicationId: string): Promise<any | null>;
  saveEvaluationDraft(input: SaveEvaluationDraftInput): Promise<any>;
  submitDecision(input: SubmitDecisionInput): Promise<any>;
  createEscalation(input: CreateEscalationInput): Promise<any>;
}
