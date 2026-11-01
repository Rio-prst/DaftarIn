import type { CreateGuideVersionDto } from '../dto/create-guide-version.dto';
import type { CreateServiceDto } from '../dto/create-service.dto';
import type { ListAdminServicesQueryDto } from '../dto/list-admin-services.query.dto';
import type { ListAuditEventsQueryDto } from '../dto/list-audit-events.query.dto';
import type { ManageRoleAssignmentDto } from '../dto/manage-role-assignment.dto';
import type { PublishGuideVersionDto } from '../dto/publish-guide-version.dto';
import type { UpdateServiceDto } from '../dto/update-service.dto';
import type { AssignOfficerDto } from '../dto/assign-officer.dto';

export const ADMIN_SERVICE = Symbol('ADMIN_SERVICE');

export interface AdminServiceItemView {
  id: string;
  name: string;
  slug: string;
  category: string;
  summary: string | null;
  agency: {
    id: string;
    name: string;
  };
  region: {
    id: string;
    name: string;
  };
  publication_status: string;
  latest_guide_version: number | null;
  created_at: string;
  updated_at: string;
}

export interface OfficerItemView {
  id: string;
  email: string;
  name: string;
  status: string;
  roles: Array<{
    role: string;
    agency: string | null;
    region: string | null;
    is_active: boolean;
  }>;
  active_assignments_count: number;
}

export interface AuditEventItemView {
  id: string;
  actor_id: string | null;
  actor_role: string;
  action: string;
  object_type: string;
  object_id: string;
  outcome: string;
  metadata: unknown;
  created_at: string;
}

export interface IAdminService {
  listServices(query: ListAdminServicesQueryDto): Promise<{
    data: AdminServiceItemView[];
    meta: {
      page: number;
      page_size: number;
      total_items: number;
      total_pages: number;
    };
  }>;
  createService(
    adminUserId: string,
    dto: CreateServiceDto,
  ): Promise<AdminServiceItemView>;
  updateService(
    adminUserId: string,
    serviceId: string,
    dto: UpdateServiceDto,
  ): Promise<AdminServiceItemView>;

  createGuideVersion(
    adminUserId: string,
    serviceId: string,
    dto: CreateGuideVersionDto,
  ): Promise<{
    guide_version_id: string;
    service_id: string;
    version_number: number;
    status: string;
    created_at: string;
  }>;
  publishGuideVersion(
    adminUserId: string,
    guideVersionId: string,
    dto: PublishGuideVersionDto,
  ): Promise<{
    guide_version_id: string;
    service_id: string;
    version_number: number;
    status: string;
    published_at: string;
  }>;

  listOfficers(query: { page: number; page_size: number }): Promise<{
    data: OfficerItemView[];
    meta: {
      page: number;
      page_size: number;
      total_items: number;
      total_pages: number;
    };
  }>;
  manageRoleAssignments(
    adminUserId: string,
    targetUserId: string,
    dto: ManageRoleAssignmentDto,
  ): Promise<{ message: string; updated_count: number }>;

  assignOfficerToApplication(
    adminUserId: string,
    dto: AssignOfficerDto,
  ): Promise<{ assignment_id: string; message: string }>;

  listAuditEvents(query: ListAuditEventsQueryDto): Promise<{
    data: AuditEventItemView[];
    meta: {
      page: number;
      page_size: number;
      total_items: number;
      total_pages: number;
    };
  }>;
}
