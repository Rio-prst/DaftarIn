import type {
  ServiceDetail,
  DocumentItem,
  InspectionFinding,
  FormData,
  AdminRule,
  ApplicationRecord,
} from "../context/AppContext";
import { isDocumentContentAvailable } from "../components/DocumentPreviewModal";

export type ApplicantTarget = "diri_sendiri" | "anggota_keluarga";

export type InspectionScope =
  | "format_formulir"
  | "keberadaan_berkas"
  | "analisis_isi_dokumen"
  | "aturan_admin";

export type EvaluationStatus =
  | "evaluated_passed"
  | "evaluated_issue"
  | "simulated_fixture"
  | "not_evaluated";

export interface InspectionSnapshot {
  runId: string;
  preparationId: string;
  inspectedAt: string;
  dataVersion: number;
  dataSignature: string;
  conditionKey: string;
  applicantTarget: ApplicantTarget;
  docSignature: string;
  guideSignature: string;
  rulesSignature: string;
  evaluatedScopes: InspectionScope[];
  legacyUnverifiedSnapshot?: boolean;
}

export interface PreparationRecord {
  id: string;
  internalReference: string;
  ownerId: string;
  serviceId: number;
  serviceName: string;
  region: string;
  agency: string;
  applicantTarget: ApplicantTarget;
  conditionKey: string;
  needConfirmed: boolean;
  formData: FormData;
  documents: DocumentItem[];
  consentAccepted: boolean;
  inspections: InspectionFinding[];
  dataVersion: number;
  lastInspectionSnapshot: InspectionSnapshot | null;
  linkedApplicationId?: string;
  migrationNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestPreparationIntent {
  serviceId: number;
  region: string;
  conditionKey: string;
  applicantTarget?: ApplicantTarget;
  savedAt: string;
}

export interface ServiceConditionOption {
  value: string;
  label: string;
  description: string;
  requiredDocIndices: number[];
}

export interface ServiceConditionConfig {
  serviceId: number;
  question: string;
  hint: string;
  options: ServiceConditionOption[];
}

export const SERVICE_CONDITIONS: Record<number, ServiceConditionConfig> = {
  1: {
    serviceId: 1,
    question: "Apa alasan utama pembaruan Kartu Keluarga?",
    hint: "Kondisi pengurusan menentukan dokumen pendukung yang wajib disiapkan.",
    options: [
      {
        value: "perubahan_biodata_keluarga",
        label: "Pembaruan elemen data / susunan keluarga umum",
        description:
          "Perubahan data anggota keluarga (pendidikan, pekerjaan, golongan darah) atau penggantian KK lama.",
        requiredDocIndices: [0, 1],
      },
      {
        value: "perubahan_status_kawin",
        label: "Perubahan status perkawinan",
        description:
          "Pencatatan status kawin atau cerai pada Kartu Keluarga.",
        requiredDocIndices: [0, 1, 2],
      },
      {
        value: "penambahan_kelahiran",
        label: "Penambahan anggota keluarga (kelahiran / mutasi)",
        description:
          "Menambahkan anggota keluarga baru karena kelahiran atau peristiwa kependudukan.",
        requiredDocIndices: [0, 1, 2, 3],
      },
      {
        value: "pengurangan_anggota",
        label: "Pengurangan anggota keluarga (kematian / pindah)",
        description:
          "Memperbarui KK karena anggota keluarga meninggal dunia atau pindah domisili.",
        requiredDocIndices: [0, 1, 3],
      },
    ],
  },
  2: {
    serviceId: 2,
    question: "Apa keperluan pengurusan KTP-el ini?",
    hint: "Pilih kondisi yang sesuai dengan permohonan KTP-el Anda.",
    options: [
      {
        value: "ktp_rusak_ubah",
        label: "KTP-el rusak atau perubahan data",
        description:
          "Fisik KTP-el rusak/buram atau ada perubahan elemen data di KK.",
        requiredDocIndices: [0, 1],
      },
      {
        value: "ktp_pemula_foto",
        label: "Perekaman baru / pembaruan pas foto",
        description: "Warga berusia 17 tahun atau pembaruan foto identitas.",
        requiredDocIndices: [0, 2],
      },
      {
        value: "ktp_hilang",
        label: "Penggantian KTP-el hilang",
        description:
          "KTP-el hilang dan memerlukan surat keterangan kehilangan.",
        requiredDocIndices: [0, 1],
      },
    ],
  },
  3: {
    serviceId: 3,
    question: "Bagaimana kondisi bukti kelahiran dan perkawinan orang tua?",
    hint: "Menentukan jenis surat keterangan lahir dan dokumen orang tua.",
    options: [
      {
        value: "lahir_faskes_tercatat",
        label: "Lahir di faskes/bidan & perkawinan orang tua tercatat",
        description:
          "Memiliki surat keterangan lahir dari RS/Puskesmas/Bidan dan Buku Nikah/Akta Perkawinan.",
        requiredDocIndices: [0, 1, 2, 3],
      },
      {
        value: "lahir_umum",
        label: "Perkawinan belum tercatat (menggunakan SPTJM)",
        description:
          "Menggunakan surat keterangan lahir serta dokumen identitas orang tua dan saksi.",
        requiredDocIndices: [0, 2, 3],
      },
    ],
  },
  4: {
    serviceId: 4,
    question: "Bagaimana cakupan perpindahan domisili?",
    hint: "Perpindahan penduduk memerlukan KK, KTP-el, dan rincian alamat tujuan.",
    options: [
      {
        value: "pindah_kota_provinsi",
        label: "Pindah antar kecamatan / kota / provinsi",
        description: "Memerlukan penerbitan SKPWNI dari Disdukcapil asal.",
        requiredDocIndices: [0, 1, 2],
      },
      {
        value: "pindah_dalam_kelurahan",
        label: "Pindah alamat dalam satu kelurahan/kecamatan",
        description:
          "Pembaruan alamat domisili beserta KK dan KTP-el pemohon.",
        requiredDocIndices: [0, 1, 2],
      },
    ],
  },
  5: {
    serviceId: 5,
    question: "Berapa usia anak yang dibuatkan KIA?",
    hint: "Anak usia 5 tahun ke atas memerlukan pas foto.",
    options: [
      {
        value: "kia_di_bawah_5",
        label: "Usia 0 sampai kurang dari 5 tahun",
        description:
          "KIA tanpa pas foto, cukup akta kelahiran, KK, dan KTP-el orang tua.",
        requiredDocIndices: [0, 1, 2],
      },
      {
        value: "kia_5_ke_atas",
        label: "Usia 5 tahun sampai kurang dari 17 tahun",
        description: "KIA menggunakan pas foto anak ukuran 2x3.",
        requiredDocIndices: [0, 1, 2, 3],
      },
    ],
  },
  6: {
    serviceId: 6,
    question: "Dari mana surat keterangan kematian diterbitkan?",
    hint: "Seluruh pelaporan akta kematian memerlukan surat keterangan kematian dan identitas.",
    options: [
      {
        value: "kematian_rs_kelurahan",
        label: "Rumah sakit / dokter / kelurahan",
        description:
          "Memiliki surat keterangan kematian, KTP/KK jenazah, serta KTP pelapor dan saksi.",
        requiredDocIndices: [0, 1, 2],
      },
    ],
  },
};

export interface DocumentSlotItem {
  id: string;
  name: string;
  required: boolean;
  conditionNote?: string;
}

export function getServiceConditionConfig(
  service: ServiceDetail,
): ServiceConditionConfig {
  return (
    SERVICE_CONDITIONS[service.id] || {
      serviceId: service.id,
      question: "Kondisi pengurusan",
      hint: "Pilih kondisi yang sesuai dengan permohonan Anda.",
      options: [
        {
          value: "standar",
          label: "Permohonan standar",
          description: "Mengikuti seluruh persyaratan dasar layanan.",
          requiredDocIndices: service.requirements.map((_, idx) => idx),
        },
      ],
    }
  );
}

export function getSelectedConditionOption(
  service: ServiceDetail,
  conditionValue?: string,
): ServiceConditionOption {
  const config = getServiceConditionConfig(service);
  return (
    config.options.find((opt) => opt.value === conditionValue) ||
    config.options[0]
  );
}

export const documentSlots = (
  service: ServiceDetail,
  conditionValue?: string,
): DocumentSlotItem[] => {
  const option = getSelectedConditionOption(service, conditionValue);
  return service.requirements.map((name, index) => {
    const isRequired = option.requiredDocIndices.includes(index);
    return {
      id: "service-" + service.id + "-doc-" + index,
      name,
      required: isRequired,
      conditionNote: isRequired
        ? "Wajib untuk kondisi ini"
        : "Tambahan bila relevan",
    };
  });
};

export type OfficerIssueCategory =
  | "berkas_tidak_lengkap"
  | "sulit_dibaca"
  | "data_tidak_sesuai"
  | "perlu_klarifikasi";

export const OFFICER_ISSUE_CATEGORY_LABELS: Record<
  OfficerIssueCategory,
  string
> = {
  berkas_tidak_lengkap: "Berkas tidak lengkap",
  sulit_dibaca: "Berkas sulit dibaca / bagian terpotong",
  data_tidak_sesuai: "Data isian tidak sesuai dokumen",
  perlu_klarifikasi: "Perlu klarifikasi tambahan",
};

export interface OfficerRevisionDetail {
  targetItem: string;
  issueCategory: OfficerIssueCategory;
  issueCategoryLabel: string;
  problemDescription: string;
  requiredAction: string;
  requestedBy: string;
  officerName?: string;
  requestedAt: string;
}

export interface SubmittedAttachment {
  id?: string;
  name: string;
  fileName: string;
  size: string;
  fileType: "image" | "pdf";
  version?: number;
  uploadedAt?: string;
  qualityPreset?: "sample_issue" | "sample_clean" | "user_file";
  fixtureId?: string;
  previewKey?: string;
}

export type OfficerItemVerdict =
  | "sesuai"
  | "perlu_perbaikan"
  | "belum_dapat_diperiksa";

export const OFFICER_ITEM_VERDICT_LABELS: Record<
  OfficerItemVerdict,
  string
> = {
  sesuai: "Sesuai",
  perlu_perbaikan: "Perlu perbaikan",
  belum_dapat_diperiksa: "Belum dapat diperiksa",
};

export interface OfficerItemAssessment {
  itemId: string;
  itemName: string;
  itemType: "form_data" | "document";
  fileVersion?: number;
  fileName?: string;
  verdict: OfficerItemVerdict;
  note?: string;
}

export interface OfficerSubmissionEvaluation {
  submissionVersion: number;
  decision: "SELESAI" | "PERLU_PERBAIKAN";
  summaryNote: string;
  evaluatedBy: string;
  evaluatedAt: string;
  itemAssessments: OfficerItemAssessment[];
  revisionDetail?: OfficerRevisionDetail;
}

export interface SubmissionSnapshot {
  submissionVersion: number;
  submittedAt: string;
  applicantTarget: ApplicantTarget;
  conditionKey: string;
  conditionLabel: string;
  formData: FormData;
  dataSignature: string;
  docSignature: string;
  attachments: SubmittedAttachment[];
  citizenNote?: string;
  changesSummary?: string[];
}

export type OfficialSubmissionStatus =
  | "DIAJUKAN_WARGA"
  | "HASIL_DITERIMA_WARGA";

export interface OfficialSubmissionRecord {
  status?: OfficialSubmissionStatus;
  recordedAt: string;
  channel: string;
  officialNumber: string;
  officialReceiptNumber?: string;
  officialNumberSource: "citizen_reported" | "not_provided";
  sourceLabel?: string;
  note?: string;
  resultReceivedAt?: string;
  resultNote?: string;
}

export type PreparationReadinessState =
  | "BELUM_DIPERIKSA"
  | "PERLU_PERIKSA_ULANG"
  | "PERLU_DILENGKAPI"
  | "PERLU_DITINJAU"
  | "SIAP_AWAL";

export const readinessLabels: Record<PreparationReadinessState, string> = {
  BELUM_DIPERIKSA: "Validasi dasar lengkap · Siap ditinjau & dikirim",
  PERLU_PERIKSA_ULANG: "Ada perubahan draf belum dikirim",
  PERLU_DILENGKAPI: "Validasi dasar belum lengkap",
  PERLU_DITINJAU: "Validasi dasar lengkap · Siap dikirim ke petugas",
  SIAP_AWAL: "Validasi dasar lengkap · Siap dikirim ke petugas",
};

export function computeDataSignature(
  conditionValue: string,
  applicantTarget: ApplicantTarget,
  formData: FormData,
): string {
  return [
    conditionValue || "",
    applicantTarget || "diri_sendiri",
    formData.nama_lengkap.trim(),
    formData.nik.trim(),
    formData.no_kk.trim(),
    formData.alamat.trim(),
    formData.alasan.trim(),
  ].join("|");
}

export function computeDocSignature(
  service: ServiceDetail,
  documents: DocumentItem[],
  conditionValue?: string,
): string {
  const slots = documentSlots(service, conditionValue);
  return slots
    .map((slot) => {
      const doc = documents.find(
        (item) => item.id === slot.id && item.status === "TERUNGGAH",
      );
      if (!doc) return `${slot.id}:missing:${slot.required ? "req" : "opt"}`;
      return `${slot.id}:v${doc.version || 1}:${doc.fileName}:${doc.qualityPreset || "user_file"}:${doc.previewKey || doc.fixtureId || ""}`;
    })
    .join("|");
}

export function computeGuideSignature(service: ServiceDetail): string {
  return `${service.id}:v${service.version || 1}:${service.requirements.join(";")}`;
}

export function computeRulesSignature(
  service: ServiceDetail,
  adminRules: AdminRule[],
): string {
  return adminRules
    .filter(
      (r) =>
        r.active &&
        (r.service === "Semua layanan" || r.service === service.name),
    )
    .map((r) => `${r.id}:${r.version}:${r.category}:${r.severity}:${r.rule}`)
    .sort()
    .join("|");
}

export function getRequiredInspectionScopes(
  service: ServiceDetail,
  adminRules: AdminRule[],
): InspectionScope[] {
  const activeRules = adminRules.filter(
    (r) =>
      r.active &&
      (r.service === "Semua layanan" || r.service === service.name),
  );
  const scopes: InspectionScope[] = [];
  if (activeRules.some((r) => r.category === "Kelengkapan")) {
    scopes.push("keberadaan_berkas");
  }
  if (activeRules.some((r) => r.category === "Kualitas Berkas")) {
    scopes.push("analisis_isi_dokumen");
  }
  if (activeRules.some((r) => r.category === "Konsistensi Data")) {
    scopes.push("format_formulir");
  }
  if (
    activeRules.some(
      (r) => !["rule-required", "rule-image", "rule-name"].includes(r.id),
    )
  ) {
    scopes.push("aturan_admin");
  }
  return scopes;
}

export interface StepCompletionStatus {
  step1Kebutuhan: boolean;
  step2Data: boolean;
  step3Dokumen: boolean;
  step4Pemeriksaan: boolean;
  step5Ringkasan: boolean;
  basicValidationPassed: boolean;
  hasUnsentDraftChanges: boolean;
  resumePath: string;
  resumeLabel: string;
}

/**
 * Menghitung kesiapan draf berdasarkan VALIDASI DASAR APLIKASI
 * (format isian, kolom wajib, keberadaan berkas wajib).
 *
 * Catatan arsitektur:
 * - AI/OCR ditunda sebagai pengembangan berikutnya dan TIDAK menghalangi pengiriman ke petugas.
 * - Lolos validasi dasar hanya menyatakan format isian & keberadaan berkas wajib lengkap,
 *   BUKAN menyatakan isi dokumen sudah sesuai.
 */
export function computePreparationReadiness(params: {
  prepId: string;
  service: ServiceDetail;
  conditionValue?: string;
  applicantTarget?: ApplicantTarget;
  needConfirmed?: boolean;
  consentAccepted?: boolean;
  formData: FormData;
  documents: DocumentItem[];
  inspections: InspectionFinding[];
  lastInspectionSnapshot: InspectionSnapshot | null;
  adminRules: AdminRule[];
  linkedApplicationId?: string;
  lastSubmittedDataSignature?: string | null;
  lastSubmittedDocSignature?: string | null;
}): {
  state: PreparationReadinessState;
  label: string;
  isStale: boolean;
  staleReason: string | null;
  missingRequiredDocs: DocumentSlotItem[];
  unavailableRequiredDocs: DocumentSlotItem[];
  unresolvedErrors: InspectionFinding[];
  unresolvedWarnings: InspectionFinding[];
  notEvaluatedFindings: InspectionFinding[];
  missingScopes: InspectionScope[];
  hasSimulatedFixtures: boolean;
  basicValidationPassed: boolean;
  hasUnsentDraftChanges: boolean;
  steps: StepCompletionStatus;
} {
  const {
    prepId,
    service,
    conditionValue,
    applicantTarget = "diri_sendiri",
    needConfirmed = false,
    consentAccepted = false,
    formData,
    documents,
    inspections,
    lastInspectionSnapshot,
    adminRules,
    linkedApplicationId,
    lastSubmittedDataSignature,
    lastSubmittedDocSignature,
  } = params;

  const query = prepId ? `?prep=${encodeURIComponent(prepId)}` : "";
  const slots = documentSlots(service, conditionValue);
  const missingRequiredDocs = slots.filter(
    (slot) =>
      slot.required &&
      !documents.some(
        (doc) => doc.id === slot.id && doc.status === "TERUNGGAH",
      ),
  );
  const unavailableRequiredDocs = slots.filter((slot) => {
    if (!slot.required) return false;
    const doc = documents.find(
      (item) => item.id === slot.id && item.status === "TERUNGGAH",
    );
    if (!doc) return false;
    return !isDocumentContentAvailable(doc);
  });

  const currentDataSig = computeDataSignature(
    conditionValue || getSelectedConditionOption(service).value,
    applicantTarget,
    formData,
  );
  const currentDocSig = computeDocSignature(service, documents, conditionValue);

  const hasUnsentDraftChanges = Boolean(
    linkedApplicationId &&
      ((lastSubmittedDataSignature &&
        lastSubmittedDataSignature !== currentDataSig) ||
        (lastSubmittedDocSignature &&
          lastSubmittedDocSignature !== currentDocSig)),
  );

  const hasEverInspected = Boolean(lastInspectionSnapshot);
  const isLegacyUnverified = Boolean(
    lastInspectionSnapshot?.legacyUnverifiedSnapshot,
  );

  const dataChanged =
    hasEverInspected &&
    lastInspectionSnapshot!.dataSignature !== currentDataSig;
  const docChanged =
    hasEverInspected &&
    lastInspectionSnapshot!.docSignature !== currentDocSig;

  const isStale = Boolean(
    hasUnsentDraftChanges ||
      (hasEverInspected && (isLegacyUnverified || dataChanged || docChanged)),
  );

  const staleReason = hasUnsentDraftChanges
    ? "Ada perubahan pada data atau berkas draf yang belum dikirim sebagai revisi ke petugas."
    : isStale
      ? "Data atau berkas pada draf berubah sejak pengecekan terakhir."
      : null;

  const requiredScopes = getRequiredInspectionScopes(service, adminRules);
  const evaluatedScopes = lastInspectionSnapshot?.evaluatedScopes || [];
  const missingScopes = hasEverInspected
    ? requiredScopes.filter((scope) => !evaluatedScopes.includes(scope))
    : requiredScopes;

  const notEvaluatedFindings = inspections.filter(
    (f) => f.evaluationStatus === "not_evaluated",
  );
  const unresolvedErrors = inspections.filter(
    (f) => !f.resolved && f.severity === "error",
  );
  const unresolvedWarnings = inspections.filter(
    (f) =>
      (!f.resolved && f.severity === "warning") ||
      f.evaluationStatus === "not_evaluated",
  );

  const hasSimulatedFixtures = documents.some(
    (d) =>
      d.status === "TERUNGGAH" &&
      (d.qualityPreset === "sample_issue" || d.qualityPreset === "sample_clean"),
  );

  // 4 Langkah Persiapan Sebelum Pengiriman:
  // 1. Kebutuhan: dikonfirmasi oleh warga
  const step1Kebutuhan = Boolean(needConfirmed && conditionValue);

  // 2. Data: Tahap 1 selesai + format dasar isian wajib terpenuhi
  const step2Data =
    step1Kebutuhan &&
    formData.nama_lengkap.trim().length >= 3 &&
    /^\d{16}$/.test(formData.nik.trim()) &&
    /^\d{16}$/.test(formData.no_kk.trim()) &&
    formData.alamat.trim().length >= 5 &&
    formData.alasan.trim().length >= 5;

  // 3. Dokumen: Tahap 2 selesai + seluruh berkas wajib telah dipilih/diunggah dan isinya tersedia
  const step3Dokumen =
    step2Data &&
    missingRequiredDocs.length === 0 &&
    unavailableRequiredDocs.length === 0;

  // Validasi dasar aplikasi (tanpa ketergantungan AI/OCR)
  const basicValidationPassed =
    step1Kebutuhan && step2Data && step3Dokumen;

  // 4. Tinjau & kirim: Validasi dasar lolos + persetujuan pembagian dicentang + sudah dikirim ke petugas
  const step4Pemeriksaan =
    basicValidationPassed && consentAccepted && Boolean(linkedApplicationId);
  const step5Ringkasan = step4Pemeriksaan;

  let resumePath = `/persiapan/kebutuhan${query}`;
  let resumeLabel = "Tentukan kebutuhan";

  if (!step1Kebutuhan) {
    resumePath = `/persiapan/kebutuhan${query}`;
    resumeLabel = "Konfirmasi kebutuhan";
  } else if (!step2Data) {
    resumePath = `/persiapan/data${query}`;
    resumeLabel = "Lengkapi data pemohon";
  } else if (!step3Dokumen) {
    resumePath = `/persiapan/dokumen${query}`;
    resumeLabel =
      unavailableRequiredDocs.length > 0
        ? "Pilih ulang berkas yang tidak tersedia"
        : "Unggah dokumen wajib";
  } else {
    resumePath = `/persiapan/ringkasan${query}`;
    resumeLabel = linkedApplicationId
      ? hasUnsentDraftChanges
        ? "Tinjau & kirim perubahan"
        : "Lihat ringkasan & kiriman"
      : "Tinjau & kirim ke petugas";
  }

  const steps: StepCompletionStatus = {
    step1Kebutuhan,
    step2Data,
    step3Dokumen,
    step4Pemeriksaan,
    step5Ringkasan,
    basicValidationPassed,
    hasUnsentDraftChanges,
    resumePath,
    resumeLabel,
  };

  if (!basicValidationPassed) {
    return {
      state: "PERLU_DILENGKAPI",
      label: readinessLabels.PERLU_DILENGKAPI,
      isStale: false,
      staleReason: null,
      missingRequiredDocs,
      unavailableRequiredDocs,
      unresolvedErrors,
      unresolvedWarnings,
      notEvaluatedFindings,
      missingScopes,
      hasSimulatedFixtures,
      basicValidationPassed,
      hasUnsentDraftChanges,
      steps,
    };
  }

  if (hasUnsentDraftChanges) {
    return {
      state: "PERLU_PERIKSA_ULANG",
      label: readinessLabels.PERLU_PERIKSA_ULANG,
      isStale: true,
      staleReason,
      missingRequiredDocs,
      unavailableRequiredDocs,
      unresolvedErrors,
      unresolvedWarnings,
      notEvaluatedFindings,
      missingScopes,
      hasSimulatedFixtures,
      basicValidationPassed,
      hasUnsentDraftChanges,
      steps,
    };
  }

  if (!consentAccepted) {
    return {
      state: "BELUM_DIPERIKSA",
      label: readinessLabels.BELUM_DIPERIKSA,
      isStale: false,
      staleReason: null,
      missingRequiredDocs,
      unavailableRequiredDocs,
      unresolvedErrors,
      unresolvedWarnings,
      notEvaluatedFindings,
      missingScopes,
      hasSimulatedFixtures,
      basicValidationPassed,
      hasUnsentDraftChanges,
      steps,
    };
  }

  return {
    state: "SIAP_AWAL",
    label: linkedApplicationId
      ? "Validasi dasar lengkap · Sudah dikirim ke petugas"
      : readinessLabels.SIAP_AWAL,
    isStale: false,
    staleReason: null,
    missingRequiredDocs,
    unavailableRequiredDocs,
    unresolvedErrors,
    unresolvedWarnings,
    notEvaluatedFindings,
    missingScopes,
    hasSimulatedFixtures,
    basicValidationPassed,
    hasUnsentDraftChanges,
    steps,
  };
}

export type ApplicationPreparationLinkResolution =
  | {
      status: "valid";
      application: ApplicationRecord;
      preparation: PreparationRecord;
    }
  | {
      status: "application_not_found";
      message: string;
    }
  | {
      status: "unlinked_application";
      application: ApplicationRecord;
      message: string;
    }
  | {
      status: "mismatch";
      application: ApplicationRecord;
      requestedPreparation: PreparationRecord;
      expectedPreparation: PreparationRecord;
      message: string;
    };

/**
 * Validasi terpusat untuk memastikan hubungan 1-ke-1 yang sah antara
 * pengajuan (`ApplicationRecord`) dan persiapan asal (`PreparationRecord`).
 * Menolak pencocokan berdasarkan `service_id` semata dan menolak kombinasi
 * `?prep=` & `?application=` yang tidak sesuai.
 */
export function resolveApplicationPreparationLink(params: {
  applicationId: string;
  requestedPrepId?: string | null;
  applications: ApplicationRecord[];
  preparations: PreparationRecord[];
  currentUserId: string;
}): ApplicationPreparationLinkResolution {
  const {
    applicationId,
    requestedPrepId,
    applications,
    preparations,
    currentUserId,
  } = params;

  const validPreps = preparations.filter(
    (p) => p.id !== "prep-draft-uninitialized" && p.ownerId === currentUserId,
  );
  const app = applications.find(
    (a) => a.id === applicationId && a.owner_id === currentUserId,
  );

  if (!app) {
    return {
      status: "application_not_found",
      message:
        "Pengajuan yang diminta tidak ditemukan atau bukan milik akun ini.",
    };
  }

  // Cari persiapan yang memiliki ikatan eksplisit (bukan berdasarkan kesamaan serviceId)
  let expectedPrep: PreparationRecord | undefined;
  if (app.preparation_id) {
    expectedPrep = validPreps.find((p) => p.id === app.preparation_id);
  }
  if (!expectedPrep) {
    const byBacklink = validPreps.filter(
      (p) => p.linkedApplicationId === app.id,
    );
    if (byBacklink.length === 1) {
      expectedPrep = byBacklink[0];
    }
  }

  if (!expectedPrep || expectedPrep.serviceId !== app.service_id) {
    return {
      status: "unlinked_application",
      application: app,
      message: `Pengajuan ${app.official_number} belum memiliki ikatan ID persiapan asal yang dapat dibuktikan pada akun ini. Sistem tidak memilih draf secara otomatis berdasarkan kesamaan layanan.`,
    };
  }

  if (requestedPrepId) {
    const reqPrep = validPreps.find((p) => p.id === requestedPrepId);
    if (reqPrep && reqPrep.id !== expectedPrep.id) {
      return {
        status: "mismatch",
        application: app,
        requestedPreparation: reqPrep,
        expectedPreparation: expectedPrep,
        message: `Persiapan ${reqPrep.internalReference} (${reqPrep.formData.nama_lengkap || "Tanpa nama"}) tidak terhubung dengan pengajuan ${app.official_number}. Pengajuan tersebut berasal dari persiapan ${expectedPrep.internalReference} (${expectedPrep.formData.nama_lengkap || "Tanpa nama"}).`,
      };
    }
  }

  return {
    status: "valid",
    application: app,
    preparation: expectedPrep,
  };
}

/**
 * Adapter pemeriksaan draf (terpisah dari kontrak API backend).
 * Memisahkan secara jujur:
 * 1. Pemeriksaan format & kelengkapan isian formulir (`format_formulir`)
 * 2. Pemeriksaan keberadaan berkas wajib (`keberadaan_berkas`)
 * 3. Analisis isi berkas (`analisis_isi_dokumen`) — membedakan fixture simulasi eksplisit vs berkas pengguna yang belum dianalisis OCR/AI
 * 4. Aturan tambahan admin (`aturan_admin`) — mencatat aturan tanpa evaluator otomatis sebagai `not_evaluated`
 */
export function evaluatePreparationDraft(input: {
  preparationId: string;
  service: ServiceDetail;
  conditionKey: string;
  applicantTarget: ApplicantTarget;
  formData: FormData;
  documents: DocumentItem[];
  adminRules: AdminRule[];
  dataVersion: number;
}): {
  findings: InspectionFinding[];
  evaluatedScopes: InspectionScope[];
} {
  const {
    service,
    conditionKey,
    formData,
    documents,
    adminRules,
    dataVersion,
  } = input;

  const slots = documentSlots(service, conditionKey);
  const activeRules = adminRules.filter(
    (r) =>
      r.active &&
      (r.service === "Semua layanan" || r.service === service.name),
  );
  const hasCompletenessRule = activeRules.some(
    (r) => r.category === "Kelengkapan",
  );
  const hasQualityRule = activeRules.some(
    (r) => r.category === "Kualitas Berkas",
  );
  const hasConsistencyRule = activeRules.some(
    (r) => r.category === "Konsistensi Data",
  );

  const findings: InspectionFinding[] = [];
  const evaluatedScopes: InspectionScope[] = [];

  // 1. Keberadaan berkas wajib
  if (hasCompletenessRule) {
    evaluatedScopes.push("keberadaan_berkas");
    slots.forEach((slot) => {
      if (!slot.required) return;
      const uploadedDoc = documents.find(
        (d) => d.id === slot.id && d.status === "TERUNGGAH",
      );
      if (!uploadedDoc) {
        findings.push({
          id: `missing-${slot.id}-dv${dataVersion}`,
          serviceId: service.id,
          scope: "keberadaan_berkas",
          evaluationStatus: "evaluated_issue",
          category: "Kelengkapan",
          title: `Dokumen wajib belum dipilih: ${slot.name}`,
          evidence: `Slot "${slot.name}" wajib untuk kondisi "${getSelectedConditionOption(service, conditionKey).label}", namun belum ada berkas pada draf ini.`,
          rule: "Keberadaan dokumen wajib sesuai kondisi permohonan",
          action: `Unggah atau pilih berkas untuk "${slot.name}" pada tahap Dokumen.`,
          severity: "error",
          resolved: false,
          docTarget: slot.id,
          documentVersion: 0,
          dataVersion,
          ruleVersion: `v${service.version || 1}`,
        });
      }
    });
  }

  // 2. Analisis keterbacaan & isi berkas (hanya berdasarkan metadata preset simulasi eksplisit, bukan nama file atau nomor versi)
  if (hasQualityRule) {
    const requiredUploadedDocs = slots
      .map((slot) =>
        documents.find((d) => d.id === slot.id && d.status === "TERUNGGAH"),
      )
      .filter((d): d is DocumentItem => Boolean(d));

    const allUploadedAreFixtures =
      requiredUploadedDocs.length > 0 &&
      requiredUploadedDocs.every(
        (d) =>
          d.qualityPreset === "sample_issue" ||
          d.qualityPreset === "sample_clean",
      );

    if (allUploadedAreFixtures) {
      evaluatedScopes.push("analisis_isi_dokumen");
    }

    slots.forEach((slot) => {
      const uploadedDoc = documents.find(
        (d) => d.id === slot.id && d.status === "TERUNGGAH",
      );
      if (!uploadedDoc) return;
      const docVer = uploadedDoc.version || 1;

      if (uploadedDoc.qualityPreset === "sample_issue") {
        findings.push({
          id: `sim-crop-${slot.id}-v${docVer}-dv${dataVersion}`,
          serviceId: service.id,
          scope: "analisis_isi_dokumen",
          evaluationStatus: "simulated_fixture",
          category: "Kualitas Berkas",
          title: `[Simulasi Fixture] Bagian bawah ${slot.name} terpotong`,
          evidence: `Berkas "${uploadedDoc.fileName}" (Versi ${docVer}) menggunakan fixture simulasi dengan area tanda tangan/QR bagian bawah terpotong.`,
          rule: "Simulasi keterbacaan empat sudut dokumen (fixture contoh)",
          action:
            "Ganti dengan fixture simulasi utuh atau pilih berkas lain, lalu jalankan pemeriksaan ulang.",
          severity: "error",
          resolved: false,
          docTarget: slot.id,
          documentVersion: docVer,
          dataVersion,
          ruleVersion: `v${service.version || 1}`,
        });
      } else if (uploadedDoc.qualityPreset === "sample_clean") {
        findings.push({
          id: `sim-clean-${slot.id}-v${docVer}-dv${dataVersion}`,
          serviceId: service.id,
          scope: "analisis_isi_dokumen",
          evaluationStatus: "simulated_fixture",
          category: "Kualitas Berkas",
          title: `[Simulasi Fixture] ${slot.name} menggunakan fixture contoh utuh`,
          evidence: `Berkas "${uploadedDoc.fileName}" (Versi ${docVer}) menggunakan fixture simulasi yang ditandai utuh untuk pengujian alur.`,
          rule: "Simulasi keterbacaan empat sudut dokumen (fixture contoh)",
          action: "Tidak diperlukan tindakan tambahan pada mode simulasi.",
          severity: "info",
          resolved: true,
          resolvedReason: `Fixture simulasi utuh (Dokumen v${docVer})`,
          docTarget: slot.id,
          documentVersion: docVer,
          dataVersion,
          ruleVersion: `v${service.version || 1}`,
        });
      } else {
        // Berkas nyata yang dipilih pengguna dari perangkat: OCR/LLM belum tersedia di backend
        findings.push({
          id: `unverified-file-${slot.id}-v${docVer}-dv${dataVersion}`,
          serviceId: service.id,
          scope: "analisis_isi_dokumen",
          evaluationStatus: "not_evaluated",
          category: "Kualitas Berkas",
          title: `Analisis isi berkas "${slot.name}" belum tersedia (OCR/LLM belum terhubung)`,
          evidence: `Berkas "${uploadedDoc.fileName}" (Versi ${docVer}) telah tercatat pada draf, namun layanan pembacaan isi dokumen otomatis (OCR/LLM) belum terhubung. Nama berkas, nomor versi baru, maupun catatan konfirmasi mandiri warga tidak menggantikan analisis otomatis sistem.`,
          rule: "Analisis otomatis keterbacaan dan isi dokumen (menunggu integrasi OCR/LLM backend)",
          action:
            "Kamu dapat mencatat keterangan pemeriksaan mandiri sebagai catatan warga, atau menggunakan tombol [Simulasi] Fixture pada tahap Dokumen untuk memperagakan alur lulus pemeriksaan.",
          severity: "warning",
          resolved: false,
          docTarget: slot.id,
          documentVersion: docVer,
          dataVersion,
          ruleVersion: `v${service.version || 1}`,
        });
      }
    });
  }

  // 3. Pemeriksaan format & kelengkapan isian formulir
  if (hasConsistencyRule) {
    evaluatedScopes.push("format_formulir");
    const firstDoc =
      documents.find(
        (d) =>
          d.id.startsWith(`service-${service.id}-doc-`) &&
          d.status === "TERUNGGAH",
      ) || documents[0];
    const targetDocId = firstDoc?.id || `service-${service.id}-doc-0`;
    const targetDocVer = firstDoc?.version || 1;

    if (
      formData.nama_lengkap.trim().length < 3 ||
      !/^\d{16}$/.test(formData.nik.trim()) ||
      !/^\d{16}$/.test(formData.no_kk.trim())
    ) {
      findings.push({
        id: `form-identity-invalid-dv${dataVersion}`,
        serviceId: service.id,
        scope: "format_formulir",
        evaluationStatus: "evaluated_issue",
        category: "Konsistensi Data",
        title: "Format Nama, NIK (16 angka), atau Nomor KK (16 angka) belum sesuai",
        evidence: `Nama: "${formData.nama_lengkap.trim() || "kosong"}", NIK: ${formData.nik.trim().length}/16 angka, Nomor KK: ${formData.no_kk.trim().length}/16 angka.`,
        rule: "Validasi format 16 angka NIK, 16 angka Nomor KK, dan nama pemohon pada formulir",
        action: "Perbaiki Nama Lengkap, NIK, dan Nomor KK pada tahap Data.",
        severity: "error",
        resolved: false,
        docTarget: targetDocId,
        documentVersion: targetDocVer,
        dataVersion,
        ruleVersion: `v${service.version || 1}`,
      });
    } else if (
      formData.alamat.trim().length < 10 ||
      formData.alasan.trim().length < 10
    ) {
      findings.push({
        id: `form-detail-short-dv${dataVersion}`,
        serviceId: service.id,
        scope: "format_formulir",
        evaluationStatus: "evaluated_issue",
        category: "Konsistensi Data",
        title: "Alamat domisili atau rincian alasan permohonan masih singkat",
        evidence: `Panjang alamat (${formData.alamat.trim().length} karakter) atau alasan (${formData.alasan.trim().length} karakter) kurang dari 10 karakter.`,
        rule: "Kelengkapan rincian alamat dan alasan permohonan pada formulir",
        action:
          "Lengkapi rincian alamat atau alasan pada tahap Data, atau catat konfirmasi bila alamat singkat tersebut memang sesuai KK.",
        severity: "warning",
        resolved: false,
        docTarget: targetDocId,
        documentVersion: targetDocVer,
        dataVersion,
        ruleVersion: `v${service.version || 1}`,
      });
    } else {
      findings.push({
        id: `form-format-ok-dv${dataVersion}`,
        serviceId: service.id,
        scope: "format_formulir",
        evaluationStatus: "evaluated_passed",
        category: "Konsistensi Data",
        title: "Format isian formulir (Nama, 16 angka NIK, 16 angka Nomor KK, alamat, alasan) terpenuhi",
        evidence: `Pemeriksaan format formulir pada Data v${dataVersion} memenuhi syarat panjang dan format digit. Pencocokan teks otomatis dengan isi gambar dokumen belum dijalankan (menunggu OCR backend).`,
        rule: "Validasi format isian formulir pemohon",
        action: "Pastikan ejaan pada formulir sama persis dengan dokumen asli.",
        severity: "info",
        resolved: true,
        resolvedReason: `Format formulir valid pada Data v${dataVersion}`,
        docTarget: targetDocId,
        documentVersion: targetDocVer,
        dataVersion,
        ruleVersion: `v${service.version || 1}`,
      });
    }
  }

  // 4. Aturan tambahan admin yang belum memiliki evaluator otomatis
  activeRules
    .filter((r) => !["rule-required", "rule-image", "rule-name"].includes(r.id))
    .forEach((customRule) => {
      findings.push({
        id: `custom-rule-${customRule.id}-dv${dataVersion}`,
        serviceId: service.id,
        scope: "aturan_admin",
        evaluationStatus: "not_evaluated",
        category: "Konsistensi Data",
        title: `Aturan tambahan belum dievaluasi otomatis: ${customRule.rule}`,
        evidence: `Aturan "${customRule.rule}" (${customRule.version}, tingkat ${customRule.severity}) aktif untuk layanan ini, namun belum memiliki evaluator otomatis. Konfirmasi mandiri warga tidak menggantikan evaluasi otomatis aturan ini.`,
        rule: `${customRule.rule} (${customRule.version})`,
        action:
          "Periksa secara mandiri apakah berkasmu sudah memenuhi aturan ini dan simpan catatan konfirmasi warga bila perlu.",
        severity: "warning",
        resolved: false,
        docTarget: `service-${service.id}-doc-0`,
        documentVersion: 1,
        dataVersion,
        ruleVersion: customRule.version,
      });
    });

  return { findings, evaluatedScopes };
}
