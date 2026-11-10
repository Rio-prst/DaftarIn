export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');

export interface IStorageService {
  uploadFile(
    storageKey: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<void>;
  createSignedUrl(
    storageKey: string,
    expiresInSeconds?: number,
  ): Promise<string>;
  downloadFile(storageKey: string): Promise<Buffer>;
  deleteFile(storageKey: string): Promise<void>;
}
