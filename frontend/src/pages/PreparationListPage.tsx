import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { getReviewStatusLabel, useApp } from "../context/AppContext";
import {
  documentSlots,
  getSelectedConditionOption,
} from "../types/preparation";

export function PreparationListPage() {
  const {
    services,
    preparations,
    selectPreparation,
    manageDraft,
    getPreparationReadiness,
    applications,
  } = useApp();
  const navigate = useNavigate();
  const [archived, setArchived] = useState(false);
  const [error, setError] = useState("");

  const validPreparations = preparations.filter(
    (p) =>
      p.id !== "prep-draft-uninitialized" && Boolean(p.archivedAt) === archived,
  );

  const handleStartNewDefault = () => {
    navigate("/kebutuhan");
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7F2] text-[#17324D]">
      <Sidebar role="warga" />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar breadcrumbs={["Persiapan saya"]} role="warga" />
        <main
          id="main-content"
          tabIndex={-1}
          className="workspace-content w-full flex-1"
        >
          <div className="section-heading">
            <div>
              <h1>Persiapan saya</h1>
              <p className="text-sm text-slate-500 mt-1">
                Setiap urusan memiliki data pemohon, dokumen, dan riwayat
                pemeriksaan yang terpisah.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleStartNewDefault}
                className="button-primary"
              >
                Buat persiapan baru
              </button>
            </div>
          </div>

          <label className="flex gap-3 items-center min-h-[44px] mb-4">
            <input
              type="checkbox"
              checked={archived}
              onChange={(event) => setArchived(event.target.checked)}
            />
            Lihat persiapan yang diarsipkan
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {validPreparations.length === 0 ? (
            <div className="empty-state">
              <h2>Belum ada persiapan yang disimpan</h2>
              <p>
                Pilih layanan yang ingin diurus, tentukan kebutuhanmu pada tahap
                pertama, lalu siapkan data dan dokumenmu.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleStartNewDefault}
                  className="button-primary"
                >
                  Mulai persiapan baru
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {validPreparations.map((prep) => {
                const service =
                  services.find((s) => s.id === prep.serviceId) || services[0];
                const conditionOption = getSelectedConditionOption(
                  service,
                  prep.conditionKey,
                );
                const slots = documentSlots(service, conditionOption.value);
                const requiredSlots = slots.filter((slot) => slot.required);
                const uploadedRequired = requiredSlots.filter((slot) =>
                  prep.documents.some(
                    (doc) => doc.id === slot.id && doc.status === "TERUNGGAH",
                  ),
                ).length;

                const progress = getPreparationReadiness(prep);
                const linkedApp = applications.find(
                  (app) =>
                    app.id === prep.linkedApplicationId ||
                    app.preparation_id === prep.id,
                );
                const needsAttention =
                  progress.state === "PERLU_DILENGKAPI" ||
                  progress.state === "PERLU_PERIKSA_ULANG";

                return (
                  <article
                    key={prep.id}
                    className="preparation-card justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-600">
                          {prep.internalReference}
                        </span>
                        <span className="text-xs text-slate-500">
                          · {prep.agency} · {prep.region}
                        </span>
                        <span
                          className={
                            needsAttention
                              ? "status-attention"
                              : progress.basicValidationPassed
                                ? "status-ready"
                                : "status-neutral"
                          }
                        >
                          {progress.label}
                        </span>
                        {linkedApp && (
                          <span
                            className={
                              linkedApp.current_status === "PERLU_PERBAIKAN" &&
                              !linkedApp.revision_pending
                                ? "status-attention"
                                : "status-neutral"
                            }
                          >
                            Tinjauan: {getReviewStatusLabel(linkedApp)}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-semibold mt-2">
                        {prep.serviceName}
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        Subjek:{" "}
                        <strong>
                          {prep.applicantTarget === "anggota_keluarga"
                            ? "Anggota keluarga"
                            : "Diri sendiri"}
                        </strong>{" "}
                        ({prep.formData.nama_lengkap || "Nama belum diisi"}) ·
                        Kondisi: {conditionOption.label}
                      </p>
                      <p className="text-sm text-slate-600 mt-1.5">
                        {uploadedRequired} dari {requiredSlots.length} dokumen
                        wajib terunggah
                        {progress.hasUnsentDraftChanges
                          ? " · Ada perubahan draf yang belum dikirim ulang"
                          : !linkedApp && progress.basicValidationPassed
                            ? " · Siap ditinjau & dikirim ke petugas pendamping"
                            : ""}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>Diperbarui: {prep.updatedAt}</span>
                        {linkedApp && (
                          <Link
                            to={`/pelacakan/${encodeURIComponent(linkedApp.id)}`}
                            className="text-link text-xs"
                          >
                            Permintaan tinjauan {linkedApp.internal_reference} (
                            {getReviewStatusLabel(linkedApp)}) →
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      <button
                        type="button"
                        className="text-link min-h-[44px]"
                        onClick={() => {
                          try {
                            manageDraft(
                              prep.id,
                              archived ? "restore" : "archive",
                            );
                            setError("");
                          } catch (cause) {
                            setError(
                              cause instanceof Error
                                ? cause.message
                                : "Belum berhasil.",
                            );
                          }
                        }}
                      >
                        {archived ? "Pulihkan persiapan" : "Arsipkan persiapan"}
                      </button>
                      {!linkedApp && !prep.linkedApplicationId && (
                        <button
                          type="button"
                          className="text-link min-h-[44px]"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Hapus draf yang belum pernah dikirim ini?",
                              )
                            ) {
                              try {
                                manageDraft(prep.id, "delete");
                              } catch (cause) {
                                setError(
                                  cause instanceof Error
                                    ? cause.message
                                    : "Belum berhasil.",
                                );
                              }
                            }
                          }}
                        >
                          Hapus draf
                        </button>
                      )}
                      <button
                        type="button"
                        className="button-primary"
                        onClick={() => {
                          selectPreparation(prep.id);
                          navigate(progress.steps.resumePath);
                        }}
                      >
                        {progress.steps.resumeLabel}{" "}
                        <span aria-hidden="true">→</span>
                      </button>
                      <button
                        type="button"
                        className="text-link text-xs"
                        onClick={() => {
                          selectPreparation(prep.id);
                          navigate(
                            `/persiapan/kebutuhan?prep=${encodeURIComponent(prep.id)}`,
                          );
                        }}
                      >
                        Tinjau kebutuhan (Tahap 1)
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
