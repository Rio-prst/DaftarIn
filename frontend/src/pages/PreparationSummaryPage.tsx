import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PreparationLayout } from "../components/PreparationLayout";
import { FamilyContext } from "../components/FamilyContext";
import {
  DocumentPreviewModal,
  isDocumentContentAvailable,
  type PreviewableDocument,
} from "../components/DocumentPreviewModal";
import {
  DEFAULT_REVIEW_UNIT,
  getReviewStatusLabel,
  useApp,
  type FormData,
} from "../context/AppContext";
import {
  documentSlots,
  getSelectedConditionOption,
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
    applications,
    resubmitApplication,
  } = useApp();

  const currentService =
    services.find((s) => s.id === activePreparation.serviceId) || services[0];

  const [citizenReviewNote, setCitizenReviewNote] = useState("");
  const [error, setError] = useState("");
  const [previewDoc, setPreviewDoc] = useState<PreviewableDocument | null>(
    null,
  );
  const navigate = useNavigate();
  const [params] = useSearchParams();

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
    if (
      JSON.stringify(prev.familyMember) !==
      JSON.stringify(activePreparation.familyMember)
    )
      diffs.push("Data anggota keluarga yang diurus diperbarui");
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
    activePreparation.familyMember,
    activeCondition.label,
    formData,
    chosen,
  ]);

  const canSendForReview =
    readiness.basicValidationPassed && activePreparation.consentAccepted;

  const sendingRef = useRef(false);
  const [sending, setSending] = useState(false);
  const handleSendToOfficer = async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setError("");
    try {
      if (isRevisingApp && linkedApp) {
        await resubmitApplication(
          linkedApp.id,
          citizenReviewNote,
          activePreparation.id,
        );
        navigate("/pelacakan/" + encodeURIComponent(linkedApp.id));
      } else {
        const created = await submitForOfficerReview(
          activePreparation.id,
          citizenReviewNote,
        );
        navigate("/pelacakan/" + encodeURIComponent(created.id));
      }
    } catch (cause) {
      sendingRef.current = false;
      setSending(false);
      setError(
        cause instanceof Error
          ? cause.message
          : "Permintaan tinjauan belum dapat dikirim.",
      );
    }
  };

  const waitingForReview =
    hasActiveReviewRequest &&
    (!isRevisingApp || Boolean(linkedApp?.revision_pending));
  const nextIncompletePath = !readiness.steps.step1Kebutuhan
    ? "/persiapan/kebutuhan"
    : !readiness.steps.step2Data
      ? "/persiapan/data"
      : "/persiapan/dokumen";
  const incompleteLabel = !readiness.steps.step1Kebutuhan
    ? "Lengkapi kebutuhan"
    : !readiness.steps.step2Data
      ? "Lengkapi data"
      : "Lengkapi dokumen";
  const actionLabel = sending
    ? "Mengirim…"
    : waitingForReview
      ? "Lihat status tinjauan"
      : !readiness.basicValidationPassed
        ? incompleteLabel
        : !activePreparation.consentAccepted
          ? "Lanjut ke persetujuan"
          : isRevisingApp
            ? "Kirim perbaikan"
            : "Kirim untuk ditinjau";
  const continueReview = () => {
    if (waitingForReview && linkedApp) {
      navigate("/pelacakan/" + encodeURIComponent(linkedApp.id));
      return;
    }
    if (!readiness.basicValidationPassed) {
      navigate(nextIncompletePath + querySuffix);
      return;
    }
    if (!activePreparation.consentAccepted) {
      const consent = document.getElementById("review-consent");
      consent?.scrollIntoView({ block: "center", behavior: "smooth" });
      consent?.focus({ preventScroll: true });
      return;
    }
    handleSendToOfficer();
  };
  return (
    <PreparationLayout
      step={4}
      title={isRevisingApp ? "Tinjau perbaikan" : "Tinjau & kirim"}
      actions={
        <>
          <Link
            to={"/persiapan/dokumen" + querySuffix}
            className="button-secondary"
          >
            Kembali ke dokumen
          </Link>
          <button
            type="button"
            className="button-primary"
            disabled={sending}
            onClick={continueReview}
          >
            {actionLabel}
          </button>
        </>
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <p className="text-sm text-slate-600 max-w-2xl">
          Periksa data dan berkas sebelum dibagikan kepada petugas pendamping.
          Pengiriman ini belum menjadi pengajuan resmi ke instansi.
        </p>
        <button
          type="button"
          className="text-link min-h-[44px] no-print"
          onClick={() => window.print()}
        >
          Cetak ringkasan
        </button>
      </div>
      {!readiness.basicValidationPassed && (
        <div className="case-update-note mb-5" role="status">
          <p>
            Persiapan belum lengkap. Selesaikan bagian yang kurang sebelum
            mengirim.
          </p>
          <Link className="text-link" to={nextIncompletePath + querySuffix}>
            {incompleteLabel} →
          </Link>
        </div>
      )}
      {/* 2. Ringkasan Data & Dokumen yang Akan Dibagikan */}
      <FamilyContext
        member={activePreparation.familyMember}
        birth={currentService.id === 3}
      />
      <div className="summary-grid">
        <section className="plain-panel">
          <div className="flex items-center justify-between gap-2">
            <h2 className="panel-title">Data pemohon</h2>
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
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 border border-red-200">
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

      <section
        className="plain-panel mt-6"
        aria-label="Pengiriman untuk tinjauan"
      >
        <h2 className="panel-title">
          {waitingForReview
            ? "Berkas sudah dikirim"
            : isRevisingApp
              ? "Kirim perbaikan"
              : "Persetujuan dan pengiriman"}
        </h2>
        {waitingForReview && linkedApp ? (
          <>
            <p className="mt-3 text-sm">
              {linkedApp.internal_reference} · {getReviewStatusLabel(linkedApp)}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {readiness.hasUnsentDraftChanges
                ? "Perubahan pada draf belum mengubah berkas yang sedang ditinjau petugas."
                : "Pantau hasil tinjauan dan arahan berikutnya melalui halaman status."}
            </p>
            <Link
              className="text-link inline-flex min-h-[44px] items-center mt-2"
              to={"/pelacakan/" + encodeURIComponent(linkedApp.id)}
            >
              Lihat status tinjauan →
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600 mt-2">
              Penerima: {linkedApp?.recipient_unit || DEFAULT_REVIEW_UNIT}.
              Petugas akan memeriksa data dan isi berkas yang dikirim.
            </p>
            {isRevisingApp && (
              <div className="mt-4 border-l-2 border-slate-300 pl-4">
                <h3 className="text-sm font-semibold">
                  Perubahan yang akan dikirim
                </h3>
                {liveChangesFromSnapshot.length ? (
                  <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                    {liveChangesFromSnapshot.map((change, index) => (
                      <li key={index}>{change}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-600 mt-2">
                    Belum ada perubahan dibanding kiriman sebelumnya. Pastikan
                    arahan petugas sudah ditangani.
                  </p>
                )}
              </div>
            )}
            <div className="form-field mt-5">
              <label htmlFor="citizen-review-note">
                Catatan untuk petugas (opsional)
              </label>
              <textarea
                id="citizen-review-note"
                rows={2}
                maxLength={500}
                value={citizenReviewNote}
                onChange={(event) => setCitizenReviewNote(event.target.value)}
                placeholder="Tambahkan keterangan yang perlu diketahui petugas."
              />
            </div>
            <label className="processing-consent mt-5">
              <input
                id="review-consent"
                type="checkbox"
                checked={activePreparation.consentAccepted}
                onChange={(event) => setConsentAccepted(event.target.checked)}
              />
              <span>
                Saya sudah memeriksa data pemohon, data keluarga yang dipilih,
                dan berkas di atas serta menyetujui pembagiannya kepada petugas
                pendamping untuk ditinjau. Saya memahami bahwa ini belum
                merupakan pengajuan resmi ke instansi pemerintah.
              </span>
            </label>
            {error && (
              <p className="form-error mt-3" role="alert">
                {error}
              </p>
            )}
            {!readiness.basicValidationPassed && (
              <p className="text-sm text-slate-600 mt-3">
                Lengkapi kebutuhan, data, dan berkas wajib agar bisa mengirim.
              </p>
            )}
            <button
              type="button"
              className="button-primary mt-5"
              disabled={!canSendForReview || sending}
              onClick={handleSendToOfficer}
            >
              {sending
                ? "Mengirim…"
                : isRevisingApp
                  ? "Kirim perbaikan untuk ditinjau"
                  : "Kirim untuk ditinjau petugas"}
            </button>
          </>
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
