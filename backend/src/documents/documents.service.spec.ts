import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FileType from 'file-type';
import type { IPreparationsRepository } from '../preparations/interfaces/preparations.repository.interface';
import type { IStorageService } from '../storage/interfaces/storage.service.interface';
import { DocumentsService } from './documents.service';
import type { IDocumentsRepository } from './interfaces/documents.repository.interface';

jest.mock('file-type');

const USER_ID = '11111111-1111-4111-8111-111111111111';
const PREPARATION_ID = '22222222-2222-4222-8222-222222222222';
const DOCUMENT_ID = '33333333-3333-4333-8333-333333333333';

function makeMockFile(
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'ktp.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('%PDF-1.4 mock content'),
    destination: '',
    filename: 'ktp.pdf',
    path: '',
    stream: null as any,
    ...overrides,
  };
}

describe('DocumentsService', () => {
  let documentsRepository: jest.Mocked<IDocumentsRepository>;
  let storageService: jest.Mocked<IStorageService>;
  let preparationsRepository: jest.Mocked<IPreparationsRepository>;
  let service: DocumentsService;

  beforeEach(() => {
    documentsRepository = {
      createVersion: jest.fn(),
      findActiveVersions: jest.fn(),
      findByDocumentId: jest.fn(),
      findVersionsByType: jest.fn(),
      getHighestVersionNumber: jest.fn(),
      softDeleteDocumentType: jest.fn(),
    };

    storageService = {
      uploadFile: jest.fn().mockResolvedValue(undefined),
      createSignedUrl: jest
        .fn()
        .mockResolvedValue('https://example.com/signed-url'),
      deleteFile: jest.fn().mockResolvedValue(undefined),
    };

    preparationsRepository = {
      findById: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      updateAnswers: jest.fn(),
      archive: jest.fn(),
      findLatestPublishedGuide: jest.fn(),
      findRequirementsForRule: jest.fn(),
      findQuestionsForService: jest.fn(),
      restore: jest.fn(),
      delete: jest.fn(),
      countSubmissions: jest.fn(),
    };

    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'MAX_UPLOAD_BYTES') return 10 * 1024 * 1024;
        return undefined;
      }),
    } as unknown as ConfigService;

    service = new DocumentsService(
      documentsRepository,
      storageService,
      preparationsRepository,
      configService,
    );

    (FileType.fromBuffer as jest.Mock).mockResolvedValue({
      ext: 'pdf',
      mime: 'application/pdf',
    });
  });

  it('uploads a valid PDF file and creates DocumentVersion', async () => {
    preparationsRepository.findById.mockResolvedValue({
      id: PREPARATION_ID,
      userId: USER_ID,
      inspectionRuns: [],
    } as any);

    documentsRepository.getHighestVersionNumber.mockResolvedValue(0);
    documentsRepository.createVersion.mockResolvedValue({
      id: DOCUMENT_ID,
      preparationId: PREPARATION_ID,
      userId: USER_ID,
      documentType: 'ktp',
      versionNumber: 1,
      storageKey: `users/${USER_ID}/preparations/${PREPARATION_ID}/documents/ktp/v1.pdf`,
      originalFilename: 'ktp.pdf',
      detectedMimeType: 'application/pdf',
      fileSizeBytes: BigInt(1024),
      checksumSha256: 'some-sha256',
      processingStatus: 'available',
      uploadedAt: new Date('2026-01-01T00:00:00Z'),
      deletedAt: null,
    });

    const file = makeMockFile();
    const result = await service.uploadDocument(
      PREPARATION_ID,
      USER_ID,
      file,
      'ktp',
    );

    expect(result.id).toBe(DOCUMENT_ID);
    expect(result.active_version).toBe(1);
    expect(result.document_type).toBe('ktp');
    expect(storageService.uploadFile).toHaveBeenCalledWith(
      expect.stringMatching(/ktp\/v1-[0-9a-f]+\.pdf/),
      file.buffer,
      'application/pdf',
    );
  });

  it('throws BadRequestException if file is missing or empty', async () => {
    preparationsRepository.findById.mockResolvedValue({
      id: PREPARATION_ID,
    } as any);

    await expect(
      service.uploadDocument(
        PREPARATION_ID,
        USER_ID,
        makeMockFile({ size: 0, buffer: Buffer.alloc(0) }),
        'ktp',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws 413 PayloadTooLargeException if file exceeds limit', async () => {
    preparationsRepository.findById.mockResolvedValue({
      id: PREPARATION_ID,
    } as any);

    const oversizedFile = makeMockFile({
      size: 15 * 1024 * 1024,
    });

    await expect(
      service.uploadDocument(PREPARATION_ID, USER_ID, oversizedFile, 'ktp'),
    ).rejects.toThrow(
      new HttpException(
        'Ukuran file melebihi batas maksimum 5 MB.',
        HttpStatus.PAYLOAD_TOO_LARGE,
      ),
    );
  });

  it('throws UnsupportedMediaTypeException for disallowed file types', async () => {
    preparationsRepository.findById.mockResolvedValue({
      id: PREPARATION_ID,
    } as any);

    (FileType.fromBuffer as jest.Mock).mockResolvedValue({
      ext: 'exe',
      mime: 'application/x-msdownload',
    });

    await expect(
      service.uploadDocument(PREPARATION_ID, USER_ID, makeMockFile(), 'ktp'),
    ).rejects.toBeInstanceOf(UnsupportedMediaTypeException);
  });

  it('throws NotFoundException if preparation does not exist', async () => {
    preparationsRepository.findById.mockResolvedValue(null);

    await expect(
      service.uploadDocument(PREPARATION_ID, USER_ID, makeMockFile(), 'ktp'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('uploads a new version of an existing document', async () => {
    preparationsRepository.findById.mockResolvedValue({
      id: PREPARATION_ID,
      userId: USER_ID,
      inspectionRuns: [],
    } as any);

    documentsRepository.findByDocumentId.mockResolvedValue({
      id: DOCUMENT_ID,
      preparationId: PREPARATION_ID,
      userId: USER_ID,
      documentType: 'ktp',
      versionNumber: 1,
    } as any);

    documentsRepository.getHighestVersionNumber.mockResolvedValue(1);
    documentsRepository.createVersion.mockResolvedValue({
      id: 'doc-v2',
      preparationId: PREPARATION_ID,
      userId: USER_ID,
      documentType: 'ktp',
      versionNumber: 2,
      storageKey: 'users/.../ktp/v2.pdf',
      originalFilename: 'ktp-updated.pdf',
      detectedMimeType: 'application/pdf',
      fileSizeBytes: BigInt(2048),
      checksumSha256: 'sha256-v2',
      processingStatus: 'available',
      uploadedAt: new Date(),
      deletedAt: null,
    });

    const file = makeMockFile({ originalname: 'ktp-updated.pdf' });
    const result = await service.uploadNewVersion(
      PREPARATION_ID,
      DOCUMENT_ID,
      USER_ID,
      file,
    );

    expect(result.id).toBe('doc-v2');
    expect(result.active_version).toBe(2);
  });

  it('lists active documents grouped by documentType', async () => {
    preparationsRepository.findById.mockResolvedValue({
      id: PREPARATION_ID,
    } as any);

    documentsRepository.findActiveVersions.mockResolvedValue([
      {
        id: 'doc-1',
        preparationId: PREPARATION_ID,
        documentType: 'ktp',
        versionNumber: 2,
        originalFilename: 'ktp-v2.pdf',
        detectedMimeType: 'application/pdf',
        fileSizeBytes: BigInt(1024),
        processingStatus: 'available',
        uploadedAt: new Date(),
      } as any,
      {
        id: 'doc-1-v1',
        preparationId: PREPARATION_ID,
        documentType: 'ktp',
        versionNumber: 1,
        originalFilename: 'ktp-v1.pdf',
        detectedMimeType: 'application/pdf',
        fileSizeBytes: BigInt(1024),
        processingStatus: 'available',
        uploadedAt: new Date(),
      } as any,
    ]);

    const docs = await service.listDocuments(PREPARATION_ID, USER_ID);

    expect(docs).toHaveLength(1);
    expect(docs[0].active_version).toBe(2);
  });

  it('returns document detail with all version records', async () => {
    preparationsRepository.findById.mockResolvedValue({
      id: PREPARATION_ID,
    } as any);

    const docV2 = {
      id: 'doc-v2',
      preparationId: PREPARATION_ID,
      documentType: 'ktp',
      versionNumber: 2,
      originalFilename: 'ktp.pdf',
      detectedMimeType: 'application/pdf',
      fileSizeBytes: BigInt(2048),
      processingStatus: 'available',
      uploadedAt: new Date(),
    } as any;

    const docV1 = {
      id: DOCUMENT_ID,
      preparationId: PREPARATION_ID,
      documentType: 'ktp',
      versionNumber: 1,
      originalFilename: 'ktp.pdf',
      detectedMimeType: 'application/pdf',
      fileSizeBytes: BigInt(1024),
      processingStatus: 'available',
      uploadedAt: new Date(),
    } as any;

    documentsRepository.findByDocumentId.mockResolvedValue(docV2);
    documentsRepository.findVersionsByType.mockResolvedValue([docV2, docV1]);

    const detail = await service.getDocumentDetail(
      PREPARATION_ID,
      'doc-v2',
      USER_ID,
    );

    expect(detail.id).toBe('doc-v2');
    expect(detail.versions).toHaveLength(2);
    expect(detail.versions[0].version).toBe(2);
    expect(detail.versions[1].version).toBe(1);
  });

  it('generates a signed content URL', async () => {
    preparationsRepository.findById.mockResolvedValue({
      id: PREPARATION_ID,
    } as any);
    documentsRepository.findByDocumentId.mockResolvedValue({
      id: DOCUMENT_ID,
      storageKey: 'users/123/v1.pdf',
    } as any);

    const url = await service.getDocumentContentUrl(
      PREPARATION_ID,
      DOCUMENT_ID,
      USER_ID,
    );

    expect(url).toBe('https://example.com/signed-url');
    expect(storageService.createSignedUrl).toHaveBeenCalledWith(
      'users/123/v1.pdf',
      300,
    );
  });

  it('soft-deletes a document and returns pending status', async () => {
    preparationsRepository.findById.mockResolvedValue({
      id: PREPARATION_ID,
    } as any);
    documentsRepository.findByDocumentId.mockResolvedValue({
      id: DOCUMENT_ID,
      documentType: 'ktp',
    } as any);

    const result = await service.deleteDocument(
      PREPARATION_ID,
      DOCUMENT_ID,
      USER_ID,
    );

    expect(result.document_id).toBe(DOCUMENT_ID);
    expect(result.deletion_status).toBe('pending');
    expect(documentsRepository.softDeleteDocumentType).toHaveBeenCalledWith(
      PREPARATION_ID,
      'ktp',
    );
  });
});
