import { SubmissionReviewHistory } from '../components/SubmissionReviewHistory';
import { Link, useLocation, useParams } from "react-router-dom";
import { RequestListPage } from "./RequestListPage";
import { useEffect, useState, type FormEvent } from "react";
import { WorkspaceLayout } from "../components/WorkspaceLayout";
import { FamilyContext } from "../components/FamilyContext";
import {
  DocumentPreviewModal,
  isDocumentContentAvailable,
  type PreviewableDocument,
} from "../components/DocumentPreviewModal";
import {
  getOfficialSubmissionStatusLabel,
  getReviewStatusLabel,
  useApp,
  type ApplicationRecord,
  type ApplicationAttachment,
} from "../context/AppContext";
import {
  documentSlots,
  OFFICER_ISSUE_CATEGORY_LABELS,
  type OfficerIssueCategory,
  type OfficerItemAssessment,
  type OfficerItemVerdict,
} from "../types/preparation";

export function OfficerPage() {
  const { id } = useParams();
  return id ? (
    <OfficerRequestPage key={id} id={id} />
  ) : (
    <RequestListPage kind="officer" />
  );
}
function OfficerRequestPage({ id }: { id: string }) {
  const { applications } = useApp();
  const location = useLocation();
  const record = applications.find(
    (item) =>
      item.id === id &&
      item.current_status !== "DICATAT_WARGA" &&
      item.assigned_officer_id,
  );
  const previous = location.state?.returnTo;
  const back =
    typeof previous === "string" &&
    (previous === "/petugas" || previous.startsWith("/petugas?") || previous === '/petugas/ringkasan' || previous === '/petugas/riwayat' || previous.startsWith('/petugas/riwayat?'))
      ? previous
      : location.pathname.startsWith('/petugas/riwayat/') ? '/petugas/riwayat' : '/petugas';
  return (
    <WorkspaceLayout
      title="Rincian tinjauan"
      actions={
        <Link to={back} className="button-secondary">
          {back.startsWith('/petugas/riwayat') ? 'Kembali ke riwayat' : back === '/petugas/ringkasan' ? 'Kembali ke ringkasan' : 'Kembali ke antrean'}
        </Link>
      }
    >
      {record ? (
        <OfficerDetail
          key={`${record.id}-v${record.submitted_snapshot?.submissionVersion || 1}`}
          record={record}
          historyVersion={Number(new URLSearchParams(location.search).get('version')) || location.state?.submissionVersion}
          readOnly={location.pathname.startsWith('/petugas/riwayat/')}
        />
      ) : (
        <div className="empty-state" role="alert">
          <h2>Tinjauan tidak ditemukan</h2>
          <p>Permintaan tidak tersedia atau tidak ditugaskan kepadamu.</p>
        </div>
      )}
    </WorkspaceLayout>
  );
}
function OfficerDetail({ record, historyVersion, readOnly }: { record: ApplicationRecord; historyVersion?: number; readOnly: boolean }) {
  const {
    services,
    user,
    officerStartReview,
    officerRequestRevision,
    officerCompleteReview,
  } = useApp();

  const snapshot = readOnly && historyVersion ? record.submission_history?.find(item=>item.submissionVersion===historyVersion) || record.submitted_snapshot : record.submitted_snapshot;
  const currentSubmissionVersion = snapshot?.submissionVersion || 1;
  const service =
    snapshot?.serviceSnapshot || services.find((s) => s.id === record.service_id) || services[0];
  const slots = snapshot?.requiredSlots || documentSlots(
    service,
    snapshot?.conditionKey || record.condition_key,
  );

  const attachments = snapshot
    ? snapshot.attachments
    : record.attachments || [];

  const assessmentDocuments: ApplicationAttachment[] = [...attachments, ...slots.filter(slot => slot.required && !attachments.some(att => att.id === slot.id || (!att.id && att.name === slot.name))).map(slot => ({id: slot.id, name: slot.name, fileName: 'Belum dilampirkan', size: '—', fileType: 'pdf' as const}))];

  const targetChoices = [
    ...attachments.map((att) => att.name),
    ...slots
      .filter((s) => s.required && !attachments.some((a) => a.name === s.name))
      .map((s) => s.name),
    "Data formulir pemohon (Nama / NIK / Nomor KK / Alamat)",
    "Keterangan kondisi permohonan",
  ];

  const defaultActionTab: "start" | "revision" | "complete" =
    record.current_status === "DITERIMA" ||
    (record.current_status === "PERLU_PERBAIKAN" && record.revision_pending)
      ? "start"
      : record.current_status === "VERIFIKASI"
        ? "complete"
        : "start";

  const draftKey = `daftarin:review-draft:${user.id}:${record.id}:${currentSubmissionVersion}`;
  const [savedDraft] = useState(() => {
    try {
      const raw = JSON.parse(sessionStorage.getItem(draftKey) || '{}');
      const text = (key: string) => typeof raw?.[key] === 'string' ? raw[key].slice(0, 2000) as string : '';
      const notes: Record<string,string> = {};
      const verdicts: Record<string, OfficerItemVerdict | ''> = {};
      if (raw?.notesByItem && typeof raw.notesByItem === 'object') for (const [key,value] of Object.entries(raw.notesByItem)) if (typeof value === 'string') notes[key] = value.slice(0,1000);
      if (raw?.verdictsByItem && typeof raw.verdictsByItem === 'object') for (const [key,value] of Object.entries(raw.verdictsByItem)) if (['sesuai','perlu_perbaikan','belum_dapat_diperiksa',''].includes(String(value))) verdicts[key] = value as OfficerItemVerdict;
      return {notes, verdicts, startNote:text('startNote'), targetItem:text('targetItem'), issueCategory:text('issueCategory'), problemDescription:text('problemDescription'), requiredAction:text('requiredAction'), completeNote:text('completeNote')};
    } catch { return null; }
  });
  const [actionTab, setActionTab] = useState<"start" | "revision" | "complete">(
    defaultActionTab,
  );
  const [startNote, setStartNote] = useState(savedDraft?.startNote || "");
  const [targetItem, setTargetItem] = useState(
    savedDraft?.targetItem || record.latest_revision_detail?.targetItem || targetChoices[0] || "",
  );
  const [issueCategory, setIssueCategory] = useState<OfficerIssueCategory>(
    savedDraft?.issueCategory && Object.hasOwn(OFFICER_ISSUE_CATEGORY_LABELS, savedDraft.issueCategory) ? savedDraft.issueCategory as OfficerIssueCategory : record.latest_revision_detail?.issueCategory || 'sulit_dibaca',
  );
  const [problemDescription, setProblemDescription] = useState(savedDraft?.problemDescription || "");
  const [requiredAction, setRequiredAction] = useState(savedDraft?.requiredAction || "");
  // Catatan penyelesaian TIDAK diisi default agar petugas menulis hasil pemeriksaan secara nyata
  const [completeNote, setCompleteNote] = useState(savedDraft?.completeNote || "");
  const [error, setError] = useState("");
  const [previewDoc, setPreviewDoc] = useState<PreviewableDocument | null>(
    null,
  );
  const [notesByItem, setNotesByItem] = useState<Record<string, string>>(() => savedDraft && Object.keys(savedDraft.notes).length ? savedDraft.notes : Object.fromEntries(
    (record.latest_evaluation?.submissionVersion === currentSubmissionVersion ? record.latest_evaluation.itemAssessments : []).map(item => [item.itemId, item.note || ''])
  ));

  // State penilaian eksplisit per item untuk versi kiriman aktif (tanpa auto-select saat membuka pratinjau)
  const [verdictsByItem, setVerdictsByItem] = useState<
    Record<string, OfficerItemVerdict | "">
  >(() => {
    if (savedDraft && Object.keys(savedDraft.verdicts).length) return savedDraft.verdicts;
    const existingEval =
      record.latest_evaluation?.submissionVersion === currentSubmissionVersion
        ? record.latest_evaluation
        : undefined;
    const initial: Record<string, OfficerItemVerdict | ""> = {
      form_data: "",
    };
    if (existingEval) {
      existingEval.itemAssessments.forEach((a) => {
        initial[a.itemId] = a.verdict;
      });
    }
    assessmentDocuments.forEach((att, idx) => {
      const key = att.id || `att-${idx}`;
      if (!(key in initial)) {
        initial[key] = "";
      }
    });
    return initial;
  });

  useEffect(() => {
    if (readOnly) return;
    try {
      if (record.current_status !== 'VERIFIKASI') sessionStorage.removeItem(draftKey);
      else sessionStorage.setItem(draftKey, JSON.stringify({verdictsByItem, notesByItem, startNote, targetItem, issueCategory, problemDescription, requiredAction, completeNote}));
    } catch { setError('Catatan sementara belum tersimpan. Tetap di halaman ini sebelum mengirim hasil tinjauan.'); }
  }, [readOnly, draftKey, record.current_status, verdictsByItem, notesByItem, startNote, targetItem, issueCategory, problemDescription, requiredAction, completeNote]);

  useEffect(() => {
    if (record.current_status === "VERIFIKASI" && actionTab === "start") {
      setActionTab("complete");
    }
  }, [record.current_status, actionTab]);

  // Status transisi yang diizinkan:
  // Menunggu tinjauan (DITERIMA) / Perbaikan dikirim (PERLU_PERBAIKAN + revision_pending)
  // -> Sedang ditinjau (VERIFIKASI)
  // -> Perlu perbaikan (PERLU_PERBAIKAN) atau Tinjauan awal selesai (SELESAI)
  const canStartReview =
    record.current_status === "DITERIMA" || record.current_status === 'DIPROSES' ||
    (record.current_status === "PERLU_PERBAIKAN" &&
      Boolean(record.revision_pending));
  const isCurrentlyReviewing = record.current_status === "VERIFIKASI";

  const setItemVerdict = (itemId: string, verdict: OfficerItemVerdict | "") => {
    setVerdictsByItem((prev) => ({
      ...prev,
      [itemId]: verdict,
    }));
    setError("");
  };

  const buildItemAssessments = (): OfficerItemAssessment[] => {
    const list: OfficerItemAssessment[] = [];
    const formVerdict = verdictsByItem["form_data"];
    if (formVerdict) {
      list.push({
        itemId: "form_data",
        itemName: "Data pemohon & isian formulir",
        itemType: "form_data",
        verdict: formVerdict,
        note: notesByItem.form_data?.trim() || undefined,
      });
    }
    assessmentDocuments.forEach((att, idx) => {
      const key = att.id || `att-${idx}`;
      const v = verdictsByItem[key];
      if (v) {
        list.push({
          itemId: key,
          itemName: att.name,
          itemType: "document",
          verdict: v,
          note: notesByItem[key]?.trim() || undefined,
          fileVersion: att.version || 1,
          fileName: att.fileName,
        });
      }
    });
    return list;
  };

  const unavailableAttachments = assessmentDocuments.filter(
    (att) => !isDocumentContentAvailable(att),
  );
  const allAttachmentsAvailable = unavailableAttachments.length === 0;

  const isFormAssessedSesuai = verdictsByItem["form_data"] === "sesuai";
  const allDocsAssessedSesuai =
    assessmentDocuments.length > 0 &&
    assessmentDocuments.every((att, idx) => {
      const key = att.id || `att-${idx}`;
      return (
        isDocumentContentAvailable(att) && verdictsByItem[key] === "sesuai"
      );
    });
  const allItemsMarkedSesuai = isFormAssessedSesuai && allDocsAssessedSesuai;
  const hasAnyNeedsRevisionOrUnavailable =
    verdictsByItem["form_data"] === "perlu_perbaikan" ||
    verdictsByItem["form_data"] === "belum_dapat_diperiksa" ||
    assessmentDocuments.some((att, idx) => {
      const v = verdictsByItem[att.id || `att-${idx}`];
      return v === "perlu_perbaikan" || v === "belum_dapat_diperiksa";
    });

  const canSubmitComplete =
    isCurrentlyReviewing &&
    allAttachmentsAvailable &&
    allItemsMarkedSesuai &&
    completeNote.trim().length >= 5;

  const handleStart = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await officerStartReview(record.id, startNote);
      setStartNote("");
      setActionTab("complete");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Gagal memulai tinjauan.",
      );
    }
  };

  const handleRevision = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await officerRequestRevision(
        record.id,
        {
          targetItem,
          issueCategory,
          problemDescription,
          requiredAction,
        },
        buildItemAssessments(),
      );
      setProblemDescription("");
      setRequiredAction("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Gagal mengirim permintaan perbaikan.",
      );
    }
  };

  const handleComplete = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await officerCompleteReview(record.id, completeNote, buildItemAssessments());
      setCompleteNote("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Gagal menyelesaikan tinjauan awal.",
      );
    }
  };

  const subjectLabel =
    (snapshot?.applicantTarget || record.applicant_target) ===
    "anggota_keluarga"
      ? "Anggota keluarga dalam satu KK"
      : "Diri sendiri / Kepala keluarga";

  const submissionHistory =
    record.submission_history && record.submission_history.length > 0
      ? record.submission_history
      : snapshot
        ? [snapshot]
        : [];


  return (
    <section
      className="plain-panel officer-detail"
      aria-labelledby="case-heading"
    >
      <div className="case-heading">
        <div>
          <p className="field-hint">
            Kode Tinjauan DaftarIn:{" "}
            <strong className="font-mono text-slate-800">
              {record.internal_reference}
            </strong>{" "}
            · Draf warga:{" "}
            <span className="font-mono">
              {record.preparation_reference || "-"}
            </span>
          </p>
          <h2 id="case-heading">{record.service_name}</h2>
          <p className="text-xs text-slate-600 mt-1">
            {record.agency || service.agency} · Wilayah{" "}
            {record.region || service.region || "Kota Contoh"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={
              record.current_status === "SELESAI" ||
              record.current_status === "HASIL_DITERIMA_WARGA"
                ? "status-ready"
                : record.current_status === "PERLU_PERBAIKAN" ||
                    record.current_status === "DITERIMA"
                  ? "status-attention"
                  : "status-neutral"
            }
          >
            Status Tinjauan: {getReviewStatusLabel(record)}
          </span>
          {record.official_submission && (
            <span className="text-xs text-slate-500">
              Kanal resmi: {getOfficialSubmissionStatusLabel(record)}
            </span>
          )}
        </div>
      </div>

      {record.revision_pending && (
        <div className="mt-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
          <p className="font-bold">
            Warga telah mengirim perbaikan berkas (Kiriman #
            {currentSubmissionVersion})
          </p>
          {snapshot?.changesSummary && snapshot.changesSummary.length > 0 && (
            <ul className="list-disc pl-4 space-y-0.5">
              {snapshot.changesSummary.map((change, idx) => (
                <li key={idx}>{change}</li>
              ))}
            </ul>
          )}
          {snapshot?.citizenNote && (
            <p>
              <strong>Catatan warga:</strong> {snapshot.citizenNote}
            </p>
          )}
          <p className="pt-1 text-blue-900 font-medium">
            Tekan &ldquo;Mulai tinjauan sekarang&rdquo; di bagian bawah untuk
            mengubah status menjadi <strong>Sedang ditinjau</strong> dan menilai
            Kiriman #{currentSubmissionVersion}.
          </p>
        </div>
      )}
      <FamilyContext
        member={snapshot?.familyMember}
        birth={record.service_id === 3}
      />

      {/* 1. Data Pemohon & Formulir yang Dikirim Warga */}
      <section className="case-section">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3>Data pemohon &amp; isian formulir yang dibagikan</h3>
          <span className="text-xs text-slate-500">
            Salinan kiriman #{currentSubmissionVersion} ·{" "}
            {snapshot?.submittedAt ||
              record.submission_date ||
              record.created_at}
          </span>
        </div>
        <dl className="record-details mt-3">
          <div>
            <dt>Subjek pengurusan</dt>
            <dd>{subjectLabel}</dd>
          </div>
          <div>
            <dt>Kondisi permohonan</dt>
            <dd>
              {snapshot?.conditionLabel ||
                record.condition_label ||
                "Sesuai permohonan"}
            </dd>
          </div>
          <div>
            <dt>Nama lengkap pemohon</dt>
            <dd>{snapshot?.formData.nama_lengkap || record.applicant_name}</dd>
          </div>
          <div>
            <dt>NIK pemohon (16 digit)</dt>
            <dd className="font-mono">
              {snapshot?.formData.nik || record.applicant_nik}
            </dd>
          </div>
          <div>
            <dt>Nomor Kartu Keluarga (16 digit)</dt>
            <dd className="font-mono">
              {snapshot?.formData.no_kk || "Belum tercantum"}
            </dd>
          </div>
          <div>
            <dt>Nomor WhatsApp / telepon</dt>
            <dd>
              {snapshot?.formData.telepon ||
                record.applicant_phone ||
                "Belum tercantum"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt>Alamat domisili</dt>
            <dd>{snapshot?.formData.alamat || "Belum tercantum"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt>Alasan / rincian permohonan</dt>
            <dd>{snapshot?.formData.alasan || "Belum tercantum"}</dd>
          </div>
        </dl>
      </section>

      {/* 2. Daftar Persyaratan Layanan & Berkas yang Dikirim Warga (dengan Pratinjau & Ketersediaan) */}
      <section className="case-section">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3>
            Berkas persyaratan pada Kiriman #{currentSubmissionVersion} (
            {attachments.length})
          </h3>
          <span className="text-xs text-slate-500">
            Membuka pratinjau tidak otomatis menandai berkas sebagai Sesuai
          </span>
        </div>

        {/* Acuan persyaratan kondisi */}
        <div className="mt-2 mb-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <strong>Persyaratan wajib kondisi ini:</strong>{" "}
          {slots
            .filter((s) => s.required)
            .map((s) => s.name)
            .join(" · ")}
        </div>

        {attachments.length ? (
          <ul className="attachment-list">
            {attachments.map((document, index) => {
              const isSampleIssue = document.qualityPreset === "sample_issue";
              const isSampleClean = document.qualityPreset === "sample_clean";
              const available = isDocumentContentAvailable(document);
              return (
                <li
                  key={index}
                  className="flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <span
                      className="material-symbols-outlined mt-0.5 text-slate-500"
                      aria-hidden="true"
                    >
                      description
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong>
                          {document.name} (Versi {document.version || 1})
                        </strong>
                        <span
                          className={
                            isSampleIssue
                              ? "status-attention"
                              : "status-neutral"
                          }
                        >
                          {isSampleIssue
                            ? "CONTOH / SIMULASI · Terpotong"
                            : isSampleClean
                              ? "CONTOH / SIMULASI · Utuh"
                              : "Berkas unggahan warga"}
                        </span>
                        {!available && (
                          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 border border-red-200">
                            Berkas tidak tersedia
                          </span>
                        )}
                      </div>
                      <small className="block mt-0.5">
                        {document.fileName} · {document.size}
                        {document.uploadedAt
                          ? ` · Diunggah ${document.uploadedAt}`
                          : ""}
                      </small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="button-secondary !py-1.5 !px-3 !text-xs shrink-0"
                    onClick={() =>
                      setPreviewDoc({
                        id: document.id || `att-${index}`,
                        name: document.name,
                        fileName: document.fileName,
                        size: document.size,
                        fileType: document.fileType,
                        version: document.version || 1,
                        uploadedAt: document.uploadedAt,
                        qualityPreset: document.qualityPreset,
                        previewKey: document.previewKey,
                        fixtureId: document.fixtureId,
                      })
                    }
                  >
                    Buka pratinjau berkas
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="field-hint">
            Belum ada lampiran berkas pada permintaan tinjauan ini.
          </p>
        )}
      </section>

      {/* 3. Riwayat Versi Kiriman & Pratinjau Tiap Versi */}
      {submissionHistory.length > 1 && (
        <section className="case-section">
          <h3>
            Riwayat versi kiriman warga ({submissionHistory.length} versi)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Setiap kiriman menyimpan snapshot versi berkas masing-masing. Anda
            tetap dapat membuka pratinjau berkas v1 maupun v2 secara terpisah.
          </p>
          <div className="space-y-2.5 mt-2.5">
            {submissionHistory.map((ver) => (
              <div
                key={ver.submissionVersion}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-slate-800">
                    Kiriman #{ver.submissionVersion}
                  </strong>
                  <span className="text-slate-500">{ver.submittedAt}</span>
                </div>
                {ver.citizenNote && (
                  <p className="text-slate-700">
                    <strong>Catatan warga:</strong> {ver.citizenNote}
                  </p>
                )}
                {ver.changesSummary && ver.changesSummary.length > 0 && (
                  <p className="text-slate-600">
                    <strong>Perubahan:</strong> {ver.changesSummary.join("; ")}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-slate-500 font-medium">
                    Lampiran Kiriman #{ver.submissionVersion}:
                  </span>
                  {ver.attachments.map((att, idx) => (
                    <button
                      key={`${ver.submissionVersion}-${att.id || idx}`}
                      type="button"
                      className="btn-secondary !py-1 !px-2.5 !text-xs"
                      onClick={() =>
                        setPreviewDoc({
                          id: att.id || `att-${idx}`,
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
        </section>
      )}

      <SubmissionReviewHistory record={record} initialVersion={historyVersion} />

      {readOnly&&<p className="text-sm text-slate-600 mt-4">Menampilkan salinan Kiriman #{currentSubmissionVersion}. <Link className="text-link" to={'/petugas/'+encodeURIComponent(record.id)}>Buka permintaan terbaru →</Link></p>}
      {/* 4. Tindakan Tinjauan Petugas & Penilaian Eksplisit */}
      {!readOnly&&!['SELESAI','DITARIK','HASIL_DITERIMA_WARGA'].includes(record.current_status)&&<Link className="text-link inline-flex items-center min-h-[44px] mt-4" to="/bantuan" state={{applicationId:record.id,topic:'Klarifikasi panduan · '+record.internal_reference}}>Minta klarifikasi admin →</Link>}
      {record.escalation?.status==='resolved'&&<p className="plain-panel mt-3">Klarifikasi admin: {record.escalation.answer}</p>}
      {!readOnly&&<section className="case-section">
        <h3>Tindakan tinjauan petugas (Kiriman #{currentSubmissionVersion})</h3>

        {record.escalation?.status==='pending'?<p className="text-sm">Menunggu klarifikasi admin: {record.escalation.reason}. Keputusan ditunda sampai admin memberi tanggapan.</p>:record.current_status==='DITARIK'?<p>Warga sudah menarik tinjauan ini. Riwayat tetap dapat dibaca.</p>:record.current_status === "SELESAI" ||
        record.current_status === "HASIL_DITERIMA_WARGA" ? (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <p>
              <strong>
                Tinjauan awal pendamping telah selesai (Kiriman #
                {record.latest_evaluation?.submissionVersion ||
                  currentSubmissionVersion}
                ).
              </strong>{" "}
              Warga telah diberikan arahan untuk melanjutkan pengajuan melalui
              kanal resmi instansi.
            </p>
            <p className="text-emerald-800">
              Catatan: Penyelesaian tinjauan awal ini tidak menyatakan instansi
              pemerintah telah menerima pengajuan resmi.
            </p>
          </div>
        ) : record.current_status === "PERLU_PERBAIKAN" &&
          !record.revision_pending ? (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
            <strong>Menunggu perbaikan dari warga.</strong> Permintaan perbaikan
            untuk Kiriman #{currentSubmissionVersion} telah dikirim. Setelah
            warga mengirim berkas perbaikan, status akan berubah menjadi{" "}
            <strong>Perbaikan dikirim</strong> dan dapat ditinjau ulang.
          </div>
        ) : (
          <>
            <div
              className="flex flex-wrap gap-2 mt-2 mb-4"
              role="tablist"
              aria-label="Pilih tahap tindakan petugas"
            >
              <button
                type="button"
                role="tab"
                aria-selected={actionTab === "start"}
                className={
                  actionTab === "start"
                    ? "button-primary !py-1.5 !px-3 !text-xs"
                    : "button-secondary !py-1.5 !px-3 !text-xs"
                }
                onClick={() => {
                  setActionTab("start");
                  setError("");
                }}
              >
                1. Mulai tinjauan
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={actionTab === "revision"}
                className={
                  actionTab === "revision"
                    ? "button-primary !py-1.5 !px-3 !text-xs"
                    : "button-secondary !py-1.5 !px-3 !text-xs"
                }
                onClick={() => {
                  setActionTab("revision");
                  setError("");
                }}
              >
                2. Minta perbaikan
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={actionTab === "complete"}
                className={
                  actionTab === "complete"
                    ? "button-primary !py-1.5 !px-3 !text-xs"
                    : "button-secondary !py-1.5 !px-3 !text-xs"
                }
                onClick={() => {
                  setActionTab("complete");
                  setError("");
                }}
              >
                3. Selesaikan tinjauan awal
              </button>
            </div>

            {error && (
              <p role="alert" className="form-error mb-3">
                {error}
              </p>
            )}

            {/* Jika belum masuk status VERIFIKASI ("Sedang ditinjau"), wajibkan Mulai Tinjauan terlebih dahulu */}
            {!isCurrentlyReviewing && actionTab !== "start" && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold">
                    Permintaan masih berstatus &ldquo;
                    {getReviewStatusLabel(record)}&rdquo;
                  </p>
                  <p className="mt-0.5 text-amber-900">
                    Sesuai alur pelayanan, petugas harus memulai tinjauan (masuk
                    ke status <strong>Sedang ditinjau</strong>) sebelum mengirim
                    permintaan perbaikan atau menyelesaikan tinjauan awal.
                  </p>
                </div>
                <button
                  type="button"
                  className="button-primary !py-1.5 !px-3 !text-xs shrink-0"
                  onClick={() => {
                    officerStartReview(record.id);
                  }}
                >
                  Mulai tinjauan sekarang →
                </button>
              </div>
            )}

            {/* Daftar Penilaian Eksplisit Per Item (aktif saat Sedang ditinjau) */}
            {isCurrentlyReviewing &&
              (actionTab === "complete" || actionTab === "revision") && (
                <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Penilaian Eksplisit Pemeriksaan Kiriman #
                      {currentSubmissionVersion}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Pilih hasil pemeriksaan untuk data pemohon dan setiap
                      berkas persyaratan. Penyelesaian tinjauan awal hanya dapat
                      dilakukan jika seluruh item tersedia dan dinilai{" "}
                      <strong>Sesuai</strong>.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {/* Baris 1: Data pemohon */}
                    <div className="rounded-lg border border-slate-200 bg-white p-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800">
                          1. Data pemohon &amp; isian formulir permohonan
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {snapshot?.formData.nama_lengkap ||
                            record.applicant_name}{" "}
                          · NIK {snapshot?.formData.nik || record.applicant_nik}{" "}
                          · KK {snapshot?.formData.no_kk || "-"}
                        </p>
                      </div>
                      <select
                        aria-label="Penilaian Data pemohon dan isian formulir"
                        value={verdictsByItem["form_data"] || ""}
                        onChange={(e) =>
                          setItemVerdict(
                            "form_data",
                            e.target.value as OfficerItemVerdict | "",
                          )
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
                      >
                        <option value="">— Pilih penilaian —</option>
                        <option value="sesuai">Sesuai</option>
                        <option value="perlu_perbaikan">Perlu perbaikan</option>
                        <option value="belum_dapat_diperiksa">
                          Belum dapat diperiksa
                        </option>
                      </select>
                      {verdictsByItem.form_data && verdictsByItem.form_data !== 'sesuai' && <div className="form-field w-full">
                        <label htmlFor="assessment-note-form">Masalah dan perbaikan data pemohon</label>
                        <textarea id="assessment-note-form" rows={2} maxLength={1000} value={notesByItem.form_data || ''} onChange={event => setNotesByItem(prev => ({...prev, form_data: event.target.value}))} />
                      </div>}
                    </div>

                    {/* Baris 2..N: Setiap berkas persyaratan */}
                    {assessmentDocuments.map((att, idx) => {
                      const key = att.id || `att-${idx}`;
                      const available = isDocumentContentAvailable(att);
                      const currentVerdict = verdictsByItem[key] || "";
                      return (
                        <div
                          key={key}
                          className="assessment-document-row rounded-lg border border-slate-200 bg-white p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs font-semibold text-slate-800">
                                {idx + 2}. {att.name} (v{att.version || 1})
                              </p>
                              {!available && (
                                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                                  Berkas tidak tersedia
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {att.fileName} · {att.size}
                              {!available
                                ? " — Isi berkas tidak ditemukan di penyimpanan sehingga tidak dapat ditandai Sesuai."
                                : ""}
                            </p>
                          </div>
                          <div className="assessment-document-controls">
                            <button
                              type="button"
                              className="btn-secondary !py-1 !px-2.5 !text-xs"
                              onClick={() =>
                                setPreviewDoc({
                                  id: key,
                                  name: att.name,
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
                              Pratinjau
                            </button>
                            <select
                              aria-label={`Penilaian ${att.name}`}
                              value={currentVerdict}
                              onChange={(e) => {
                                const nextVal = e.target.value as
                                  OfficerItemVerdict | "";
                                setItemVerdict(key, nextVal);
                                if (
                                  nextVal === "perlu_perbaikan" ||
                                  nextVal === "belum_dapat_diperiksa"
                                ) {
                                  setTargetItem(att.name);
                                }
                              }}
                              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
                            >
                              <option value="">— Pilih penilaian —</option>
                              <option value="sesuai" disabled={!available}>
                                {available
                                  ? "Sesuai"
                                  : "Sesuai (Tidak tersedia — berkas hilang)"}
                              </option>
                              <option value="perlu_perbaikan">
                                Perlu perbaikan
                              </option>
                              <option value="belum_dapat_diperiksa">
                                Belum dapat diperiksa
                              </option>
                            </select>
                            
                          </div>
                            {verdictsByItem[key] && verdictsByItem[key] !== 'sesuai' && <div className="form-field assessment-document-note">
                              <label htmlFor={`assessment-note-${key}`}>Masalah dan perbaikan {att.name}</label>
                              <textarea id={`assessment-note-${key}`} rows={2} maxLength={1000} value={notesByItem[key] || ''} onChange={event => setNotesByItem(prev => ({...prev, [key]: event.target.value}))} />
                            </div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {actionTab === "start" && (
              <form className="auth-form" onSubmit={handleStart} noValidate>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ubah status permintaan dari{" "}
                  <strong>{getReviewStatusLabel(record)}</strong> menjadi{" "}
                  <strong>Sedang ditinjau</strong> agar warga mengetahui berkas
                  mereka sedang diperiksa petugas.
                </p>
                <div className="form-field">
                  <label htmlFor="officer-start-note">
                    Catatan mulai tinjauan (opsional)
                  </label>
                  <textarea
                    id="officer-start-note"
                    rows={2}
                    maxLength={500}
                    value={startNote}
                    onChange={(e) => setStartNote(e.target.value)}
                    placeholder="Contoh: Petugas mulai memeriksa kelengkapan berkas dan kesesuaian data formulir."
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="button-primary disabled:opacity-50"
                    disabled={!canStartReview}
                  >
                    {canStartReview
                      ? "Mulai tinjauan sekarang"
                      : "Permintaan sudah dalam tahap Sedang ditinjau"}
                  </button>
                </div>
              </form>
            )}

            {actionTab === "revision" && (
              <form className="auth-form" onSubmit={handleRevision} noValidate>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kembalikan permintaan dengan catatan terstruktur agar warga
                  tahu persis berkas atau isian mana yang harus diperbaiki pada
                  permintaan <strong>{record.internal_reference}</strong>.
                </p>
                <div className="form-field">
                  <label htmlFor="revision-target-item">
                    Dokumen atau bagian data yang bermasalah
                  </label>
                  <select
                    id="revision-target-item"
                    value={targetItem}
                    onChange={(e) => setTargetItem(e.target.value)}
                  >
                    {targetChoices.map((choice) => (
                      <option key={choice} value={choice}>
                        {choice}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="revision-issue-category">
                    Kategori masalah
                  </label>
                  <select
                    id="revision-issue-category"
                    value={issueCategory}
                    onChange={(e) =>
                      setIssueCategory(e.target.value as OfficerIssueCategory)
                    }
                  >
                    {(
                      Object.entries(OFFICER_ISSUE_CATEGORY_LABELS) as Array<
                        [OfficerIssueCategory, string]
                      >
                    ).map(([code, label]) => (
                      <option key={code} value={code}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="revision-problem-desc">
                    Penjelasan masalah yang ditemukan petugas
                  </label>
                  <textarea
                    id="revision-problem-desc"
                    rows={3}
                    maxLength={1000}
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    placeholder="Contoh: Bagian bawah dokumen KK lama terpotong sehingga tanda tangan kepala keluarga dan QR pengesahan tidak terlihat."
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="revision-required-action">
                    Tindakan perbaikan yang harus dilakukan warga
                  </label>
                  <textarea
                    id="revision-required-action"
                    rows={2}
                    maxLength={1000}
                    value={requiredAction}
                    onChange={(e) => setRequiredAction(e.target.value)}
                    placeholder="Contoh: Foto atau pindai ulang Kartu Keluarga secara utuh (keempat sudut terlihat jelas), unggah berkas baru di tahap Dokumen, lalu kirim perbaikan."
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="button-primary disabled:opacity-50"
                    disabled={!isCurrentlyReviewing}
                  >
                    Kirim permintaan perbaikan ke warga
                  </button>
                </div>
              </form>
            )}

            {actionTab === "complete" && (
              <form className="auth-form" onSubmit={handleComplete} noValidate>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tandai <strong>Tinjauan awal selesai</strong> hanya apabila
                  seluruh data pemohon dan berkas wajib pada Kiriman #
                  {currentSubmissionVersion} tersedia serta telah Anda nilai{" "}
                  <strong>Sesuai</strong>.
                </p>

                {!allAttachmentsAvailable && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900"
                  >
                    <strong>
                      Tidak dapat menyelesaikan tinjauan karena ada berkas yang
                      tidak tersedia:
                    </strong>{" "}
                    {unavailableAttachments.map((a) => a.name).join(", ")}.
                    Tandai berkas tersebut sebagai{" "}
                    <em>Belum dapat diperiksa</em> dan gunakan tab{" "}
                    <strong>2. Minta perbaikan</strong> agar warga mengunggah
                    ulang berkasnya.
                  </div>
                )}

                {allAttachmentsAvailable && !allItemsMarkedSesuai && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950">
                    {hasAnyNeedsRevisionOrUnavailable ? (
                      <span>
                        Ada item yang dinilai <strong>Perlu perbaikan</strong>{" "}
                        atau <strong>Belum dapat diperiksa</strong>. Gunakan tab{" "}
                        <button
                          type="button"
                          className="underline font-semibold"
                          onClick={() => setActionTab("revision")}
                        >
                          2. Minta perbaikan
                        </button>{" "}
                        untuk mengembalikan berkas ke warga, atau ubah penilaian
                        seluruh item menjadi <strong>Sesuai</strong> jika sudah
                        memenuhi syarat.
                      </span>
                    ) : (
                      <span>
                        Lengkapi penilaian eksplisit pada daftar di atas:
                        pastikan <strong>Data pemohon</strong> dan seluruh{" "}
                        <strong>{attachments.length} berkas persyaratan</strong>{" "}
                        telah dinilai <strong>Sesuai</strong>.
                      </span>
                    )}
                  </div>
                )}

                <div className="form-field">
                  <label htmlFor="officer-complete-note">
                    Catatan hasil tinjauan awal untuk warga (wajib ditulis
                    petugas, min. 5 karakter)
                  </label>
                  <textarea
                    id="officer-complete-note"
                    rows={3}
                    maxLength={1000}
                    value={completeNote}
                    onChange={(e) => setCompleteNote(e.target.value)}
                    placeholder="Tuliskan ringkasan hasil pemeriksaan Anda terhadap data formulir dan dokumen persyaratan serta arahan pengajuan ke kanal resmi..."
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="button-primary disabled:opacity-50"
                    disabled={!canSubmitComplete}
                  >
                    Selesaikan tinjauan awal
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </section>}

      {/* 5. Linimasa Tinjauan */}
      <section className="case-section">
        <h3>Linimasa tinjauan</h3>
        <ol className="case-history">
          {record.events
            .filter((event) => event.completed)
            .map((event) => (
              <li key={event.id}>
                <strong>{event.title}</strong>
                <p>{event.notes}</p>
                {event.next_action && (
                  <p className="text-xs text-slate-600 mt-1">
                    <strong>Tindak lanjut:</strong> {event.next_action}
                  </p>
                )}
                <small>
                  {event.source} · {event.time}
                </small>
              </li>
            ))}
        </ol>
      </section>

      <DocumentPreviewModal
        doc={previewDoc}
        applicantName={snapshot?.formData.nama_lengkap || record.applicant_name}
        applicantNik={snapshot?.formData.nik || record.applicant_nik}
        applicantNoKk={snapshot?.formData.no_kk}
        applicantAddress={snapshot?.formData.alamat}
        onClose={() => setPreviewDoc(null)}
        onOfficerMarkUnavailable={
          previewDoc && isCurrentlyReviewing && !readOnly
            ? () => {
                if (previewDoc.id) {
                  setItemVerdict(previewDoc.id, "belum_dapat_diperiksa");
                }
                setTargetItem(previewDoc.name);
                setIssueCategory("sulit_dibaca");
                setProblemDescription(
                  `Berkas "${previewDoc.fileName}" tidak tersedia / tidak dapat dibuka pada pratinjau petugas.`,
                );
                setRequiredAction(
                  `Unggah ulang berkas ${previewDoc.name} dalam format PDF/JPG/PNG yang utuh pada tahap Dokumen, lalu kirim perbaikan.`,
                );
                setActionTab("revision");
                setPreviewDoc(null);
              }
            : undefined
        }
      />
    </section>
  );
}
