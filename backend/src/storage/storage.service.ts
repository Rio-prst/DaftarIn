import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import type { IStorageService } from './interfaces/storage.service.interface';

@Injectable()
export class StorageService implements IStorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: ReturnType<typeof createClient> | null;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    this.bucket =
      this.configService.get<string>('SUPABASE_STORAGE_BUCKET') ?? 'documents';

    this.client = (supabaseUrl && supabaseServiceKey) ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }) : null;

  }

  async uploadFile(
    storageKey: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    if (!this.client) {
      throw new InternalServerErrorException(
        'Penyimpanan berkas server belum dikonfigurasi.',
      );
    }
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(storageKey, buffer, {
        contentType: mimeType,
        upsert: true,
      });


    if (error) {
      this.logger.error(
        `Failed to upload file to storageKey: ${storageKey}`,
        error.message,
      );
      throw new InternalServerErrorException(
        'Gagal menyimpan berkas ke storage.',
      );
    }
  }

  async createSignedUrl(
    storageKey: string,
    expiresInSeconds = 300,
  ): Promise<string> {
    if (!this.client) return '';
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(storageKey, expiresInSeconds);

    if (error || !data?.signedUrl) {
      this.logger.error(
        `Failed to create signed URL for storageKey: ${storageKey}`,
        error?.message,
      );
      throw new InternalServerErrorException('Gagal membuat URL akses berkas.');
    }

    return data.signedUrl;
  }

  async deleteFile(storageKey: string): Promise<void> {
    if (!this.client) {
      throw new InternalServerErrorException(
        'Penyimpanan berkas server belum dikonfigurasi.',
      );
    }
    const { error } = await this.client.storage
      .from(this.bucket)
      .remove([storageKey]);

    if (error) {
      this.logger.error(
        `Failed to delete file from storageKey: ${storageKey}`,
        error.message,
      );
      throw new InternalServerErrorException(
        'Gagal menghapus berkas dari storage.',
      );
    }
  }
}
