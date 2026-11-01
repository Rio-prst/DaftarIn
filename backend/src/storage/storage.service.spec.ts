import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as supabaseJs from '@supabase/supabase-js';
import { StorageService } from './storage.service';

jest.mock('@supabase/supabase-js');

describe('StorageService', () => {
  let service: StorageService;
  let mockSupabase: any;
  let mockStorageBucket: any;

  beforeEach(() => {
    mockStorageBucket = {
      upload: jest.fn().mockResolvedValue({ error: null }),
      createSignedUrl: jest.fn().mockResolvedValue({
        data: { signedUrl: 'https://example.com/signed' },
        error: null,
      }),
      remove: jest.fn().mockResolvedValue({ error: null }),
    };

    mockSupabase = {
      storage: {
        from: jest.fn().mockReturnValue(mockStorageBucket),
      },
    };

    (supabaseJs.createClient as jest.Mock).mockReturnValue(mockSupabase);

    const configService = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'secret-service-key';
        return '';
      }),
      get: jest.fn((key: string) => {
        if (key === 'SUPABASE_STORAGE_BUCKET') return 'test-documents';
        return undefined;
      }),
    } as unknown as ConfigService;

    service = new StorageService(configService);
  });

  it('uploads a file buffer to the configured bucket', async () => {
    const buffer = Buffer.from('test file content');
    await service.uploadFile('path/to/file.pdf', buffer, 'application/pdf');

    expect(mockSupabase.storage.from).toHaveBeenCalledWith('test-documents');
    expect(mockStorageBucket.upload).toHaveBeenCalledWith(
      'path/to/file.pdf',
      buffer,
      {
        contentType: 'application/pdf',
        upsert: true,
      },
    );
  });

  it('throws InternalServerErrorException when upload fails', async () => {
    mockStorageBucket.upload.mockResolvedValue({
      error: new Error('Upload error'),
    });

    const buffer = Buffer.from('test file');
    await expect(
      service.uploadFile('path/file.pdf', buffer, 'application/pdf'),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('creates a signed URL with default expiry', async () => {
    const signedUrl = await service.createSignedUrl('path/to/file.pdf');

    expect(signedUrl).toBe('https://example.com/signed');
    expect(mockStorageBucket.createSignedUrl).toHaveBeenCalledWith(
      'path/to/file.pdf',
      300,
    );
  });

  it('deletes a file from the bucket', async () => {
    await service.deleteFile('path/to/file.pdf');

    expect(mockStorageBucket.remove).toHaveBeenCalledWith(['path/to/file.pdf']);
  });
});
