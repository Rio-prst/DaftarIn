import { Injectable, NotFoundException } from '@nestjs/common';
import {
  FamilyRelationship,
  type FamilyMember,
} from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  CreateFamilyMemberDto,
  UpdateFamilyMemberDto,
} from './dto/create-family-member.dto';

export interface FamilyMemberItemView {
  id: string;
  full_name: string;
  relationship: string;
  nik: string | null;
  birth_date: string | null;
  gender: string | null;
  is_under_age: boolean;
  created_at: string;
}

@Injectable()
export class FamilyService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<FamilyMemberItemView[]> {
    const items = await this.prisma.familyMember.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    return items.map((item: FamilyMember) => this.mapToView(item));
  }

  async getById(id: string, userId: string): Promise<FamilyMemberItemView> {
    const item = await this.prisma.familyMember.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!item) {
      throw new NotFoundException('Anggota keluarga tidak ditemukan.');
    }

    return this.mapToView(item);
  }

  async create(
    userId: string,
    dto: CreateFamilyMemberDto,
  ): Promise<FamilyMemberItemView> {
    const item = await this.prisma.familyMember.create({
      data: {
        userId,
        fullName: dto.full_name,
        relationship: dto.relationship as FamilyRelationship,
        nik: dto.nik ?? null,
        birthDate: dto.birth_date ? new Date(dto.birth_date) : null,
        gender: dto.gender ?? null,
        isUnderAge: dto.is_under_age ?? false,
      },
    });

    return this.mapToView(item);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateFamilyMemberDto,
  ): Promise<FamilyMemberItemView> {
    const existing = await this.prisma.familyMember.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Anggota keluarga tidak ditemukan.');
    }

    const updated = await this.prisma.familyMember.update({
      where: { id },
      data: {
        ...(dto.full_name ? { fullName: dto.full_name } : {}),
        ...(dto.relationship
          ? { relationship: dto.relationship as FamilyRelationship }
          : {}),
        ...(dto.nik !== undefined ? { nik: dto.nik } : {}),
        ...(dto.birth_date !== undefined
          ? { birthDate: dto.birth_date ? new Date(dto.birth_date) : null }
          : {}),
        ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
        ...(dto.is_under_age !== undefined
          ? { isUnderAge: dto.is_under_age }
          : {}),
      },
    });

    return this.mapToView(updated);
  }

  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.prisma.familyMember.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Anggota keluarga tidak ditemukan.');
    }

    await this.prisma.familyMember.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private mapToView(item: {
    id: string;
    fullName: string;
    relationship: FamilyRelationship;
    nik: string | null;
    birthDate: Date | null;
    gender: string | null;
    isUnderAge: boolean;
    createdAt: Date;
  }): FamilyMemberItemView {
    return {
      id: item.id,
      full_name: item.fullName,
      relationship: item.relationship.toLowerCase(),
      nik: item.nik,
      birth_date: item.birthDate?.toISOString() ?? null,
      gender: item.gender,
      is_under_age: item.isUnderAge,
      created_at: item.createdAt.toISOString(),
    };
  }
}
