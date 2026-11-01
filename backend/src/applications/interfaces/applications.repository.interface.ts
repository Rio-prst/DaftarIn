import type {
  ApplicationStatus,
  CompanionReviewStatus,
  Prisma,
  StatusSourceType,
  SubmissionChannel,
} from '../../generated/prisma/client';

export const APPLICATIONS_REPOSITORY = Symbol('APPLICATIONS_REPOSITORY');

export type ApplicationRecordWithRelations =
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
          agencyType: true;
        };
      };
      preparation: {
        select: {
          id: true;
          internalReference: true;
          status: true;
        };
      };
      statusEvents: {
        orderBy: {
          occurredAt: 'desc';
        };
        take: 1;
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

export interface CreateApplicationRepositoryInput {
  userId: string;
  serviceId: string;
  agencyId: string;
  preparationId?: string | null;
  internalReference: string;
  officialReference?: string | null;
  submittedDate?: Date | null;
  submissionChannel: SubmissionChannel;
  sourceMode: StatusSourceType;
  statusSummary: ApplicationStatus;
  reviewStatus?: CompanionReviewStatus;
  citizenNotes?: string | null;
  initialEvent: {
    statusCode: ApplicationStatus;
    sourceType: StatusSourceType;
    sourceLabel: string;
    description?: string | null;
    occurredAt: Date;
    metadataJson?: Prisma.InputJsonValue;
  };
}

export interface ListApplicationsRepositoryInput {
  userId: string;
  serviceId?: string;
  status?: ApplicationStatus;
  sourceMode?: StatusSourceType;
  page: number;
  pageSize: number;
  sort: 'created_at' | 'updated_at' | 'submitted_date' | 'status';
  order: 'asc' | 'desc';
}

export interface AddStatusEventRepositoryInput {
  applicationId: string;
  actorUserId?: string | null;
  statusCode: ApplicationStatus;
  sourceType: StatusSourceType;
  sourceLabel: string;
  description?: string | null;
  occurredAt: Date;
  metadataJson?: Prisma.InputJsonValue;
}

export interface CreateSubmissionSnapshotRepositoryInput {
  applicationId: string;
  preparationId: string;
  versionNumber: number;
  conditionKey?: string | null;
  serviceSnapshotJson: Prisma.InputJsonValue;
  applicantSnapshotJson: Prisma.InputJsonValue;
  answersSnapshotJson: Prisma.InputJsonValue;
  documentsSnapshotJson: Prisma.InputJsonValue;
  requiredSlotsJson: Prisma.InputJsonValue;
  citizenNote?: string | null;
  changesSummary?: string | null;
  consentVersion: string;
  consentedAt: Date;
}

export interface IApplicationsRepository {
  create(
    input: CreateApplicationRepositoryInput,
  ): Promise<ApplicationRecordWithRelations>;
  findById(
    id: string,
    userId?: string,
  ): Promise<ApplicationRecordWithRelations | null>;
  list(input: ListApplicationsRepositoryInput): Promise<{
    items: ApplicationRecordWithRelations[];
    total: number;
  }>;
  addStatusEvent(
    input: AddStatusEventRepositoryInput,
  ): Promise<StatusEventWithActor>;
  listStatusEvents(applicationId: string): Promise<StatusEventWithActor[]>;
  updateStatus(
    applicationId: string,
    status: ApplicationStatus,
    officialReference?: string | null,
  ): Promise<ApplicationRecordWithRelations>;
  updateReviewStatus(
    applicationId: string,
    reviewStatus: CompanionReviewStatus,
  ): Promise<ApplicationRecordWithRelations>;
  linkPreparation(
    applicationId: string,
    preparationId: string,
  ): Promise<ApplicationRecordWithRelations>;
  findServiceById(
    serviceId: string,
  ): Promise<{ id: string; agencyId: string; name: string } | null>;
  findPreparationById(
    preparationId: string,
    userId: string,
  ): Promise<{
    id: string;
    serviceId: string;
    userId: string;
    archivedAt: Date | null;
    deletedAt: Date | null;
  } | null>;
  findPreparationForSubmission(
    preparationId: string,
    userId: string,
  ): Promise<any>;
  findUserForSubmission(userId: string): Promise<any>;
  findFamilyMember(familyMemberId: string, userId: string): Promise<any>;
  createSubmissionSnapshot(
    input: CreateSubmissionSnapshotRepositoryInput,
  ): Promise<any>;
  findSubmissionSnapshots(applicationId: string): Promise<any[]>;
  findSubmissionSnapshotByVersion(
    applicationId: string,
    versionNumber: number,
  ): Promise<any>;
  findLatestSubmissionVersion(applicationId: string): Promise<number>;
  withdrawApplication(
    applicationId: string,
    userId: string,
    reason: string,
  ): Promise<ApplicationRecordWithRelations>;
}
