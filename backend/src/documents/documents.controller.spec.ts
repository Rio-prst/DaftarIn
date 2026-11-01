import { HttpStatus } from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { DocumentsController } from './documents.controller';
import type { IDocumentsService } from './interfaces/documents.service.interface';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const PREPARATION_ID = '22222222-2222-4222-8222-222222222222';
const DOCUMENT_ID = '33333333-3333-4333-8333-333333333333';

const mockUser: AuthenticatedUser = {
  id: USER_ID,
  role: 'citizen',
  sessionId: 'session-1',
};

function makeMockService(): jest.Mocked<IDocumentsService> {
  return {
    uploadDocument: jest.fn(),
    uploadNewVersion: jest.fn(),
    listDocuments: jest.fn(),
    getDocumentDetail: jest.fn(),
    getDocumentContentUrl: jest.fn(),
    deleteDocument: jest.fn(),
  };
}

describe('DocumentsController', () => {
  let service: jest.Mocked<IDocumentsService>;
  let controller: DocumentsController;

  beforeEach(() => {
    service = makeMockService();
    controller = new DocumentsController(service);
  });

  it('delegates file upload to the service', async () => {
    service.uploadDocument.mockResolvedValue({
      id: DOCUMENT_ID,
      preparation_id: PREPARATION_ID,
      requirement_id: null,
      document_type: 'ktp',
      display_name: 'ktp.pdf',
      active_version: 1,
      status: 'uploaded',
      version: {
        id: DOCUMENT_ID,
        version: 1,
        mime_type: 'application/pdf',
        size_bytes: 1024,
        page_count: null,
        processing_status: 'available',
        uploaded_at: new Date().toISOString(),
      },
    });

    const file = { originalname: 'ktp.pdf' } as Express.Multer.File;
    const result = await controller.upload(
      PREPARATION_ID,
      file,
      { document_type: 'ktp' },
      mockUser,
    );

    expect(service.uploadDocument).toHaveBeenCalledWith(
      PREPARATION_ID,
      USER_ID,
      file,
      'ktp',
      undefined,
      undefined,
    );
    expect(result.data.id).toBe(DOCUMENT_ID);
  });

  it('delegates document list to the service', async () => {
    service.listDocuments.mockResolvedValue([]);

    const result = await controller.list(PREPARATION_ID, mockUser);

    expect(service.listDocuments).toHaveBeenCalledWith(PREPARATION_ID, USER_ID);
    expect(result.data).toEqual([]);
  });

  it('delegates document detail to the service', async () => {
    service.getDocumentDetail.mockResolvedValue({} as any);

    await controller.getDetail(PREPARATION_ID, DOCUMENT_ID, mockUser);

    expect(service.getDocumentDetail).toHaveBeenCalledWith(
      PREPARATION_ID,
      DOCUMENT_ID,
      USER_ID,
    );
  });

  it('redirects to signed URL for content by default', async () => {
    service.getDocumentContentUrl.mockResolvedValue(
      'https://example.com/signed',
    );

    const res = {
      redirect: jest.fn(),
    } as unknown as ExpressResponse;

    await controller.getContent(
      PREPARATION_ID,
      DOCUMENT_ID,
      undefined,
      mockUser,
      res,
    );

    expect(res.redirect).toHaveBeenCalledWith(
      HttpStatus.FOUND,
      'https://example.com/signed',
    );
  });

  it('returns JSON with signed URL when redirect=false', async () => {
    service.getDocumentContentUrl.mockResolvedValue(
      'https://example.com/signed',
    );

    const jsonMock = jest.fn();
    const res = {
      status: jest.fn().mockReturnValue({ json: jsonMock }),
    } as unknown as ExpressResponse;

    await controller.getContent(
      PREPARATION_ID,
      DOCUMENT_ID,
      'false',
      mockUser,
      res,
    );

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          url: 'https://example.com/signed',
          expires_in_seconds: 300,
        },
      }),
    );
  });

  it('delegates delete to the service', async () => {
    service.deleteDocument.mockResolvedValue({
      document_id: DOCUMENT_ID,
      deletion_status: 'pending',
      message: 'Penghapusan dokumen berhasil diproses.',
    });

    const result = await controller.delete(
      PREPARATION_ID,
      DOCUMENT_ID,
      mockUser,
    );

    expect(service.deleteDocument).toHaveBeenCalledWith(
      PREPARATION_ID,
      DOCUMENT_ID,
      USER_ID,
    );
    expect(result.data.deletion_status).toBe('pending');
  });
});
