import type { DocumentVersion } from '../../generated/prisma/client';

export const DOCUMENTS_REPOSITORY = Symbol('DOCUMENTS_REPOSITORY');

export type CreateDocumentVersionInput = {
  preparationId: string;
  userId: string;
  documentType: string;
  versionNumber: number;
  storageKey: string;
  originalFilename: string;
  detectedMimeType: string;
  fileSizeBytes: bigint;
  checksumSha256: string;
  processingStatus: string;
};

export interface IDocumentsRepository {
  createVersion(data: CreateDocumentVersionInput): Promise<DocumentVersion>;
  findActiveVersions(preparationId: string): Promise<DocumentVersion[]>;
  findByDocumentId(
    documentId: string,
    preparationId: string,
  ): Promise<DocumentVersion | null>;
  findVersionsByType(
    preparationId: string,
    documentType: string,
  ): Promise<DocumentVersion[]>;
  getHighestVersionNumber(
    preparationId: string,
    documentType: string,
  ): Promise<number>;
  softDeleteDocumentType(
    preparationId: string,
    documentType: string,
  ): Promise<number>;
}
