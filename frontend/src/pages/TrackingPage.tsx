import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import {
  DocumentPreviewModal,
  type PreviewableDocument,
} from "../components/DocumentPreviewModal";
import {
  DEFAULT_REVIEW_UNIT,
  getOfficialSubmissionStatusLabel,
  getReviewStatusLabel,
  useApp,
  type ApplicationStatusCode,
} from "../context/AppContext";
import {
  OFFICER_ISSUE_CATEGORY_LABELS,
  OFFICER_ITEM_VERDICT_LABELS,
  resolveApplicationPreparationLink,
} from "../types/preparation";

const NEXT_ACTION_GUIDANCE: Record<ApplicationStatusCode, string> = {
  DICATAT_WARGA:
    "Simpan bukti tanda terima fisik/digital dari loket instansi. Catatan ini dibuat oleh warga dan belum dikonfirmasi oleh sistem instansi.",
  DITERIMA:
    "Permintaan tinjauan awal sudah masuk ke antrean petugas pendamping. Tunggu petugas memulai pemeriksaan kelengkapan dan keterbacaan berkas.",
  VERIFIKASI:
    "Petugas pendamping sedang memeriksa kesesuaian data dan keterbacaan berkas. Pantau halaman ini apabila ada permintaan perbaikan.",
  PERLU_PERBAIKAN:
    "Buka draf persiapan asal, perbaiki data atau ganti berkas sesuai catatan terstruktur petugas, lalu klik 'Kirim perbaikan untuk ditinjau' pada tahap Tinjau & kirim.",
  DIPROSES:
    "Berkas sedang dalam pemeriksaan lanjutan petugas pendamping.",
  SELESAI:
    "Tinjauan awal di DaftarIn telah selesai. Ajukan berkas melalui kanal resmi instansi (loket Disdukcapil, MPP, atau portal resmi daerah), catat nomor tanda terima resmi di bawah, lalu konfirmasi setelah dokumen hasil diterima.",
  HASIL_DITERIMA_WARGA:
    "Seluruh tahapan tinjauan pendamping dan penerimaan dokumen hasil dari kanal resmi instansi telah selesai dicatat.",
};

export function TrackingPage() {
  const {
    user,
    applications,
    preparations,
    selectPreparation,
    createLinkedRevisionPreparation,
    addCitizenNote,
    recordOfficialSubmission,
    confirmApplicationResult,
    services,
    setSelectedService,
  } = useApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [recordingOfficial, setRecordingOfficial] = useState(false);
  const [officialNumInput, setOfficialNumInput] = useState("");
  const [officialChannelInput, setOfficialChannelInput] = useState("");
  const [officialNoteInput, setOfficialNoteInput] = useState("");
  const [error, setError] = useState("");
  const [previewDoc, setPreviewDoc] = useState<PreviewableDocument | null>(
    null,
  );

  const requestedAppId = params.get("id") || params.get("application");
  const currentApp = requestedAppId
    ? applications.find((app) => app.id === requestedAppId)
    : applications[0];

  const linkedService = currentApp
    ? services.find((item) => item.id === currentApp.service_id)
    : undefined;

  const linkResolution = currentApp
    ? resolveApplicationPreparationLink({
        applicationId: currentApp.id,
        applications,
        preparations,
        currentUserId: user.id,
      })
    : null;

  const linkedPrep =
    linkResolution && linkResolution.status === "valid"
      ? linkResolution.preparation
      : undefined;

  const events =
    currentApp?.events.filter((event) => event.completed || event.current) ||
    [];
  const latestEvent = events.length ? events[events.length - 1] : undefined;

  const latestRevisionDetail =
    currentApp?.latest_revision_detail ||
    [...events].reverse().find((e) => e.revision_detail)?.revision_detail;

  const saveNote = (event: FormEvent) => {
    event.preventDefault();
    if (!currentApp || !note.trim()) return;
    setError("");
    try {
      addCitizenNote(currentApp.id, note.trim());
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Catatan belum tersimpan.",
      );
      return;
    }
    setNote("");
    setAddingNote(false);
  };

  const handleSaveOfficialSubmission = (event: FormEvent) => {
    event.preventDefault();
    if (!currentApp) return;
    setError("");
    try {
      recordOfficialSubmission(
        currentApp.id,
        officialNumInput,
        officialChannelInput ||
          linkedService?.official_channel ||
          "Loket Disdukcapil Kota Contoh",
        officialNoteInput,
      );
      setRecordingOfficial(false);
      setOfficialNumInput("");
      setOfficialNoteInput("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Catatan pengajuan resmi belum tersimpan.",
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <Sidebar role="warga" />
      <div className="min-w-0 flex-1">
        <TopBar
          breadcrumbs={["Pengajuan saya", "Status Tinjauan & Pelacakan"]}
          role="warga"
        />
        <main id="main-content" tabIndex={-1} className="workspace-content">
          <div className="section-heading">
            <div>
              <h1>Status tinjauan awal &amp; pelacakan pengajuan</h1>
              <p className="text-sm text-slate-500 mt-1">
                Memisahkan secara jelas status tinjauan awal petugas pendamping
                DaftarIn dari catatan pengajuan pada kanal resmi instansi.
              </p>
            </div>
            {currentApp && (
              <button
                type="button"
                className="button-secondary no-print"
                onClick={() => window.print()}
              >
                Cetak riwayat
              </button>
            )}
          </div>

          {!currentApp ? (
            <div className="empty-state">
              <h2>
                {requestedAppId
                  ? "Data pengajuan / tinjauan tidak ditemukan"
                  : "Belum ada permintaan tinjauan atau catatan pengajuan"}
              </h2>
              <p>
                Kirim draf persiapan Anda pada tahap{" "}
                <strong>Tinjau &amp; kirim</strong> untuk diperiksa petugas
                pendamping, atau catat tanda terima dari kanal resmi instansi.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/persiapan" className="button-primary">
                  Buka persiapan saya
                </Link>
                <Link to="/katalog" className="button-secondary">
                  Cari layanan
                </Link>
              </div>
            </div>
          ) : (
            <>
              {applications.length > 1 && (
                <div className="mb-6">
                  <label
                    htmlFor="application-select"
                    className="block text-sm font-medium mb-2"
                  >
                    Pilih urusan ({applications.length} tercatat)
                  </label>
                  <select
                    id="application-select"
                    className="w-full max-w-xl border border-slate-300 rounded-lg p-3 text-sm bg-white"
                    value={currentApp.id}
                    onChange={(event) => {
                      setParams({ id: event.target.value });
                      setNote("");
                      setAddingNote(false);
                      setRecordingOfficial(false);
                    }}
                  >
                      {applications.map((app) => (
                      <option value={app.id} key={app.id}>
                        {app.service_name} · {app.internal_reference} (Tinjauan:{" "}
                        {getReviewStatusLabel(app)} · Kanal Resmi:{" "}
                        {getOfficialSubmissionStatusLabel(app)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Ringkasan Pemisahan 2 Lapis Status: Tinjauan DaftarIn vs Kanal Resmi Instansi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <section className="plain-panel !p-4 border-l-4 border-l-[#142c4b]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      1. Status Tinjauan Pendamping DaftarIn
                    </span>
                    <span
                      className={
                        currentApp.current_status === "SELESAI" ||
                        currentApp.current_status === "HASIL_DITERIMA_WARGA"
                          ? "status-ready"
                          : currentApp.current_status === "PERLU_PERBAIKAN" &&
                              !currentApp.revision_pending
                            ? "status-attention"
                            : "status-neutral"
                      }
                    >
                      {getReviewStatusLabel(currentApp)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#142c4b] mt-2">
                    Kode Tinjauan: {currentApp.internal_reference}
                    {currentApp.submitted_snapshot
                      ? ` · Kiriman #${currentApp.submitted_snapshot.submissionVersion}`
                      : ""}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Unit penerima:{" "}
                    <strong>
                      {currentApp.recipient_unit ||
                        (currentApp.mode === "demo_review"
                          ? DEFAULT_REVIEW_UNIT
                          : "Tidak melalui tinjauan petugas (Dilaporkan warga)")}
                    </strong>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Status ini menunjukkan hasil pemeriksaan awal pendamping di
                    DaftarIn dan tidak menyatakan instansi pemerintah telah
                    menerima pengajuan resmi.
                  </p>
                </section>

                <section className="plain-panel !p-4 border-l-4 border-l-emerald-700">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      2. Pengajuan &amp; Hasil Layanan Pemerintah
                    </span>
                    <span
                      className={
                        currentApp.official_submission?.status ===
                          "HASIL_DITERIMA_WARGA" ||
                        currentApp.official_submission?.resultReceivedAt ||
                        currentApp.current_status === "HASIL_DITERIMA_WARGA" ||
                        currentApp.official_submission
                          ? "status-ready"
                          : "status-neutral"
                      }
                    >
                      {getOfficialSubmissionStatusLabel(currentApp)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#142c4b] mt-2">
                    Tanda Terima Resmi:{" "}
                    {currentApp.official_submission?.officialReceiptNumber ||
                      currentApp.official_submission?.officialNumber ||
                      (currentApp.official_number_source === "citizen_reported"
                        ? currentApp.official_number
                        : "") ||
                      "Belum dicatat"}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {currentApp.official_submission ? (
                      <>
                        Diajukan di{" "}
                        <strong>
                          {currentApp.official_submission.channel}
                        </strong>{" "}
                        pada {currentApp.official_submission.recordedAt} (Sumber:{" "}
                        <strong>
                          {currentApp.official_submission.sourceLabel ||
                            "Dilaporkan warga"}
                        </strong>
                        ).
                        {currentApp.official_submission.resultReceivedAt && (
                          <span className="block mt-1 font-medium text-emerald-800">
                            ✓ Hasil layanan dikonfirmasi diterima pada{" "}
                            {currentApp.official_submission.resultReceivedAt}{" "}
                            (Dilaporkan warga).
                          </span>
                        )}
                      </>
                    ) : (
                      "DaftarIn tidak mengirim berkas otomatis ke SIAK/instansi. Catat nomor tanda terima resmi dan konfirmasi hasil layanan setelah Anda mengurus di loket/portal instansi (Dilaporkan warga)."
                    )}
                  </p>
                </section>
              </div>

              <section className="tracking-overview">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold">
                    {currentApp.service_name}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Kondisi permohonan:{" "}
                    <strong>
                      {currentApp.condition_label || "Sesuai permohonan"}
                    </strong>{" "}
                    · Pemohon: <strong>{currentApp.applicant_name}</strong>
                  </p>

                  <dl className="tracking-details">
                    <div>
                      <dt>Draf persiapan asal</dt>
                      <dd>
                        {linkedPrep ? (
                          <>
                            <span className="font-mono font-semibold">
                              {linkedPrep.internalReference}
                            </span>{" "}
                            ·{" "}
                            <Link
                              to={`/persiapan/ringkasan?prep=${encodeURIComponent(linkedPrep.id)}&application=${encodeURIComponent(currentApp.id)}`}
                              onClick={() => selectPreparation(linkedPrep.id)}
                              className="text-link text-xs"
                            >
                              Buka draf persiapan
                            </Link>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-amber-800">
                              Draf asal belum terhubung
                            </span>{" "}
                            ·{" "}
                            <button
                              type="button"
                              onClick={() => {
                                const created = createLinkedRevisionPreparation(
                                  currentApp.id,
                                );
                                if (created) {
                                  navigate(
                                    `/persiapan/dokumen?prep=${encodeURIComponent(created.id)}&application=${encodeURIComponent(currentApp.id)}`,
                                  );
                                }
                              }}
                              className="text-link text-xs"
                            >
                              Buat &amp; kaitkan draf perbaikan
                            </button>
                          </>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Waktu kirim / pembaruan terakhir</dt>
                      <dd>
                        {latestEvent
                          ? `${latestEvent.time} · ${latestEvent.source}`
                          : currentApp.submission_date || currentApp.created_at}
                      </dd>
                    </div>
                    <div>
                      <dt>Kanal pelayanan resmi instansi</dt>
                      <dd>
                        {currentApp.official_submission?.channel ||
                          linkedService?.official_channel ||
                          currentApp.channel}
                      </dd>
                    </div>
                    <div>
                      <dt>Tindakan berikutnya untuk warga</dt>
                      <dd>
                        {currentApp.revision_pending
                          ? "Perbaikan berkas sudah dikirim ke petugas pendamping (Status: Perbaikan dikirim). Tunggu petugas meninjau ulang berkas versi terbaru."
                          : NEXT_ACTION_GUIDANCE[currentApp.current_status]}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>

              {/* Banner Permintaan Perbaikan Terstruktur dari Petugas */}
              {currentApp.current_status === "PERLU_PERBAIKAN" && (
                <div
                  className={
                    currentApp.revision_pending
                      ? "tracking-action tracking-action-pending"
                      : "tracking-action"
                  }
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">
                        {currentApp.revision_pending
                          ? `Perbaikan sudah dikirim (${currentApp.internal_reference})`
                          : "Tindak lanjut diperlukan: Petugas meminta perbaikan berkas / data"}
                      </h2>
                      {latestRevisionDetail && (
                        <span className="status-attention">
                          {
                            OFFICER_ISSUE_CATEGORY_LABELS[
                              latestRevisionDetail.issueCategory
                            ]
                          }
                        </span>
                      )}
                    </div>

                    {currentApp.revision_pending ? (
                      <div className="text-sm text-slate-700 space-y-1">
                        <p>
                          Perbaikan dari draf{" "}
                          <strong className="font-mono">
                            {linkedPrep?.internalReference ||
                              currentApp.preparation_reference}
                          </strong>{" "}
                          telah dikirim sebagai{" "}
                          <strong>
                            Kiriman #
                            {currentApp.submitted_snapshot?.submissionVersion ||
                              2}
                          </strong>
                          . Petugas pendamping akan meninjau berkas versi
                          terbaru Anda.
                        </p>
                        {currentApp.submitted_snapshot?.changesSummary && (
                          <p className="text-xs text-slate-600">
                            <strong>Perubahan yang dikirim:</strong>{" "}
                            {currentApp.submitted_snapshot.changesSummary.join(
                              "; ",
                            )}
                          </p>
                        )}
                      </div>
                    ) : latestRevisionDetail ? (
                      <div className="text-sm text-slate-700 space-y-1.5">
                        <p>
                          <strong>Bagian yang perlu diperbaiki:</strong>{" "}
                          {latestRevisionDetail.targetItem}
                        </p>
                        <p>
                          <strong>Penjelasan petugas:</strong>{" "}
                          {latestRevisionDetail.problemDescription}
                        </p>
                        <p>
                          <strong>Tindakan perbaikan yang diminta:</strong>{" "}
                          {latestRevisionDetail.requiredAction}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">
                        Buka draf persiapan yang terhubung, perbaiki data atau
                        ganti dokumen sesuai catatan petugas, lalu kirim
                        perbaikan pada tahap Tinjau &amp; kirim.
                      </p>
                    )}
                  </div>

                  {linkedPrep ? (
                    <Link
                      to={`/persiapan/dokumen?prep=${encodeURIComponent(linkedPrep.id)}&application=${encodeURIComponent(currentApp.id)}`}
                      onClick={() => {
                        selectPreparation(linkedPrep.id);
                        if (linkedService) setSelectedService(linkedService);
                      }}
                      className="button-primary shrink-0"
                    >
                      {currentApp.revision_pending
                        ? "Lihat draf perbaikan"
                        : "Perbaiki berkas & kirim ulang →"}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const created = createLinkedRevisionPreparation(
                          currentApp.id,
                        );
                        if (created) {
                          if (linkedService) setSelectedService(linkedService);
                          navigate(
                            `/persiapan/dokumen?prep=${encodeURIComponent(created.id)}&application=${encodeURIComponent(currentApp.id)}`,
                          );
                        }
                      }}
                      className="button-primary shrink-0"
                    >
                      Buat &amp; kaitkan draf perbaikan →
                    </button>
                  )}
                </div>
              )}

              {/* Tindakan setelah Tinjauan Awal Selesai: Catat Pengajuan Kanal Resmi & Konfirmasi Hasil */}
              {(currentApp.current_status === "SELESAI" ||
                currentApp.mode === "citizen") && (
                <div className="tracking-action mt-6 flex-col items-stretch">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold">
                        {currentApp.official_submission?.status ===
                          "HASIL_DITERIMA_WARGA" ||
                        currentApp.official_submission?.resultReceivedAt
                          ? "Tinjauan awal selesai · Hasil layanan kanal resmi telah diterima (Dilaporkan warga)"
                          : "Tinjauan awal selesai — Lanjutkan di kanal resmi instansi"}
                      </h2>
                      <p className="text-sm mt-1.5 text-slate-600 leading-relaxed max-w-2xl">
                        Berkas persiapan Anda telah selesai ditinjau petugas
                        pendamping DaftarIn (status tinjauan tetap{" "}
                        <strong>{getReviewStatusLabel(currentApp)}</strong>).
                        Ajukan berkas ke{" "}
                        <strong>
                          {linkedService?.official_channel ||
                            "Loket Disdukcapil / Kanal Resmi Daerah"}
                        </strong>
                        . Catatan tanda terima maupun konfirmasi penerimaan
                        hasil di bawah ini disimpan secara terpisah dengan
                        sumber <strong>Dilaporkan warga</strong> tanpa menimpa
                        status tinjauan petugas.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => {
                          setRecordingOfficial(!recordingOfficial);
                          setOfficialChannelInput(
                            currentApp.official_submission?.channel ||
                              linkedService?.official_channel ||
                              "Loket Disdukcapil Kota Contoh",
                          );
                          setOfficialNumInput(
                            currentApp.official_submission
                              ?.officialReceiptNumber ||
                              (currentApp.official_number_source ===
                              "citizen_reported"
                                ? currentApp.official_number
                                : "") ||
                              "",
                          );
                        }}
                      >
                        {currentApp.official_submission
                          ? "Perbarui tanda terima resmi"
                          : "Catat tanda terima kanal resmi"}
                      </button>
                      {currentApp.official_submission?.status ===
                        "HASIL_DITERIMA_WARGA" ||
                      currentApp.official_submission?.resultReceivedAt ? (
                        <span className="status-ready self-center">
                          ✓ Hasil layanan diterima (Dilaporkan warga)
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="button-primary"
                          onClick={() =>
                            confirmApplicationResult(
                              currentApp.id,
                              "Warga mengonfirmasi dokumen hasil layanan dari kanal resmi instansi telah diterima dengan lengkap.",
                            )
                          }
                        >
                          Konfirmasi hasil layanan diterima
                        </button>
                      )}
                    </div>
                  </div>

                  {recordingOfficial && (
                    <form
                      onSubmit={handleSaveOfficialSubmission}
                      className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3"
                    >
                      <div className="form-field">
                        <label htmlFor="track-official-num">
                          Nomor tanda terima resmi instansi (Dilaporkan warga)
                        </label>
                        <input
                          id="track-official-num"
                          value={officialNumInput}
                          onChange={(e) => setOfficialNumInput(e.target.value)}
                          placeholder="Contoh: REG-KK-2026-0192"
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="track-official-channel">
                          Kanal / loket resmi instansi
                        </label>
                        <input
                          id="track-official-channel"
                          required
                          value={officialChannelInput}
                          onChange={(e) =>
                            setOfficialChannelInput(e.target.value)
                          }
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="track-official-note">
                          Catatan pengajuan resmi (opsional)
                        </label>
                        <input
                          id="track-official-note"
                          value={officialNoteInput}
                          onChange={(e) => setOfficialNoteInput(e.target.value)}
                          placeholder="Contoh: Diserahkan di loket 2"
                        />
                      </div>
                      <div className="sm:col-span-3 flex gap-2">
                        <button type="submit" className="button-primary">
                          Simpan catatan kanal resmi (Dilaporkan warga)
                        </button>
                        <button
                          type="button"
                          className="button-secondary"
                          onClick={() => setRecordingOfficial(false)}
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Penilaian Terstruktur Petugas (jika ada) */}
              {currentApp.latest_evaluation && (
                <section
                  className="plain-panel mt-6"
                  aria-labelledby="evaluation-heading"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 id="evaluation-heading" className="panel-title">
                      Penilaian petugas pada Kiriman #
                      {currentApp.latest_evaluation.submissionVersion}
                    </h2>
                    <span className="text-xs text-slate-500">
                      {currentApp.latest_evaluation.evaluatedBy} ·{" "}
                      {currentApp.latest_evaluation.evaluatedAt}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mt-2">
                    {currentApp.latest_evaluation.summaryNote}
                  </p>
                  {currentApp.latest_evaluation.itemAssessments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {currentApp.latest_evaluation.itemAssessments.map(
                        (item) => (
                          <span
                            key={item.itemId}
                            className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs text-slate-700"
                          >
                            {item.itemName}
                            {item.fileVersion ? ` (v${item.fileVersion})` : ""}:{" "}
                            <strong>
                              {OFFICER_ITEM_VERDICT_LABELS[item.verdict]}
                            </strong>
                          </span>
                        ),
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* Daftar Dokumen pada Kiriman Ini (dengan Pratinjau) */}
              {currentApp.attachments && currentApp.attachments.length > 0 && (
                <section
                  className="plain-panel mt-6"
                  aria-labelledby="attachments-heading"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 id="attachments-heading" className="panel-title">
                      Salinan berkas pada Kiriman #
                      {currentApp.submitted_snapshot?.submissionVersion || 1} (
                      {currentApp.attachments.length} berkas)
                    </h2>
                    <span className="text-xs text-slate-500 font-mono">
                      Draf asal:{" "}
                      {linkedPrep?.internalReference ||
                        currentApp.preparation_reference ||
                        "PREP-2026-0001"}
                    </span>
                  </div>
                  <ul className="attachment-list mt-4">
                    {currentApp.attachments.map((doc, idx) => (
                      <li
                        key={idx}
                        className="flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className="material-symbols-outlined mt-0.5 text-slate-500"
                            aria-hidden="true"
                          >
                            description
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <strong>{doc.name}</strong>
                              <span className="status-neutral">
                                Versi {doc.version || 1}
                              </span>
                            </div>
                            <small>
                              {doc.fileName} · {doc.size}
                            </small>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-secondary !py-1 !px-2.5 !text-xs no-print"
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
                            })
                          }
                        >
                          Lihat berkas
                        </button>
                      </li>
                    ))}
                  </ul>

                  {currentApp.submission_history &&
                    currentApp.submission_history.length > 1 && (
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                        <p className="text-xs font-semibold text-slate-700">
                          Riwayat versi kiriman (
                          {currentApp.submission_history.length} kiriman):
                        </p>
                        {currentApp.submission_history.map((ver) => (
                          <div
                            key={ver.submissionVersion}
                            className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                          >
                            <span>
                              <strong>Kiriman #{ver.submissionVersion}</strong>{" "}
                              ({ver.submittedAt})
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {ver.attachments.map((att, idx) => (
                                <button
                                  key={`${ver.submissionVersion}-${att.id || idx}`}
                                  type="button"
                                  className="btn-secondary !py-1 !px-2 !text-[11px]"
                                  onClick={() =>
                                    setPreviewDoc({
                                      id: att.id,
                                      name: `${att.name} (Kiriman #${ver.submissionVersion})`,
                                      fileName: att.fileName,
                                      size: att.size,
                                      fileType: att.fileType,
                                      version: att.version || 1,
                                      uploadedAt: att.uploadedAt,
                                      qualityPreset: att.qualityPreset,
                                      previewKey: att.previewKey,
                                      fixtureId: att.fixtureId,
                                    })
                                  }
                                >
                                  Pratinjau {att.fileName} (v{att.version || 1})
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </section>
              )}

              {/* Linimasa Riwayat */}
              <section
                className="workspace-section"
                aria-labelledby="timeline-heading"
              >
                <div className="section-heading">
                  <div>
                    <h2 id="timeline-heading">
                      Riwayat tinjauan &amp; catatan tindak lanjut
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Setiap entri menampilkan waktu dan sumber pembaruan
                      (Kiriman/catatan warga vs Tinjauan petugas pendamping).
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-link no-print"
                    onClick={() => setAddingNote(!addingNote)}
                    aria-expanded={addingNote}
                  >
                    {addingNote ? "Batal" : "Tambah catatan warga"}
                  </button>
                </div>

                {addingNote && (
                  <form onSubmit={saveNote} className="note-form no-print">
                    {error && (
                      <p role="alert" className="form-error">
                        {error}
                      </p>
                    )}
                    <label
                      htmlFor="citizen-note"
                      className="block text-sm font-medium"
                    >
                      Catatan tindak lanjut warga
                    </label>
                    <textarea
                      id="citizen-note"
                      autoFocus
                      required
                      maxLength={2000}
                      rows={3}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="Contoh: Berkas fisik sudah disiapkan untuk dibawa ke loket Disdukcapil."
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!note.trim()}
                        className="button-primary disabled:opacity-50"
                      >
                        Simpan catatan warga
                      </button>
                    </div>
                  </form>
                )}

                <ol className="tracking-timeline">
                  {events.map((event) => {
                    const isCitizenSource =
                      event.source_type === "citizen" ||
                      event.source.toLowerCase().includes("warga");
                    return (
                      <li key={event.id}>
                        <span className="timeline-marker" aria-hidden="true" />
                        <div className="flex flex-wrap justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{event.title}</h3>
                            <span
                              className={
                                isCitizenSource
                                  ? "status-neutral"
                                  : "status-attention"
                              }
                            >
                              {isCitizenSource
                                ? "Dilaporkan warga"
                                : "Tinjauan petugas pendamping"}
                            </span>
                          </div>
                          <time className="text-xs text-slate-500">
                            {event.time}
                          </time>
                        </div>
                        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                          {event.notes}
                        </p>
                        {event.next_action && (
                          <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            <strong>Tindakan berikutnya:</strong>{" "}
                            {event.next_action}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-2">
                          Sumber: {event.source}
                        </p>
                      </li>
                    );
                  })}
                </ol>
                {!events.length && (
                  <p className="empty-state text-sm text-slate-500">
                    Belum ada pembaruan status.
                  </p>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      <DocumentPreviewModal
        doc={previewDoc}
        applicantName={
          currentApp?.submitted_snapshot?.formData.nama_lengkap ||
          currentApp?.applicant_name
        }
        applicantNik={
          currentApp?.submitted_snapshot?.formData.nik ||
          currentApp?.applicant_nik
        }
        applicantNoKk={currentApp?.submitted_snapshot?.formData.no_kk}
        applicantAddress={currentApp?.submitted_snapshot?.formData.alamat}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}
