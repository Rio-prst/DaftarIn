import type {
  ApplicationStatus,
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
}
