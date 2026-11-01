import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../common/types/authenticated-user';

export interface HelpRequestItem {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerRole: string;
  topic: string;
  body: string;
  applicationId?: string;
  status: 'open' | 'answered' | 'closed';
  createdAt: string;
  messages: Array<{
    by: string;
    role: string;
    text: string;
    at: string;
  }>;
}

@Injectable()
export class HelpService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    user: AuthenticatedUser,
    input: { topic: string; body: string; applicationId?: string },
  ): Promise<HelpRequestItem> {
    const text = input.body.trim();
    if (text.length < 10) {
      throw new BadRequestException(
        'Jelaskan pertanyaan atau kendala minimal 10 karakter.',
      );
    }
    if (/\b(?:\d[ -]?){16}\b/.test(text)) {
      throw new BadRequestException(
        'Jangan menyertakan NIK atau nomor KK di pertanyaan. Gunakan nomor pengajuan atau persiapan sebagai rujukan.',
      );
    }

    const id = randomUUID();
    const createdAt = new Date().toISOString();

    const requestData: HelpRequestItem = {
      id,
      ownerId: user.id,
      ownerName: `Pengguna #${user.id.slice(0, 8)}`,
      ownerRole: user.role,
      topic: input.topic,
      body: text,
      applicationId: input.applicationId,
      status: 'open',
      createdAt,
      messages: [],
    };

    await this.prisma.auditEvent.create({
      data: {
        actorUserId: user.id,
        actorRole: user.role,
        action: 'HELP_REQUEST_CREATED',
        objectType: 'help_request',
        objectId: id,
        requestId: randomUUID(),
        outcome: 'open',
        metadataJson: requestData as any,
      },
    });

    return requestData;
  }

  async list(user: AuthenticatedUser): Promise<HelpRequestItem[]> {
    const isAdmin = user.role === 'admin';
    const events = await this.prisma.auditEvent.findMany({
      where: {
        objectType: 'help_request',
        action: 'HELP_REQUEST_CREATED',
        ...(isAdmin ? {} : { actorUserId: user.id }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const requests: HelpRequestItem[] = [];
    for (const event of events) {
      if (
        event.metadataJson &&
        typeof event.metadataJson === 'object' &&
        'id' in (event.metadataJson as Record<string, unknown>)
      ) {
        requests.push(event.metadataJson as unknown as HelpRequestItem);
      }
    }

    return requests;
  }

  async get(id: string, user: AuthenticatedUser): Promise<HelpRequestItem> {
    const isAdmin = user.role === 'admin';
    const event = await this.prisma.auditEvent.findFirst({
      where: {
        objectType: 'help_request',
        objectId: id,
        action: 'HELP_REQUEST_CREATED',
        ...(isAdmin ? {} : { actorUserId: user.id }),
      },
    });

    if (!event || !event.metadataJson) {
      throw new NotFoundException('Permintaan bantuan tidak ditemukan.');
    }

    return event.metadataJson as unknown as HelpRequestItem;
  }

  async reply(
    id: string,
    user: AuthenticatedUser,
    input: { text: string; close?: boolean },
  ): Promise<HelpRequestItem> {
    const current = await this.get(id, user);

    const messageText = input.text.trim();
    if (messageText.length < 5) {
      throw new BadRequestException('Tuliskan tanggapan minimal 5 karakter.');
    }

    const nextStatus = input.close
      ? 'closed'
      : user.role === 'admin'
        ? 'answered'
        : 'open';

    const updated: HelpRequestItem = {
      ...current,
      status: nextStatus,
      messages: [
        ...current.messages,
        {
          by: user.role === 'admin' ? 'Pengelola Layanan' : 'Pemohon',
          role: user.role,
          text: messageText,
          at: new Date().toISOString(),
        },
      ],
    };

    // Update the base event metadata
    const event = await this.prisma.auditEvent.findFirst({
      where: {
        objectType: 'help_request',
        objectId: id,
        action: 'HELP_REQUEST_CREATED',
      },
    });

    if (event) {
      await this.prisma.auditEvent.update({
        where: { id: event.id },
        data: {
          outcome: nextStatus,
          metadataJson: updated as any,
        },
      });
    }

    // Log the reply action
    await this.prisma.auditEvent.create({
      data: {
        actorUserId: user.id,
        actorRole: user.role,
        action: 'HELP_REQUEST_REPLIED',
        objectType: 'help_request',
        objectId: id,
        requestId: randomUUID(),
        outcome: nextStatus,
        metadataJson: {
          reply: messageText,
          status: nextStatus,
        },
      },
    });

    return updated;
  }
}
