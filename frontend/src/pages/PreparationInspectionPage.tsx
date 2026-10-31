import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PreparationLayout } from "../components/PreparationLayout";
import { useApp } from "../context/AppContext";
import { documentSlots, type InspectionScope } from "../types/preparation";

const scopeLabels: Record<InspectionScope, string> = {
  format_formulir: "Format Formulir",
  keberadaan_berkas: "Keberadaan Berkas",
  analisis_isi_dokumen: "Analisis Isi Dokumen",
  aturan_admin: "Aturan Tambahan Admin",
};

export function PreparationInspectionPage() {
  const {
    services,
    activePreparation,
    documents,
    inspections,
    runAIScanSimulation,
    aiScanning,
    readiness,
    confirmFindingCorrection,
  } = useApp();
  const [params] = useSearchParams();

  const currentService =
    services.find((s) => s.id === activePreparation.serviceId) || services[0];
  const slots = documentSlots(currentService, activePreparation.conditionKey);

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
  const [selectedId, setSelectedId] = useState("");
  const [confirmingId, setConfirmingId] = useState("");
  const [confirmationNote, setConfirmationNote] = useState("");

  const available = documents.filter(
    (doc) =>
      slots.some((slot) => slot.id === doc.id) && doc.status === "TERUNGGAH",
  );
  const selected =
    available.find((doc) => doc.id === selectedId) || available[0];

  const hasInspected = Boolean(activePreparation.lastInspectionSnapshot);
  const unresolvedErrors = readiness.unresolvedErrors;
  const unresolvedWarnings = readiness.unresolvedWarnings;
  const canRunScan = readiness.steps.step3Dokumen && !aiScanning;

  return (
    <PreparationLayout
      step={4}
      title="Rincian validasi & simulasi aturan (opsional)"
      actions={
        <>
          <Link
            to={"/persiapan/dokumen" + querySuffix}
            className="button-secondary"
          >
            Kembali ke dokumen
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={"/persiapan/ringkasan" + querySuffix}
              className="button-primary"
            >
              Lanjut ke Tinjau &amp; kirim →
            </Link>
          </div>
        </>
      }
    >
      <div className="mb-5 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 leading-relaxed flex flex-wrap items-center justify-between gap-3">
        <span>
          <strong>Peran halaman ini:</strong> Alur utama persiapan menggunakan{" "}
          <strong>validasi dasar aplikasi</strong> dan{" "}
          <strong>tinjauan manusia oleh petugas pendamping</strong> pada tahap{" "}
          <em>Tinjau &amp; kirim</em>. Pembacaan isi dokumen otomatis (OCR/AI)
          disiapkan untuk pengembangan berikutnya dan{" "}
          <strong>tidak menghalangi pengiriman berkas Anda</strong>.
        </span>
        <Link
          to={"/persiapan/ringkasan" + querySuffix}
          className="text-link text-xs shrink-0"
        >
          Ke Tinjau &amp; kirim →
        </Link>
      </div>
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
            Ke tahap Kebutuhan →
          </Link>
        </div>
      ) : !readiness.steps.step2Data ? (
        <div className="case-update-note mb-5 flex flex-wrap items-center justify-between gap-3">
          <span>
            <strong>Prasyarat belum selesai:</strong> Data pemohon pada Tahap 2
            belum lengkap. Lengkapi data agar pemeriksaan dapat dijalankan.
          </span>
          <Link
            to={"/persiapan/data" + querySuffix}
            className="button-primary !py-1.5 !px-3 !text-xs shrink-0"
          >
            Ke tahap Data →
          </Link>
        </div>
      ) : !readiness.steps.step3Dokumen ? (
        <div className="case-update-note mb-5 flex flex-wrap items-center justify-between gap-3">
          <span>
            <strong>Prasyarat belum selesai:</strong>{" "}
            {readiness.missingRequiredDocs.length > 0
              ? `Masih ada ${readiness.missingRequiredDocs.length} dokumen wajib yang belum diunggah.`
              : "Persetujuan pemrosesan berkas pada tahap Dokumen belum dicentang."}
          </span>
          <Link
            to={"/persiapan/dokumen" + querySuffix}
            className="button-primary !py-1.5 !px-3 !text-xs shrink-0"
          >
            Ke tahap Dokumen →
          </Link>
        </div>
      ) : null}

      {!available.length ? (
        <div className="empty-state">
          <h2>Belum ada berkas untuk diperiksa</h2>
          <p>
            Pilih dokumen persyaratan atau gunakan fixture simulasi pada tahap
            Dokumen terlebih dahulu.
          </p>
          <Link
            to={"/persiapan/dokumen" + querySuffix}
            className="button-primary"
          >
            Buka tahap dokumen →
          </Link>
        </div>
      ) : (
        <>
          <section className="plain-panel mb-6" aria-label="Status pemeriksaan">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="panel-title">Status pemeriksaan</h2>
                  <span
                    className={
                      readiness.state === "SIAP_AWAL"
                        ? "status-neutral"
                        : "status-attention"
                    }
                  >
                    {readiness.label}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1.5">
                  {!hasInspected
                    ? "Pemeriksaan awal belum dijalankan. Tekan tombol di samping untuk memeriksa format formulir, keberadaan berkas wajib, dan status keterbacaan berkas."
                    : readiness.isStale
                      ? readiness.staleReason ||
                        "Ada perubahan data, berkas, atau aturan setelah pemeriksaan terakhir. Jalankan pemeriksaan ulang."
                      : unresolvedErrors.length > 0
                        ? `${unresolvedErrors.length} temuan penghalang perlu diperbaiki sebelum berkas dinyatakan siap awal.`
                        : readiness.notEvaluatedFindings.length > 0
                          ? `Evaluasi aturan formulir dan keberadaan berkas telah selesai, namun analisis isi dokumen otomatis (OCR/LLM) belum tersedia untuk ${readiness.notEvaluatedFindings.length} item. Catatan mandiri warga tidak menggantikan cakupan pemeriksaan otomatis sistem.`
                          : unresolvedWarnings.length > 0
                            ? `Tidak ada penghalang wajib, namun terdapat ${unresolvedWarnings.length} peringatan yang perlu ditinjau.`
                            : readiness.hasSimulatedFixtures
                              ? "Evaluasi aturan formulir (nyata) dan pemeriksaan keterbacaan berkas (Simulasi Fixture) telah selesai dan sesuai."
                              : "Format formulir dan kelengkapan berkas pada draf ini telah melewati pemeriksaan awal."}
                </p>
              </div>
              <button
                type="button"
                className="button-primary shrink-0 disabled:opacity-50"
                disabled={!canRunScan}
                onClick={() => runAIScanSimulation(activePreparation.id)}
              >
                {aiScanning
                  ? "Memeriksa…"
                  : !hasInspected
                    ? "Jalankan pemeriksaan"
                    : readiness.isStale
                      ? "Periksa ulang berkas"
                      : "Periksa ulang"}
              </button>
            </div>
          </section>

          <div className="inspection-grid">
            <section className="plain-panel">
              <h2 className="panel-title">Berkas dalam draf ini</h2>
              <label className="sr-only" htmlFor="inspection-document">
                Pilih berkas
              </label>
              <select
                className="field-select"
                id="inspection-document"
                value={selected?.id || ""}
                onChange={(event) => setSelectedId(event.target.value)}
              >
                {available.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} (Versi {doc.version || 1})
                  </option>
                ))}
              </select>
              {selected && (
                <div className="document-placeholder">
                  <span
                    className="material-symbols-outlined text-[40px] text-slate-400"
                    aria-hidden="true"
                  >
                    description
                  </span>
                  <p className="text-sm font-semibold mt-3 break-words text-[#142c4b]">
                    {selected.fileName} (v{selected.version || 1})
                  </p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {selected.qualityPreset === "sample_issue"
                      ? "[Simulasi Fixture] Berkas contoh dengan area tanda tangan/QR bawah terpotong."
                      : selected.qualityPreset === "sample_clean"
                        ? "[Simulasi Fixture] Berkas contoh utuh untuk pengujian alur."
                        : "Berkas perangkat pengguna: pembacaan isi dokumen otomatis (OCR/AI) belum terhubung ke backend. Pastikan secara mandiri keempat sudut dokumen terlihat jelas."}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
                <Link
                  to={"/persiapan/dokumen" + querySuffix}
                  className="text-link"
                >
                  Ganti berkas →
                </Link>
                <Link
                  to={"/persiapan/data" + querySuffix}
                  className="text-link"
                >
                  Ubah data →
                </Link>
              </div>
            </section>

            <section>
              <h2 className="panel-title mb-4">
                Rincian pemeriksaan ({inspections.length})
              </h2>
              <div className="space-y-4">
                {!inspections.length && (
                  <div className="plain-panel">
                    <p className="field-hint">
                      Belum ada hasil pemeriksaan untuk draf ini. Jalankan
                      pemeriksaan untuk mengevaluasi format formulir dan
                      dokumen yang dipilih.
                    </p>
                  </div>
                )}

                {inspections.map((finding) => {
                  const isNotEvaluated =
                    finding.evaluationStatus === "not_evaluated";
                  const isSimulated =
                    finding.evaluationStatus === "simulated_fixture";
                  const isRealEvaluated =
                    finding.evaluationStatus === "evaluated_passed" ||
                    finding.evaluationStatus === "evaluated_issue";
                  const isError =
                    !finding.resolved && finding.severity === "error";
                  const isWarning =
                    !finding.resolved && finding.severity === "warning";
                  const targetPath =
                    finding.scope === "format_formulir"
                      ? "/persiapan/data" + querySuffix
                      : "/persiapan/dokumen" + querySuffix;

                  const scopeLabel = finding.scope
                    ? scopeLabels[finding.scope]
                    : finding.category;

                  return (
                    <article className="finding-card" key={finding.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="finding-label font-medium">
                            {scopeLabel}
                          </span>
                          {isSimulated && (
                            <span className="status-neutral">
                              Simulasi Fixture
                            </span>
                          )}
                          {isRealEvaluated && (
                            <span className="status-neutral">
                              Evaluasi aturan nyata
                            </span>
                          )}
                          {isNotEvaluated && (
                            <span className="status-attention">
                              Analisis otomatis belum tersedia
                            </span>
                          )}
                        </div>
                        <span
                          className={
                            isError || isNotEvaluated
                              ? "status-attention"
                              : "status-neutral"
                          }
                        >
                          {isNotEvaluated
                            ? "Belum dianalisis otomatis"
                            : finding.resolved
                              ? isSimulated
                                ? "Sesuai (Simulasi)"
                                : "Sesuai"
                              : isError
                                ? "Perlu diperbaiki"
                                : "Peringatan aturan"}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold mt-2.5 text-[#142c4b]">
                        {finding.title}
                      </h3>

                      <p className="text-sm text-slate-600 leading-relaxed mt-2">
                        {finding.evidence}
                      </p>

                      {!finding.resolved && finding.action && (
                        <p className="text-sm text-slate-700 leading-relaxed mt-2">
                          <strong>Tindakan:</strong> {finding.action}
                        </p>
                      )}

                      {finding.userCorrection && (
                        <div className="text-xs text-slate-700 mt-2.5 bg-[#f0f5fc] p-3 rounded-lg border border-[#cbd7e6] space-y-1">
                          <p className="font-semibold text-[#142c4b]">
                            Catatan warga ({finding.userCorrection.correctedAt})
                            {" · "}
                            Sumber:{" "}
                            {finding.userCorrection.source ||
                              "Catatan pemeriksaan mandiri warga (bukan hasil evaluasi otomatis sistem)"}
                          </p>
                          <p>{finding.userCorrection.note}</p>
                          {isNotEvaluated && (
                            <p className="text-slate-500">
                              Catatan mandiri ini tersimpan pada draf, namun
                              status analisis otomatis tetap tercatat belum
                              dilakukan karena OCR/LLM belum terhubung.
                            </p>
                          )}
                        </div>
                      )}

                      {!finding.resolved && (
                        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
                          <Link className="text-link" to={targetPath}>
                            {finding.scope === "format_formulir"
                              ? "Perbaiki data →"
                              : "Ganti berkas / gunakan fixture simulasi →"}
                          </Link>

                          {(isWarning || isNotEvaluated) &&
                            confirmingId !== finding.id && (
                              <button
                                type="button"
                                className="text-xs font-medium text-slate-600 hover:text-[#1769d2]"
                                onClick={() => {
                                  setConfirmingId(finding.id);
                                  setConfirmationNote(
                                    finding.userCorrection?.note ||
                                      "Saya telah memeriksa berkas fisik/foto secara mandiri dan memastikan seluruh bagian terbaca jelas.",
                                  );
                                }}
                              >
                                {finding.userCorrection
                                  ? "Ubah catatan pemeriksaan mandiri"
                                  : "Tambah catatan pemeriksaan mandiri"}
                              </button>
                            )}
                        </div>
                      )}

                      {(isWarning || isNotEvaluated) &&
                        confirmingId === finding.id && (
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2.5">
                            <label
                              htmlFor={`confirm-note-${finding.id}`}
                              className="block text-xs font-medium text-slate-700"
                            >
                              Catatan pemeriksaan mandiri warga (tidak mengubah
                              status analisis otomatis):
                            </label>
                            <input
                              id={`confirm-note-${finding.id}`}
                              type="text"
                              value={confirmationNote}
                              onChange={(e) =>
                                setConfirmationNote(e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="button-primary text-xs py-2 px-3"
                                onClick={() => {
                                  confirmFindingCorrection(
                                    finding.id,
                                    confirmationNote,
                                  );
                                  setConfirmingId("");
                                }}
                              >
                                Simpan catatan mandiri warga
                              </button>
                              <button
                                type="button"
                                className="button-secondary text-xs py-2 px-3"
                                onClick={() => setConfirmingId("")}
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        )}
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        </>
      )}
    </PreparationLayout>
  );
}
