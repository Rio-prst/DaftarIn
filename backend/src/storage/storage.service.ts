import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { IStorageService } from './interfaces/storage.service.interface';

@Injectable()
export class StorageService implements IStorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: ReturnType<typeof createClient> | null;
  private readonly bucket: string;
  private readonly localBaseDir: string;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    this.bucket =
      this.configService.get<string>('SUPABASE_STORAGE_BUCKET') ?? 'documents';

    this.localBaseDir = path.resolve(process.cwd(), 'storage_files');

    this.client =
      supabaseUrl && supabaseServiceKey
        ? createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          })
        : null;

    if (!this.client) {
      this.logger.log(
        `Supabase Storage tidak terkonfigurasi. Menggunakan penyimpanan berkas lokal di: ${this.localBaseDir}`,
      );
      if (!fs.existsSync(this.localBaseDir)) {
        fs.mkdirSync(this.localBaseDir, { recursive: true });
      }
    }
  }

  async uploadFile(
    storageKey: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    if (this.client) {
      // Supabase Storage: upsert is strictly FALSE for immutability
      const { error } = await this.client.storage
        .from(this.bucket)
        .upload(storageKey, buffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        this.logger.error(
          `Failed to upload file to storageKey: ${storageKey}`,
          error.message,
        );
        if (
          error.message.includes('already exists') ||
          error.message.includes('Duplicate')
        ) {
          throw new ConflictException(
            'Berkas dengan kunci tersebut sudah ada di penyimpanan.',
          );
        }
        throw new InternalServerErrorException(
          'Gagal menyimpan berkas ke storage.',
        );
      }
      return;
    }

    // Local Disk Fallback (deterministic & safe for local dev)
    const filePath = this.resolveLocalPath(storageKey);
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    if (fs.existsSync(filePath)) {
      throw new ConflictException(
        'Berkas dengan kunci tersebut sudah ada di penyimpanan lokal.',
      );
    }

    try {
      fs.writeFileSync(filePath, buffer, { flag: 'wx' });
    } catch (err: any) {
      this.logger.error(
        `Gagal menulis berkas lokal: ${storageKey}`,
        err.message,
      );
      throw new InternalServerErrorException(
        'Gagal menyimpan berkas ke penyimpanan lokal.',
      );
    }
  }

  async createSignedUrl(
    storageKey: string,
    expiresInSeconds = 300,
  ): Promise<string> {
    if (this.client) {
      const { data, error } = await this.client.storage
        .from(this.bucket)
        .createSignedUrl(storageKey, expiresInSeconds);

      if (error || !data?.signedUrl) {
        this.logger.error(
          `Failed to create signed URL for storageKey: ${storageKey}`,
          error?.message,
        );
        throw new InternalServerErrorException(
          'Gagal membuat URL akses berkas.',
        );
      }
      return data.signedUrl;
    }

    // Local fallback signed/direct URL through the storage raw endpoint
    return `/api/storage/raw?key=${encodeURIComponent(storageKey)}`;
  }

  async deleteFile(storageKey: string): Promise<void> {
    if (this.client) {
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
      return;
    }

    const filePath = this.resolveLocalPath(storageKey);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err: any) {
        this.logger.error(
          `Gagal menghapus berkas lokal: ${storageKey}`,
          err.message,
        );
      }
    }
  }

  getLocalFile(storageKey: string): { buffer: Buffer; filePath: string } {
    if (this.client) throw new NotFoundException('Penyimpanan lokal tidak aktif.');
    const filePath = this.resolveLocalPath(storageKey);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Berkas tidak ditemukan.');
    }
    return {
      buffer: fs.readFileSync(filePath),
      filePath,
    };
  }
  private resolveLocalPath(storageKey: string): string {
    if (!storageKey || storageKey.includes('\\') || storageKey.split('/').some(part => part === '..' || part === '.')) {
      throw new NotFoundException('Akses berkas tidak sah.');
    }
    const filePath = path.resolve(this.localBaseDir, storageKey);
    const relative = path.relative(this.localBaseDir, filePath);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new NotFoundException('Akses berkas tidak sah.');
    }
    return filePath;
  }
}
