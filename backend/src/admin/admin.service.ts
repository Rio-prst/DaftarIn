import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import type { AdminListDto, ChangeAccessDto } from './admin.dto';

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

  agencies() {
    return this.prisma.agency.findMany({
      where: { isActive: true, region: { isActive: true } },
      select: { id: true, name: true, region: { select: { name: true } } },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 500,
    });
  }

  async changeAccess(
    actor: AuthenticatedUser,
    id: string,
    dto: ChangeAccessDto,
    requestId: string,
  ) {
    if (actor.id === id)
      throw new ForbiddenException(
        'Akses akun sendiri tidak dapat diubah dari halaman ini.',
      );
    const administrator = await this.prisma.user.findUnique({
      where: { id: actor.id },
      select: { passwordHash: true },
    });
    if (
      !administrator?.passwordHash ||
      !(await bcrypt.compare(dto.current_password, administrator.passwordHash))
    )
      throw new BadRequestException('Kata sandi admin tidak sesuai.');
    await this.prisma.$transaction(async (tx) => {
      const target = await tx.user.findFirst({
        where: { id, deletedAt: null },
        select: userSelect,
      });
      if (!target) throw new NotFoundException('Akun tidak ditemukan.');
      if (target.userRoles.some((role) => role.role.roleCode === 'admin'))
        throw new ForbiddenException(
          'Akses administrator dikelola oleh pengelola sistem.',
        );
      if (!['ACTIVE', 'SUSPENDED'].includes(target.accountStatus))
        throw new ConflictException(
          'Status akun ini memerlukan penanganan pengelola sistem.',
        );
      const agency =
        dto.role === 'officer'
          ? await tx.agency.findFirst({
              where: {
                id: dto.agency_id,
                isActive: true,
                region: { isActive: true },
              },
              select: { id: true, regionId: true },
            })
          : null;
      if (dto.role === 'officer' && !agency)
        throw new BadRequestException('Instansi tidak tersedia.');
      const updated = await tx.user.updateMany({
        where: { id, updatedAt: new Date(dto.expected_updated_at) },
        data: { accountStatus: dto.status, updatedAt: new Date() },
      });
      if (!updated.count)
        throw new ConflictException(
          'Akun sudah diperbarui. Muat ulang sebelum menyimpan.',
        );
      await tx.userRole.updateMany({
        where: { userId: id, isActive: true },
        data: { isActive: false, validUntil: new Date() },
      });
      const role = await tx.role.upsert({
        where: { roleCode: dto.role },
        update: {},
        create: {
          roleCode: dto.role,
          roleName: dto.role === 'officer' ? 'Officer' : 'Citizen',
        },
      });
      await tx.userRole.create({
        data: {
          userId: id,
          roleId: role.id,
          agencyId: agency?.id,
          regionId: agency?.regionId,
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
          actorRole: actor.role,
          action: 'account.access_changed',
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
