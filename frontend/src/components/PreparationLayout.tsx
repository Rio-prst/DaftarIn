import { useEffect, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { PreparationStepper } from "./PreparationStepper";
import { useApp } from "../context/AppContext";
import {
  OFFICER_ISSUE_CATEGORY_LABELS,
  resolveApplicationPreparationLink,
} from "../types/preparation";

export function PreparationLayout({
  step,
  title,
  children,
  actions,
}: {
  step: number;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  const {
    user,
    activePreparation,
    preparations,
    selectPreparation,
    dismissMigrationNote,
    applications,
    guestIntent,
    createLinkedRevisionPreparation,
  } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const prepParam = params.get("prep");
  const revisionId = params.get("application");
  const isNewRequest = params.get("new") === "1";

  const userPreparations = preparations.filter(
    (p) => p.id !== "prep-draft-uninitialized" && p.ownerId === user.id,
  );

  const requestedPrep = prepParam
    ? userPreparations.find((p) => p.id === prepParam)
    : undefined;

  const isInvalidPrepParam = Boolean(prepParam && !requestedPrep);

  const isInitializingNewDraft =
    step === 1 && !prepParam && !revisionId && (isNewRequest || Boolean(guestIntent));

  const linkResolution =
    !isInvalidPrepParam && revisionId
      ? resolveApplicationPreparationLink({
          applicationId: revisionId,
          requestedPrepId: prepParam,
          applications,
          preparations: userPreparations,
          currentUserId: user.id,
        })
      : null;

  const resolvedPrep = isInvalidPrepParam
    ? undefined
    : linkResolution
      ? linkResolution.status === "valid"
        ? linkResolution.preparation
        : undefined
      : requestedPrep
        ? requestedPrep
        : !isInitializingNewDraft &&
            activePreparation.id !== "prep-draft-uninitialized" &&
            userPreparations.some((p) => p.id === activePreparation.id)
          ? activePreparation
          : undefined;

  const isSyncingActivePrep = Boolean(
    resolvedPrep && activePreparation.id !== resolvedPrep.id,
  );

  useEffect(() => {
    if (resolvedPrep && activePreparation.id !== resolvedPrep.id) {
      selectPreparation(resolvedPrep.id);
    }
  }, [resolvedPrep, activePreparation.id, selectPreparation]);

  // 1. Jika sedang menginisialisasi draf baru dari ?new=1 atau guestIntent, tunggu sampai URL diperbarui
  if (isInitializingNewDraft) {
    return (
      <div className="flex min-h-screen bg-[#F7F8FA]">
        <Sidebar role="warga" />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar breadcrumbs={["Persiapan saya", title]} role="warga" />
          <main
            id="main-content"
            tabIndex={-1}
            className="workspace-content w-full flex-1"
          >
            <div className="plain-panel" role="status" aria-live="polite">
              <h1 className="panel-title">Menyiapkan draf persiapan baru…</h1>
              <p className="text-sm text-slate-600 mt-1">
                Membuat draf urusan terpisah untuk sesi persiapan ini.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 2. Jika parameter ?prep= tidak ditemukan pada draf milik pengguna, tolak tanpa fallback ke activePreparation
  if (isInvalidPrepParam) {
    return (
      <div className="flex min-h-screen bg-[#F7F8FA]">
        <Sidebar role="warga" />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar
            breadcrumbs={["Persiapan saya", "Persiapan tidak ditemukan"]}
            role="warga"
          />
          <main
            id="main-content"
            tabIndex={-1}
            className="workspace-content w-full flex-1"
          >
            <div className="empty-state" role="alert">
              <h1>Persiapan tidak ditemukan</h1>
              <p>
                Draf persiapan dengan ID{" "}
                <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                  {prepParam}
                </code>{" "}
                tidak ditemukan pada daftar persiapan akun ini. Sistem tidak
                membuka atau mengubah draf lain sebagai pengganti otomatis.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Link to="/persiapan" className="button-primary">
                  Kembali ke Daftar persiapan
                </Link>
                <Link
                  to="/persiapan/kebutuhan?new=1"
                  className="button-secondary"
                >
                  Mulai persiapan baru
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 3. Jika parameter ?application= tidak valid, belum terhubung, atau tidak cocok dengan ?prep=
  if (linkResolution && linkResolution.status !== "valid") {
    return (
      <div className="flex min-h-screen bg-[#F7F8FA]">
        <Sidebar role="warga" />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar
            breadcrumbs={["Persiapan saya", "Validasi hubungan pengajuan"]}
            role="warga"
          />
          <main
            id="main-content"
            tabIndex={-1}
            className="workspace-content w-full flex-1"
          >
            <div className="empty-state" role="alert">
              <h1>
                {linkResolution.status === "application_not_found"
                  ? "Pengajuan tidak ditemukan"
                  : linkResolution.status === "unlinked_application"
                    ? "Persiapan asal pengajuan belum terhubung"
                    : "Kombinasi persiapan dan pengajuan tidak cocok"}
              </h1>
              <p>{linkResolution.message}</p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {linkResolution.status === "mismatch" && (
                  <>
                    <Link
                      to={`/persiapan/dokumen?prep=${encodeURIComponent(linkResolution.expectedPreparation.id)}&application=${encodeURIComponent(linkResolution.application.id)}`}
                      className="button-primary"
                    >
                      Buka persiapan asal pengajuan ini (
                      {linkResolution.expectedPreparation.internalReference}) →
                    </Link>
                    <Link
                      to={`/persiapan/kebutuhan?prep=${encodeURIComponent(linkResolution.requestedPreparation.id)}`}
                      className="button-secondary"
                    >
                      Buka {linkResolution.requestedPreparation.internalReference}{" "}
                      tanpa kaitan revisi
                    </Link>
                  </>
                )}
                {linkResolution.status === "unlinked_application" && (
                  <button
                    type="button"
                    className="button-primary"
                    onClick={() => {
                      const created = createLinkedRevisionPreparation(
                        linkResolution.application.id,
                      );
                      if (created) {
                        navigate(
                          `/persiapan/dokumen?prep=${encodeURIComponent(created.id)}&application=${encodeURIComponent(linkResolution.application.id)}`,
                        );
                      }
                    }}
                  >
                    Buat &amp; kaitkan draf perbaikan untuk pengajuan ini →
                  </button>
                )}
                <Link to="/pelacakan" className="button-secondary">
                  Kembali ke Pelacakan pengajuan
                </Link>
                <Link to="/persiapan" className="text-link text-sm">
                  Daftar persiapan saya
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 4. Jika tidak ada persiapan yang valid sama sekali
  if (!resolvedPrep) {
    return (
      <div className="flex min-h-screen bg-[#F7F8FA]">
        <Sidebar role="warga" />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar breadcrumbs={["Persiapan saya", title]} role="warga" />
          <main
            id="main-content"
            tabIndex={-1}
            className="workspace-content w-full flex-1"
          >
            <div className="empty-state">
              <h1>Belum ada persiapan yang dipilih</h1>
              <p>
                Pilih persiapan dari daftar persiapanmu atau mulai draf
                persiapan baru dari tahap pertama.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Link
                  to="/persiapan/kebutuhan?new=1"
                  className="button-primary"
                >
                  Mulai persiapan baru
                </Link>
                <Link to="/persiapan" className="button-secondary">
                  Buka Daftar persiapan
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 5. Pastikan sinkronisasi activePreparation selesai sebelum me-mount form input dan tombol aksi
  if (isSyncingActivePrep) {
    return (
      <div className="flex min-h-screen bg-[#F7F8FA]">
        <Sidebar role="warga" />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar breadcrumbs={["Persiapan saya", title]} role="warga" />
          <main
            id="main-content"
            tabIndex={-1}
            className="workspace-content w-full flex-1"
          >
            <div className="plain-panel" role="status" aria-live="polite">
              <h1 className="panel-title">Memuat draf persiapan…</h1>
              <p className="text-sm text-slate-600 mt-1">
                Menyinkronkan draf{" "}
                <span className="font-mono">
                  {resolvedPrep.internalReference}
                </span>
                .
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const revisionApp =
    linkResolution && linkResolution.status === "valid"
      ? linkResolution.application
      : applications.find(
          (app) =>
            app.owner_id === user.id &&
            (app.id === activePreparation.linkedApplicationId ||
              app.preparation_id === activePreparation.id),
        );

  const targetLabel =
    activePreparation.applicantTarget === "anggota_keluarga"
      ? "Untuk anggota keluarga"
      : "Untuk diri sendiri";

  const latestOfficerRevision =
    revisionApp?.latest_revision_detail ||
    revisionApp?.events
      .slice()
      .reverse()
      .find((e) => e.revision_detail)?.revision_detail;

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <Sidebar role="warga" />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar breadcrumbs={["Persiapan saya", title]} role="warga" />
        <main
          id="main-content"
          tabIndex={-1}
          className="workspace-content w-full flex-1 pb-28"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h1>{title}</h1>
              <p className="text-sm text-slate-600 mt-1">
                {activePreparation.serviceName} · {targetLabel} ·{" "}
                <span className="font-mono text-xs text-slate-500">
                  {activePreparation.internalReference}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/persiapan" className="text-link text-xs">
                Daftar persiapan saya
              </Link>
              <details className="text-xs text-slate-500">
                <summary className="cursor-pointer hover:text-slate-700">
                  Informasi draf
                </summary>
                <div className="mt-1 p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                  <p>Referensi persiapan: {activePreparation.internalReference}</p>
                  <p>Terakhir diperbarui: {activePreparation.updatedAt}</p>
                  <p>Versi isian formulir: v{activePreparation.dataVersion}</p>
                  {revisionApp && (
                    <p>
                      Permintaan tinjauan terhubung:{" "}
                      {revisionApp.internal_reference}
                    </p>
                  )}
                </div>
              </details>
            </div>
          </div>

          {activePreparation.migrationNote && (
            <div className="case-update-note mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-amber-950 max-w-2xl">
                <strong>Catatan data sebelumnya:</strong>{" "}
                {activePreparation.migrationNote}
              </p>
              <button
                type="button"
                onClick={() => dismissMigrationNote(activePreparation.id)}
                className="btn-secondary !py-1 !px-2.5 !text-xs"
              >
                Tutup catatan
              </button>
            </div>
          )}

          {revisionApp && revisionApp.current_status === "PERLU_PERBAIKAN" && (
            <div
              className={`mt-4 rounded-xl border p-4 ${
                revisionApp.revision_pending
                  ? "bg-blue-50/90 border-blue-200 text-blue-950"
                  : "bg-amber-50/95 border-amber-300 text-amber-950"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider">
                  {revisionApp.revision_pending
                    ? `Perbaikan Telah Dikirim · ${revisionApp.internal_reference}`
                    : `Permintaan Perbaikan Petugas · ${revisionApp.internal_reference}`}
                </p>
                <span className="text-xs font-medium">
                  Draf asal: {activePreparation.internalReference}
                </span>
              </div>
              {latestOfficerRevision ? (
                <div className="mt-2 space-y-1.5 text-xs">
                  <p>
                    <strong>Bagian yang perlu diperbaiki:</strong>{" "}
                    {latestOfficerRevision.targetItem} ·{" "}
                    <span className="inline-block px-2 py-0.5 rounded bg-white/80 border border-amber-300 font-semibold">
                      {
                        OFFICER_ISSUE_CATEGORY_LABELS[
                          latestOfficerRevision.issueCategory
                        ]
                      }
                    </span>
                  </p>
                  <p>
                    <strong>Catatan petugas ({latestOfficerRevision.officerName}):</strong>{" "}
                    {latestOfficerRevision.problemDescription}
                  </p>
                  <p>
                    <strong>Tindakan perbaikan yang diminta:</strong>{" "}
                    {latestOfficerRevision.requiredAction}
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-xs">
                  Perbaiki data atau ganti berkas sesuai catatan petugas pada
                  permintaan tinjauan <strong>{revisionApp.internal_reference}</strong>,
                  lalu kirim perbaikan pada tahap Tinjau &amp; kirim.
                </p>
              )}
            </div>
          )}

          <div key={activePreparation.id}>
            <PreparationStepper currentStep={step} />
            {children}
          </div>
        </main>
        <div
          key={`actions-${activePreparation.id}`}
          className="preparation-actions no-print"
        >
          {actions}
        </div>
      </div>
    </div>
  );
}
