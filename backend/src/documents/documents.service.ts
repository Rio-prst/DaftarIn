import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import FileType from 'file-type';
import type { DocumentVersion } from '../generated/prisma/client';
import {
  PREPARATIONS_REPOSITORY,
  type IPreparationsRepository,
} from '../preparations/interfaces/preparations.repository.interface';
import {
  STORAGE_SERVICE,
  type IStorageService,
} from '../storage/interfaces/storage.service.interface';
import {
  DOCUMENTS_REPOSITORY,
  type IDocumentsRepository,
} from './interfaces/documents.repository.interface';
import type {
  DocumentDeletionResult,
  DocumentDetailView,
  DocumentItemView,
  DocumentVersionInfo,
  IDocumentsService,
} from './interfaces/documents.service.interface';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const DEFAULT_MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class DocumentsService implements IDocumentsService {
  private readonly maxUploadBytes: number;

  constructor(
    @Inject(DOCUMENTS_REPOSITORY)
    private readonly documentsRepository: IDocumentsRepository,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
    @Inject(PREPARATIONS_REPOSITORY)
    private readonly preparationsRepository: IPreparationsRepository,
    private readonly configService: ConfigService,
  ) {
    this.maxUploadBytes =
      this.configService.get<number>('MAX_UPLOAD_BYTES') ??
      DEFAULT_MAX_UPLOAD_BYTES;
  }

  async uploadDocument(
    preparationId: string,
    userId: string,
    file: Express.Multer.File,
    documentType: string,
    requirementId?: string,
    displayName?: string,
  ): Promise<DocumentItemView> {
    const prep = await this.preparationsRepository.findById(
      preparationId,
      userId,
    );
    if (!prep) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }

    const { detectedMime, ext, checksumSha256 } =
      await this.validateAndInspectFile(file);

    const nextVersion =
      (await this.documentsRepository.getHighestVersionNumber(
        preparationId,
        documentType,
      )) + 1;

    // Unique immutable storage key: prevents concurrent upload overwrites
    const nonce = randomBytes(4).toString('hex');
    const storageKey = `users/${userId}/preparations/${preparationId}/documents/${documentType}/v${nextVersion}_${Date.now()}_${nonce}.${ext}`;

    await this.storageService.uploadFile(storageKey, file.buffer, detectedMime);

    const docVersion = await this.documentsRepository.createVersion({
      preparationId,
      userId,
      documentType,
      versionNumber: nextVersion,
      storageKey,
      originalFilename: file.originalname,
      detectedMimeType: detectedMime,
      fileSizeBytes: BigInt(file.size),
      checksumSha256,
      processingStatus: 'available',
    });

    return this.mapToItemView(docVersion, displayName, requirementId);
  }

  async uploadNewVersion(
    preparationId: string,
    documentId: string,
    userId: string,
    file: Express.Multer.File,
    displayName?: string,
  ): Promise<DocumentItemView> {
    const existing = await this.documentsRepository.findByDocumentId(
      documentId,
      preparationId,
    );
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Dokumen tidak ditemukan.');
    }

    return this.uploadDocument(
      preparationId,
      userId,
      file,
      existing.documentType,
      undefined,
      displayName,
    );
  }

  async reuseDocument(
    preparationId: string,
    userId: string,
    sourceDocumentId: string,
    documentType: string,
    userConsent: boolean,
  ): Promise<DocumentItemView> {
    if (!userConsent) {
      throw new BadRequestException(
        'Persetujuan penggunaan ulang dokumen wajib diberikan oleh pengguna.',
      );
    }

    const prep = await this.preparationsRepository.findById(
      preparationId,
      userId,
    );
    if (!prep) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }

    const source = await this.documentsRepository.findByDocumentId(
      sourceDocumentId,
    );
    if (!source || source.userId !== userId || source.deletedAt) {
      throw new NotFoundException(
        'Dokumen sumber tidak ditemukan atau tidak sah.',
      );
    }

    const nextVersion =
      (await this.documentsRepository.getHighestVersionNumber(
        preparationId,
        documentType,
      )) + 1;

    const docVersion = await this.documentsRepository.createVersion({
      preparationId,
      userId,
      documentType,
      versionNumber: nextVersion,
      storageKey: source.storageKey,
      originalFilename: source.originalFilename,
      detectedMimeType: source.detectedMimeType,
      fileSizeBytes: source.fileSizeBytes,
      checksumSha256: source.checksumSha256,
      processingStatus: 'available',
    });

    return this.mapToItemView(docVersion);
  }

  async listDocuments(
    preparationId: string,
    userId: string,
  ): Promise<DocumentItemView[]> {
    const prep = await this.preparationsRepository.findById(
      preparationId,
      userId,
    );
    if (!prep) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }

    const versions =
      await this.documentsRepository.findActiveVersions(preparationId);

    // Group by documentType and keep the highest versionNumber
    const latestByType = new Map<string, DocumentVersion>();
    for (const v of versions) {
      if (!latestByType.has(v.documentType)) {
        latestByType.set(v.documentType, v);
      }
    }

    return Array.from(latestByType.values()).map((v) => this.mapToItemView(v));
  }

  async getDocumentDetail(
    preparationId: string,
    documentId: string,
    userId: string,
  ): Promise<DocumentDetailView> {
    const prep = await this.preparationsRepository.findById(
      preparationId,
      userId,
    );
    if (!prep) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }

    const doc = await this.documentsRepository.findByDocumentId(
      documentId,
      preparationId,
    );
    if (!doc || doc.userId !== userId) {
      throw new NotFoundException('Dokumen tidak ditemukan.');
    }

    const allVersions = await this.documentsRepository.findVersionsByType(
      preparationId,
      doc.documentType,
    );

    return {
      ...this.mapToItemView(doc),
      versions: allVersions.map((v) => this.mapToVersionInfo(v)),
    };
  }

  async getDocumentContentUrl(
    preparationId: string,
    documentId: string,
    userId: string,
  ): Promise<string> {
    const prep = await this.preparationsRepository.findById(
      preparationId,
      userId,
    );
    if (!prep) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }

    const doc = await this.documentsRepository.findByDocumentId(
      documentId,
      preparationId,
    );
    if (!doc || doc.userId !== userId) {
      throw new NotFoundException('Dokumen tidak ditemukan.');
    }

    return this.storageService.createSignedUrl(doc.storageKey);
  }

  async deleteDocument(
    preparationId: string,
    documentId: string,
    userId: string,
  ): Promise<DocumentDeletionResult> {
    const prep = await this.preparationsRepository.findById(
      preparationId,
      userId,
    );
    if (!prep) {
      throw new NotFoundException('Persiapan tidak ditemukan.');
    }

    const doc = await this.documentsRepository.findByDocumentId(
      documentId,
      preparationId,
    );
    if (!doc || doc.userId !== userId) {
      throw new NotFoundException('Dokumen tidak ditemukan.');
    }

    await this.documentsRepository.softDeleteDocumentType(
      preparationId,
      doc.documentType,
    );

    return {
      document_id: documentId,
      deletion_status: 'pending',
      message: 'Penghapusan dokumen berhasil diproses.',
    };
  }

  private async validateAndInspectFile(file?: Express.Multer.File) {
    if (!file || !file.buffer || file.size === 0) {
      throw new BadRequestException('Berkas dokumen wajib diunggah.');
    }

    if (file.size > this.maxUploadBytes) {
      throw new HttpException(
        'Ukuran file melebihi batas maksimum 10 MB.',
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    let detected: { ext: string; mime: string } | undefined;
    try {
      detected = await FileType.fromBuffer(file.buffer);
    } catch {
      throw new BadRequestException('Berkas rusak atau tidak dapat dibaca.');
    }

    if (!detected || !ALLOWED_MIME_TYPES.includes(detected.mime)) {
      throw new UnsupportedMediaTypeException(
        'Format file tidak didukung. Format yang diizinkan: PDF, JPEG, PNG.',
      );
    }

    const checksumSha256 = createHash('sha256')
      .update(file.buffer)
      .digest('hex');

    return {
      detectedMime: detected.mime,
      ext: detected.ext,
      checksumSha256,
    };
  }

  private mapToItemView(
    doc: DocumentVersion,
    displayName?: string,
    requirementId?: string,
  ): DocumentItemView {
    return {
      id: doc.id,
      preparation_id: doc.preparationId,
      requirement_id: requirementId ?? null,
      document_type: doc.documentType,
      display_name: displayName ?? doc.originalFilename,
      active_version: doc.versionNumber,
      status: 'uploaded',
      version: this.mapToVersionInfo(doc),
    };
  }

  private mapToVersionInfo(doc: DocumentVersion): DocumentVersionInfo {
    return {
      id: doc.id,
      version: doc.versionNumber,
      mime_type: doc.detectedMimeType,
      size_bytes: Number(doc.fileSizeBytes),
      page_count: null,
      processing_status: doc.processingStatus,
      uploaded_at: doc.uploadedAt.toISOString(),
    };
  }
}
