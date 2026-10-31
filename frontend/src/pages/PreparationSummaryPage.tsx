import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PreparationLayout } from "../components/PreparationLayout";
import {
  DocumentPreviewModal,
  isDocumentContentAvailable,
  type PreviewableDocument,
} from "../components/DocumentPreviewModal";
import {
  DEFAULT_REVIEW_UNIT,
  getReviewStatusLabel,
  useApp,
  type ApplicationRecord,
  type FormData,
} from "../context/AppContext";
import {
  documentSlots,
  getSelectedConditionOption,
  OFFICER_ISSUE_CATEGORY_LABELS,
  resolveApplicationPreparationLink,
} from "../types/preparation";

export function PreparationSummaryPage() {
  const {
    user,
    services,
    activePreparation,
    preparations,
    formData,
    documents,
    readiness,
    setConsentAccepted,
    submitForOfficerReview,
    addApplication,
    recordOfficialSubmission,
    applications,
    resubmitApplication,
  } = useApp();

  const currentService =
    services.find((s) => s.id === activePreparation.serviceId) || services[0];

  const [citizenReviewNote, setCitizenReviewNote] = useState("");
  const [officialNumber, setOfficialNumber] = useState("");
  const [channel, setChannel] = useState(
    currentService.official_channel || "Loket Disdukcapil Kota Contoh",
  );
  const [submissionNote, setSubmissionNote] = useState("");
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const [officialError, setOfficialError] = useState("");
  const [previewDoc, setPreviewDoc] = useState<PreviewableDocument | null>(
    null,
  );
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    setChannel(
      currentService.official_channel || "Loket Disdukcapil Kota Contoh",
    );
  }, [currentService.id, currentService.official_channel]);

  const revisionId =
    params.get("application") || activePreparation.linkedApplicationId;
  const linkResolution = revisionId
    ? resolveApplicationPreparationLink({
        applicationId: revisionId,
        requestedPrepId: activePreparation.id,
        applications,
        preparations,
        currentUserId: user.id,
      })
    : null;
  const linkedApp =
    linkResolution && linkResolution.status === "valid"
      ? linkResolution.application
      : applications.find(
          (app) =>
            app.owner_id === user.id &&
            (app.id === activePreparation.linkedApplicationId ||
              app.preparation_id === activePreparation.id),
        );

  const isRevisingApp = Boolean(
    linkedApp && linkedApp.current_status === "PERLU_PERBAIKAN",
  );
  const hasActiveReviewRequest = Boolean(
    linkedApp && linkedApp.mode === "demo_review",
  );

  const buildQuery = () => {
    const q = new URLSearchParams();
    const prepId =
      params.get("prep") ||
      (activePreparation.id !== "prep-draft-uninitialized"
        ? activePreparation.id
        : "");
    if (prepId) q.set("prep", prepId);
    const appParam = params.get("application");
    if (appParam) q.set("application", appParam);
    const qs = q.toString();
    return qs ? "?" + qs : "";
  };

  const querySuffix = buildQuery();

  const activeCondition = getSelectedConditionOption(
    currentService,
    activePreparation.conditionKey,
  );
  const slots = documentSlots(currentService, activePreparation.conditionKey);
  const chosen = documents.filter(
    (doc) =>
      slots.some((slot) => slot.id === doc.id) && doc.status === "TERUNGGAH",
  );

  // Hitung ringkasan perubahan dibanding kiriman sebelumnya (bila ada)
  const liveChangesFromSnapshot = useMemo(() => {
    const prev = linkedApp?.submitted_snapshot;
    if (!prev) return [];
    const diffs: string[] = [];
    if (prev.conditionKey !== activePreparation.conditionKey) {
      diffs.push(
        `Kondisi permohonan diubah menjadi "${activeCondition.label}"`,
      );
    }
    if (prev.applicantTarget !== activePreparation.applicantTarget) {
      diffs.push(
        `Subjek pengurusan diubah menjadi ${
          activePreparation.applicantTarget === "anggota_keluarga"
            ? "Anggota keluarga"
            : "Diri sendiri"
        }`,
      );
    }
    const fieldLabels: Record<keyof FormData, string> = {
      nama_lengkap: "Nama lengkap pemohon",
      nik: "NIK pemohon",
      no_kk: "Nomor Kartu Keluarga",
      telepon: "Nomor WhatsApp / telepon",
      alamat: "Alamat domisili",
      alasan: "Alasan / rincian permohonan",
    };
    (Object.keys(fieldLabels) as Array<keyof FormData>).forEach((key) => {
      if ((prev.formData[key] || "").trim() !== (formData[key] || "").trim()) {
        diffs.push(`Data ${fieldLabels[key]} diperbarui`);
      }
    });
    chosen.forEach((doc) => {
      const prevAtt = prev.attachments.find(
        (item) => item.id === doc.id || item.name === doc.name,
      );
      if (!prevAtt) {
        diffs.push(
          `Menambahkan berkas ${doc.name}: ${doc.fileName} (v${doc.version || 1})`,
        );
      } else if (
        prevAtt.fileName !== doc.fileName ||
        (prevAtt.version || 1) !== (doc.version || 1)
      ) {
        diffs.push(
          `Mengganti berkas ${doc.name}: dari ${prevAtt.fileName} (v${prevAtt.version || 1}) menjadi ${doc.fileName} (v${doc.version || 1})`,
        );
      }
    });
    return diffs;
  }, [
    linkedApp?.submitted_snapshot,
    activePreparation.conditionKey,
    activePreparation.applicantTarget,
    activeCondition.label,
    formData,
    chosen,
  ]);

  const canSendForReview =
    readiness.basicValidationPassed && activePreparation.consentAccepted;

  const handleSendToOfficer = () => {
    setError("");
    try {
      if (isRevisingApp && linkedApp) {
        resubmitApplication(
          linkedApp.id,
          citizenReviewNote,
          activePreparation.id,
        );
        navigate("/pelacakan?id=" + encodeURIComponent(linkedApp.id));
      } else {
        const created = submitForOfficerReview(
          activePreparation.id,
          citizenReviewNote,
        );
        navigate("/pelacakan?id=" + encodeURIComponent(created.id));
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Permintaan tinjauan belum dapat dikirim.",
      );
    }
  };

  const handleRecordOfficial = (event: FormEvent) => {
    event.preventDefault();
    setOfficialError("");
    if (!channel.trim()) {
      setOfficialError("Isi kanal atau loket resmi yang digunakan.");
      return;
    }
    try {
      if (linkedApp) {
        recordOfficialSubmission(
          linkedApp.id,
          officialNumber,
          channel,
          submissionNote,
        );
        navigate("/pelacakan?id=" + encodeURIComponent(linkedApp.id));
        return;
      }

      const now = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
      });
      const internalRef =
        "CATAT-2026-" + String(applications.length + 1).padStart(4, "0");
      const trimmedOfficial = officialNumber.trim();
      const application: ApplicationRecord = {
        id: "CITIZEN-" + crypto.randomUUID(),
        preparation_id: activePreparation.id,
        internal_reference: internalRef,
        preparation_reference: activePreparation.internalReference,
        official_number: trimmedOfficial || "Belum diterbitkan (Catatan Warga)",
        official_number_source: trimmedOfficial
          ? "citizen_reported"
          : "not_provided",
        service_id: currentService.id,
        service_name: currentService.name,
        condition_label: activeCondition.label,
        channel: channel.trim(),
        applicant_name: formData.nama_lengkap || "Pemohon belum diisi",
        applicant_nik: formData.nik || "-",
        current_status: "DICATAT_WARGA",
        created_at: now,
        mode: "citizen",
        attachments: chosen.map((doc) => ({
          id: doc.id,
          name: doc.name,
          fileName: doc.fileName || "dokumen-persiapan.pdf",
          size: doc.size || "Contoh",
          fileType: doc.fileType,
          version: doc.version || 1,
          uploadedAt: doc.uploadedAt,
          qualityPreset: doc.qualityPreset || "user_file",
          previewKey: doc.previewKey,
        })),
        events: [
          {
            id: 1,
            status: "DICATAT_WARGA",
            title: "Pengajuan di kanal resmi dicatat oleh warga",
            time: now,
            source: "Catatan warga — belum dikonfirmasi instansi",
            notes:
              `Warga mencatat pengajuan melalui ${channel.trim()} (dari draf ${activePreparation.internalReference}).` +
              (submissionNote.trim()
                ? ` Catatan: ${submissionNote.trim()}`
                : ""),
            completed: true,
            current: true,
          },
        ],
      };
      addApplication(application, activePreparation.id);
      navigate("/pelacakan?id=" + encodeURIComponent(application.id));
    } catch (cause) {
      setOfficialError(
        cause instanceof Error ? cause.message : "Catatan belum tersimpan.",
      );
    }
  };

  return (
    <PreparationLayout
      step={4}
      title={
        isRevisingApp
          ? "Tinjau & kirim perbaikan berkas"
          : "Tinjau & kirim berkas"
      }
      actions={
        <>
          <Link
            to={"/persiapan/dokumen" + querySuffix}
            className="button-secondary"
          >
            Kembali ke dokumen
          </Link>
          <button
            className="button-secondary"
            type="button"
            onClick={() => window.print()}
          >
            Cetak ringkasan
          </button>
        </>
      }
    >
      {/* 1. Ringkasan Validasi Dasar Aplikasi & Peran Tinjauan Petugas */}
      <section
        className="plain-panel mb-6"
        aria-label="Validasi dasar aplikasi"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="panel-title">Validasi dasar persiapan</h2>
              <span
                className={
                  readiness.basicValidationPassed
                    ? "status-ready"
                    : "status-attention"
                }
              >
                {readiness.basicValidationPassed
                  ? "Format & berkas wajib lengkap"
                  : "Perlu dilengkapi"}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Validasi dasar aplikasi memeriksa kelengkapan langkah kebutuhan,
              format isian wajib pemohon, dan keberadaan berkas persyaratan
              wajib. <strong>Isi serta keterbacaan dokumen</strong> belum
              diperiksa otomatis dan akan ditinjau oleh petugas pendamping
              setelah Anda mengirim berkas di bawah.
            </p>
            <p className="text-xs text-slate-500 mt-1.5">
              Catatan: Pembacaan isi dokumen otomatis (OCR/AI) disiapkan sebagai
              kemampuan tambahan pada pengembangan berikutnya dan tidak
              menghalangi pengiriman berkas Anda.
            </p>
          </div>
          <Link
            to={"/persiapan/pemeriksaan" + querySuffix}
            className="text-link text-xs min-w-0 max-w-full no-print"
          >
            Buka rincian validasi &amp; simulasi aturan (opsional) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700">
                1. Kebutuhan &amp; kondisi
              </span>
              <span
                className={
                  readiness.steps.step1Kebutuhan
                    ? "status-ready"
                    : "status-attention"
                }
              >
                {readiness.steps.step1Kebutuhan ? "Lengkap" : "Belum"}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {readiness.steps.step1Kebutuhan
                ? `${activeCondition.label}`
                : "Konfirmasi kondisi permohonan pada Tahap 1."}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700">
                2. Format data pemohon
              </span>
              <span
                className={
                  readiness.steps.step2Data
                    ? "status-ready"
                    : "status-attention"
                }
              >
                {readiness.steps.step2Data ? "Sesuai format" : "Belum lengkap"}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {readiness.steps.step2Data
                ? "Nama, 16 digit NIK, 16 digit No. KK, alamat, dan alasan terisi."
                : "Lengkapi isian wajib pemohon pada Tahap 2."}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700">
                3. Keberadaan berkas wajib
              </span>
              <span
                className={
                  readiness.missingRequiredDocs.length === 0 &&
                  readiness.unavailableRequiredDocs.length === 0
                    ? "status-ready"
                    : "status-attention"
                }
              >
                {readiness.missingRequiredDocs.length === 0 &&
                readiness.unavailableRequiredDocs.length === 0
                  ? `${chosen.length} berkas tersedia`
                  : readiness.unavailableRequiredDocs.length > 0
                    ? `${readiness.unavailableRequiredDocs.length} berkas tidak tersedia`
                    : `Kurang ${readiness.missingRequiredDocs.length} berkas`}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {readiness.missingRequiredDocs.length === 0 &&
              readiness.unavailableRequiredDocs.length === 0
                ? "Seluruh berkas persyaratan wajib tersedia (PDF/JPG/PNG)."
                : readiness.unavailableRequiredDocs.length > 0
                  ? `Pilih ulang berkas yang isinya tidak tersedia: ${readiness.unavailableRequiredDocs.map((d) => d.name).join(", ")}`
                  : `Belum diunggah: ${readiness.missingRequiredDocs.map((d) => d.name).join(", ")}`}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Ringkasan Data & Dokumen yang Akan Dibagikan */}
      <div className="summary-grid">
        <section className="plain-panel">
          <div className="flex items-center justify-between gap-2">
            <h2 className="panel-title">
              Data pemohon ({activePreparation.internalReference})
            </h2>
            <Link
              className="text-link text-xs no-print"
              to={"/persiapan/data" + querySuffix}
            >
              Ubah data →
            </Link>
          </div>
          <dl className="summary-details">
            <div>
              <dt>Subjek pengurusan</dt>
              <dd>
                {activePreparation.applicantTarget === "anggota_keluarga"
                  ? "Anggota keluarga dalam satu KK"
                  : "Diri sendiri / Kepala keluarga"}
              </dd>
            </div>
            <div>
              <dt>Nama lengkap</dt>
              <dd>{formData.nama_lengkap || "Belum diisi"}</dd>
            </div>
            <div>
              <dt>NIK</dt>
              <dd className="font-mono">{formData.nik || "Belum diisi"}</dd>
            </div>
            <div>
              <dt>Nomor KK</dt>
              <dd className="font-mono">{formData.no_kk || "Belum diisi"}</dd>
            </div>
            <div>
              <dt>Nomor WhatsApp / telepon</dt>
              <dd>{formData.telepon || "Belum diisi"}</dd>
            </div>
            <div>
              <dt>Kondisi permohonan</dt>
              <dd>{activeCondition.label}</dd>
            </div>
            <div>
              <dt>Alamat domisili</dt>
              <dd>{formData.alamat || "Belum diisi"}</dd>
            </div>
            <div>
              <dt>Alasan / rincian permohonan</dt>
              <dd>{formData.alasan || "Belum diisi"}</dd>
            </div>
          </dl>
        </section>

        <section className="plain-panel">
          <div className="flex items-center justify-between gap-2">
            <h2 className="panel-title">Dokumen pada draf ini</h2>
            <Link
              className="text-link text-xs no-print"
              to={"/persiapan/dokumen" + querySuffix}
            >
              Ubah dokumen →
            </Link>
          </div>
          <ul className="summary-documents">
            {slots.map((slot) => {
              const doc = chosen.find((item) => item.id === slot.id);
              const available = doc ? isDocumentContentAvailable(doc) : false;
              return (
                <li key={slot.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{slot.name}</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          slot.required ? "status-attention" : "status-neutral"
                        }
                      >
                        {slot.required ? "Wajib" : "Tambahan"}
                      </span>
                      {doc && !available && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800 border border-red-200">
                          Berkas tidak tersedia
                        </span>
                      )}
                      {doc && (
                        <button
                          type="button"
                          className="btn-secondary !py-0.5 !px-2 !text-xs no-print"
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
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 break-words">
                    {doc
                      ? `${doc.fileName} · ${doc.size} · Versi ${doc.version || 1}${!available ? " (Isi berkas tidak tersedia — pilih ulang di tahap Dokumen)" : ""}`
                      : slot.required
                        ? "Belum diunggah"
                        : "Tidak diunggah"}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* 3. Bagian Pengiriman untuk Tinjauan Awal Petugas Pendamping DaftarIn */}
      <section
        className="plain-panel mt-6 border-2 border-[#142c4b]/15"
        aria-label="Kirim untuk ditinjau petugas"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Tahap 4 · Pengiriman Tinjauan Awal DaftarIn
            </p>
            <h2 className="panel-title mt-1">
              {isRevisingApp
                ? `Kirim perbaikan untuk permintaan ${linkedApp?.internal_reference}`
                : hasActiveReviewRequest
                  ? `Status tinjauan awal (${linkedApp?.internal_reference})`
                  : "Kirim draf untuk ditinjau petugas pendamping"}
            </h2>
          </div>
          <span
            className={
              !linkedApp
                ? "status-neutral"
                : linkedApp.current_status === "SELESAI" ||
                    linkedApp.current_status === "HASIL_DITERIMA_WARGA"
                  ? "status-ready"
                  : linkedApp.current_status === "PERLU_PERBAIKAN" &&
                      !linkedApp.revision_pending
                    ? "status-attention"
                    : "status-neutral"
            }
          >
            {getReviewStatusLabel(linkedApp)}
          </span>
        </div>

        {/* Informasi penerima & pemisahan proses */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700 leading-relaxed">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              <strong>Unit penerima tinjauan:</strong>{" "}
              {linkedApp?.recipient_unit || DEFAULT_REVIEW_UNIT}
            </span>
            <span className="font-mono text-slate-500">
              Draf asal: {activePreparation.internalReference}
            </span>
          </div>
          <p>
            <strong>
              Perbedaan tinjauan DaftarIn &amp; pengajuan instansi:
            </strong>{" "}
            Mengirim berkas pada bagian ini hanya membagikan salinan data
            formulir dan berkas persyaratan Anda ke ruang kerja petugas
            pendamping DaftarIn untuk diperiksa kelengkapan serta
            keterbacaannya.{" "}
            <strong>
              Tindakan ini bukan pengajuan resmi ke SIAK atau sistem instansi
              pemerintah.
            </strong>
          </p>
        </div>

        {/* Peringatan jika ada perubahan draf yang belum dikirim */}
        {hasActiveReviewRequest && readiness.hasUnsentDraftChanges && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950">
            <strong>Perubahan draf belum terkirim ke petugas:</strong> Anda
            telah mengubah data atau dokumen pada draf ini setelah kiriman
            terakhir ({linkedApp?.submitted_snapshot?.submittedAt}). Petugas
            masih melihat salinan kiriman sebelumnya sampai Anda mengirim
            perbaikan secara eksplisit.
          </div>
        )}

        {/* Ringkasan perubahan sejak kiriman sebelumnya */}
        {linkedApp?.submitted_snapshot && (
          <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Ringkasan perubahan sejak kiriman sebelumnya (Kiriman #
              {linkedApp.submitted_snapshot.submissionVersion})
            </h3>
            {liveChangesFromSnapshot.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-slate-700 list-disc pl-4">
                {liveChangesFromSnapshot.map((diff, idx) => (
                  <li key={idx}>{diff}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-slate-500">
                Belum ada perubahan data atau pergantian versi berkas dibanding
                kiriman terakhir ({linkedApp.submitted_snapshot.submittedAt}).
              </p>
            )}
          </div>
        )}

        {/* Jika permintaan tinjauan sudah dikirim dan TIDAK sedang menunggu perbaikan dari warga */}
        {hasActiveReviewRequest && !isRevisingApp ? (
          <div className="mt-5 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-emerald-950">
                Permintaan tinjauan {linkedApp?.internal_reference} telah
                tercatat
              </p>
              <span className="text-xs text-emerald-800">
                Waktu kirim:{" "}
                {linkedApp?.submitted_snapshot?.submittedAt ||
                  linkedApp?.submission_date}
              </span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Status saat ini:{" "}
              <strong>{getReviewStatusLabel(linkedApp)}</strong>.{" "}
              {linkedApp?.current_status === "SELESAI"
                ? "Petugas pendamping telah menyelesaikan tinjauan awal. Anda dapat melanjutkan pengajuan di kanal resmi instansi."
                : "Petugas pendamping akan memeriksa kelengkapan dan kesesuaian berkas yang Anda kirim. Pantau hasilnya pada halaman Pengajuan & Tinjauan."}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to={`/pelacakan?id=${encodeURIComponent(linkedApp!.id)}`}
                className="button-primary !py-2 !px-4 !text-xs"
              >
                Buka status tinjauan &amp; pelacakan →
              </Link>
            </div>
          </div>
        ) : (
          /* Form pengiriman baru atau pengiriman perbaikan */
          <div className="mt-5 space-y-4">
            {isRevisingApp && linkedApp?.latest_revision_detail && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                <p className="font-semibold">
                  Menjawab permintaan perbaikan petugas pada:{" "}
                  {linkedApp.latest_revision_detail.targetItem} (
                  {
                    OFFICER_ISSUE_CATEGORY_LABELS[
                      linkedApp.latest_revision_detail.issueCategory
                    ]
                  }
                  )
                </p>
                <p>
                  <strong>Arahan petugas:</strong>{" "}
                  {linkedApp.latest_revision_detail.requiredAction}
                </p>
              </div>
            )}

            <label className="processing-consent !mt-0">
              <input
                type="checkbox"
                checked={activePreparation.consentAccepted}
                onChange={(event) => setConsentAccepted(event.target.checked)}
              />
              <span>
                Saya menyetujui pembagian data pemohon dan salinan berkas pada
                draf <strong>{activePreparation.internalReference}</strong>{" "}
                kepada <strong>{DEFAULT_REVIEW_UNIT}</strong> untuk keperluan
                tinjauan awal di DaftarIn. Saya memahami bahwa pengiriman ini
                bukan pendaftaran resmi ke instansi pemerintah.
              </span>
            </label>

            {!readiness.basicValidationPassed && (
              <div className="case-update-note flex flex-wrap items-center justify-between gap-3">
                <span>
                  <strong>Prasyarat pengiriman belum lengkap:</strong>{" "}
                  {!readiness.steps.step1Kebutuhan
                    ? "Konfirmasi kebutuhan permohonan pada Tahap 1."
                    : !readiness.steps.step2Data
                      ? "Lengkapi data wajib pemohon pada Tahap 2."
                      : readiness.unavailableRequiredDocs.length > 0
                        ? `Pilih ulang ${readiness.unavailableRequiredDocs.length} berkas wajib yang isinya tidak tersedia pada Tahap 3.`
                        : `Unggah seluruh berkas persyaratan wajib pada Tahap 3 (kurang ${readiness.missingRequiredDocs.length} berkas).`}
                </span>
                <Link
                  to={
                    !readiness.steps.step1Kebutuhan
                      ? "/persiapan/kebutuhan" + querySuffix
                      : !readiness.steps.step2Data
                        ? "/persiapan/data" + querySuffix
                        : "/persiapan/dokumen" + querySuffix
                  }
                  className="button-secondary !py-1.5 !px-3 !text-xs shrink-0"
                >
                  Lengkapi sekarang →
                </Link>
              </div>
            )}

            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}

            <div className="form-field max-w-xl">
              <label htmlFor="citizen-review-note">
                {isRevisingApp
                  ? "Catatan perbaikan untuk petugas (opsional)"
                  : "Catatan pengantar untuk petugas peninjau (opsional)"}
              </label>
              <textarea
                id="citizen-review-note"
                rows={2}
                maxLength={500}
                value={citizenReviewNote}
                onChange={(e) => setCitizenReviewNote(e.target.value)}
                placeholder={
                  isRevisingApp
                    ? "Contoh: Berkas KK lama sudah diganti dengan hasil pindai utuh (Versi 2) yang memperlihatkan seluruh empat sudut dokumen."
                    : "Contoh: Mohon bantuan memeriksa keterbacaan berkas sebelum saya datang ke loket Disdukcapil besok pagi."
                }
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="button-primary disabled:opacity-50"
                disabled={
                  !canSendForReview ||
                  Boolean(isRevisingApp && linkedApp?.revision_pending)
                }
                onClick={handleSendToOfficer}
              >
                {isRevisingApp
                  ? linkedApp?.revision_pending
                    ? "Perbaikan sudah dikirim (menunggu tinjauan ulang)"
                    : "Kirim perbaikan untuk ditinjau"
                  : "Kirim untuk ditinjau petugas"}
              </button>
              {isRevisingApp && linkedApp && (
                <Link
                  to={`/pelacakan?id=${encodeURIComponent(linkedApp.id)}`}
                  className="button-secondary"
                >
                  Lihat riwayat tinjauan ({linkedApp.internal_reference})
                </Link>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 4. Bagian Terpisah: Pengajuan melalui Kanal Resmi Pemerintah & Pencatatan Tanda Terima */}
      <section
        className="plain-panel mt-6"
        aria-label="Pengajuan di kanal resmi instansi"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Proses Resmi di Instansi Pemerintah (Di Luar DaftarIn)
        </p>
        <h2 className="panel-title mt-1">
          Pengajuan di kanal resmi &amp; pencatatan tanda terima instansi
        </h2>
        <dl className="summary-details mt-4 pb-4 border-b border-slate-200">
          <div>
            <dt>Kanal pelayanan resmi</dt>
            <dd>
              {currentService.official_channel ||
                "Loket Disdukcapil Kota Contoh"}
            </dd>
          </div>
          <div>
            <dt>Biaya &amp; estimasi penyelesaian (referensi layanan)</dt>
            <dd>
              {currentService.official_fee || "Gratis (Rp 0)"} ·{" "}
              {currentService.official_duration || "1–3 hari kerja"}
            </dd>
          </div>
        </dl>

        {linkedApp?.official_submission ? (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">
              Catatan pengajuan kanal resmi telah tersimpan (Dicatat warga)
            </p>
            <p>
              Kanal: <strong>{linkedApp.official_submission.channel}</strong> ·
              Nomor tanda terima resmi:{" "}
              <strong>
                {linkedApp.official_submission.officialReceiptNumber ||
                  "Belum diisi"}
              </strong>{" "}
              · Dicatat pada {linkedApp.official_submission.recordedAt}
            </p>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-slate-600 mt-4">
            Setelah persiapan Anda ditinjau atau apabila Anda langsung mengurus
            di loket/portal resmi instansi, Anda dapat mencatat nomor tanda
            terima dari instansi di bawah ini sebagai pengingat pribadi.
          </p>
        )}

        <button
          type="button"
          className="text-link mt-4 no-print"
          onClick={() => setRecording(!recording)}
          aria-expanded={recording}
        >
          {recording
            ? "Tutup formulir pencatatan kanal resmi"
            : linkedApp?.official_submission
              ? "Perbarui catatan tanda terima kanal resmi →"
              : "Sudah mengajukan di loket/kanal resmi? Catat tanda terima resmi (Dicatat warga) →"}
        </button>

        {recording && (
          <form
            onSubmit={handleRecordOfficial}
            className="record-form no-print"
          >
            {officialError && (
              <p className="form-error" role="alert">
                {officialError}
              </p>
            )}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <strong>Pemisahan status:</strong> Pencatatan ini disimpan sebagai
              catatan pengajuan di kanal resmi instansi (
              <span className="font-mono">Dicatat warga</span>) dan terpisah
              dari status tinjauan awal DaftarIn.
            </div>
            <div>
              <label htmlFor="official-number">
                Nomor tanda terima resmi dari instansi (opsional bila belum ada)
              </label>
              <input
                id="official-number"
                maxLength={120}
                value={officialNumber}
                onChange={(event) => setOfficialNumber(event.target.value)}
                placeholder="Contoh: REG-KK-2026-0192"
              />
            </div>
            <div>
              <label htmlFor="submission-channel">
                Kanal atau loket resmi yang digunakan
              </label>
              <input
                id="submission-channel"
                required
                maxLength={200}
                value={channel}
                onChange={(event) => setChannel(event.target.value)}
                placeholder="Contoh: Loket Disdukcapil Kota Contoh"
              />
            </div>
            <div>
              <label htmlFor="submission-note">
                Catatan tambahan (opsional)
              </label>
              <input
                id="submission-note"
                maxLength={500}
                value={submissionNote}
                onChange={(event) => setSubmissionNote(event.target.value)}
                placeholder="Contoh: Diserahkan di loket 2 pukul 09.30 WIB"
              />
            </div>
            <button
              className="button-primary"
              type="submit"
              disabled={!channel.trim()}
            >
              Simpan catatan kanal resmi &amp; buka pelacakan
            </button>
          </form>
        )}
      </section>

      <DocumentPreviewModal
        doc={previewDoc}
        applicantName={formData.nama_lengkap}
        applicantNik={formData.nik}
        applicantNoKk={formData.no_kk}
        applicantAddress={formData.alamat}
        onClose={() => setPreviewDoc(null)}
      />
    </PreparationLayout>
  );
}
