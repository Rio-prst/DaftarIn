import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import type { AdminListDto, ChangeAccessDto } from './admin.dto';
import { ServicePublicationStatus } from '../../generated/prisma/client';

const userSelect = {
  id: true,
  displayName: true,
  email: true,
  accountStatus: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
  userRoles: {
    where: { isActive: true },
    select: {
      validFrom: true,
      validUntil: true,
      role: { select: { roleCode: true } },
      agency: { select: { id: true, name: true } },
    },
  },
} as const;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [userCount, applicationCount, serviceCount, auditCount] =
      await Promise.all([
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.applicationRecord.count({ where: { archivedAt: null } }),
        this.prisma.service.count(),
        this.prisma.auditEvent.count(),
      ]);

    return {
      total_users: userCount,
      total_applications: applicationCount,
      total_services: serviceCount,
      total_audits: auditCount,
    };
  }

  async services() {
    const services = await this.prisma.service.findMany({
      include: {
        region: { select: { id: true, name: true } },
        agency: { select: { id: true, name: true } },
        guideVersions: {
          select: { id: true, versionNumber: true, status: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return services.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      category: s.category,
      publication_status: s.publicationStatus,
      region: s.region,
      agency: s.agency,
      guide_versions_count: s.guideVersions.length,
      published_at: s.publishedAt ? s.publishedAt.toISOString() : null,
      updated_at: s.updatedAt.toISOString(),
    }));
  }

  async updateServiceStatus(
    serviceId: string,
    status: ServicePublicationStatus,
    actor: AuthenticatedUser,
  ) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException('Layanan tidak ditemukan.');
    }

    const updated = await this.prisma.service.update({
      where: { id: serviceId },
      data: {
        publicationStatus: status,
        ...(status === ServicePublicationStatus.PUBLISHED
          ? { publishedAt: new Date() }
          : {}),
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        actorUserId: actor.id,
        actorRole: 'admin',
        action: 'SERVICE_STATUS_CHANGED',
        objectType: 'service',
        objectId: serviceId,
        requestId: randomUUID(),
        outcome: 'success',
        metadataJson: {
          previous_status: service.publicationStatus,
          new_status: status,
        },
      },
    });

    return {
      id: updated.id,
      publication_status: updated.publicationStatus,
    };
  }

  async assignOfficer(
    applicationId: string,
    officerUserId: string,
    actor: AuthenticatedUser,
    reason?: string,
  ) {
    const target = await this.prisma.user.findFirst({
      where: {
        id: officerUserId,
        deletedAt: null,
        accountStatus: 'ACTIVE',
        userRoles: {
          some: {
            role: { roleCode: 'officer' },
            isActive: true,
          },
        },
      },
    });

    if (!target) {
      throw new BadRequestException(
        'Petugas tidak ditemukan, tidak aktif, atau tidak memiliki peran petugas.',
      );
    }

    const application = await this.prisma.applicationRecord.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Pengajuan tidak ditemukan.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.officerAssignment.updateMany({
        where: {
          applicationId,
          endedAt: null,
        },
        data: {
          endedAt: new Date(),
          assignmentStatus: 'transferred',
        },
      });

      const newAssignment = await tx.officerAssignment.create({
        data: {
          applicationId,
          officerUserId,
          assignmentStatus: 'active',
          assignedAt: new Date(),
        },
      });

      await tx.auditEvent.create({
        data: {
          actorUserId: actor.id,
          actorRole: 'admin',
          action: 'ADMIN_ASSIGNMENT_TRANSFER',
          objectType: 'application',
          objectId: applicationId,
          requestId: randomUUID(),
          outcome: 'success',
          metadataJson: {
            assignedOfficerId: officerUserId,
            reason: reason ?? 'Penugasan petugas oleh administrator.',
          },
        },
      });

      return {
        message: 'Petugas berhasil ditugaskan ke pengajuan.',
        assignment_id: newAssignment.id,
      };
    });
  }

  async users(query: AdminListDto) {
    const rows = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(query.q
          ? {
              OR: [
                {
                  displayName: {
                    contains: query.q,
                    mode: 'insensitive' as const,
                  },
                },
                { email: { contains: query.q, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      select: userSelect,
    });
    const now = new Date();
    const items = rows.slice(0, query.limit).map((row) => ({
      id: row.id,
      display_name: row.displayName,
      email: row.email,
      status: row.accountStatus,
      email_verified: Boolean(row.emailVerifiedAt),
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
      roles: row.userRoles
        .filter(
          (role) =>
            (!role.validFrom || role.validFrom <= now) &&
            (!role.validUntil || role.validUntil > now),
        )
        .map((role) => ({ code: role.role.roleCode, agency: role.agency })),
    }));
    return {
      items,
      next_cursor: rows.length > query.limit ? items.at(-1)?.id : null,
    };
  }

  async agencies() {
    const rows = await this.prisma.agency.findMany({
      where: { isActive: true },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 500,
      select: {
        id: true,
        name: true,
        agencyType: true,
        region: { select: { id: true, name: true, regionType: true } },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.agencyType,
      region: row.region,
    }));
  }

  async changeAccess(
    actor: AuthenticatedUser,
    id: string,
    dto: ChangeAccessDto,
    requestId: string,
  ) {
    if (actor.id === id) {
      throw new ForbiddenException(
        'Akun sendiri tidak dapat diubah melalui endpoint ini.',
      );
    }
    await this.prisma.$transaction(async (tx) => {
      const target = await tx.user.findFirst({
        where: { id, deletedAt: null },
        select: {
          id: true,
          email: true,
          accountStatus: true,
          updatedAt: true,
          userRoles: {
            where: { isActive: true },
            select: { id: true, role: { select: { roleCode: true } } },
          },
        },
      });
      if (!target) throw new NotFoundException('Akun target tidak ditemukan.');
      if (target.userRoles.some((r) => r.role.roleCode === 'admin')) {
        throw new ForbiddenException(
          'Akses akun administrator tidak dapat diubah di sini.',
        );
      }
      if (
        target.accountStatus === 'DELETED' ||
        target.accountStatus === 'DELETION_REQUESTED'
      ) {
        throw new BadRequestException('Akun dalam status penghapusan.');
      }
      if (
        dto.expected_updated_at &&
        target.updatedAt.toISOString() !== dto.expected_updated_at
      ) {
        throw new ConflictException(
          'Data akun telah diperbarui pihak lain. Muat ulang daftar.',
        );
      }

      let agency: { id: string } | null = null;
      if (dto.role === 'officer') {
        if (!dto.agency_id) {
          throw new BadRequestException('Petugas wajib memiliki instansi.');
        }
        agency = await tx.agency.findFirst({
          where: {
            id: dto.agency_id,
            isActive: true,
            region: { isActive: true },
          },
          select: { id: true },
        });
        if (!agency) {
          throw new BadRequestException(
            'Instansi tidak valid atau tidak aktif.',
          );
        }
      }

      const role = await tx.role.findUnique({
        where: { roleCode: dto.role },
        select: { id: true },
      });
      if (!role) throw new BadRequestException('Peran tidak tersedia.');

      await tx.user.update({
        where: { id },
        data: { accountStatus: dto.status },
      });
      await tx.userRole.updateMany({
        where: { userId: id, isActive: true },
        data: { isActive: false, validUntil: new Date() },
      });
      await tx.userRole.create({
        data: {
          userId: id,
          roleId: role.id,
          agencyId: agency?.id ?? null,
          assignedById: actor.id,
          validFrom: new Date(),
        },
      });
      await tx.refreshSession.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await tx.auditEvent.create({
        data: {
          actorUserId: actor.id,
          actorRole: 'admin',
          action: 'ACCESS_CHANGE',
          objectType: 'user',
          objectId: id,
          requestId,
          outcome: 'success',
          metadataJson: {
            previous_status: target.accountStatus,
            status: dto.status,
            role: dto.role,
            agency_id: agency?.id ?? null,
          },
        },
      });
    });
  }

  async audit(query: AdminListDto) {
    const rows = await this.prisma.auditEvent.findMany({
      where: query.q
        ? { action: { contains: query.q, mode: 'insensitive' } }
        : {},
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        action: true,
        objectType: true,
        objectId: true,
        outcome: true,
        createdAt: true,
        actor: { select: { displayName: true } },
      },
    });
    const items = rows.slice(0, query.limit);
    return {
      items,
      next_cursor: rows.length > query.limit ? items.at(-1)?.id : null,
    };
  }
}
