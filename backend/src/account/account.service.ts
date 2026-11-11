import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import type {
  ChangePasswordDto,
  UpdatePreferencesDto,
  UpdateProfileDto,
} from './account.dto';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async profile(actor: AuthenticatedUser) {
    const user = await this.prisma.user.findFirst({
      where: { id: actor.id, deletedAt: null },
      select: {
        id: true,
        displayName: true,
        email: true,
        phone: true,
        identity: { select: { nik: true, familyCardNumber: true } },
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('Akun tidak ditemukan.');
    return {
      id: user.id,
      display_name: user.displayName,
      email: user.email,
      phone: user.phone || '',
      identity: user.identity
        ? {
            nik_last_four: user.identity.nik.slice(-4),
            family_card_last_four: user.identity.familyCardNumber.slice(-4),
            photo_uploaded: true,
          }
        : null,
      email_verified: Boolean(user.emailVerifiedAt),
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    };
  }

  async updateProfile(
    actor: AuthenticatedUser,
    dto: UpdateProfileDto,
    requestId: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: {
          id: actor.id,
          deletedAt: null,
          ...(dto.expected_updated_at
            ? { updatedAt: new Date(dto.expected_updated_at) }
            : {}),
        },
        data: { displayName: dto.display_name, phone: dto.phone || null },
      });
      if (updated.count !== 1)
        throw new ConflictException(
          'Data akun berubah di sesi lain. Muat ulang sebelum menyimpan.',
        );
      await tx.auditEvent.create({
        data: {
          actorUserId: actor.id,
          actorRole: actor.role,
          action: 'ACCOUNT_PROFILE_UPDATED',
          objectType: 'user',
          objectId: actor.id,
          requestId,
          outcome: 'SUCCESS',
          metadataJson: {},
        },
      });
    });
    return this.profile(actor);
  }

  async changePassword(
    actor: AuthenticatedUser,
    dto: ChangePasswordDto,
    requestId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: actor.id },
      select: { passwordHash: true },
    });
    if (
      !user?.passwordHash ||
      !(await bcrypt.compare(dto.current_password, user.passwordHash))
    )
      throw new BadRequestException('Kata sandi saat ini tidak sesuai.');
    if (dto.current_password === dto.new_password)
      throw new BadRequestException('Gunakan kata sandi baru yang berbeda.');
    const passwordHash = await bcrypt.hash(dto.new_password, 12);
    await this.prisma.$transaction(async (tx) => {
      const changed = await tx.user.updateMany({
        where: { id: actor.id, passwordHash: user.passwordHash },
        data: { passwordHash },
      });
      if (changed.count !== 1)
        throw new ConflictException(
          'Kata sandi sudah berubah. Masuk kembali dan coba lagi.',
        );
      await tx.refreshSession.updateMany({
        where: { userId: actor.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await tx.auditEvent.create({
        data: {
          actorUserId: actor.id,
          actorRole: actor.role,
          action: 'ACCOUNT_PASSWORD_CHANGED',
          objectType: 'user',
          objectId: actor.id,
          requestId,
          outcome: 'SUCCESS',
          metadataJson: {},
        },
      });
    });
  }

  async sessions(actor: AuthenticatedUser) {
    const rows = await this.prisma.refreshSession.findMany({
      where: {
        userId: actor.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, createdAt: true, expiresAt: true, lastUsedAt: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map((row) => ({
      id: row.id,
      current: row.id === actor.sessionId,
      created_at: row.createdAt.toISOString(),
      expires_at: row.expiresAt.toISOString(),
      last_used_at: row.lastUsedAt?.toISOString() || null,
    }));
  }

  async revokeSession(actor: AuthenticatedUser, id: string, requestId: string) {
    if (id === actor.sessionId)
      throw new BadRequestException(
        'Gunakan tombol Keluar untuk sesi yang sedang dipakai.',
      );
    await this.prisma.$transaction(async (tx) => {
      const revoked = await tx.refreshSession.updateMany({
        where: {
          id,
          userId: actor.id,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { revokedAt: new Date() },
      });
      if (revoked.count !== 1)
        throw new NotFoundException('Sesi tidak ditemukan.');
      await tx.auditEvent.create({
        data: {
          actorUserId: actor.id,
          actorRole: actor.role,
          action: 'ACCOUNT_SESSION_REVOKED',
          objectType: 'session',
          objectId: id,
          requestId,
          outcome: 'SUCCESS',
          metadataJson: {},
        },
      });
    });
  }

  async preferences(actor: AuthenticatedUser) {
    const row = await this.prisma.accountPreference.findUnique({
      where: { userId: actor.id },
    });
    return {
      font_size: row?.fontSize || 'normal',
      high_contrast: row?.highContrast || false,
      notify_in_app: row?.notifyInApp ?? true,
    };
  }

  async updatePreferences(actor: AuthenticatedUser, dto: UpdatePreferencesDto) {
    const data = {
      fontSize: dto.font_size,
      highContrast: dto.high_contrast,
      notifyInApp: dto.notify_in_app,
    };
    await this.prisma.accountPreference.upsert({
      where: { userId: actor.id },
      create: { userId: actor.id, ...data },
      update: data,
    });
    return this.preferences(actor);
  }
}
