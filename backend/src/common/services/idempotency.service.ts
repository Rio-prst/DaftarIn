import { ConflictException, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type IdempotencyCheckResult =
  | {
      status: 'HIT';
      statusCode: number;
      response: unknown;
    }
  | {
      status: 'MISS';
      requestHash: string;
    };

@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  hashPayload(payload: unknown): string {
    const serialized = JSON.stringify(payload ?? {});
    return createHash('sha256').update(serialized).digest('hex');
  }

  async check(
    userId: string,
    operationKey: string,
    idempotencyKey?: string,
    payload?: unknown,
  ): Promise<IdempotencyCheckResult> {
    if (!idempotencyKey) {
      return { status: 'MISS', requestHash: '' };
    }

    const requestHash = this.hashPayload(payload);

    const record = await this.prisma.idempotencyRecord.findUnique({
      where: {
        userId_operationKey_idempotencyKey: {
          userId,
          operationKey,
          idempotencyKey,
        },
      },
    });

    if (!record) {
      return { status: 'MISS', requestHash };
    }

    if (record.requestHash !== requestHash) {
      throw new ConflictException(
        'Idempotency key sudah digunakan untuk request payload yang berbeda.',
      );
    }

    return {
      status: 'HIT',
      statusCode: record.responseStatus,
      response: record.responseBodyJson,
    };
  }

  async save(
    userId: string,
    operationKey: string,
    idempotencyKey: string | undefined,
    requestHash: string,
    statusCode: number,
    responseBody: unknown,
  ): Promise<void> {
    if (!idempotencyKey) {
      return;
    }

    try {
      await this.prisma.idempotencyRecord.create({
        data: {
          userId,
          operationKey,
          idempotencyKey,
          requestHash,
          responseStatus: statusCode,
          responseBodyJson: (responseBody ?? {}) as Prisma.InputJsonValue,
        },
      });
    } catch {
      // Ignore unique constraint race conditions
    }
  }
}
