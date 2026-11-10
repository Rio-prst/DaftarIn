export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');

export interface IStorageService {
  downloadFile(storageKey: string): Promise<Buffer>;
  uploadFile(
    storageKey: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<void>;
  createSignedUrl(
    storageKey: string,
    expiresInSeconds?: number,
  ): Promise<string>;
  deleteFile(storageKey: string): Promise<void>;
}
