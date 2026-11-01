import type {
  AuditEvent,
  GuideVersion,
  OfficerAssignment,
  Prisma,
  Role,
  Service,
  ServiceAvailability,
  ServicePublicationStatus,
  User,
  UserRole,
} from '../../generated/prisma/client';

export const ADMIN_REPOSITORY = Symbol('ADMIN_REPOSITORY');

export type AdminServiceWithRelations = Prisma.ServiceGetPayload<{
  include: {
    agency: {
      select: {
        id: true;
        name: true;
      };
    };
    region: {
      select: {
        id: true;
        name: true;
      };
    };
    guideVersions: {
      orderBy: {
        versionNumber: 'desc';
      };
      take: 1;
    };
  };
}>;

export type OfficerWithRoles = Prisma.UserGetPayload<{
  include: {
    userRoles: {
      include: {
        role: true;
        agency: { select: { id: true; name: true } };
        region: { select: { id: true; name: true } };
      };
    };
    officerAssignments: {
      where: { endedAt: null };
      select: { id: true; applicationId: true };
    };
  };
}>;

export interface ListAdminServicesRepositoryInput {
  q?: string;
  publicationStatus?: ServicePublicationStatus;
  regionId?: string;
  agencyId?: string;
  page: number;
  pageSize: number;
}

export interface CreateServiceRepositoryInput {
  name: string;
  slug: string;
  category: string;
  agencyId: string;
  regionId: string;
  summary?: string | null;
}

export interface UpdateServiceRepositoryInput {
  name?: string;
  category?: string;
  summary?: string | null;
  publicationStatus?: ServicePublicationStatus;
}

export interface CreateGuideVersionRepositoryInput {
  serviceId: string;
  versionNumber: number;
  procedureJson: Prisma.InputJsonValue;
  officialCostJson?: Prisma.InputJsonValue;
  officialDurationJson?: Prisma.InputJsonValue;
  sourceReviewedAt?: Date | null;
  createdById?: string;
}

export interface RoleAssignmentInput {
  roleCode: string;
  agencyId?: string | null;
  regionId?: string | null;
  isActive: boolean;
}

export interface RecordAuditEventInput {
  actorUserId?: string | null;
  actorRole: string;
  action: string;
  objectType: string;
  objectId: string;
  requestId?: string;
  outcome: string;
  metadataJson: Prisma.InputJsonValue;
}

export interface ListAuditEventsRepositoryInput {
  actorId?: string;
  action?: string;
  objectType?: string;
  page: number;
  pageSize: number;
}

export interface IAdminRepository {
  listServices(
    input: ListAdminServicesRepositoryInput,
  ): Promise<{ items: AdminServiceWithRelations[]; total: number }>;
  findServiceById(id: string): Promise<AdminServiceWithRelations | null>;
  findServiceBySlug(slug: string): Promise<Service | null>;
  createService(
    input: CreateServiceRepositoryInput,
  ): Promise<AdminServiceWithRelations>;
  updateService(
    id: string,
    input: UpdateServiceRepositoryInput,
  ): Promise<AdminServiceWithRelations>;

  findLatestGuideVersionNumber(serviceId: string): Promise<number>;
  createGuideVersion(
    input: CreateGuideVersionRepositoryInput,
  ): Promise<GuideVersion>;
  findGuideVersionById(id: string): Promise<GuideVersion | null>;
  publishGuideVersion(
    guideVersionId: string,
    serviceId: string,
    publishedAt: Date,
  ): Promise<GuideVersion>;

  listOfficers(query: {
    page: number;
    pageSize: number;
  }): Promise<{ items: OfficerWithRoles[]; total: number }>;
  findRoleByCode(code: string): Promise<Role | null>;
  findUserById(userId: string): Promise<User | null>;
  updateUserRoleAssignments(
    userId: string,
    assignments: RoleAssignmentInput[],
    assignedById: string,
  ): Promise<UserRole[]>;

  createOfficerAssignment(
    applicationId: string,
    officerUserId: string,
  ): Promise<OfficerAssignment>;

  recordAuditEvent(input: RecordAuditEventInput): Promise<AuditEvent>;
  listAuditEvents(
    input: ListAuditEventsRepositoryInput,
  ): Promise<{ items: AuditEvent[]; total: number }>;
  updateServiceAvailability(
    serviceId: string,
    availability: ServiceAvailability,
    reason?: string | null,
  ): Promise<Service>;
  findEscalationById(escalationId: string): Promise<any | null>;
  resolveEscalation(
    escalationId: string,
    adminUserId: string,
    resolutionNote: string,
  ): Promise<any>;
  findApplicationById(applicationId: string): Promise<any | null>;
}
