import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HelpTicketStatus, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateHelpReplyDto,
  CreateHelpRequestDto,
} from './dto/create-help-request.dto';

export interface HelpRequestItemView {
  id: string;
  topic: string;
  category: string;
  status: string;
  application_id: string | null;
  preparation_id: string | null;
  created_at: string;
  updated_at: string;
  reply_count: number;
}

export interface HelpRequestDetailView extends HelpRequestItemView {
  replies: Array<{
    id: string;
    sender_id: string;
    sender_name: string;
    sender_role: string;
    message: string;
    created_at: string;
  }>;
}

@Injectable()
export class HelpService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, role: string): Promise<HelpRequestItemView[]> {
    const where = role === 'admin' ? {} : { userId };

    const items = await this.prisma.helpRequest.findMany({
      where,
      include: {
        _count: {
          select: { replies: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return items.map((item: any) => ({
      id: item.id,
      topic: item.topic,
      category: item.category,
      status: item.status.toLowerCase(),
      application_id: item.applicationId,
      preparation_id: item.preparationId,
      created_at: item.createdAt.toISOString(),
      updated_at: item.updatedAt.toISOString(),
      reply_count: item._count.replies,
    }));
  }

  async getById(
    id: string,
    userId: string,
    role: string,
  ): Promise<HelpRequestDetailView> {
    const item = await this.prisma.helpRequest.findUnique({
      where: { id },
      include: {
        replies: {
          include: {
            sender: {
              select: { id: true, displayName: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Tiket bantuan tidak ditemukan.');
    }

    if (role !== 'admin' && item.userId !== userId) {
      throw new ForbiddenException('Akses ditolak.');
    }

    return {
      id: item.id,
      topic: item.topic,
      category: item.category,
      status: item.status.toLowerCase(),
      application_id: item.applicationId,
      preparation_id: item.preparationId,
      created_at: item.createdAt.toISOString(),
      updated_at: item.updatedAt.toISOString(),
      reply_count: item.replies.length,
      replies: item.replies.map((r: any) => ({
        id: r.id,
        sender_id: r.senderUserId,
        sender_name: r.sender.displayName,
        sender_role: r.senderRole,
        message: r.message,
        created_at: r.createdAt.toISOString(),
      })),
    };
  }

  async create(
    userId: string,
    dto: CreateHelpRequestDto,
  ): Promise<HelpRequestDetailView> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const ticket = await tx.helpRequest.create({
        data: {
          userId,
          topic: dto.topic,
          category: dto.category,
          status: HelpTicketStatus.OPEN,
          applicationId: dto.application_id ?? null,
          preparationId: dto.preparation_id ?? null,
        },
      });

      const initialReply = await tx.helpReply.create({
        data: {
          helpRequestId: ticket.id,
          senderUserId: userId,
          senderRole: 'citizen',
          message: dto.message,
        },
        include: {
          sender: { select: { id: true, displayName: true } },
        },
      });

      return {
        id: ticket.id,
        topic: ticket.topic,
        category: ticket.category,
        status: ticket.status.toLowerCase(),
        application_id: ticket.applicationId,
        preparation_id: ticket.preparationId,
        created_at: ticket.createdAt.toISOString(),
        updated_at: ticket.updatedAt.toISOString(),
        reply_count: 1,
        replies: [
          {
            id: initialReply.id,
            sender_id: initialReply.senderUserId,
            sender_name: initialReply.sender.displayName,
            sender_role: initialReply.senderRole,
            message: initialReply.message,
            created_at: initialReply.createdAt.toISOString(),
          },
        ],
      };
    });
  }

  async createReply(
    id: string,
    userId: string,
    role: string,
    dto: CreateHelpReplyDto,
  ) {
    const ticket = await this.prisma.helpRequest.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Tiket bantuan tidak ditemukan.');
    }

    if (role !== 'admin' && ticket.userId !== userId) {
      throw new ForbiddenException('Akses ditolak.');
    }

    const reply = await this.prisma.helpReply.create({
      data: {
        helpRequestId: id,
        senderUserId: userId,
        senderRole: role,
        message: dto.message,
      },
      include: {
        sender: { select: { id: true, displayName: true } },
      },
    });

    await this.prisma.helpRequest.update({
      where: { id },
      data: {
        updatedAt: new Date(),
        ...(role === 'admin' ? { status: HelpTicketStatus.RESOLVED } : {}),
      },
    });

    return {
      id: reply.id,
      sender_id: reply.senderUserId,
      sender_name: reply.sender.displayName,
      sender_role: reply.senderRole,
      message: reply.message,
      created_at: reply.createdAt.toISOString(),
    };
  }

  async createOfficerEscalation(
    applicationId: string,
    officerUserId: string,
    dto: { reason: string; urgency?: string },
  ) {
    const assignment = await this.prisma.officerAssignment.findFirst({
      where: {
        applicationId,
        officerUserId,
        endedAt: null,
      },
    });

    if (!assignment) {
      throw new ForbiddenException(
        'Anda tidak memiliki penugasan aktif untuk pengajuan ini.',
      );
    }

    const escalation = await this.prisma.officerEscalation.create({
      data: {
        applicationId,
        officerUserId,
        reason: dto.reason,
        urgency: dto.urgency ?? 'NORMAL',
        status: 'OPEN',
      },
      include: {
        officer: { select: { displayName: true } },
      },
    });

    return {
      id: escalation.id,
      application_id: escalation.applicationId,
      officer_name: escalation.officer.displayName,
      reason: escalation.reason,
      urgency: escalation.urgency,
      status: escalation.status,
      created_at: escalation.createdAt.toISOString(),
    };
  }

  async resolveOfficerEscalation(
    escalationId: string,
    adminUserId: string,
    resolutionNote: string,
  ) {
    const escalation = await this.prisma.officerEscalation.findUnique({
      where: { id: escalationId },
    });

    if (!escalation) {
      throw new NotFoundException('Eskalasi tidak ditemukan.');
    }

    const updated = await this.prisma.officerEscalation.update({
      where: { id: escalationId },
      data: {
        status: 'RESOLVED',
        resolvedByAdminId: adminUserId,
        resolutionNote,
        resolvedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      application_id: updated.applicationId,
      status: updated.status,
      resolution_note: updated.resolutionNote,
      resolved_at: updated.resolvedAt?.toISOString() ?? null,
    };
  }
}
