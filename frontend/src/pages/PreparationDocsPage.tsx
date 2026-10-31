import { useRef, useState, type ChangeEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PreparationLayout } from "../components/PreparationLayout";
import {
  DocumentPreviewModal,
  isDocumentContentAvailable,
  type PreviewableDocument,
} from "../components/DocumentPreviewModal";
import { useApp } from "../context/AppContext";
import {
  documentSlots,
  getSelectedConditionOption,
   type DocumentSlotItem,
} from "../types/preparation";
import {
  formatFileSize,
  MAX_UPLOAD_FILE_LABEL,
  readAndStoreUploadedFile,
  validateUploadFile,
} from "../utils/fileStorage";

interface UploadTargetContext {
  prepId: string;
  prepRef: string;
  slotId: string;
  slotName: string;
  slotRequired: boolean;
  existingDocName?: string;
  existingDocVersion?: number;
  nextVersion: number;
}

export function PreparationDocsPage() {
  const {
    services,
    activePreparation,
    documents,
    addDocument,
    removeDocument,
    loadSampleDocuments,
    readiness,
    showToast,
  } = useApp();
  const [params] = useSearchParams();
  const [previewDoc, setPreviewDoc] = useState<PreviewableDocument | null>(
    null,
  );
  const [uploadingSlotId, setUploadingSlotId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<{
    slotId: string;
    slotName: string;
    fileName: string;
    message: string;
    preservedFileName?: string;
    preservedVersion?: number;
  } | null>(null);
  const [simulateFailureOnce, setSimulateFailureOnce] = useState(false);

  const currentService =
    services.find((s) => s.id === activePreparation.serviceId) || services[0];
  const activeCondition = getSelectedConditionOption(
    currentService,
    activePreparation.conditionKey,
  );
  const slots = documentSlots(currentService, activePreparation.conditionKey);
  const requiredSlots = slots.filter((slot) => slot.required);
  const input = useRef<HTMLInputElement>(null);
  const uploadContextRef = useRef<UploadTargetContext | null>(null);
  const navigate = useNavigate();

  const buildQuery = () => {
    const q = new URLSearchParams();
    const prepId =
      params.get("prep") ||
      (activePreparation.id !== "prep-draft-uninitialized"
        ? activePreparation.id
        : "");
    if (prepId) q.set("prep", prepId);
    const appId = params.get("application");
    if (appId) q.set("application", appId);
    const qs = q.toString();
    return qs ? "?" + qs : "";
  };

  const querySuffix = buildQuery();

  const uploadedRequired = requiredSlots.filter((slot) =>
    documents.some(
      (doc) =>
        doc.id === slot.id &&
        doc.status === "TERUNGGAH" &&
        isDocumentContentAvailable(doc),
    ),
  ).length;
  const canProceedToReview = readiness.steps.step3Dokumen;

  const choose = (slot: DocumentSlotItem) => {
    const existing = documents.find(
      (item) => item.id === slot.id && item.status === "TERUNGGAH",
    );
    const nextVersion = existing ? (existing.version || 1) + 1 : 1;
    uploadContextRef.current = {
      prepId: activePreparation.id,
      prepRef: activePreparation.internalReference,
      slotId: slot.id,
      slotName: slot.name,
      slotRequired: slot.required,
      existingDocName: existing?.fileName,
      existingDocVersion: existing?.version || 1,
      nextVersion,
    };
    input.current?.click();
  };

  const pickFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const ctx = uploadContextRef.current;
    if (!ctx) return;

    const validation = validateUploadFile(file);
    if (!validation.valid) {
      setUploadError({
        slotId: ctx.slotId,
        slotName: ctx.slotName,
        fileName: file.name,
        message: validation.message,
        preservedFileName: ctx.existingDocName,
        preservedVersion: ctx.existingDocVersion,
      });
      showToast(validation.message, "error");
      return;
    }

    setUploadError(null);
    setUploadingSlotId(ctx.slotId);
    const shouldFail = simulateFailureOnce;
    if (simulateFailureOnce) {
      setSimulateFailureOnce(false);
    }

    try {
      const stored = await readAndStoreUploadedFile({
        file,
        prepId: ctx.prepId,
        slotId: ctx.slotId,
        version: ctx.nextVersion,
        simulateStorageFailure: shouldFail,
      });
      const sizeText = formatFileSize(stored.sizeBytes);

      // Hanya masukkan metadata TERUNGGAH setelah isi berkas diverifikasi tersimpan di IndexedDB,
      // dan ikat ke ctx.prepId asal meskipun pengguna berpindah draf saat pembacaan berlangsung.
      addDocument(
        {
          id: ctx.slotId,
          name: ctx.slotName,
          fileName: stored.fileName,
          size: sizeText,
          status: "TERUNGGAH",
          required: ctx.slotRequired,
          fileType: validation.fileType,
          version: ctx.nextVersion,
          qualityPreset: "user_file",
          previewKey: stored.storageId,
        },
        ctx.prepId,
      );

      showToast(
        `Berkas "${stored.fileName}" (${sizeText}, v${ctx.nextVersion}) berhasil disimpan ke persiapan ${ctx.prepRef}.`,
        "success",
      );
    } catch (err) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "Gagal membaca atau menyimpan isi berkas ke penyimpanan browser.";
      setUploadError({
        slotId: ctx.slotId,
        slotName: ctx.slotName,
        fileName: file.name,
        message: errMsg,
        preservedFileName: ctx.existingDocName,
        preservedVersion: ctx.existingDocVersion,
      });
      showToast(
        ctx.existingDocName
          ? `${errMsg} Berkas lama "${ctx.existingDocName}" (v${ctx.existingDocVersion || 1}) tetap dipertahankan.`
          : errMsg,
        "error",
      );
    } finally {
      setUploadingSlotId(null);
    }
  };

  return (
    <PreparationLayout
      step={3}
      title="Unggah dokumen"
      actions={
        <>
          <Link
            to={"/persiapan/data" + querySuffix}
            className="button-secondary"
          >
            Kembali ke data
          </Link>
          <button
            type="button"
            className="button-primary disabled:opacity-50"
            disabled={!canProceedToReview || Boolean(uploadingSlotId)}
            onClick={() => navigate("/persiapan/ringkasan" + querySuffix)}
          >
            Lanjut ke tinjau &amp; kirim →
          </button>
        </>
      }
    >
      {!readiness.steps.step1Kebutuhan ? (
        <div className="case-update-note mb-5 flex flex-wrap items-center justify-between gap-3">
          <span>
            <strong>Prasyarat belum selesai:</strong> Tahap 1 (Kebutuhan) belum
            dikonfirmasi pada draf ini.
          </span>
          <Link
            to={"/persiapan/kebutuhan" + querySuffix}
            className="button-primary !py-1.5 !px-3 !text-xs shrink-0"
          >
            Konfirmasi kebutuhan (Tahap 1) →
          </Link>
        </div>
      ) : !readiness.steps.step2Data ? (
        <div className="case-update-note mb-5 flex flex-wrap items-center justify-between gap-3">
          <span>
            <strong>Prasyarat belum selesai:</strong> Data pemohon (Nama, 16
            angka NIK, 16 angka Nomor KK, alamat, dan alasan) pada Tahap 2 belum
            lengkap.
          </span>
          <Link
            to={"/persiapan/data" + querySuffix}
            className="button-primary !py-1.5 !px-3 !text-xs shrink-0"
          >
            Lengkapi data pemohon (Tahap 2) →
          </Link>
        </div>
      ) : null}

      <div className="section-heading flex-wrap">
        <div>
          <p className="text-sm font-medium text-[#142c4b]">
            {uploadedRequired} dari {requiredSlots.length} dokumen wajib
            tersedia untuk kondisi <strong>{activeCondition.label}</strong>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Validasi dasar memeriksa keberadaan isi berkas wajib, format (PDF,
            JPG, PNG), dan ukuran (maks. {MAX_UPLOAD_FILE_LABEL}). Isi berkas
            disimpan sebagai Blob di IndexedDB browser untuk pratinjau warga
            &amp; petugas (penyimpanan browser ini belum menggantikan
            penyimpanan privat pada backend).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="button-secondary text-xs"
            type="button"
            onClick={() => loadSampleDocuments("issue", activePreparation.id)}
          >
            Muat dokumen contoh (1 berkas terpotong)
          </button>
          <button
            className="button-secondary text-xs"
            type="button"
            onClick={() => loadSampleDocuments("fixed", activePreparation.id)}
          >
            Muat dokumen contoh (semua berkas utuh)
          </button>
        </div>
      </div>

      {uploadError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-xs text-red-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-red-900">
                Gagal menyimpan berkas &ldquo;{uploadError.fileName}&rdquo; pada
                slot {uploadError.slotName}
              </p>
              <p className="mt-1 leading-relaxed text-red-800">
                {uploadError.message}
              </p>
              {uploadError.preservedFileName ? (
                <p className="mt-1.5 font-medium text-emerald-800">
                  ✓ Berkas sebelumnya ({uploadError.preservedFileName} · v
                  {uploadError.preservedVersion || 1}) tetap dipertahankan dan
                  tidak tertimpa.
                </p>
              ) : (
                <p className="mt-1.5 text-red-700">
                  Status slot tetap <strong>Belum diunggah</strong>. Silakan
                  pilih berkas PDF/JPG/PNG (maks. {MAX_UPLOAD_FILE_LABEL}) dan
                  coba unggah kembali.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-xs font-medium text-red-700 hover:underline shrink-0"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {readiness.unavailableRequiredDocs.length > 0 && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950"
        >
          <p className="font-semibold">
            Perhatian: {readiness.unavailableRequiredDocs.length} berkas wajib
            tidak memiliki isi berkas yang tersimpan
          </p>
          <p className="mt-1 text-amber-900">
            Berkas berikut tercatat pada metadata tetapi isinya tidak tersedia
            di penyimpanan browser:{" "}
            <strong>
              {readiness.unavailableRequiredDocs.map((d) => d.name).join(", ")}
            </strong>
            . Pilih ulang berkas tersebut agar dapat diperiksa dan dikirim ke
            petugas.
          </p>
        </div>
      )}

      <input
        ref={input}
        type="file"
        className="hidden"
        tabIndex={-1}
        accept=".pdf,.jpg,.jpeg,.png"
        aria-label="Pilih dokumen"
        onChange={pickFile}
      />

      <div className="document-list">
        {slots.map((slot) => {
          const doc = documents.find(
            (item) => item.id === slot.id && item.status === "TERUNGGAH",
          );
          const isUploading = uploadingSlotId === slot.id;
          const contentAvailable = doc ? isDocumentContentAvailable(doc) : false;
          const sourceBadge =
            doc?.qualityPreset === "sample_issue"
              ? "Dokumen contoh (bagian bawah terpotong)"
              : doc?.qualityPreset === "sample_clean"
                ? "Dokumen contoh (utuh & lengkap)"
                : doc
                  ? "Berkas dari perangkat Anda"
                  : null;
          return (
            <section className="document-item" key={slot.id}>
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span
                  className="material-symbols-outlined text-slate-400 mt-1"
                  aria-hidden="true"
                >
                  description
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium text-sm">{slot.name}</h2>
                    <span
                      className={
                        slot.required ? "status-attention" : "status-neutral"
                      }
                    >
                      {slot.required ? "Wajib" : "Tambahan"}
                    </span>
                    {isUploading && (
                      <span className="status-neutral">
                        Menyimpan isi berkas...
                      </span>
                    )}
                    {doc && contentAvailable && (
                      <span className="status-ready">
                        Terunggah · v{doc.version || 1}
                      </span>
                    )}
                    {doc && !contentAvailable && (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-800 border border-red-200">
                        Berkas tidak tersedia · v{doc.version || 1}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 break-words">
                    {doc ? (
                      <>
                        <strong>{doc.fileName}</strong> · {doc.size}
                        {sourceBadge ? ` · ${sourceBadge}` : ""}
                        {!contentAvailable ? (
                          <span className="block text-red-700 font-medium mt-1">
                            Isi berkas tidak tersedia di penyimpanan browser —
                            silakan pilih ulang berkas sebelum mengirim.
                          </span>
                        ) : null}
                      </>
                    ) : (
                      slot.conditionNote || "Belum dipilih"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {doc && (
                  <button
                    type="button"
                    className="btn-secondary !py-1 !px-2.5 !text-xs"
                    onClick={() =>
                      setPreviewDoc({
                        id: doc.id,
                        name: doc.name,
                        fileName: doc.fileName,
                        size: doc.size,
                        fileType: doc.fileType,
                        version: doc.version || 1,
                        uploadedAt: doc.uploadedAt,
                        qualityPreset: doc.qualityPreset,
                        previewKey: doc.previewKey,
                        fixtureId: doc.fixtureId,
                        previewUrl: doc.previewUrl,
                      })
                    }
                  >
                    Lihat berkas
                  </button>
                )}
                <button
                  type="button"
                  className="text-link disabled:opacity-50"
                  disabled={isUploading}
                  aria-label={(doc ? "Ganti " : "Pilih ") + slot.name}
                  onClick={() => choose(slot)}
                >
                  {isUploading
                    ? "Menyimpan..."
                    : doc
                      ? contentAvailable
                        ? "Ganti berkas"
                        : "Pilih ulang berkas"
                      : "Pilih berkas"}
                </button>
                {doc && (
                  <button
                    type="button"
                    className="text-sm text-slate-500 hover:text-red-700"
                    aria-label={"Hapus " + slot.name}
                    onClick={() => removeDocument(slot.id)}
                  >
                    Hapus
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={simulateFailureOnce}
            onChange={(e) => setSimulateFailureOnce(e.target.checked)}
            className="rounded border-slate-300 text-[#142c4b]"
          />
          <span>
            <strong>Simulasi uji kegagalan penyimpanan:</strong> gagalkan
            penyimpanan saat memilih berkas berikutnya (untuk menguji penanganan
            error &amp; perlindungan berkas lama).
          </span>
        </label>
        {simulateFailureOnce && (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">
            Aktif untuk 1 unggahan berikutnya
          </span>
        )}
      </div>

      {!canProceedToReview && (
        <p className="text-xs text-slate-500 mt-4">
          Untuk lanjut ke tahap <strong>Tinjau &amp; kirim</strong>: pastikan
          Tahap 1 &amp; 2 selesai dan seluruh {requiredSlots.length} dokumen
          persyaratan wajib telah dipilih serta isinya tersimpan.
        </p>
      )}

      <DocumentPreviewModal
        doc={previewDoc}
        applicantName={activePreparation.formData.nama_lengkap}
        applicantNik={activePreparation.formData.nik}
        applicantNoKk={activePreparation.formData.no_kk}
        applicantAddress={activePreparation.formData.alamat}
        onClose={() => setPreviewDoc(null)}
        onReupload={
          previewDoc?.id
            ? () => {
                const targetSlot = slots.find((s) => s.id === previewDoc.id);
                setPreviewDoc(null);
                if (targetSlot) {
                  choose(targetSlot);
                }
              }
            : undefined
        }
      />
    </PreparationLayout>
  );
}
