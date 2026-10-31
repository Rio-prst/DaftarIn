export const MAX_UPLOAD_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_UPLOAD_FILE_LABEL = "5 MB";

const IDB_DB_NAME = "daftarin_file_storage_v1";
const IDB_STORE_NAME = "file_blobs";
const LEGACY_SHARED_PREVIEW_KEY = "daftarin:shared-file-previews:v1";

export interface StoredFileRecord {
  storageId: string;
  prepId: string;
  slotId: string;
  version: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  blob: Blob;
}

const availableStorageIds = new Set<string>();
const storageListeners = new Set<() => void>();
let initPromise: Promise<void> | null = null;
let storageInitialized = false;

function notifyStorageListeners() {
  storageListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignore listener errors
    }
  });
}

export function subscribeFileStorage(listener: () => void): () => void {
  storageListeners.add(listener);
  return () => {
    storageListeners.delete(listener);
  };
}

export function isFileStorageInitialized(): boolean {
  return storageInitialized;
}

function openFileDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(
        new Error(
          "Penyimpanan berkas browser (IndexedDB) tidak tersedia pada peramban ini.",
        ),
      );
      return;
    }
    const request = indexedDB.open(IDB_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME, { keyPath: "storageId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(
        new Error(
          "Gagal membuka ruang penyimpanan berkas di browser. Periksa izin penyimpanan browser Anda.",
        ),
      );
  });
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; mimeType: string } | null {
  try {
    const commaIdx = dataUrl.indexOf(",");
    if (commaIdx === -1) return null;
    const header = dataUrl.slice(0, commaIdx);
    const base64 = dataUrl.slice(commaIdx + 1);
    const mimeMatch = header.match(/data:([^;]+);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { blob: new Blob([bytes], { type: mimeType }), mimeType };
  } catch {
    return null;
  }
}

export function initFileStorage(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const db = await openFileDatabase();

      // Migrasi pratinjau Data URL lama dari localStorage ke IndexedDB bila ada
      try {
        const legacyRaw = localStorage.getItem(LEGACY_SHARED_PREVIEW_KEY);
        if (legacyRaw) {
          const legacyMap = JSON.parse(legacyRaw) as Record<string, string>;
          const entries = Object.entries(legacyMap);
          for (const [key, dataUrl] of entries) {
            const converted = dataUrlToBlob(dataUrl);
            if (converted && converted.blob.size > 0) {
              await new Promise<void>((res) => {
                const tx = db.transaction(IDB_STORE_NAME, "readwrite");
                const store = tx.objectStore(IDB_STORE_NAME);
                const getReq = store.get(key);
                getReq.onsuccess = () => {
                  if (!getReq.result) {
                    store.put({
                      storageId: key,
                      prepId: "legacy-migrated",
                      slotId: "legacy-slot",
                      version: 1,
                      fileName: "berkas-migrasi",
                      mimeType: converted.mimeType,
                      sizeBytes: converted.blob.size,
                      createdAt: new Date().toISOString(),
                      blob: converted.blob,
                    } satisfies StoredFileRecord);
                  }
                };
                tx.oncomplete = () => res();
                tx.onerror = () => res();
              });
            }
          }
          localStorage.removeItem(LEGACY_SHARED_PREVIEW_KEY);
        }
      } catch {
        // Ignore legacy migration errors
      }

      // Muat seluruh kunci berkas yang benar-benar memiliki Blob valid (> 0 byte)
      await new Promise<void>((resolve) => {
        const tx = db.transaction(IDB_STORE_NAME, "readonly");
        const store = tx.objectStore(IDB_STORE_NAME);
        const req = store.openCursor();
        req.onsuccess = () => {
          const cursor = req.result;
          if (cursor) {
            const val = cursor.value as StoredFileRecord;
            if (
              val &&
              val.storageId &&
              val.blob instanceof Blob &&
              val.blob.size > 0
            ) {
              availableStorageIds.add(val.storageId);
            }
            cursor.continue();
          }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });

      db.close();
    } catch {
      // IndexedDB unavailable in this environment
    } finally {
      storageInitialized = true;
      notifyStorageListeners();
    }
  })();
  return initPromise;
}

// Mulai inisialisasi saat modul dimuat
void initFileStorage();

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return Math.max(1, Math.round(bytes / 1024)) + " KB";
  }
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export function validateUploadFile(
  file: File,
): { valid: true; fileType: "pdf" | "image"; mimeType: string } | { valid: false; message: string } {
  const nameLower = file.name.toLowerCase();
  const isPdfExt = nameLower.endsWith(".pdf");
  const isJpgExt = nameLower.endsWith(".jpg") || nameLower.endsWith(".jpeg");
  const isPngExt = nameLower.endsWith(".png");

  if (!isPdfExt && !isJpgExt && !isPngExt) {
    return {
      valid: false,
      message:
        "Format berkas tidak didukung. Pilih berkas dengan ekstensi .PDF, .JPG, atau .PNG.",
    };
  }

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "",
  ];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message:
        "Jenis konten berkas tidak sesuai. Pastikan berkas benar-benar berformat PDF, JPG, atau PNG.",
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      message:
        "Berkas yang dipilih kosong (0 KB). Pilih berkas yang berisi dokumen yang valid.",
    };
  }

  if (file.size > MAX_UPLOAD_FILE_BYTES) {
    return {
      valid: false,
      message: `Ukuran berkas (${formatFileSize(file.size)}) melebihi batas maksimal ${MAX_UPLOAD_FILE_LABEL}. Kompres atau pilih berkas maksimal ${MAX_UPLOAD_FILE_LABEL} agar dapat disimpan dan dipratinjau.`,
    };
  }

  const mimeType = isPdfExt
    ? "application/pdf"
    : isPngExt
      ? "image/png"
      : "image/jpeg";

  return {
    valid: true,
    fileType: isPdfExt ? "pdf" : "image",
    mimeType,
  };
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer && reader.result.byteLength > 0) {
        resolve(reader.result);
      } else {
        reject(
          new Error(
            "Isi berkas tidak dapat dibaca atau kosong. Silakan pilih ulang berkas dari perangkat Anda.",
          ),
        );
      }
    };
    reader.onerror = () => {
      reject(
        new Error(
          "Gagal membaca berkas dari perangkat. Pastikan berkas tidak sedang dikunci aplikasi lain lalu coba lagi.",
        ),
      );
    };
    reader.readAsArrayBuffer(file);
  });
}

export async function readAndStoreUploadedFile(params: {
  file: File;
  prepId: string;
  slotId: string;
  version: number;
  simulateStorageFailure?: boolean;
}): Promise<StoredFileRecord> {
  const { file, prepId, slotId, version, simulateStorageFailure } = params;

  const validation = validateUploadFile(file);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  await initFileStorage();

  if (simulateStorageFailure) {
    throw new Error(
      "Gagal menyimpan isi berkas ke penyimpanan browser (simulasi kegagalan penyimpanan). Berkas sebelumnya tetap dipertahankan; silakan coba unggah kembali.",
    );
  }

  // 1. Baca isi berkas secara penuh ke memori terlebih dahulu
  const buffer = await readFileAsArrayBuffer(file);
  if (buffer.byteLength !== file.size || buffer.byteLength <= 0) {
    throw new Error(
      "Pembacaan isi berkas tidak lengkap. Silakan coba pilih ulang berkas Anda.",
    );
  }

  const blob = new Blob([buffer], { type: validation.mimeType });
  const storageId = `blob-${prepId}-${slotId}-v${version}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const createdAt = new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
  });

  const record: StoredFileRecord = {
    storageId,
    prepId,
    slotId,
    version,
    fileName: file.name,
    mimeType: validation.mimeType,
    sizeBytes: blob.size,
    createdAt,
    blob,
  };

  // 2. Simpan ke IndexedDB dan verifikasi keterbacaan sebelum menyatakan berhasil
  const db = await openFileDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_NAME, "readwrite");
      const store = tx.objectStore(IDB_STORE_NAME);
      store.put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(
          new Error(
            "Penyimpanan browser gagal menyimpan berkas (kuota penuh atau akses ditolak). Hapus berkas draf yang tidak diperlukan atau periksa ruang penyimpanan browser.",
          ),
        );
      tx.onabort = () =>
        reject(
          new Error(
            "Transaksi penyimpanan berkas dibatalkan oleh browser. Silakan coba unggah kembali.",
          ),
        );
    });

    // Verifikasi bahwa entri benar-benar tersimpan di IndexedDB
    const verified = await new Promise<boolean>((resolve) => {
      const tx = db.transaction(IDB_STORE_NAME, "readonly");
      const store = tx.objectStore(IDB_STORE_NAME);
      const getReq = store.get(storageId);
      getReq.onsuccess = () => {
        const saved = getReq.result as StoredFileRecord | undefined;
        resolve(
          Boolean(
            saved &&
              saved.storageId === storageId &&
              saved.blob instanceof Blob &&
              saved.blob.size === file.size,
          ),
        );
      };
      getReq.onerror = () => resolve(false);
    });

    if (!verified) {
      throw new Error(
        "Verifikasi penyimpanan berkas gagal: isi berkas tidak ditemukan setelah disimpan.",
      );
    }

    availableStorageIds.add(storageId);
    notifyStorageListeners();
    return record;
  } finally {
    db.close();
  }
}

export async function getStoredFileBlob(
  storageId?: string,
): Promise<Blob | null> {
  if (!storageId) return null;
  await initFileStorage();
  try {
    const db = await openFileDatabase();
    try {
      return await new Promise<Blob | null>((resolve) => {
        const tx = db.transaction(IDB_STORE_NAME, "readonly");
        const store = tx.objectStore(IDB_STORE_NAME);
        const req = store.get(storageId);
        req.onsuccess = () => {
          const rec = req.result as StoredFileRecord | undefined;
          if (rec && rec.blob instanceof Blob && rec.blob.size > 0) {
            availableStorageIds.add(storageId);
            resolve(rec.blob);
          } else {
            availableStorageIds.delete(storageId);
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } finally {
      db.close();
    }
  } catch {
    return null;
  }
}

export async function verifyStoredFileBlob(
  storageId?: string,
): Promise<boolean> {
  const blob = await getStoredFileBlob(storageId);
  return Boolean(blob && blob.size > 0);
}

export function hasStoredFileSync(storageId?: string): boolean {
  if (!storageId) return false;
  return availableStorageIds.has(storageId);
}
