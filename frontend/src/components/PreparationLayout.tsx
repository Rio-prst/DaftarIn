import { useEffect, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  } = useApp();
  const [params] = useSearchParams();

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
                tidak ditemukan pada daftar persiapan akun ini.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Link to="/persiapan" className="button-primary">
                  Buka daftar persiapan saya
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
                Pilih persiapan dari daftar persiapanmu atau mulai draf persiapan baru dari tahap pertama.
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
    <div className="flex min-h-screen bg-[#F5F7FB]">
      <Sidebar role="warga" />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar breadcrumbs={["Persiapan saya", title]} role="warga" />
        <main
          id="main-content"
          tabIndex={-1}
          className="workspace-content w-full flex-1 pb-32"
        >
          {/* Header Judul Dossier */}
          <div className="flex flex-wrap items-baseline justify-between gap-4 pb-1 border-b border-slate-200/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-[#1769D2] font-mono font-bold text-xs">
                  {activePreparation.internalReference}
                </span>
                <span className="text-xs text-slate-500 font-medium">{targetLabel}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142C4B] mt-1 font-display tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Layanan: <strong>{activePreparation.serviceName}</strong> · Terakhir diperbarui {activePreparation.updatedAt}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/persiapan" className="text-link text-xs font-semibold">
                ← Daftar persiapan saya
              </Link>
            </div>
          </div>

          {activePreparation.migrationNote && (
            <div className="case-update-note mt-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <p className="max-w-2xl leading-relaxed">
                <strong>Catatan data sebelumnya:</strong> {activePreparation.migrationNote}
              </p>
              <button
                type="button"
                onClick={() => dismissMigrationNote(activePreparation.id)}
                className="button-secondary !py-1 !px-2.5 !text-xs"
              >
                Tutup catatan
              </button>
            </div>
          )}

          {/* Banner Permintaan Perbaikan Petugas (Tactile Civic Notice) */}
          {revisionApp && revisionApp.current_status === "PERLU_PERBAIKAN" && (
            <div
              className={`mt-5 rounded-2xl border-l-4 p-5 shadow-xs transition-all ${
                revisionApp.revision_pending
                  ? "bg-blue-50/95 border-l-blue-600 border border-blue-200/90 text-blue-950"
                  : "bg-amber-50/95 border-l-amber-500 border border-amber-200/90 text-amber-950"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-200/70">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-amber-600">
                    notification_important
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">
                    {revisionApp.revision_pending
                      ? `Perbaikan Telah Dikirim · ${revisionApp.internal_reference}`
                      : `Permintaan Tindakan Perbaikan Petugas · ${revisionApp.internal_reference}`}
                  </span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white font-medium border border-amber-200 text-amber-800">
                  Draf Berkas: {activePreparation.internalReference}
                </span>
              </div>

              {latestOfficerRevision ? (
                <div className="mt-3.5 space-y-2 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-700 font-semibold">Bagian yang Perlu Diperbaiki:</span>
                    <span className="font-bold text-[#142C4B] bg-white px-2.5 py-0.5 rounded-md border border-amber-200">
                      {latestOfficerRevision.targetItem}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-300">
                      {OFFICER_ISSUE_CATEGORY_LABELS[latestOfficerRevision.issueCategory]}
                    </span>
                  </div>

                  <p className="text-slate-800 leading-relaxed bg-white/70 p-3 rounded-xl border border-amber-100">
                    <strong className="text-amber-950">Catatan Petugas ({latestOfficerRevision.officerName}):</strong>{" "}
                    {latestOfficerRevision.problemDescription}
                  </p>

                  <div className="p-3 rounded-xl bg-white border border-amber-300/80 text-amber-950 flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0 mt-0.5">
                      task_alt
                    </span>
                    <p className="leading-relaxed">
                      <strong>Tindakan yang Diminta:</strong> {latestOfficerRevision.requiredAction}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm leading-relaxed">
                  Perbaiki data atau ganti berkas sesuai catatan petugas pada permintaan tinjauan{" "}
                  <strong>{revisionApp.internal_reference}</strong>, lalu kirimkan kembali perbaikan pada tahap Tinjau &amp; kirim.
                </p>
              )}
            </div>
          )}

          {/* Stepper Manila Tab + Konten Halaman */}
          <div key={activePreparation.id} className="mt-4">
            <PreparationStepper currentStep={step} />
            <div className="civic-dossier-body bg-white rounded-b-2xl border border-t-0 border-[#CBD7E6] p-6 sm:p-8 shadow-xs">
              {children}
            </div>
          </div>
        </main>

        {/* Sticky Actions Bar dengan Glassmorphism */}
        <div
          key={`actions-${activePreparation.id}`}
          className="preparation-actions no-print sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-4 shadow-lg"
        >
          {actions}
        </div>
      </div>
    </div>
  );
}

export default PreparationLayout;
