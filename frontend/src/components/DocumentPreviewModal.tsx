import React, { useEffect, useRef, useState } from "react";
import {
  getStoredFileBlob,
  hasStoredFileSync,
  isFileStorageInitialized,
} from "../utils/fileStorage";

export interface PreviewableDocument {
  id?: string;
  name: string;
  fileName: string;
  size: string;
  fileType: "image" | "pdf";
  version?: number;
  uploadedAt?: string;
  qualityPreset?: "sample_issue" | "sample_clean" | "user_file";
  fixtureId?: string;
  previewUrl?: string;
  previewKey?: string;
}

/**
 * Menentukan apakah berkas merupakan dokumen contoh bawaan aplikasi secara
 * eksplisit dari metadata (`fixtureId` atau `qualityPreset`), BUKAN dari nama file.
 * Berkas warga bernama "contoh-kk.pdf" tetap diperlakukan sebagai berkas warga (`user_file`).
 */
export function isBuiltInSampleDocument(
  doc?: PreviewableDocument | null,
): boolean {
  if (!doc) return false;
  if (doc.qualityPreset === "user_file") {
    return false;
  }
  if (doc.fixtureId && doc.fixtureId.startsWith("sample-")) {
    return true;
  }
  return (
    doc.qualityPreset === "sample_issue" || doc.qualityPreset === "sample_clean"
  );
}

export function isCroppedSampleDocument(
  doc?: PreviewableDocument | null,
): boolean {
  if (!doc || !isBuiltInSampleDocument(doc)) return false;
  if (
    doc.fixtureId === "sample-kk-cropped-v1" ||
    doc.fixtureId?.includes("cropped")
  ) {
    return true;
  }
  return doc.qualityPreset === "sample_issue";
}

export function isDocumentContentAvailable(
  doc?: PreviewableDocument | null,
): boolean {
  if (!doc) return false;
  if (isBuiltInSampleDocument(doc)) return true;
  if (doc.previewUrl) return true;
  if (!isFileStorageInitialized() && doc.previewKey) {
    // Saat IndexedDB masih melakukan inisialisasi awal (< 50ms), jangan anggap hilang prematur
    return true;
  }
  return hasStoredFileSync(doc.previewKey);
}

interface DocumentPreviewModalProps {
  document?: PreviewableDocument | null;
  doc?: PreviewableDocument | null;
  applicantName?: string;
  applicantNik?: string;
  familyNumber?: string;
  applicantNoKk?: string;
  address?: string;
  applicantAddress?: string;
  viewerRole?: "warga" | "petugas";
  onReupload?: () => void;
  onOfficerMarkUnavailable?: () => void;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document: docProp,
  doc: docAlias,
  applicantName = "Ayu Contoh",
  applicantNik = "3275011508950001",
  familyNumber: familyNumberProp,
  applicantNoKk,
  address: addressProp,
  applicantAddress,
  viewerRole = "warga",
  onReupload,
  onOfficerMarkUnavailable,
  onClose,
}) => {
  const doc = docProp ?? docAlias ?? null;
  const familyNumber = familyNumberProp || applicantNoKk || "3275010908120005";
  const address =
    addressProp ||
    applicantAddress ||
    "Jl. Merdeka No. 12, RT 04/RW 02, Kota Contoh";

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingBlob, setLoadingBlob] = useState<boolean>(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pdfFrameRef = useRef<HTMLIFrameElement>(null);
  const closeCallback = useRef(onClose);
  const isOpen = Boolean(doc);

  useEffect(() => {
    closeCallback.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const frame = pdfFrameRef.current;
    if (!frame || !blobUrl || !isOpen) return;

    let frameDocument: Document | null = null;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      closeCallback.current();
    };
    const bindFrame = () => {
      frameDocument?.removeEventListener("keydown", handleEscape, true);
      try {
        frameDocument = frame.contentDocument;
        frameDocument?.addEventListener("keydown", handleEscape, true);
      } catch {
        // Some browser PDF readers isolate their document from the parent page.
        frameDocument = null;
      }
    };

    frame.addEventListener("load", bindFrame);
    bindFrame();
    return () => {
      frame.removeEventListener("load", bindFrame);
      frameDocument?.removeEventListener("keydown", handleEscape, true);
    };
  }, [blobUrl, isOpen, doc?.fileType]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeCallback.current();
        return;
      }
      if (event.key !== "Tab") return;

      const controls = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(
        (element) =>
          element.tabIndex >= 0 && element.getClientRects().length > 0,
      );
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener("keydown", handleKey);
    return () => {
      dialog.removeEventListener("keydown", handleKey);
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    let active = true;
    let createdObjectUrl: string | null = null;

    if (!doc) {
      setBlobUrl(null);
      setLoadingBlob(false);
      return;
    }

    if (doc.previewUrl) {
      setBlobUrl(doc.previewUrl);
      setLoadingBlob(false);
      return;
    }

    if (isBuiltInSampleDocument(doc)) {
      setBlobUrl(null);
      setLoadingBlob(false);
      return;
    }

    if (!doc.previewKey) {
      setBlobUrl(null);
      setLoadingBlob(false);
      return;
    }

    setLoadingBlob(true);
    getStoredFileBlob(doc.previewKey)
      .then((blob) => {
        if (!active) return;
        if (blob && blob.size > 0) {
          createdObjectUrl = URL.createObjectURL(blob);
          setBlobUrl(createdObjectUrl);
        } else {
          setBlobUrl(null);
        }
      })
      .catch(() => {
        if (active) setBlobUrl(null);
      })
      .finally(() => {
        if (active) setLoadingBlob(false);
      });

    return () => {
      active = false;
      if (createdObjectUrl) {
        URL.revokeObjectURL(createdObjectUrl);
      }
    };
  }, [doc]);

  if (!doc) return null;

  const isSample = isBuiltInSampleDocument(doc);
  const isCropped = isCroppedSampleDocument(doc);
  const isKtp =
    doc.fixtureId?.includes("ktp") || doc.name.toLowerCase().includes("ktp");
  const isAkta =
    doc.fixtureId?.includes("akta") ||
    doc.name.toLowerCase().includes("akta") ||
    doc.name.toLowerCase().includes("lahir");

  return (
    <dialog
      ref={dialogRef}
      className="document-preview-dialog fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      aria-labelledby="doc-preview-title"
      onClick={onClose}
      onCancel={(event) => {
        event.preventDefault();
        closeCallback.current();
      }}
    >
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="doc-preview-title"
                className="text-base font-semibold text-[#142c4b]"
              >
                Pratinjau Berkas: {doc.name}
              </h2>
              <span className="status-neutral">Versi {doc.version || 1}</span>
              {isSample ? (
                <span className="status-attention">
                  DOKUMEN CONTOH / SIMULASI
                </span>
              ) : (
                <span className="status-neutral">Berkas Unggahan Warga</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Nama file: <strong>{doc.fileName}</strong> · Ukuran: {doc.size} ·
              Format: {doc.fileType.toUpperCase()}
              {doc.previewKey ? ` · ID Berkas: ${doc.previewKey}` : ""}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="button-secondary !py-1.5 !px-3 !text-xs"
          >
            Tutup pratinjau
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 bg-[#F7F8FA] flex-1">
          {loadingBlob ? (
            <div
              className="p-6 rounded-lg bg-white border border-slate-200 text-sm text-slate-600"
              role="status"
            >
              Memuat isi berkas <strong>{doc.fileName}</strong> dari penyimpanan
              browser…
            </div>
          ) : blobUrl ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-slate-700">
                Menampilkan isi asli berkas <strong>{doc.fileName}</strong>{" "}
                (Versi {doc.version || 1}) yang tersimpan pada ruang penyimpanan
                browser ini.
              </div>
              {doc.fileType === "pdf" ? (
                <iframe
                  ref={pdfFrameRef}
                  title={`Pratinjau ${doc.name}`}
                  src={blobUrl}
                  className="w-full h-[460px] rounded-lg border border-slate-300 bg-white"
                />
              ) : (
                <div className="bg-white p-4 rounded-lg border border-slate-300 flex justify-center">
                  <img
                    src={blobUrl}
                    alt={`Pratinjau ${doc.name}`}
                    className="max-h-[460px] w-auto object-contain rounded"
                  />
                </div>
              )}
            </div>
          ) : isSample ? (
            <div className="space-y-3">
              <div
                className={
                  isCropped
                    ? "p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950"
                    : "p-3 rounded-lg bg-slate-100 border border-slate-300 text-xs text-slate-700"
                }
              >
                {isCropped ? (
                  <>
                    <strong>
                      [CONTOH BERKAS BERMASALAH · FIXTURE SIMULASI]
                    </strong>{" "}
                    Lembar contoh ini memperagakan hasil foto Kartu Keluarga
                    yang <strong>terpotong pada bagian bawah</strong> sehingga
                    tanggal penerbitan, tanda tangan, dan kode QR pengesahan
                    tidak terlihat.
                  </>
                ) : (
                  <>
                    <strong>[CONTOH BERKAS LENGKAP · FIXTURE SIMULASI]</strong>{" "}
                    Lembar contoh ini memperagakan dokumen contoh dengan{" "}
                    <strong>keempat sudut utuh</strong> untuk keperluan simulasi
                    tinjauan petugas.
                  </>
                )}
              </div>

              {/* Visualisasi Dokumen Contoh Berpenanda CONTOH */}
              <div
                className={
                  "relative bg-white rounded-lg border-2 p-6 shadow-sm overflow-hidden " +
                  (isCropped
                    ? "border-red-400 border-b-4 border-b-dashed"
                    : "border-slate-400")
                }
              >
                {/* Watermark CONTOH */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-10"
                >
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-widest text-slate-900 -rotate-12 border-4 border-slate-900 px-6 py-2">
                    CONTOH · BUKAN DOKUMEN RESMI
                  </span>
                </div>

                {/* Sudut penanda dokumen */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-3 pb-2 border-b border-slate-200">
                  <span>[SUDUT KIRI ATAS: TERLIHAT]</span>
                  <span className="font-semibold text-slate-700">
                    SALINAN CONTOH SIMULASI DAFTARIN (
                    {doc.fixtureId || doc.qualityPreset})
                  </span>
                  <span>[SUDUT KANAN ATAS: TERLIHAT]</span>
                </div>

                {isKtp ? (
                  <div className="space-y-3 text-xs text-slate-800">
                    <div className="text-center border-b border-slate-300 pb-2">
                      <p className="font-bold uppercase tracking-wide">
                        PROVINSI CONTOH · KOTA CONTOH
                      </p>
                      <p className="text-[11px] text-slate-500">
                        KARTU TANDA PENDUDUK ELEKTRONIK (CONTOH SIMULASI)
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="sm:col-span-2 space-y-1.5">
                        <p>
                          <span className="inline-block w-32 text-slate-500">
                            NIK
                          </span>
                          :{" "}
                          <strong className="font-mono">{applicantNik}</strong>
                        </p>
                        <p>
                          <span className="inline-block w-32 text-slate-500">
                            Nama Lengkap
                          </span>
                          : <strong>{applicantName}</strong>
                        </p>
                        <p>
                          <span className="inline-block w-32 text-slate-500">
                            Alamat
                          </span>
                          : {address}
                        </p>
                        <p>
                          <span className="inline-block w-32 text-slate-500">
                            Status / Pekerjaan
                          </span>
                          : Kawin · Karyawan Swasta (Data Contoh)
                        </p>
                        <p>
                          <span className="inline-block w-32 text-slate-500">
                            Berlaku Hingga
                          </span>
                          : Seumur Hidup
                        </p>
                      </div>
                      <div className="border border-slate-300 rounded bg-slate-50 p-3 flex flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-3xl text-slate-400">
                          badge
                        </span>
                        <span className="text-[11px] text-slate-500 mt-1">
                          PAS FOTO &amp; TANDA TANGAN CONTOH
                        </span>
                      </div>
                    </div>
                  </div>
                ) : isAkta ? (
                  <div className="space-y-3 text-xs text-slate-800">
                    <div className="text-center border-b border-slate-300 pb-2">
                      <p className="font-bold uppercase tracking-wide">
                        KUTIPAN AKTA KELAHIRAN / SURAT KETERANGAN (CONTOH)
                      </p>
                      <p className="font-mono text-[11px] text-slate-600 mt-0.5">
                        Nomor Contoh: 3275-LU-2026-CONTOH-01
                      </p>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <p>
                        Bahwa di <strong>Kota Contoh</strong> telah lahir
                        seorang anak yang tercatat pada permohonan keluarga:
                      </p>
                      <p>
                        <span className="inline-block w-36 text-slate-500">
                          Kepala Keluarga / Pemohon
                        </span>
                        : <strong>{applicantName}</strong> (NIK: {applicantNik})
                      </p>
                      <p>
                        <span className="inline-block w-36 text-slate-500">
                          Nomor KK Terkait
                        </span>
                        : <strong className="font-mono">{familyNumber}</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs text-slate-800">
                    <div className="text-center border-b border-slate-300 pb-2">
                      <p className="font-bold text-sm uppercase tracking-wide">
                        KARTU KELUARGA (CONTOH SIMULASI)
                      </p>
                      <p className="font-mono text-xs text-slate-700 mt-0.5">
                        No. {familyNumber}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <p>
                        <span className="text-slate-500">
                          Nama Kepala Keluarga:{" "}
                        </span>
                        <strong>{applicantName}</strong>
                      </p>
                      <p>
                        <span className="text-slate-500">Alamat: </span>
                        {address}
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-300 text-[11px]">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 px-2 py-1 text-left">
                              No
                            </th>
                            <th className="border border-slate-300 px-2 py-1 text-left">
                              Nama Lengkap
                            </th>
                            <th className="border border-slate-300 px-2 py-1 text-left">
                              NIK
                            </th>
                            <th className="border border-slate-300 px-2 py-1 text-left">
                              Status Hubungan
                            </th>
                            <th className="border border-slate-300 px-2 py-1 text-left">
                              Pendidikan / Pekerjaan
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-slate-300 px-2 py-1">
                              1
                            </td>
                            <td className="border border-slate-300 px-2 py-1 font-medium">
                              {applicantName}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 font-mono">
                              {applicantNik}
                            </td>
                            <td className="border border-slate-300 px-2 py-1">
                              Kepala Keluarga / Pemohon
                            </td>
                            <td className="border border-slate-300 px-2 py-1">
                              S1 / Karyawan Swasta
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 px-2 py-1">
                              2
                            </td>
                            <td className="border border-slate-300 px-2 py-1">
                              Anggota Keluarga Contoh
                            </td>
                            <td className="border border-slate-300 px-2 py-1 font-mono">
                              3275015505980002
                            </td>
                            <td className="border border-slate-300 px-2 py-1">
                              Anggota Keluarga
                            </td>
                            <td className="border border-slate-300 px-2 py-1">
                              SLTA / Pelajar
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Bagian bawah dokumen: Terpotong vs Utuh */}
                {isCropped ? (
                  <div className="mt-4 pt-3 border-t-2 border-dashed border-red-400 bg-red-50/80 -mx-6 -mb-6 p-4 text-center">
                    <p className="text-xs font-bold text-red-800 uppercase">
                      ✂ BATAS FOTO TERPOTONG (CONTOH MASALAH BERKAS)
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Bagian bawah dokumen (tanggal dikeluarkannya KK, tanda
                      tangan Kepala Keluarga, dan area QR Code pengesahan
                      Disdukcapil) tidak masuk ke dalam bingkai foto.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 pt-3 border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-slate-600">
                      <div>
                        <p className="font-semibold text-slate-700">
                          Tanda Tangan Kepala Keluarga / Pemohon
                        </p>
                        <p className="mt-3 font-mono text-slate-800">
                          [Tertanda: {applicantName}]
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="font-semibold text-slate-700">
                          Area Pengesahan Dokumen Contoh
                        </p>
                        <p className="mt-1 font-mono text-slate-700">
                          [QR CONTOH TERBACA UTUH · BUKAN DOKUMEN RESMI]
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-3 pt-2 border-t border-slate-100">
                      <span>[SUDUT KIRI BAWAH: TERLIHAT]</span>
                      <span>[SUDUT KANAN BAWAH: TERLIHAT]</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="p-5 rounded-lg bg-amber-50/80 border border-amber-300 space-y-2.5 text-sm text-amber-950"
              role="alert"
            >
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-amber-700"
                  aria-hidden="true"
                >
                  warning
                </span>
                <p className="font-semibold text-base">Berkas tidak tersedia</p>
              </div>
              <p className="text-xs leading-relaxed">
                Isi berkas untuk <strong>{doc.fileName}</strong> (Versi{" "}
                {doc.version || 1}) tidak ditemukan pada ruang penyimpanan
                browser ini. Aplikasi tidak membuat dokumen contoh pengganti
                untuk berkas unggahan warga.
              </p>
              <div className="p-3 rounded bg-white border border-amber-200 text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-[#142c4b]">
                  Tindakan yang dapat dilakukan:
                </p>
                {viewerRole === "petugas" || onOfficerMarkUnavailable ? (
                  <div className="space-y-2">
                    <p>
                      Berkas ini belum dapat dibuka. Tandai penilaian berkas ini
                      sebagai <strong>Belum dapat diperiksa</strong> atau pilih{" "}
                      <strong>Minta perbaikan</strong> agar warga mengunggah
                      ulang berkas yang dapat dibuka. Berkas yang tidak tersedia
                      tidak dapat ditandai <em>Sesuai</em>.
                    </p>
                    {onOfficerMarkUnavailable && (
                      <button
                        type="button"
                        onClick={onOfficerMarkUnavailable}
                        className="button-primary !py-1.5 !px-3 !text-xs"
                      >
                        Tandai &ldquo;Belum dapat diperiksa&rdquo; &amp; Minta
                        Perbaikan →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p>
                      Buka <strong>Tahap 3 (Dokumen)</strong> pada draf
                      persiapan Anda, lalu pilih{" "}
                      <strong>Pilih ulang berkas</strong> pada slot{" "}
                      <strong>{doc.name}</strong> untuk menyimpan ulang berkas
                      dari perangkat Anda sebelum mengirimnya ke petugas.
                    </p>
                    {onReupload && (
                      <button
                        type="button"
                        onClick={onReupload}
                        className="button-primary !py-1.5 !px-3 !text-xs"
                      >
                        Pilih ulang berkas dari perangkat →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
};
