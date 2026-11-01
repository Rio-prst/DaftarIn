import { Injectable } from '@nestjs/common';
import type { DocumentVersion } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateDocumentVersionInput,
  IDocumentsRepository,
} from './interfaces/documents.repository.interface';

@Injectable()
export class DocumentsRepository implements IDocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createVersion(
    data: CreateDocumentVersionInput,
  ): Promise<DocumentVersion> {
    return this.prisma.documentVersion.create({
      data: {
        preparationId: data.preparationId,
        userId: data.userId,
        documentType: data.documentType,
        versionNumber: data.versionNumber,
        storageKey: data.storageKey,
        originalFilename: data.originalFilename,
        detectedMimeType: data.detectedMimeType,
        fileSizeBytes: data.fileSizeBytes,
        checksumSha256: data.checksumSha256,
        processingStatus: data.processingStatus,
      },
    });
  }

  async findActiveVersions(preparationId: string): Promise<DocumentVersion[]> {
    return this.prisma.documentVersion.findMany({
      where: {
        preparationId,
        deletedAt: null,
      },
      orderBy: [{ documentType: 'asc' }, { versionNumber: 'desc' }],
    });
  }

  async findByDocumentId(
    documentId: string,
    preparationId: string,
  ): Promise<DocumentVersion | null> {
    return this.prisma.documentVersion.findFirst({
      where: {
        id: documentId,
        preparationId,
        deletedAt: null,
      },
    });
  }

  async findVersionsByType(
    preparationId: string,
    documentType: string,
  ): Promise<DocumentVersion[]> {
    return this.prisma.documentVersion.findMany({
      where: {
        preparationId,
        documentType,
        deletedAt: null,
      },
      orderBy: {
        versionNumber: 'desc',
      },
    });
  }

  async getHighestVersionNumber(
    preparationId: string,
    documentType: string,
  ): Promise<number> {
    const latest = await this.prisma.documentVersion.findFirst({
      where: {
        preparationId,
        documentType,
      },
      orderBy: {
        versionNumber: 'desc',
      },
      select: {
        versionNumber: true,
      },
    });

    return latest?.versionNumber ?? 0;
  }

  async softDeleteDocumentType(
    preparationId: string,
    documentType: string,
  ): Promise<number> {
    const result = await this.prisma.documentVersion.updateMany({
      where: {
        preparationId,
        documentType,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return result.count;
  }
}
