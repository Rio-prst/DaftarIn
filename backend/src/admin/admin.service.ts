import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import type { CreateGuideVersionDto } from './dto/create-guide-version.dto';
import type { CreateServiceDto } from './dto/create-service.dto';
import type { ListAdminServicesQueryDto } from './dto/list-admin-services.query.dto';
import type { ListAuditEventsQueryDto } from './dto/list-audit-events.query.dto';
import type { ManageRoleAssignmentDto } from './dto/manage-role-assignment.dto';
import type { PublishGuideVersionDto } from './dto/publish-guide-version.dto';
import type { UpdateServiceDto } from './dto/update-service.dto';
import type { AssignOfficerDto } from './dto/assign-officer.dto';
import type { PauseServiceDto } from './dto/pause-service.dto';
import type { ResolveEscalationDto } from './dto/resolve-escalation.dto';
import { ServiceAvailability } from '../generated/prisma/client';
import {
  ADMIN_REPOSITORY,
  type AdminServiceWithRelations,
  type IAdminRepository,
} from './interfaces/admin.repository.interface';
import {
  type AdminServiceItemView,
  type AuditEventItemView,
  type IAdminService,
  type OfficerItemView,
} from './interfaces/admin.service.interface';

@Injectable()
export class AdminService implements IAdminService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly repository: IAdminRepository,
  ) {}

  async listServices(query: ListAdminServicesQueryDto) {
    const { items, total } = await this.repository.listServices({
      q: query.q,
      publicationStatus: query.publication_status,
      regionId: query.region_id,
      agencyId: query.agency_id,
      page: query.page,
      pageSize: query.page_size,
    });

    return {
      data: items.map((item) => this.mapServiceToView(item)),
      meta: {
        page: query.page,
        page_size: query.page_size,
        total_items: total,
        total_pages: Math.ceil(total / query.page_size),
      },
    };
  }

  async createService(
    adminUserId: string,
    dto: CreateServiceDto,
  ): Promise<AdminServiceItemView> {
    const existing = await this.repository.findServiceBySlug(dto.slug);
    if (existing) {
      throw new ConflictException('Slug layanan sudah digunakan.');
    }

    const service = await this.repository.createService({
      name: dto.name,
      slug: dto.slug,
      category: dto.category,
      agencyId: dto.agency_id,
      regionId: dto.region_id,
      summary: dto.summary,
    });

    await this.repository.recordAuditEvent({
      actorUserId: adminUserId,
      actorRole: 'admin',
      action: 'create_service',
      objectType: 'service',
      objectId: service.id,
      outcome: 'SUCCESS',
      metadataJson: { name: service.name, slug: service.slug },
    });

    return this.mapServiceToView(service);
  }

  async updateService(
    adminUserId: string,
    serviceId: string,
    dto: UpdateServiceDto,
  ): Promise<AdminServiceItemView> {
    const existing = await this.repository.findServiceById(serviceId);
    if (!existing) {
      throw new NotFoundException('Layanan tidak ditemukan.');
    }

    const updated = await this.repository.updateService(serviceId, {
      name: dto.name,
      category: dto.category,
      summary: dto.summary,
      publicationStatus: dto.publication_status,
    });

    await this.repository.recordAuditEvent({
      actorUserId: adminUserId,
      actorRole: 'admin',
      action: 'update_service',
      objectType: 'service',
      objectId: serviceId,
      outcome: 'SUCCESS',
      metadataJson: { changes: { ...dto } },
    });

    return this.mapServiceToView(updated);
  }

  async createGuideVersion(
    adminUserId: string,
    serviceId: string,
    dto: CreateGuideVersionDto,
  ) {
    const service = await this.repository.findServiceById(serviceId);
    if (!service) {
      throw new NotFoundException('Layanan tidak ditemukan.');
    }

    const latestVersion =
      await this.repository.findLatestGuideVersionNumber(serviceId);
    const newVersionNumber = latestVersion + 1;

    const guideVersion = await this.repository.createGuideVersion({
      serviceId,
      versionNumber: newVersionNumber,
      procedureJson: dto.procedure_steps,
      officialCostJson: (dto.official_fee ?? undefined) as
        Prisma.InputJsonValue | undefined,
      officialDurationJson: (dto.official_processing_time ?? undefined) as
        Prisma.InputJsonValue | undefined,
      sourceReviewedAt: dto.reviewed_at ? new Date(dto.reviewed_at) : null,
      createdById: adminUserId,
    });

    await this.repository.recordAuditEvent({
      actorUserId: adminUserId,
      actorRole: 'admin',
      action: 'create_guide_version',
      objectType: 'guide_version',
      objectId: guideVersion.id,
      outcome: 'SUCCESS',
      metadataJson: {
        serviceId,
        versionNumber: newVersionNumber,
      },
    });

    return {
      guide_version_id: guideVersion.id,
      service_id: guideVersion.serviceId,
      version_number: guideVersion.versionNumber,
      status: guideVersion.status.toLowerCase(),
      created_at: guideVersion.createdAt.toISOString(),
    };
  }

  async publishGuideVersion(
    adminUserId: string,
    guideVersionId: string,
    dto: PublishGuideVersionDto,
  ) {
    const guideVersion =
      await this.repository.findGuideVersionById(guideVersionId);
    if (!guideVersion) {
      throw new NotFoundException('Versi panduan tidak ditemukan.');
    }

    if (
      dto.expected_version !== undefined &&
      dto.expected_version !== guideVersion.versionNumber
    ) {
      throw new ConflictException(
        'Versi panduan telah berubah (VERSION_CONFLICT). Muat ulang versi panduan.',
      );
    }

    const publishedAt = new Date();
    const published = await this.repository.publishGuideVersion(
      guideVersionId,
      guideVersion.serviceId,
      publishedAt,
    );

    await this.repository.recordAuditEvent({
      actorUserId: adminUserId,
      actorRole: 'admin',
      action: 'publish_guide_version',
      objectType: 'guide_version',
      objectId: guideVersionId,
      outcome: 'SUCCESS',
      metadataJson: {
        changeSummary: dto.change_summary,
        versionNumber: published.versionNumber,
      },
    });

    return {
      guide_version_id: published.id,
      service_id: published.serviceId,
      version_number: published.versionNumber,
      status: published.status.toLowerCase(),
      published_at: publishedAt.toISOString(),
    };
  }

  async listOfficers(query: { page: number; page_size: number }) {
    const { items, total } = await this.repository.listOfficers({
      page: query.page,
      pageSize: query.page_size,
    });

    const data: OfficerItemView[] = items.map((officer) => ({
      id: officer.id,
      email: officer.email,
      name: officer.displayName,
      status: officer.accountStatus.toLowerCase(),
      roles: officer.userRoles.map((ur) => ({
        role: ur.role.roleCode,
        agency: ur.agency?.name ?? null,
        region: ur.region?.name ?? null,
        is_active: ur.isActive,
      })),
      active_assignments_count: officer.officerAssignments.length,
    }));

    return {
      data,
      meta: {
        page: query.page,
        page_size: query.page_size,
        total_items: total,
        total_pages: Math.ceil(total / query.page_size),
      },
    };
  }

  async manageRoleAssignments(
    adminUserId: string,
    targetUserId: string,
    dto: ManageRoleAssignmentDto,
  ) {
    const targetUser = await this.repository.findUserById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    const updatedRoles = await this.repository.updateUserRoleAssignments(
      targetUserId,
      dto.assignments.map((a) => ({
        roleCode: a.role,
        agencyId: a.agency_id,
        regionId: a.region_id,
        isActive: a.active,
      })),
      adminUserId,
    );

    await this.repository.recordAuditEvent({
      actorUserId: adminUserId,
      actorRole: 'admin',
      action: 'update_user_roles',
      objectType: 'user',
      objectId: targetUserId,
      outcome: 'SUCCESS',
      metadataJson: {
        reason: dto.reason,
        rolesCount: updatedRoles.length,
      },
    });

    return {
      message: 'Penugasan peran berhasil diperbarui.',
      updated_count: updatedRoles.length,
    };
  }

  async assignOfficerToApplication(adminUserId: string, dto: AssignOfficerDto) {
    if (dto.expected_version !== undefined) {
      const app = await this.repository.findApplicationById(dto.application_id);
      if (!app) {
        throw new NotFoundException('Pengajuan tidak ditemukan.');
      }
      if (app.version !== dto.expected_version) {
        throw new ConflictException(
          'Versi pengajuan telah diperbarui (VERSION_CONFLICT). Muat ulang pengajuan.',
        );
      }
    }

    const assignment = await this.repository.createOfficerAssignment(
      dto.application_id,
      dto.officer_user_id,
      dto.expected_version,
    );

    await this.repository.recordAuditEvent({
      actorUserId: adminUserId,
      actorRole: 'admin',
      action: 'assign_officer',
      objectType: 'officer_assignment',
      objectId: assignment.id,
      outcome: 'SUCCESS',
      metadataJson: {
        applicationId: dto.application_id,
        officerUserId: dto.officer_user_id,
        reason: dto.reason,
      },
    });

    return {
      assignment_id: assignment.id,
      message: 'Petugas berhasil ditugaskan ke pengajuan.',
    };
  }

  async listAuditEvents(query: ListAuditEventsQueryDto) {
    const { items, total } = await this.repository.listAuditEvents({
      actorId: query.actor_id,
      action: query.action,
      objectType: query.object_type,
      page: query.page,
      pageSize: query.page_size,
    });

    const data: AuditEventItemView[] = items.map((audit) => ({
      id: audit.id,
      actor_id: audit.actorUserId,
      actor_role: audit.actorRole,
      action: audit.action,
      object_type: audit.objectType,
      object_id: audit.objectId,
      outcome: audit.outcome,
      metadata: audit.metadataJson,
      created_at: audit.createdAt.toISOString(),
    }));

    return {
      data,
      meta: {
        page: query.page,
        page_size: query.page_size,
        total_items: total,
        total_pages: Math.ceil(total / query.page_size),
      },
    };
  }

  private mapServiceToView(
    service: AdminServiceWithRelations,
  ): AdminServiceItemView {
    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      category: service.category,
      summary: service.summary,
      agency: {
        id: service.agency.id,
        name: service.agency.name,
      },
      region: {
        id: service.region.id,
        name: service.region.name,
      },
      publication_status: service.publicationStatus.toLowerCase(),
      latest_guide_version: service.guideVersions?.[0]?.versionNumber ?? null,
      created_at: service.createdAt.toISOString(),
      updated_at: service.updatedAt.toISOString(),
    };
  }

  async pauseService(
    adminUserId: string,
    serviceId: string,
    dto: PauseServiceDto,
  ): Promise<{ message: string }> {
    const service = await this.repository.findServiceById(serviceId);
    if (!service) {
      throw new NotFoundException('Layanan tidak ditemukan.');
    }

    await this.repository.updateServiceAvailability(
      serviceId,
      ServiceAvailability.PAUSED,
      dto.reason,
    );

    await this.repository.recordAuditEvent({
      actorUserId: adminUserId,
      actorRole: 'admin',
      action: 'pause_service',
      objectType: 'service',
      objectId: serviceId,
      outcome: 'SUCCESS',
      metadataJson: { reason: dto.reason },
    });

    return { message: 'Layanan berhasil dijeda.' };
  }

  async resumeService(
    adminUserId: string,
    serviceId: string,
  ): Promise<{ message: string }> {
    const service = await this.repository.findServiceById(serviceId);
    if (!service) {
      throw new NotFoundException('Layanan tidak ditemukan.');
    }

    await this.repository.updateServiceAvailability(
      serviceId,
      ServiceAvailability.ACTIVE,
      null,
    );

    await this.repository.recordAuditEvent({
      actorUserId: adminUserId,
      actorRole: 'admin',
      action: 'resume_service',
      objectType: 'service',
      objectId: serviceId,
      outcome: 'SUCCESS',
      metadataJson: {},
    });

    return { message: 'Layanan berhasil diaktifkan kembali.' };
  }

  async resolveEscalation(
    adminUserId: string,
    escalationId: string,
    dto: ResolveEscalationDto,
  ): Promise<{ message: string }> {
    const escalation = await this.repository.findEscalationById(escalationId);
    if (!escalation) {
      throw new NotFoundException('Eskalasi tidak ditemukan.');
    }

    await this.repository.resolveEscalation(
      escalationId,
      adminUserId,
      dto.resolution_note,
    );

    await this.repository.recordAuditEvent({
      actorUserId: adminUserId,
      actorRole: 'admin',
      action: 'resolve_escalation',
      objectType: 'officer_escalation',
      objectId: escalationId,
      outcome: 'SUCCESS',
      metadataJson: { resolutionNote: dto.resolution_note },
    });

    return { message: 'Eskalasi berhasil diselesaikan.' };
  }
}
