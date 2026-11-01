import type { FamilyMember } from "../family/members";
import { useAuth } from "../auth/AuthContext";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { isDocumentContentAvailable } from "../components/DocumentPreviewModal";
import { subscribeFileStorage, deleteDraftFiles } from "../utils/fileStorage";
import { mockAuth } from "../auth/mockAuth";
import {
  servicesApi,
  preparationsApi,
  applicationsApi,
  officerApi,
} from "../api/client";
import { adminApi } from "../api/admin";
import {
  computeDataSignature,
  computeDocSignature,
  computeGuideSignature,
  computeRulesSignature,
  computePreparationReadiness,
  documentSlots,
  evaluatePreparationDraft,
  getSelectedConditionOption,
  OFFICER_ISSUE_CATEGORY_LABELS,
  OFFICER_ITEM_VERDICT_LABELS,
  resolveApplicationPreparationLink,
  type ApplicantTarget,
  type EvaluationStatus,
  type GuestPreparationIntent,
  type InspectionScope,
  type InspectionSnapshot,
  type OfficerIssueCategory,
  type OfficerItemAssessment,
  type OfficerRevisionDetail,
  type OfficerSubmissionEvaluation,
  type ServiceConditionConfig,
  type OfficialSubmissionRecord,
  type PreparationRecord,
  type SubmissionSnapshot,
  type SubmittedAttachment,
} from "../types/preparation";

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  role: "warga" | "petugas" | "admin";
  email: string;
  nik: string;
}

export interface ServiceDetail {
  availability?: "active" | "paused";
  availabilityNote?: string;
  conditions?: ServiceConditionConfig;
  source_review_status?: "sesuai" | "perlu_ditinjau" | "perlu_perbaikan";
  source_review_version?: number;
  source_review_by?: string;
  source_url?: string;
  source_title?: string;
  source_verified?: boolean;
  source_note?: string;
  reviewed_at?: string;
  region?: string;
  version?: number;
  published_at?: string;
  id: number;
  slug: string;
  name: string;
  category: string;
  agency: string;
  description: string;
  official_fee: string;
  official_duration: string;
  official_channel: string;
  requirements: string[];
  is_popular?: boolean;
}

export interface DocumentItem {
  id: string;
  name: string;
  fileName: string;
  size: string;
  status: "TERUNGGAH" | "BELUM";
  required: boolean;
  fileType: "image" | "pdf";
  previewUrl?: string;
  previewKey?: string;
  fixtureId?: string;
  version?: number;
  uploadedAt?: string;
  qualityPreset?: "sample_issue" | "sample_clean" | "user_file";
}

export interface InspectionFinding {
  id: string;
  serviceId?: number;
  scope?: InspectionScope;
  evaluationStatus?: EvaluationStatus;
  category:
    "Konsistensi Data" | "Kualitas Berkas" | "Kelengkapan" | "Legalitas";
  title: string;
  evidence: string;
  rule: string;
  action: string;
  severity: "warning" | "error" | "info";
  resolved: boolean;
  resolvedReason?: string;
  docTarget: string;
  documentVersion?: number;
  dataVersion?: number;
  ruleVersion?: string;
  sourceUrl?: string;
  userCorrection?: {
    note: string;
    correctedAt: string;
    source?: string;
  };
}

export type ApplicationStatusCode =
  | "DITARIK"
  | "DICATAT_WARGA"
  | "DITERIMA"
  | "VERIFIKASI"
  | "PERLU_PERBAIKAN"
  | "DIPROSES"
  | "SELESAI"
  | "HASIL_DITERIMA_WARGA";

export interface TimelineEvent {
  id: number;
  status: ApplicationStatusCode;
  title: string;
  time: string;
  source: string;
  source_type?: "citizen" | "officer" | "simulation" | "admin";
  notes: string;
  next_action?: string;
  revision_detail?: OfficerRevisionDetail;
  completed: boolean;
  current?: boolean;
}

export interface ApplicationAttachment {
  id?: string;
  name: string;
  fileName: string;
  size: string;
  fileType: "image" | "pdf";
  version?: number;
  uploadedAt?: string;
  qualityPreset?: "sample_issue" | "sample_clean" | "user_file";
  previewKey?: string;
  fixtureId?: string;
}

export interface ApplicationRecord {
  escalation?: {
    ticketId: string;
    reason: string;
    status: "pending" | "resolved";
    answer?: string;
  };
  mode?: "simulation" | "citizen" | "demo_review";
  revision_pending?: boolean;
  attachments?: ApplicationAttachment[];
  owner_id?: string;
  assigned_officer_id?: string;
  recipient_unit?: string;
  submitted_snapshot?: SubmissionSnapshot;
  submission_history?: SubmissionSnapshot[];
  latest_revision_detail?: OfficerRevisionDetail;
  latest_evaluation?: OfficerSubmissionEvaluation;
  evaluation_history?: OfficerSubmissionEvaluation[];
  official_submission?: OfficialSubmissionRecord;
  id: string;
  preparation_id?: string;
  internal_reference?: string;
  preparation_reference?: string;
  applicant_target?: ApplicantTarget;
  condition_key?: string;
  condition_label?: string;
  official_number: string;
  official_number_source?:
    "citizen_reported" | "simulation_assigned" | "not_provided";
  service_id: number;
  service_name: string;
  region?: string;
  agency?: string;
  channel: string;
  applicant_name: string;
  applicant_nik: string;
  applicant_phone?: string;
  submission_date?: string;
  estimated_completion?: string;
  current_status: ApplicationStatusCode;
  created_at: string;
  updated_at?: string;
  events: TimelineEvent[];
}

export interface AdminRule {
  id: string;
  service: string;
  category: string;
  rule: string;
  version: string;
  active: boolean;
  severity: "Kritis" | "Peringatan" | "Rekomendasi";
}

export interface ToastNotice {
  id: number;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

export interface FormData {
  nama_lengkap: string;
  nik: string;
  no_kk: string;
  telepon: string;
  alamat: string;
  alasan: string;
}

export interface PreparationMeta {
  internalReference: string;
  serviceId: number;
  conditionKey: string;
  applicantTarget?: ApplicantTarget;
  needConfirmed?: boolean;
  started?: boolean;
  dataVersion: number;
  lastInspectedDataVersion: number | null;
  lastInspectedDataSignature: string | null;
  lastInspectedDocSignature: string | null;
  lastInspectedAt: string | null;
  lastInspectedGuideVersion: number;
  lastInspectedRuleCount: number;
  consentAccepted: boolean;
  updatedAt: string;
}

const DEFAULT_SOURCE_NOTE =
  "Data panduan contoh berbasis regulasi nasional. Tautan mengarah ke portal umum Kemendagri; rincian persyaratan dan estimasi waktu daerah belum diverifikasi otomatis.";

export const DEFAULT_SERVICES: ServiceDetail[] = [
  {
    id: 1,
    slug: "pembaruan-kartu-keluarga",
    name: "Pembaruan Data Kartu Keluarga (KK)",
    category: "Kependudukan",
    agency: "Dinas Kependudukan dan Pencatatan Sipil",
    region: "Kota Contoh",
    version: 3,
    reviewed_at: "31 Oktober 2026",
    source_title:
      "Referensi Prosedur Daerah: Disdukcapil Kota Pekalongan & Disdukcapil Kab. Ponorogo (Permendagri No. 108 Tahun 2019)",
    source_url:
      "https://disdukcapil.pekalongankota.go.id/halaman/penerbitan-kartu-keluarga.html",
    source_verified: false,
    source_note:
      "Mengacu pada pola layanan KK Disdukcapil Kota Pekalongan (disdukcapil.pekalongankota.go.id) dan Disdukcapil Kab. Ponorogo (dukcapil.ponorogo.go.id/persyaratan-mengurus-kartu-keluarga-kk/): warga menyiapkan formulir F1-02/F1-06 dan berkas pendukung sesuai kondisi, petugas memeriksa kelengkapan/kesesuaian, kekurangan dikembalikan dengan arahan perbaikan, lalu berkas yang sesuai diteruskan untuk pengesahan dan penyerahan di kanal resmi. DaftarIn adalah aplikasi pendamping dan belum terhubung ke SIAK.",
    description:
      "Layanan perubahan susunan keluarga, perubahan status perkawinan, penambahan anggota, atau pembetulan elemen biodata pada Kartu Keluarga.",
    official_fee: "Gratis (Rp 0)",
    official_duration:
      "1–2 Hari Kerja sejak berkas dinyatakan lengkap di kanal resmi",
    official_channel: "Loket Disdukcapil / Portal Layanan Adminduk Kota Contoh",
    requirements: [
      "Kartu Keluarga (KK) Asli Lama (beserta isian Formulir F1-02/F1-06)",
      "KTP-el Kepala Keluarga & Pemohon",
      "Buku Nikah / Kutipan Akta Perkawinan atau Perceraian (jika perubahan status kawin)",
      "Surat Keterangan Lahir / Akta Kelahiran / Kematian / SKPWNI (jika penambahan atau pengurangan anggota)",
    ],
    is_popular: true,
  },
  {
    id: 2,
    slug: "ktp-el-baru-penggantian",
    name: "Penerbitan KTP-el Baru / Penggantian Rusak",
    category: "Identitas",
    agency: "Dinas Kependudukan dan Pencatatan Sipil",
    region: "Kota Contoh",
    version: 1,
    reviewed_at: "26 Oktober 2026",
    source_title:
      "Acuan Regulasi: Permendagri No. 108 Tahun 2019 (Data Contoh)",
    source_url: "https://dukcapil.kemendagri.go.id",
    source_verified: false,
    source_note: DEFAULT_SOURCE_NOTE,
    description:
      "Cetak fisik KTP-el karena rusak, hilang, perubahan elemen data, atau perekaman pemula usia 17 tahun.",
    official_fee: "Gratis (Rp 0)",
    official_duration: "1 Hari Kerja (tergantung ketersediaan blangko)",
    official_channel: "Kantor Kecamatan / Loket Terpadu Disdukcapil",
    requirements: [
      "Fotokopi Kartu Keluarga Terbaru",
      "KTP-el Fisik Rusak (atau Surat Kehilangan Polisi jika hilang)",
      "Pas Foto Resmi Latar Biru/Merah (jika pembaruan foto)",
    ],
    is_popular: true,
  },
  {
    id: 3,
    slug: "akta-kelahiran",
    name: "Penerbitan Akta Kelahiran Baru",
    category: "Pencatatan Sipil",
    agency: "Dinas Kependudukan dan Pencatatan Sipil",
    region: "Kota Contoh",
    version: 1,
    reviewed_at: "26 Oktober 2026",
    source_title:
      "Acuan Regulasi: Permendagri No. 108 Tahun 2019 Pasal 43 (Data Contoh)",
    source_url: "https://dukcapil.kemendagri.go.id",
    source_verified: false,
    source_note: DEFAULT_SOURCE_NOTE,
    description:
      "Pencatatan peristiwa kelahiran anak untuk penerbitan kutipan akta kelahiran dan pembaruan KK.",
    official_fee: "Gratis (Rp 0)",
    official_duration: "2–3 Hari Kerja",
    official_channel: "Loket Faskes Terintegrasi / Loket Disdukcapil",
    requirements: [
      "Surat Keterangan Lahir dari Dokter / Bidan / Faskes (atau SPTJM Kelahiran)",
      "Buku Nikah / Akta Perkawinan Orang Tua (atau SPTJM Pasangan Suami Istri)",
      "KTP-el Kedua Orang Tua & 2 Orang Saksi",
      "Kartu Keluarga Orang Tua",
    ],
    is_popular: true,
  },
  {
    id: 4,
    slug: "surat-pindah-skpwni",
    name: "Surat Keterangan Pindah Datang (SKPWNI)",
    category: "Kependudukan",
    agency: "Dinas Kependudukan dan Pencatatan Sipil",
    region: "Kota Contoh",
    version: 1,
    reviewed_at: "26 Oktober 2026",
    source_title:
      "Acuan Regulasi: Permendagri No. 108 Tahun 2019 Pasal 17–24 (Data Contoh)",
    source_url: "https://dukcapil.kemendagri.go.id",
    source_verified: false,
    source_note: DEFAULT_SOURCE_NOTE,
    description:
      "Layanan administrasi perpindahan domisili kependudukan antar kelurahan, kecamatan, atau antar kabupaten/provinsi.",
    official_fee: "Gratis (Rp 0)",
    official_duration: "1–3 Hari Kerja",
    official_channel: "Portal Layanan Online / Loket Pelayanan Adminduk",
    requirements: [
      "Kartu Keluarga (KK) Asli Pemohon",
      "KTP-el Pemohon yang Pindah",
      "Rincian Alamat Tujuan Lengkap Termasuk Kode Pos",
    ],
    is_popular: false,
  },
  {
    id: 5,
    slug: "kartu-identitas-anak-kia",
    name: "Penerbitan Kartu Identitas Anak (KIA)",
    category: "Identitas",
    agency: "Dinas Kependudukan dan Pencatatan Sipil",
    region: "Kota Contoh",
    version: 1,
    reviewed_at: "26 Oktober 2026",
    source_title: "Acuan Regulasi: Permendagri No. 2 Tahun 2016 (Data Contoh)",
    source_url: "https://dukcapil.kemendagri.go.id",
    source_verified: false,
    source_note: DEFAULT_SOURCE_NOTE,
    description:
      "Identitas resmi anak usia 0 hingga kurang dari 17 tahun dan belum menikah.",
    official_fee: "Gratis (Rp 0)",
    official_duration: "1 Hari Kerja",
    official_channel: "Loket Disdukcapil / Kantor Kecamatan",
    requirements: [
      "Kutipan Akta Kelahiran Anak",
      "Kartu Keluarga Orang Tua",
      "KTP-el Kedua Orang Tua",
      "Pas Foto Anak 2x3 (khusus anak usia 5 tahun ke atas)",
    ],
    is_popular: false,
  },
  {
    id: 6,
    slug: "akta-kematian",
    name: "Pencatatan & Penerbitan Akta Kematian",
    category: "Pencatatan Sipil",
    agency: "Dinas Kependudukan dan Pencatatan Sipil",
    region: "Kota Contoh",
    version: 1,
    reviewed_at: "26 Oktober 2026",
    source_title:
      "Acuan Regulasi: Permendagri No. 108 Tahun 2019 Pasal 59 (Data Contoh)",
    source_url: "https://dukcapil.kemendagri.go.id",
    source_verified: false,
    source_note: DEFAULT_SOURCE_NOTE,
    description:
      "Pencatatan peristiwa kematian warga untuk pemutakhiran data kependudukan dan keperluan administrasi ahli waris.",
    official_fee: "Gratis (Rp 0)",
    official_duration: "1–2 Hari Kerja",
    official_channel: "Loket Disdukcapil / Kelurahan",
    requirements: [
      "Surat Kematian dari Dokter / Rumah Sakit / Kepala Desa/Lurah",
      "KTP-el & Kartu Keluarga Jenazah Asli",
      "KTP-el Pelapor & 2 Orang Saksi",
    ],
    is_popular: false,
  },
];

export interface CreatePreparationOptions {
  service?: ServiceDetail;
  region?: string;
  conditionKey?: string;
  applicantTarget?: ApplicantTarget;
  needConfirmed?: boolean;
  linkedApplicationId?: string;
}

interface AppContextType {
  user: UserProfile;
  services: ServiceDetail[];
  saveService: (service: ServiceDetail) => void;
  selectedService: ServiceDetail;
  setSelectedService: (service: ServiceDetail) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  conditionKey: string;
  setConditionKey: (condition: string) => void;
  preparations: PreparationRecord[];
  activePreparation: PreparationRecord;
  selectPreparation: (prepId: string) => void;
  manageDraft: (id: string, action: "archive" | "restore" | "delete") => void;
  withdrawReview: (id: string, reason: string) => void;
  escalateReview: (id: string, ticketId: string, reason: string) => void;
  resolveReviewEscalation: (id: string, answer: string) => void;
  setServiceAvailability: (id: number, paused: boolean, reason: string) => void;
  createPreparation: (options?: CreatePreparationOptions) => PreparationRecord;
  createLinkedRevisionPreparation: (applicationId: string) => PreparationRecord;
  dismissMigrationNote: (prepId: string) => void;
  getPreparationReadiness: (
    prep: PreparationRecord,
  ) => ReturnType<typeof computePreparationReadiness>;
  guestIntent: GuestPreparationIntent | null;
  saveGuestIntent: (intent: Omit<GuestPreparationIntent, "savedAt">) => void;
  consumeGuestIntent: () => GuestPreparationIntent | null;
  preparationMeta: PreparationMeta;
  prepMetaByService: Record<number, PreparationMeta>;
  confirmNeedStep: (
    target: ApplicantTarget,
    condition: string,
    serviceOverride?: ServiceDetail,
    familyMember?: FamilyMember,
  ) => void;
  startPreparation: (
    service: ServiceDetail,
    initialCondition?: string,
    options?: {
      createNew?: boolean;
      applicantTarget?: ApplicantTarget;
      needConfirmed?: boolean;
    },
  ) => PreparationRecord;
  readiness: ReturnType<typeof computePreparationReadiness>;
  setConsentAccepted: (accepted: boolean) => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  updateFormField: (key: keyof FormData, value: string) => void;
  loadDemoFormData: () => void;
  documents: DocumentItem[];
  addDocument: (document: DocumentItem, targetPrepId?: string) => void;
  removeDocument: (id: string) => void;
  updateDocumentStatus: (id: string, status: DocumentItem["status"]) => void;
  loadSampleDocuments: (mode: "issue" | "fixed", targetPrepId?: string) => void;
  inspections: InspectionFinding[];
  toggleResolveFinding: (id: string) => void;
  confirmFindingCorrection: (id: string, note: string) => void;
  readinessScore: number;
  aiScanning: boolean;
  scanningPrepIds: string[];
  runAIScanSimulation: (targetPrepId?: string) => void;
  applications: ApplicationRecord[];
  reviewQueue: Pick<
    ApplicationRecord,
    | "id"
    | "internal_reference"
    | "service_name"
    | "applicant_name"
    | "current_status"
    | "assigned_officer_id"
    | "revision_pending"
  >[];
  assignReviewOfficer: (id: string, officerId: string, reason: string) => Promise<void> | void;
  reviewServiceSource: (
    id: number,
    version: number,
    decision: "sesuai" | "perlu_perbaikan",
    note: string,
  ) => void;
  officerHistory: {
    id: string;
    applicationId: string;
    reference: string;
    serviceName: string;
    submissionVersion: number;
    decision: "SELESAI" | "PERLU_PERBAIKAN";
    evaluatedAt: string;
    summaryNote?: string;
    canOpen: boolean;
  }[];
  operationalEvents: {
    id: string;
    message: string;
    by: string;
    time: string;
    applicationId: string;
    reference: string;
    category: "penugasan" | "tinjauan";
  }[];
  addApplication: (application: ApplicationRecord, prepId?: string) => void;
  submitForOfficerReview: (
    prepId?: string,
    citizenNote?: string,
  ) => Promise<ApplicationRecord> | ApplicationRecord;
  officerStartReview: (id: string, note?: string) => Promise<void> | void;
  officerRequestRevision: (
    id: string,
    detail: {
      targetItem: string;
      issueCategory: OfficerIssueCategory;
      problemDescription: string;
      requiredAction: string;
    },
    itemAssessments?: OfficerItemAssessment[],
  ) => Promise<void> | void;
  officerCompleteReview: (
    id: string,
    note: string,
    itemAssessments: OfficerItemAssessment[],
  ) => Promise<void> | void;
  officerUpdateApplication: (
    id: string,
    status: ApplicationStatusCode,
    note: string,
  ) => void;
  addCitizenNote: (id: string, note: string) => Promise<void> | void;
  resubmitApplication: (
    id: string,
    citizenNote?: string,
    prepId?: string,
  ) => Promise<void> | void;
  recordOfficialSubmission: (
    id: string,
    officialNumber: string,
    channel: string,
    note?: string,
  ) => void;
  confirmApplicationResult: (
    id: string,
    note?: string,
    channel?: string,
  ) => Promise<void> | void;
  adminRules: AdminRule[];
  toggleRuleActive: (id: string) => void;
  addAdminRule: (rule: Omit<AdminRule, "id">) => void;
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toasts: ToastNotice[];
  showToast: (message: string, type?: ToastNotice["type"]) => void;
  removeToast: (id: number) => void;
}

export const statusLabels: Record<ApplicationStatusCode, string> = {
  DITARIK: "Tinjauan ditarik warga",
  DICATAT_WARGA: "Pengajuan kanal resmi (Dilaporkan warga)",
  DITERIMA: "Menunggu tinjauan",
  VERIFIKASI: "Sedang ditinjau",
  PERLU_PERBAIKAN: "Perlu perbaikan",
  DIPROSES: "Menunggu tinjauan lanjutan",
  SELESAI: "Tinjauan awal selesai",
  HASIL_DITERIMA_WARGA: "Hasil layanan diterima (Dilaporkan warga)",
};

/**
 * Mengembalikan label status TINJAUAN PENDAMPING DaftarIn.
 * Konfirmasi hasil layanan pemerintah oleh warga TIDAK menimpa status tinjauan petugas.
 */
export function getReviewStatusLabel(
  record?: Pick<
    ApplicationRecord,
    "mode" | "assigned_officer_id" | "current_status" | "revision_pending"
  > | null,
): string {
  if (!record) return "Belum dikirim";
  if (record.mode === "citizen" && !record.assigned_officer_id) {
    return "Tidak melalui tinjauan pendamping";
  }
  if (record.current_status === "PERLU_PERBAIKAN" && record.revision_pending) {
    return "Perbaikan dikirim";
  }
  if (
    record.current_status === "SELESAI" ||
    record.current_status === "HASIL_DITERIMA_WARGA"
  ) {
    return "Tinjauan awal selesai";
  }
  return statusLabels[record.current_status] || record.current_status;
}

/**
 * Mengembalikan status PENGAJUAN & HASIL LAYANAN RESMI INSTANSI (Dilaporkan warga).
 * Terpisah sepenuhnya dari status tinjauan pendamping DaftarIn.
 */
export function getOfficialSubmissionStatusLabel(
  record?: ApplicationRecord | null,
): string {
  if (!record) return "Belum diajukan / belum dicatat warga";
  if (
    record.official_submission?.status === "HASIL_DITERIMA_WARGA" ||
    record.official_submission?.resultReceivedAt ||
    record.current_status === "HASIL_DITERIMA_WARGA"
  ) {
    return "Hasil layanan diterima (Dilaporkan warga)";
  }
  if (record.official_submission || record.current_status === "DICATAT_WARGA") {
    return "Sudah diajukan di kanal resmi (Dilaporkan warga)";
  }
  return "Belum diajukan / belum dicatat warga";
}

export const allowedStatusTransitions: Record<
  ApplicationStatusCode,
  ApplicationStatusCode[]
> = {
  DITARIK: [],
  DICATAT_WARGA: ["DITERIMA", "VERIFIKASI", "PERLU_PERBAIKAN"],
  DITERIMA: ["VERIFIKASI"],
  VERIFIKASI: ["PERLU_PERBAIKAN", "SELESAI"],
  PERLU_PERBAIKAN: ["VERIFIKASI"],
  DIPROSES: ["SELESAI", "PERLU_PERBAIKAN"],
  SELESAI: [],
  HASIL_DITERIMA_WARGA: [],
};

export function readStored<T>(key: string, fallback: T): T {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    if (value === null) return fallback;
    if (Array.isArray(fallback))
      return (Array.isArray(value) ? value : fallback) as T;
    if (typeof fallback === "object" && fallback !== null)
      return typeof value === "object" && !Array.isArray(value)
        ? { ...fallback, ...value }
        : fallback;
    return typeof value === typeof fallback ? value : fallback;
  } catch {
    return fallback;
  }
}

const GUEST_INTENT_KEY = "daftarin:guest-intent:v1";

function readGuestIntent(): GuestPreparationIntent | null {
  try {
    const raw = sessionStorage.getItem(GUEST_INTENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestPreparationIntent;
    if (!parsed || typeof parsed.serviceId !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

const formatNow = () =>
  new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

export const DEFAULT_REVIEW_UNIT =
  "Unit Tinjauan Pendamping Adminduk — Budi Santoso (Petugas Contoh / Simulasi)";

const initialRules: AdminRule[] = [
  {
    id: "rule-required",
    service: "Semua layanan",
    category: "Kelengkapan",
    rule: "Periksa keberadaan seluruh dokumen wajib sesuai kondisi layanan yang dipilih.",
    version: "v1",
    active: true,
    severity: "Kritis",
  },
  {
    id: "rule-image",
    service: "Semua layanan",
    category: "Kualitas Berkas",
    rule: "Periksa keterbacaan isi dan kelengkapan empat sudut dokumen (tidak terpotong atau buram).",
    version: "v1",
    active: true,
    severity: "Kritis",
  },
  {
    id: "rule-name",
    service: "Semua layanan",
    category: "Konsistensi Data",
    rule: "Bandingkan kelengkapan nama, 16 digit NIK/Nomor KK, dan alasan permohonan dengan dokumen identitas.",
    version: "v1",
    active: true,
    severity: "Peringatan",
  },
];

function sanitizeStoredFinding(finding: InspectionFinding): InspectionFinding {
  const rawStatus = finding.evaluationStatus as string | undefined;
  const isUnevaluatedTarget =
    finding.id.startsWith("unverified-file-") ||
    finding.id.startsWith("custom-rule-") ||
    finding.scope === "aturan_admin";

  if (rawStatus === "citizen_confirmed") {
    if (isUnevaluatedTarget) {
      return {
        ...finding,
        evaluationStatus: "not_evaluated",
        resolved: false,
      };
    }
    return {
      ...finding,
      evaluationStatus: "evaluated_issue",
    };
  }

  if (finding.evaluationStatus === "not_evaluated" && finding.resolved) {
    return {
      ...finding,
      resolved: false,
    };
  }

  return finding;
}

function loadOrMigratePreparations(
  user: UserProfile,
  services: ServiceDetail[],
  _adminRules: AdminRule[],
): PreparationRecord[] {
  if (user.id === "guest") return [];
  const scope = "daftarin:" + user.id + ":";
  const v3Key = scope + "preparations:v3";

  try {
    const rawV3 = localStorage.getItem(v3Key);
    if (rawV3) {
      const parsed = JSON.parse(rawV3);
      if (Array.isArray(parsed)) {
        return parsed.map((item: PreparationRecord) => {
          const sanitizedInspections = Array.isArray(item.inspections)
            ? item.inspections.map(sanitizeStoredFinding)
            : [];
          const isMigratedRun =
            item.lastInspectionSnapshot?.runId?.startsWith("scan-migrated-");
          const sanitizedSnapshot =
            item.lastInspectionSnapshot && isMigratedRun
              ? {
                  ...item.lastInspectionSnapshot,
                  evaluatedScopes: [],
                  legacyUnverifiedSnapshot: true,
                }
              : item.lastInspectionSnapshot;

          return {
            ...item,
            inspections: sanitizedInspections,
            lastInspectionSnapshot: sanitizedSnapshot,
            linkedApplicationId: item.linkedApplicationId,
          };
        });
      }
    }
  } catch {
    // Fall through to migration
  }

  // Migrate from legacy per-account keys (`prep-meta:v2`, `prep-meta:v1`, `form`, `documents`, `inspections`)
  const legacyMetaV2 = readStored<Record<number, PreparationMeta>>(
    scope + "prep-meta:v2",
    {},
  );
  const legacyMetaV1 = readStored<Record<number, PreparationMeta>>(
    scope + "prep-meta:v1",
    {},
  );
  const legacyMeta =
    Object.keys(legacyMetaV2).length > 0 ? legacyMetaV2 : legacyMetaV1;
  const startedMetas = Object.values(legacyMeta).filter(
    (m) => m && (m.started || m.needConfirmed || m.lastInspectedAt),
  );

  if (startedMetas.length > 0) {
    const legacyForm = readStored<FormData>(scope + "form", {
      nama_lengkap: user.name || "",
      nik: user.nik || "",
      no_kk: "",
      telepon: user.phone || "",
      alamat: "",
      alasan: "",
    });
    const legacyDocs = readStored<DocumentItem[]>(scope + "documents", []);
    const legacyInspections = readStored<InspectionFinding[]>(
      scope + "inspections",
      [],
    );

    const hasSharedFormAmbiguity = startedMetas.length > 1;
    const migrated: PreparationRecord[] = startedMetas.map((meta, idx) => {
      const svc =
        services.find((s) => s.id === meta.serviceId) || DEFAULT_SERVICES[0];
      const cond = meta.conditionKey || getSelectedConditionOption(svc).value;
      const target: ApplicantTarget = meta.applicantTarget || "diri_sendiri";
      const svcDocs = legacyDocs.filter((d) =>
        d.id.startsWith(`service-${svc.id}-doc-`),
      );
      const svcInspections = legacyInspections
        .filter((f) => !f.serviceId || f.serviceId === svc.id)
        .map(sanitizeStoredFinding);

      const isAyuSampleKK = user.id === "citizen-ayu" && svc.id === 1;
      const prepId = isAyuSampleKK
        ? "prep-sample-kk-01"
        : `prep-migrated-${svc.id}-${idx + 1}`;
      const internalRef =
        meta.internalReference ||
        `PREP-2026-${String(idx + 1).padStart(4, "0")}`;

      let snapshot: InspectionSnapshot | null = null;
      if (meta.lastInspectedAt) {
        // Jangan memalsukan guideSignature, rulesSignature, atau evaluatedScopes dari aturan sekarang
        // karena data lama tidak menyimpan rincian aturan maupun cakupan yang dievaluasi.
        snapshot = {
          runId: `scan-migrated-${svc.id}`,
          preparationId: prepId,
          inspectedAt: meta.lastInspectedAt,
          dataVersion: meta.lastInspectedDataVersion || meta.dataVersion || 1,
          dataSignature:
            meta.lastInspectedDataSignature || "legacy-unknown-data-signature",
          conditionKey: cond,
          applicantTarget: target,
          docSignature:
            meta.lastInspectedDocSignature || "legacy-unknown-doc-signature",
          guideSignature: `legacy-guide-v${meta.lastInspectedGuideVersion ?? "unknown"}`,
          rulesSignature: `legacy-rules-count-${meta.lastInspectedRuleCount ?? "unknown"}`,
          evaluatedScopes: [],
          legacyUnverifiedSnapshot: true,
        };
      }

      return {
        id: prepId,
        internalReference: internalRef,
        ownerId: user.id,
        serviceId: svc.id,
        serviceName: svc.name,
        region: svc.region || "Kota Contoh",
        agency: svc.agency,
        applicantTarget: target,
        conditionKey: cond,
        needConfirmed: Boolean(meta.needConfirmed),
        formData: { ...legacyForm },
        documents: svcDocs,
        consentAccepted: Boolean(meta.consentAccepted),
        inspections: svcInspections,
        dataVersion: meta.dataVersion || 1,
        lastInspectionSnapshot: snapshot,
        linkedApplicationId: isAyuSampleKK ? "sample-kk-01" : undefined,
        migrationNote: hasSharedFormAmbiguity
          ? "Draf ini dipulihkan dari penyimpanan browser versi lama yang berbagi satu formulir pemohon untuk beberapa layanan. Periksa kembali Nama, NIK, Nomor KK, dan alasan pada urusan ini sebelum melanjutkan."
          : undefined,
        createdAt: meta.updatedAt || "28 Oktober 2026, 09.10 WIB",
        updatedAt: meta.updatedAt || formatNow(),
      };
    });

    return migrated;
  }

  return [];
}

function buildFallbackPreparation(
  user: UserProfile,
  service: ServiceDetail,
  region: string,
): PreparationRecord {
  const cond = getSelectedConditionOption(service).value;
  return {
    id: "prep-draft-uninitialized",
    internalReference: "PREP-2026-BARU",
    ownerId: user.id,
    serviceId: service.id,
    serviceName: service.name,
    region: service.region || region || "Kota Contoh",
    agency: service.agency,
    applicantTarget: "diri_sendiri",
    conditionKey: cond,
    needConfirmed: false,
    formData: {
      nama_lengkap: user.id !== "guest" ? user.name : "",
      nik: user.id !== "guest" ? user.nik : "",
      no_kk: "",
      telepon: user.id !== "guest" ? user.phone : "",
      alamat: "",
      alasan: "",
    },
    documents: [],
    consentAccepted: false,
    inspections: [],
    dataVersion: 1,
    lastInspectionSnapshot: null,
    createdAt: formatNow(),
    updatedAt: formatNow(),
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user: account, mode: authMode } = useAuth();
  const isApiMode = authMode === "api";
  const user: UserProfile = account || {
    id: "guest",
    name: "Pengunjung",
    role: "warga",
    email: "",
    nik: "",
    phone: "",
  };
  const scope = "daftarin:" + user.id + ":";

  const [services, setServices] = useState<ServiceDetail[]>(() => {
    const stored = readStored("daftarin:services:v1", DEFAULT_SERVICES);
    return stored.map((item) => {
      const def = DEFAULT_SERVICES.find((d) => d.id === item.id);
      return def ? { ...def, ...item } : item;
    });
  });

  const [adminRules, setAdminRules] = useState<AdminRule[]>(() =>
    readStored("daftarin:rules:v1", initialRules),
  );

  const [selectedRegion, setSelectedRegionState] = useState<string>(() =>
    readStored("daftarin:region:v1", "Kota Contoh"),
  );

  const [selected, setSelected] = useState<ServiceDetail>(() =>
    readStored("daftarin:selected-service:v1", DEFAULT_SERVICES[0]),
  );

  const [preparations, setPreparations] = useState<PreparationRecord[]>(() =>
    isApiMode ? [] : loadOrMigratePreparations(user, services, adminRules),
  );

  const [activePrepId, setActivePrepId] = useState<string>(() => {
    const storedActive = readStored<string>(scope + "active-prep-id:v1", "");
    if (storedActive && preparations.some((p) => p.id === storedActive)) {
      return storedActive;
    }
    return preparations[0]?.id || "";
  });

  const [guestIntent, setGuestIntent] = useState<GuestPreparationIntent | null>(
    () => readGuestIntent(),
  );

  // Reload preparations when account changes (e.g., guest -> logged in warga)
  const prevUserIdRef = useRef(user.id);
  useEffect(() => {
    if (prevUserIdRef.current !== user.id) {
      prevUserIdRef.current = user.id;
      const nextPreps = isApiMode ? [] : loadOrMigratePreparations(user, services, adminRules);
      setPreparations(nextPreps);
      const storedActive = readStored<string>(
        "daftarin:" + user.id + ":active-prep-id:v1",
        "",
      );
      if (storedActive && nextPreps.some((p) => p.id === storedActive)) {
        setActivePrepId(storedActive);
      } else {
        setActivePrepId(nextPreps[0]?.id || "");
      }
    }
  }, [user.id, services, adminRules]);

  const activePreparation: PreparationRecord =
    preparations.find((p) => p.id === activePrepId) ||
    preparations[0] ||
    buildFallbackPreparation(
      user,
      services.find((s) => s.id === selected.id) || services[0],
      selectedRegion,
    );

  const selectedService =
    services.find((service) => service.id === selected.id) || services[0];

  const [records, setRecords] = useState<ApplicationRecord[]>(() => {
    if (isApiMode) return [];
    const stored = readStored<ApplicationRecord[]>("daftarin:applications:v1", []);
    return stored.map((rec) => {
      const merged: ApplicationRecord = rec;

      // Migrasi pemisahan status tinjauan pendamping vs konfirmasi hasil layanan pemerintah:
      // Jika record tinjauan petugas lama memiliki current_status === "HASIL_DITERIMA_WARGA",
      // pulihkan current_status menjadi "SELESAI" (Tinjauan awal selesai) dan simpan konfirmasi warga pada official_submission.
      if (
        merged.current_status === "HASIL_DITERIMA_WARGA" &&
        (merged.assigned_officer_id || merged.mode !== "citizen")
      ) {
        const receivedAt =
          merged.official_submission?.resultReceivedAt ||
          merged.updated_at ||
          merged.created_at;
        return {
          ...merged,
          current_status: "SELESAI",
          official_submission: {
            status: "HASIL_DITERIMA_WARGA",
            recordedAt:
              merged.official_submission?.recordedAt ||
              merged.updated_at ||
              merged.created_at,
            channel:
              merged.official_submission?.channel ||
              merged.channel ||
              "Kanal Resmi Instansi",
            officialNumber:
              merged.official_submission?.officialNumber ||
              merged.official_number ||
              "Dicatat warga",
            officialReceiptNumber:
              merged.official_submission?.officialReceiptNumber ||
              merged.official_number ||
              undefined,
            officialNumberSource:
              merged.official_submission?.officialNumberSource ||
              "citizen_reported",
            note: merged.official_submission?.note,
            resultReceivedAt: receivedAt,
            resultNote:
              merged.official_submission?.resultNote ||
              "Warga mengonfirmasi telah menerima dokumen hasil dari kanal resmi instansi.",
            sourceLabel: "Dilaporkan warga",
          },
        };
      }

      if (merged.official_submission && !merged.official_submission.status) {
        return {
          ...merged,
          official_submission: {
            ...merged.official_submission,
            status: merged.official_submission.resultReceivedAt
              ? "HASIL_DITERIMA_WARGA"
              : "DIAJUKAN_WARGA",
            sourceLabel:
              merged.official_submission.sourceLabel || "Dilaporkan warga",
          },
        };
      }

      return merged;
    });
  });

  const [, setFileStorageTick] = useState(0);
  useEffect(
    () => subscribeFileStorage(() => setFileStorageTick((t) => t + 1)),
    [],
  );

  const [isChatOpen, setChatOpen] = useState(false);
  const [scanningPrepIds, setScanningPrepIds] = useState<string[]>([]);
  const inFlightRunsRef = useRef<Record<string, string>>({});
  const deviceClearing = useRef(
    sessionStorage.getItem("daftarin:clearing-device") === "1",
  );
  useEffect(() => {
    const clear = () => {
      deviceClearing.current = true;
      sessionStorage.setItem("daftarin:clearing-device", "1");
      sessionStorage.removeItem("daftarin:session:v1");
    };
    const external = (event: StorageEvent) => {
      if (event.key === "daftarin:device-clear") {
        clear();
        window.location.replace("/?deviceCleared=1#/masuk");
      }
      if (event.key === "daftarin:device-cleared") {
        sessionStorage.removeItem("daftarin:clearing-device");
        window.location.replace("/?deviceCleared=1#/masuk");
      }
    };
    window.addEventListener("daftarin-device-clear", clear);
    window.addEventListener("storage", external);
    return () => {
      window.removeEventListener("daftarin-device-clear", clear);
      window.removeEventListener("storage", external);
    };
  }, []);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (isApiMode || deviceClearing.current) return;
    const values: [string, unknown][] = [
      ["daftarin:services:v1", services],
      ["daftarin:applications:v1", records],
      ["daftarin:rules:v1", adminRules],
      ["daftarin:region:v1", selectedRegion],
    ];
    if (account) {
      const sanitizedPreps = preparations.map((prep) => ({
        ...prep,
        documents: prep.documents.map(
          ({ previewUrl: _previewUrl, ...doc }) => doc,
        ),
      }));
      values.push(
        [scope + "preparations:v3", sanitizedPreps],
        [scope + "active-prep-id:v1", activePrepId],
      );
    }
    try {
      values.forEach(([key, value]) =>
        localStorage.setItem(key, JSON.stringify(value)),
      );
    } catch {
      setStorageUnavailable(true);
    }
  }, [
    services,
    records,
    adminRules,
    selectedRegion,
    scope,
    preparations,
    activePrepId,
    account,
  ]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (isApiMode) return;
      if (event.key === "daftarin:applications:v1")
        setRecords(readStored<ApplicationRecord[]>(event.key, []));
      if (event.key === "daftarin:services:v1")
        setServices(readStored(event.key, DEFAULT_SERVICES));
      if (event.key === "daftarin:rules:v1")
        setAdminRules(readStored(event.key, initialRules));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function mapApiStatusToLocal(
    apiStatus: string | undefined,
    fallback: ApplicationStatusCode,
  ): ApplicationStatusCode {
    if (!apiStatus) return fallback;
    const s = apiStatus.toLowerCase();
    switch (s) {
      case "accepted":
        return "DITERIMA";
      case "verification":
        return "VERIFIKASI";
      case "needs_correction":
      case "needs_revision":
      case "revision_requested":
        return "PERLU_PERBAIKAN";
      case "processing":
        return "DIPROSES";
      case "completed":
        return "SELESAI";
      case "result_received_by_citizen":
        return "HASIL_DITERIMA_WARGA";
      case "withdrawn":
        return "DITARIK";
      case "citizen_recorded_unconfirmed":
        return "DITERIMA";
      default:
        return fallback;
    }
  }

  useEffect(() => {
    if (!isApiMode) return;
    let alive = true;

    async function syncFromApi() {
      try {
        const svcRes = await servicesApi.getAll();
        if (alive && svcRes?.data && svcRes.data.length > 0) {
          setServices((prev) => {
            return svcRes.data.map((item) => {
              const localMatch = prev.find(
                (p) => p.slug === item.slug || String(p.id) === item.id,
              );
              return {
                ...(localMatch || DEFAULT_SERVICES[0]),
                id: localMatch ? localMatch.id : (item.id as any),
                slug: item.slug,
                name: item.name,
                description: item.summary || localMatch?.description || "",
                category:
                  typeof item.category === "object"
                    ? item.category.name
                    : item.category,
                agency:
                  typeof item.agency === "object"
                    ? item.agency.name
                    : item.agency,
                region:
                  typeof item.region === "object"
                    ? item.region.name
                    : item.region,
                availability:
                  (item as any).availability === "PAUSED" ? "paused" : "active",
                availabilityNote:
                  (item as any).paused_reason || (item as any).pausedReason,
              };
            });
          });
        }
      } catch (err) {
        console.warn("Sinkronisasi katalog layanan dari API:", err);
      }

      if (!account) return;

      if (account.role === "warga") {
        try {
          const appRes = await applicationsApi.getAll();
          if (alive && appRes?.data) {
            setRecords((prev) => {
              const remoteList = appRes.data;
              const remoteMap = new Map(remoteList.map((r) => [r.id, r]));
              return prev.map((local) => {
                const rem = remoteMap.get(local.id);
                if (rem) {
                  return {
                    ...local,
                    current_status: mapApiStatusToLocal(
                      rem.current_status,
                      local.current_status,
                    ),
                    internal_reference:
                      rem.internal_reference || local.internal_reference,
                  };
                }
                return local;
              });
            });
          }
        } catch (err) {
          console.warn("Sinkronisasi pengajuan warga dari API:", err);
        }
      } else if (account.role === "petugas") {
        try {
          const assignRes = await officerApi.getAssignments();
          if (alive && assignRes?.data) {
            setRecords((prev) => {
              const assignments = assignRes.data as any[];
              const assignMap = new Map(
                assignments.map((a) => [a.application_id || a.id, a]),
              );
              return prev.map((local) => {
                const rem = assignMap.get(local.id);
                if (rem) {
                  return {
                    ...local,
                    assigned_officer_id: account.id,
                    current_status: mapApiStatusToLocal(
                      rem.current_status,
                      local.current_status,
                    ),
                  };
                }
                return local;
              });
            });
          }
        } catch (err) {
          console.warn("Sinkronisasi penugasan petugas dari API:", err);
        }
      }
    }

    void syncFromApi();
    return () => {
      alive = false;
    };
  }, [isApiMode, account?.id, account?.role]);

  const showToast = (
    message: string,
    type: ToastNotice["type"] = "success",
  ) => {
    const id = Date.now() + Math.random();
    setToasts([{ id, message, type }]);
    timers.current.push(
      setTimeout(
        () =>
          setToasts((previous) => previous.filter((item) => item.id !== id)),
        4500,
      ),
    );
  };

  const ensure = (
    condition: boolean,
    message = "Akun ini tidak memiliki akses untuk tindakan tersebut.",
  ) => {
    if (!condition) throw new Error(message);
  };

  const applications = !account
    ? []
    : records.filter((record) =>
        user.role === "warga"
          ? record.owner_id === user.id
          : user.role === "petugas"
            ? record.assigned_officer_id === user.id
            : false,
      );

  const getPreparationReadiness = (prep: PreparationRecord) => {
    const svc =
      services.find((s) => s.id === prep.serviceId) ||
      selectedService ||
      DEFAULT_SERVICES[0];
    const linkedApp = applications.find(
      (app) =>
        app.id === prep.linkedApplicationId &&
        (!app.preparation_id || app.preparation_id === prep.id),
    );
    return computePreparationReadiness({
      familyMember: prep.familyMember,
      prepId: prep.id === "prep-draft-uninitialized" ? "" : prep.id,
      service: svc,
      conditionValue: prep.conditionKey,
      applicantTarget: prep.applicantTarget,
      needConfirmed: prep.needConfirmed,
      consentAccepted: prep.consentAccepted,
      formData: prep.formData,
      documents: prep.documents,
      inspections: prep.inspections,
      lastInspectionSnapshot: prep.lastInspectionSnapshot,
      adminRules,
      linkedApplicationId: linkedApp?.id || prep.linkedApplicationId,
      lastSubmittedDataSignature:
        linkedApp?.submitted_snapshot?.dataSignature ?? null,
      lastSubmittedDocSignature:
        linkedApp?.submitted_snapshot?.docSignature ?? null,
    });
  };

  const buildSubmissionSnapshot = (
    prep: PreparationRecord,
    svc: ServiceDetail,
    submissionVersion: number,
    submittedAt: string,
    citizenNote?: string,
    prevSnapshot?: SubmissionSnapshot | null,
  ): SubmissionSnapshot => {
    const condObj = getSelectedConditionOption(svc, prep.conditionKey);
    const currentSlots = documentSlots(svc, prep.conditionKey);
    const attachments: SubmittedAttachment[] = prep.documents
      .filter(
        (doc) =>
          doc.status === "TERUNGGAH" &&
          currentSlots.some(
            (slot) => slot.id === doc.id && slot.name === doc.name,
          ),
      )
      .map((doc) => ({
        id: doc.id,
        name: doc.name,
        fileName: doc.fileName,
        size: doc.size,
        fileType: doc.fileType,
        version: doc.version || 1,
        uploadedAt: doc.uploadedAt || submittedAt,
        qualityPreset: doc.qualityPreset || "user_file",
        previewKey: doc.previewKey,
        fixtureId: doc.fixtureId,
      }));
    const dataSignature = computeDataSignature(
      prep.conditionKey,
      prep.applicantTarget,
      prep.formData,
      prep.familyMember,
    );
    const docSignature = computeDocSignature(
      svc,
      prep.documents,
      prep.conditionKey,
    );

    const changesSummary: string[] = [];
    if (prevSnapshot) {
      if (
        JSON.stringify(prevSnapshot.familyMember) !==
        JSON.stringify(prep.familyMember)
      )
        changesSummary.push("Data anggota keluarga yang diurus diperbarui");
      if (prevSnapshot.conditionKey !== prep.conditionKey) {
        changesSummary.push(
          `Kondisi permohonan diubah menjadi "${condObj.label}"`,
        );
      }
      if (prevSnapshot.applicantTarget !== prep.applicantTarget) {
        changesSummary.push(
          `Subjek pengurusan diubah menjadi ${prep.applicantTarget === "anggota_keluarga" ? "Anggota keluarga" : "Diri sendiri"}`,
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
        if (
          (prevSnapshot.formData[key] || "").trim() !==
          (prep.formData[key] || "").trim()
        ) {
          changesSummary.push(`Data ${fieldLabels[key]} diperbarui`);
        }
      });

      attachments.forEach((att) => {
        const prevAtt = prevSnapshot.attachments.find(
          (item) => item.id === att.id || item.name === att.name,
        );
        if (!prevAtt) {
          changesSummary.push(
            `Menambahkan berkas ${att.name}: ${att.fileName} (v${att.version || 1})`,
          );
        } else if (
          prevAtt.fileName !== att.fileName ||
          (prevAtt.version || 1) !== (att.version || 1)
        ) {
          changesSummary.push(
            `Mengganti berkas ${att.name}: dari ${prevAtt.fileName} (v${prevAtt.version || 1}) menjadi ${att.fileName} (v${att.version || 1})`,
          );
        }
      });
      if (changesSummary.length === 0) {
        changesSummary.push(
          "Mengirim ulang data dan berkas untuk peninjauan ulang petugas",
        );
      }
    }

    return {
      submissionVersion,
      serviceSnapshot: structuredClone(svc),
      requiredSlots: documentSlots(svc, prep.conditionKey).filter(
        (slot) => slot.required,
      ),
      submittedAt,
      applicantTarget: prep.applicantTarget,
      conditionKey: prep.conditionKey,
      conditionLabel: condObj.label,
      familyMember: prep.familyMember ? { ...prep.familyMember } : undefined,
      formData: { ...prep.formData },
      attachments,
      dataSignature,
      docSignature,
      citizenNote: citizenNote?.trim() || undefined,
      changesSummary: changesSummary.length > 0 ? changesSummary : undefined,
    };
  };

  const readiness = getPreparationReadiness(activePreparation);

  const selectPreparation = (prepId: string) => {
    if (!prepId) return;
    const found = preparations.find(
      (p) => p.id === prepId && p.ownerId === user.id,
    );
    if (!found) return;
    if (activePrepId !== found.id) {
      setActivePrepId(found.id);
    }
    const svc = services.find((s) => s.id === found.serviceId);
    if (svc && selected.id !== svc.id) {
      setSelected(svc);
    }
  };

  const createPreparation = (
    options?: CreatePreparationOptions,
  ): PreparationRecord => {
    const svc = options?.service || selectedService || DEFAULT_SERVICES[0];
    ensure(
      svc.availability !== "paused",
      "Panduan sedang dikoreksi. Baca sumber layanan atau minta bantuan petugas.",
    );
    const region =
      options?.region || svc.region || selectedRegion || "Kota Contoh";
    const cond = options?.conditionKey || getSelectedConditionOption(svc).value;
    const target: ApplicantTarget = options?.applicantTarget || "diri_sendiri";
    const now = formatNow();

    const maxRefNum = preparations.reduce((max, item) => {
      const match = item.internalReference.match(/PREP-\d{4}-(\d+)/);
      const num = match ? parseInt(match[1], 10) : 0;
      return Math.max(max, isNaN(num) ? 0 : num);
    }, 0);
    const nextRefNum = Math.max(maxRefNum + 1, preparations.length + 1);
    const internalReference = `PREP-2026-${String(nextRefNum).padStart(4, "0")}`;
    const id = `prep-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    const newRecord: PreparationRecord = {
      id,
      internalReference,
      ownerId: user.id,
      serviceId: svc.id,
      serviceName: svc.name,
      region,
      agency: svc.agency,
      applicantTarget: target,
      conditionKey: cond,
      needConfirmed: Boolean(options?.needConfirmed),
      formData: {
        nama_lengkap: target === "diri_sendiri" && account ? account.name : "",
        nik: target === "diri_sendiri" && account ? account.nik : "",
        no_kk: "",
        telepon: account?.phone || "",
        alamat: "",
        alasan: "",
      },
      documents: [],
      consentAccepted: false,
      inspections: [],
      dataVersion: 1,
      lastInspectionSnapshot: null,
      linkedApplicationId: options?.linkedApplicationId,
      createdAt: now,
      updatedAt: now,
    };

    setPreparations((prev) => {
      const next = [newRecord, ...prev];
      if (account) {
        try {
          localStorage.setItem(scope + "preparations:v3", JSON.stringify(next));
          localStorage.setItem(
            scope + "active-prep-id:v1",
            JSON.stringify(newRecord.id),
          );
        } catch {
          // Handled by effect
        }
      }
      return next;
    });
    setActivePrepId(newRecord.id);
    setSelected(svc);
    return newRecord;
  };

  const createLinkedRevisionPreparation = (
    applicationId: string,
  ): PreparationRecord => {
    const appRecord = records.find(
      (r) => r.id === applicationId && r.owner_id === user.id,
    );
    ensure(
      Boolean(appRecord),
      "Pengajuan tidak ditemukan atau bukan milik akun ini.",
    );
    const svc =
      services.find((s) => s.id === appRecord!.service_id) ||
      DEFAULT_SERVICES[0];
    const condOpt = getSelectedConditionOption(svc).value;
    const now = formatNow();

    const maxRefNum = preparations.reduce((max, item) => {
      const match = item.internalReference.match(/PREP-\d{4}-(\d+)/);
      const num = match ? parseInt(match[1], 10) : 0;
      return Math.max(max, isNaN(num) ? 0 : num);
    }, 0);
    const nextRefNum = Math.max(maxRefNum + 1, preparations.length + 1);
    const internalReference =
      appRecord!.preparation_reference &&
      !preparations.some(
        (p) => p.internalReference === appRecord!.preparation_reference,
      )
        ? appRecord!.preparation_reference
        : `PREP-2026-${String(nextRefNum).padStart(4, "0")}`;
    const id = `prep-rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    const newPrep: PreparationRecord = {
      id,
      internalReference,
      ownerId: user.id,
      serviceId: svc.id,
      serviceName: svc.name,
      region: appRecord!.region || svc.region || selectedRegion,
      agency: appRecord!.agency || svc.agency,
      applicantTarget:
        appRecord!.submitted_snapshot?.applicantTarget ||
        appRecord!.applicant_target ||
        "diri_sendiri",
      familyMember: appRecord!.submitted_snapshot?.familyMember
        ? { ...appRecord!.submitted_snapshot.familyMember }
        : undefined,
      conditionKey: condOpt,
      needConfirmed: true,
      formData: appRecord!.submitted_snapshot
        ? { ...appRecord!.submitted_snapshot.formData }
        : {
            nama_lengkap: appRecord!.applicant_name || user.name || "",
            nik:
              appRecord!.applicant_nik &&
              /^\d{16}$/.test(appRecord!.applicant_nik)
                ? appRecord!.applicant_nik
                : user.nik || "",
            no_kk: "",
            telepon: user.phone || "",
            alamat: "",
            alasan: `Perbaikan berkas untuk pengajuan ${appRecord!.official_number}`,
          },
      documents: [],
      consentAccepted: false,
      inspections: [],
      dataVersion: 1,
      lastInspectionSnapshot: null,
      linkedApplicationId: appRecord!.id,
      createdAt: now,
      updatedAt: now,
    };

    setPreparations((prev) => [newPrep, ...prev]);
    setRecords((prev) =>
      prev.map((item) =>
        item.id !== appRecord!.id
          ? item
          : {
              ...item,
              preparation_id: newPrep.id,
              preparation_reference: newPrep.internalReference,
              updated_at: now,
            },
      ),
    );
    setActivePrepId(newPrep.id);
    setSelected(svc);
    showToast(
      `Draf perbaikan ${newPrep.internalReference} dibuat dan dikaitkan ke pengajuan ${appRecord!.official_number}.`,
      "info",
    );
    return newPrep;
  };

  const updateActivePreparation = (
    updater: (prev: PreparationRecord) => PreparationRecord,
    targetPrepId?: string,
  ) => {
    const idToUpdate = targetPrepId || activePreparation.id;
    if (!idToUpdate || idToUpdate === "prep-draft-uninitialized") {
      return;
    }
    setPreparations((prev) => {
      if (!prev.some((p) => p.id === idToUpdate && p.ownerId === user.id)) {
        return prev;
      }
      return prev.map((item) => {
        if (item.id !== idToUpdate || item.ownerId !== user.id) return item;
        const next = updater(item);
        const contentChanged =
          item.formData !== next.formData ||
          item.documents !== next.documents ||
          item.serviceId !== next.serviceId ||
          item.conditionKey !== next.conditionKey ||
          item.applicantTarget !== next.applicantTarget ||
          item.familyMember !== next.familyMember;
        return contentChanged ? { ...next, consentAccepted: false } : next;
      });
    });
  };

  const dismissMigrationNote = (prepId: string) => {
    // Hanya menutup catatan migrasi tanpa mengesahkan atau mengubah snapshot pemeriksaan lama
    updateActivePreparation(
      (prev) => ({ ...prev, migrationNote: undefined, updatedAt: formatNow() }),
      prepId,
    );
  };

  const saveGuestIntent = (intent: Omit<GuestPreparationIntent, "savedAt">) => {
    const payload: GuestPreparationIntent = {
      ...intent,
      savedAt: formatNow(),
    };
    setGuestIntent(payload);
    try {
      sessionStorage.setItem(GUEST_INTENT_KEY, JSON.stringify(payload));
    } catch {
      // Ignore sessionStorage errors
    }
  };

  const consumeGuestIntent = (): GuestPreparationIntent | null => {
    const current = readGuestIntent() || guestIntent;
    setGuestIntent(null);
    try {
      sessionStorage.removeItem(GUEST_INTENT_KEY);
    } catch {
      // Ignore
    }
    return current;
  };

  const toPreparationMeta = (prep: PreparationRecord): PreparationMeta => {
    const svc =
      services.find((s) => s.id === prep.serviceId) || DEFAULT_SERVICES[0];
    return {
      internalReference: prep.internalReference,
      serviceId: prep.serviceId,
      conditionKey: prep.conditionKey,
      applicantTarget: prep.applicantTarget,
      needConfirmed: prep.needConfirmed,
      started: true,
      dataVersion: prep.dataVersion,
      lastInspectedDataVersion:
        prep.lastInspectionSnapshot?.dataVersion ?? null,
      lastInspectedDataSignature:
        prep.lastInspectionSnapshot?.dataSignature ?? null,
      lastInspectedDocSignature:
        prep.lastInspectionSnapshot?.docSignature ?? null,
      lastInspectedAt: prep.lastInspectionSnapshot?.inspectedAt ?? null,
      lastInspectedGuideVersion: svc.version || 1,
      lastInspectedRuleCount: adminRules.filter((r) => r.active).length,
      consentAccepted: prep.consentAccepted,
      updatedAt: prep.updatedAt,
    };
  };

  const currentPrepMeta = toPreparationMeta(activePreparation);
  const prepMetaByService: Record<number, PreparationMeta> = {};
  preparations.forEach((p) => {
    if (!prepMetaByService[p.serviceId]) {
      prepMetaByService[p.serviceId] = toPreparationMeta(p);
    }
  });

  const officerUpdateApplication = (
    id: string,
    status: ApplicationStatusCode,
    note: string,
  ) => {
    const record = records.find((item) => item.id === id);
    ensure(user.role === "petugas" && record?.assigned_officer_id === user.id);
    ensure(
      !!record &&
        allowedStatusTransitions[record.current_status].includes(status),
      "Pilih perubahan status yang sesuai dengan tahap tinjauan.",
    );
    ensure(
      note.trim().length >= 5 && note.trim().length <= 2000,
      "Tulis catatan antara 5 dan 2.000 karakter.",
    );
    const nextActionMap: Partial<Record<ApplicationStatusCode, string>> = {
      VERIFIKASI:
        "Petugas sedang meninjau kelengkapan dan kesesuaian berkas. Pantau pembaruan berikutnya pada linimasa ini.",
      PERLU_PERBAIKAN:
        "Buka ruang persiapan untuk memperbaiki data atau mengganti dokumen sesuai catatan petugas, lalu kirim perbaikan untuk ditinjau ulang.",
      DIPROSES: "Berkas sedang dalam pemeriksaan lanjutan petugas pendamping.",
      SELESAI:
        "Tinjauan awal selesai. Lanjutkan pengajuan melalui kanal resmi instansi (loket Disdukcapil, MPP, atau portal resmi daerah) dan catat nomor tanda terima resmi bila sudah diajukan.",
    };
    const now = formatNow();
    setRecords((previous) =>
      previous.map((item) =>
        item.id !== id
          ? item
          : {
              ...item,
              current_status: status,
              revision_pending: false,
              updated_at: now,
              events: [
                ...item.events.map((event) => ({ ...event, current: false })),
                {
                  id: Date.now(),
                  status,
                  title: statusLabels[status],
                  time: now,
                  source: user.name + " · petugas contoh (simulasi)",
                  source_type: "officer",
                  notes: note.trim(),
                  next_action: nextActionMap[status],
                  completed: true,
                  current: true,
                },
              ],
            },
      ),
    );
    showToast("Status tinjauan diperbarui.");
  };

  const assignReviewOfficer = async (
    id: string,
    officerId: string,
    reason: string,
  ) => {
    const record = records.find((item) => item.id === id);
    ensure(user.role === "admin", "Hanya admin yang dapat mengubah penugasan.");
    const officer = mockAuth
      .listAccounts()
      .find(
        (item) =>
          item.id === officerId &&
          item.role === "petugas" &&
          item.active !== false,
      );
    ensure(Boolean(officer) || isApiMode, "Pilih petugas yang aktif.");
    ensure(
      Boolean(record) &&
        record!.current_status !== "DICATAT_WARGA" &&
        !["SELESAI", "DITARIK", "HASIL_DITERIMA_WARGA"].includes(
          record!.current_status,
        ),
      "Penugasan hanya tersedia untuk tinjauan yang masih aktif.",
    );
    ensure(
      record!.assigned_officer_id !== officerId,
      "Permintaan sudah ditugaskan kepada petugas ini.",
    );
    ensure(
      reason.trim().length >= 10,
      "Tuliskan alasan penugasan minimal 10 karakter.",
    );

    if (isApiMode) {
      await adminApi.assignReviewOfficer(id, officerId, reason.trim());
    }

    const now = formatNow();
    setRecords((previous) =>
      previous.map((item) =>
        item.id !== id
          ? item
          : {
              ...item,
              assigned_officer_id: officerId,
              current_status:
                item.current_status === "VERIFIKASI" ||
                item.current_status === "DIPROSES"
                  ? "DITERIMA"
                  : item.current_status,
              updated_at: now,
              events: [
                ...item.events.map((event) => ({ ...event, current: false })),
                {
                  id: Date.now(),
                  status:
                    item.current_status === "VERIFIKASI" ||
                    item.current_status === "DIPROSES"
                      ? "DITERIMA"
                      : item.current_status,
                  title: "Penugasan petugas diperbarui",
                  time: now,
                  source: user.name + " · Admin",
                  source_type: "admin",
                  notes: `Ditugaskan kepada ${officer!.name}. Alasan: ${reason.trim()}`,
                  next_action:
                    item.current_status === "PERLU_PERBAIKAN" &&
                    !item.revision_pending
                      ? "Warga melanjutkan perbaikan sesuai catatan yang sudah diberikan."
                      : "Petugas yang ditugaskan memulai tinjauan kiriman aktif.",
                  completed: true,
                  current: true,
                },
              ],
            },
      ),
    );
    showToast("Penugasan petugas diperbarui.");
  };

  const officerStartReview = async (id: string, note?: string) => {
    const record = records.find((item) => item.id === id);
    ensure(
      user.role === "petugas" && (record?.assigned_officer_id === user.id || isApiMode),
      "Hanya petugas yang ditugaskan yang dapat memulai tinjauan ini.",
    );
    ensure(
      record!.current_status === "DITERIMA" ||
        record!.current_status === "DIPROSES" ||
        (record!.current_status === "PERLU_PERBAIKAN" &&
          Boolean(record!.revision_pending)),
      "Permintaan ini sudah dalam tahap tinjauan atau telah selesai.",
    );
    const now = formatNow();
    const cleanNote =
      note?.trim() ||
      (record!.revision_pending
        ? "Petugas mulai meninjau ulang berkas dan data perbaikan yang dikirim warga."
        : "Petugas mulai memeriksa kelengkapan berkas, keterbacaan dokumen, dan kesesuaian data formulir.");

    if (isApiMode) {
      await officerApi.recordEvent(id, {
        event_type: "status_changed",
        status: "verification",
        note: cleanNote,
      });
    }
    setRecords((previous) =>
      previous.map((item) =>
        item.id !== id
          ? item
          : {
              ...item,
              current_status: "VERIFIKASI",
              revision_pending: false,
              updated_at: now,
              events: [
                ...item.events.map((event) => ({ ...event, current: false })),
                {
                  id: Date.now(),
                  status: "VERIFIKASI",
                  title: "Sedang ditinjau petugas",
                  time: now,
                  source: user.name + " · petugas contoh (simulasi)",
                  source_type: "officer",
                  notes: cleanNote,
                  next_action:
                    "Petugas sedang memeriksa berkas yang Anda kirim. Pantau hasil tinjauan pada halaman ini.",
                  completed: true,
                  current: true,
                },
              ],
            },
      ),
    );
    showToast("Status diubah menjadi Sedang ditinjau.");
  };

  const officerRequestRevision = async (
    id: string,
    detail: {
      targetItem: string;
      issueCategory: OfficerIssueCategory;
      problemDescription: string;
      requiredAction: string;
    },
    itemAssessments?: OfficerItemAssessment[],
  ) => {
    const record = records.find((item) => item.id === id);
    ensure(
      record?.escalation?.status !== "pending",
      "Tunggu klarifikasi admin sebelum mengirim keputusan.",
    );
    ensure(
      user.role === "petugas" && (record?.assigned_officer_id === user.id || isApiMode),
      "Hanya petugas yang ditugaskan yang dapat meminta perbaikan.",
    );
    ensure(
      record!.current_status === "VERIFIKASI",
      "Permintaan perbaikan hanya dapat dikirim setelah petugas memulai tinjauan (status: Sedang ditinjau). Klik 'Mulai tinjauan sekarang' terlebih dahulu.",
    );
    ensure(
      detail.targetItem.trim().length >= 2,
      "Pilih atau tulis dokumen / bagian data yang perlu diperbaiki.",
    );
    ensure(
      detail.problemDescription.trim().length >= 5,
      "Jelaskan alasan atau masalah yang ditemukan minimal 5 karakter.",
    );
    ensure(
      detail.requiredAction.trim().length >= 5,
      "Tuliskan tindakan perbaikan yang harus dilakukan warga minimal 5 karakter.",
    );
    const issues = (itemAssessments || []).filter(
      (item) => item.verdict !== "sesuai",
    );
    ensure(
      issues.length > 0,
      "Tandai bagian yang perlu diperbaiki atau belum dapat diperiksa.",
    );
    ensure(
      issues.every((item) => (item.note || "").trim().length >= 5),
      "Isi masalah dan perbaikan pada setiap bagian yang belum sesuai, minimal 5 karakter.",
    );

    const now = formatNow();
    const categoryLabel =
      OFFICER_ISSUE_CATEGORY_LABELS[detail.issueCategory] ||
      detail.issueCategory;
    const fullDetail: OfficerRevisionDetail = {
      targetItem: detail.targetItem.trim(),
      issueCategory: detail.issueCategory,
      issueCategoryLabel: categoryLabel,
      problemDescription: detail.problemDescription.trim(),
      requiredAction: detail.requiredAction.trim(),
      requestedBy: user.name + " · Petugas Tinjauan Contoh (Simulasi)",
      officerName: user.name,
      requestedAt: now,
    };

    const currentSubmissionVersion =
      record!.submitted_snapshot?.submissionVersion || 1;
    const evaluation: OfficerSubmissionEvaluation = {
      submissionVersion: currentSubmissionVersion,
      decision: "PERLU_PERBAIKAN",
      summaryNote: `[${categoryLabel} — ${fullDetail.targetItem}] ${fullDetail.problemDescription}`,
      evaluatedBy: user.name,
      evaluatedById: user.id,
      evaluatedAt: now,
      itemAssessments: itemAssessments || [],
      revisionDetail: fullDetail,
    };

    if (isApiMode) {
      const mappedItems = (itemAssessments || []).map((item) => ({
        item_type: (item.itemId === "form_data" ? "FORM_DATA" : "DOCUMENT") as "FORM_DATA" | "DOCUMENT",
        item_id: item.itemId,
        verdict: (item.verdict === "sesuai" ? "SESUAI" : item.verdict === "perlu_perbaikan" ? "PERLU_PERBAIKAN" : "BELUM_DAPAT_DIPERIKSA") as any,
        note: item.note || detail.problemDescription,
      }));
      await officerApi.submitDecision(id, {
        decision: "revision_requested",
        overall_notes: `[${categoryLabel} — ${fullDetail.targetItem}] ${fullDetail.problemDescription}. Tindakan: ${fullDetail.requiredAction}`,
        items: mappedItems.length > 0 ? mappedItems : [
          {
            item_type: "DOCUMENT",
            item_id: detail.targetItem,
            verdict: "PERLU_PERBAIKAN",
            note: detail.problemDescription,
          },
        ],
      });
    }

    setRecords((previous) =>
      previous.map((item) =>
        item.id !== id
          ? item
          : {
              ...item,
              current_status: "PERLU_PERBAIKAN",
              revision_pending: false,
              latest_revision_detail: fullDetail,
              latest_evaluation: evaluation,
              evaluation_history: [
                ...(item.evaluation_history || []),
                evaluation,
              ],
              updated_at: now,
              events: [
                ...item.events.map((event) => ({ ...event, current: false })),
                {
                  id: Date.now(),
                  status: "PERLU_PERBAIKAN",
                  title: `Perlu perbaikan (Kiriman #${currentSubmissionVersion}) · ${fullDetail.targetItem}`,
                  time: now,
                  source: user.name + " · petugas contoh (simulasi)",
                  source_type: "officer",
                  notes: `[${categoryLabel} — ${fullDetail.targetItem}] ${fullDetail.problemDescription}`,
                  next_action: fullDetail.requiredAction,
                  revision_detail: fullDetail,
                  completed: true,
                  current: true,
                },
              ],
            },
      ),
    );
    showToast("Permintaan perbaikan berhasil dikirim ke warga.");
  };

  const officerCompleteReview = async (
    id: string,
    note: string,
    itemAssessments: OfficerItemAssessment[],
  ) => {
    const record = records.find((item) => item.id === id);
    ensure(
      record?.escalation?.status !== "pending",
      "Tunggu klarifikasi admin sebelum mengirim keputusan.",
    );
    ensure(
      user.role === "petugas" && (record?.assigned_officer_id === user.id || isApiMode),
      "Hanya petugas yang ditugaskan yang dapat menyelesaikan tinjauan ini.",
    );
    ensure(
      record!.current_status === "VERIFIKASI",
      "Penyelesaian tinjauan hanya tersedia setelah masuk tahap 'Sedang ditinjau'. Tekan 'Mulai tinjauan sekarang' terlebih dahulu.",
    );
    ensure(
      note.trim().length >= 5,
      "Tuliskan catatan hasil tinjauan awal minimal 5 karakter.",
    );

    const currentAttachments =
      record!.submitted_snapshot?.attachments || record!.attachments || [];
    const required = record!.submitted_snapshot?.requiredSlots;
    ensure(
      !required ||
        required.every((slot) =>
          currentAttachments.some((att) => att.id === slot.id),
        ),
      "Masih ada dokumen wajib pada acuan kiriman yang belum dilampirkan. Minta perbaikan terlebih dahulu.",
    );

    const formAssessment = itemAssessments.find(
      (a) => a.itemId === "form_data",
    );
    ensure(
      Boolean(formAssessment && formAssessment.verdict === "sesuai"),
      "Data pemohon harus dinilai eksplisit sebagai 'Sesuai' sebelum menyelesaikan tinjauan awal.",
    );

    currentAttachments.forEach((att, idx) => {
      const attId = att.id || `att-${idx}`;
      const available = isDocumentContentAvailable(att);
      ensure(
        available,
        `Berkas "${att.name}" (${att.fileName}) tidak tersedia di penyimpanan sehingga tidak dapat ditandai 'Sesuai' dan tidak dapat meloloskan penyelesaian tinjauan.`,
      );
      const docAssessment = itemAssessments.find((a) => a.itemId === attId);
      ensure(
        Boolean(docAssessment && docAssessment.verdict === "sesuai"),
        `Berkas "${att.name}" harus dinilai eksplisit sebagai 'Sesuai' sebelum menyelesaikan tinjauan awal.`,
      );
    });

    const now = formatNow();
    const currentSubmissionVersion =
      record!.submitted_snapshot?.submissionVersion || 1;
    const evaluation: OfficerSubmissionEvaluation = {
      submissionVersion: currentSubmissionVersion,
      decision: "SELESAI",
      summaryNote: note.trim(),
      evaluatedBy: user.name,
      evaluatedById: user.id,
      evaluatedAt: now,
      itemAssessments,
    };

    const itemsSummaryText = itemAssessments
      .map(
        (a) =>
          `${a.itemName}: ${OFFICER_ITEM_VERDICT_LABELS[a.verdict] || a.verdict}`,
      )
      .join(" · ");

    if (isApiMode) {
      const mappedItems = itemAssessments.map((a) => ({
        item_type: (a.itemId === "form_data" ? "FORM_DATA" : "DOCUMENT") as "FORM_DATA" | "DOCUMENT",
        item_id: a.itemId,
        verdict: "SESUAI" as const,
        note: a.note || note.trim(),
      }));
      await officerApi.submitDecision(id, {
        decision: "approved_for_submission",
        overall_notes: note.trim(),
        items: mappedItems,
      });
    }

    setRecords((previous) =>
      previous.map((item) =>
        item.id !== id
          ? item
          : {
              ...item,
              current_status: "SELESAI",
              revision_pending: false,
              latest_evaluation: evaluation,
              evaluation_history: [
                ...(item.evaluation_history || []),
                evaluation,
              ],
              updated_at: now,
              events: [
                ...item.events.map((event) => ({ ...event, current: false })),
                {
                  id: Date.now(),
                  status: "SELESAI",
                  title: `Tinjauan awal selesai (Kiriman #${currentSubmissionVersion})`,
                  time: now,
                  source: user.name + " · petugas contoh (simulasi)",
                  source_type: "officer",
                  notes: `${note.trim()} (Penilaian item Kiriman #${currentSubmissionVersion}: ${itemsSummaryText}). Catatan: Penyelesaian tinjauan pendamping ini tidak berarti instansi pemerintah telah menerima pengajuan resmi.`,
                  next_action:
                    "Persiapan Anda telah selesai ditinjau petugas pendamping. Ajukan berkas melalui kanal resmi instansi (loket Disdukcapil, MPP, atau portal resmi daerah) dan catat nomor tanda terima resmi bila sudah diajukan.",
                  completed: true,
                  current: true,
                },
              ],
            },
      ),
    );
    showToast("Tinjauan awal diselesaikan.");
  };

  const recordOfficialSubmission = (
    id: string,
    officialNumber: string,
    channel: string,
    note?: string,
  ) => {
    const record = records.find((item) => item.id === id);
    ensure(
      user.role === "warga" && record?.owner_id === user.id,
      "Permintaan tidak ditemukan atau bukan milik akun ini.",
    );
    const cleanChannel = channel.trim() || "Loket / Kanal Resmi Instansi";
    const cleanNum = officialNumber.trim();
    const now = formatNow();

    setRecords((previous) =>
      previous.map((item) =>
        item.id !== id
          ? item
          : {
              ...item,
              official_number: cleanNum || item.official_number,
              official_number_source: cleanNum
                ? "citizen_reported"
                : item.official_number_source,
              official_submission: {
                status:
                  item.official_submission?.status === "HASIL_DITERIMA_WARGA" ||
                  item.official_submission?.resultReceivedAt
                    ? "HASIL_DITERIMA_WARGA"
                    : "DIAJUKAN_WARGA",
                recordedAt: now,
                channel: cleanChannel,
                officialNumber:
                  cleanNum || "Belum diterbitkan (Dilaporkan warga)",
                officialReceiptNumber: cleanNum || undefined,
                officialNumberSource: cleanNum
                  ? "citizen_reported"
                  : "not_provided",
                note: note?.trim() || undefined,
                resultReceivedAt: item.official_submission?.resultReceivedAt,
                resultNote: item.official_submission?.resultNote,
                sourceLabel: "Dilaporkan warga",
              },
              updated_at: now,
              events: [
                ...item.events,
                {
                  id: Date.now(),
                  status: item.current_status,
                  title: "Pengajuan di kanal resmi instansi (Dilaporkan warga)",
                  time: now,
                  source: user.name + " · Dilaporkan warga",
                  source_type: "citizen",
                  notes:
                    `Diajukan melalui ${cleanChannel}` +
                    (cleanNum
                      ? ` dengan nomor tanda terima resmi ${cleanNum}. `
                      : ". ") +
                    (note?.trim() ||
                      "Catatan mandiri warga untuk memantau proses di kanal resmi instansi."),
                  next_action:
                    "Pantau proses resmi di kanal instansi. Setelah dokumen resmi diterbitkan oleh instansi, Anda dapat mengonfirmasi penerimaan hasil.",
                  completed: true,
                  current: false,
                },
              ],
            },
      ),
    );
    showToast(
      "Catatan pengajuan di kanal resmi instansi (Dilaporkan warga) berhasil disimpan.",
    );
  };

  const addCitizenNote = async (id: string, note: string) => {
    const record = records.find((item) => item.id === id);
    ensure(user.role === "warga" && record?.owner_id === user.id);
    ensure(
      note.trim().length > 0 && note.trim().length <= 2000,
      "Tulis catatan maksimal 2.000 karakter.",
    );

    if (isApiMode) {
      await applicationsApi.addCitizenNote(id, note.trim());
    }

    const now = formatNow();
    setRecords((previous) =>
      previous.map((item) =>
        item.id !== id
          ? item
          : {
              ...item,
              updated_at: now,
              events: [
                ...item.events,
                {
                  id: Date.now(),
                  status: item.current_status,
                  title: "Catatan warga (Dilaporkan warga)",
                  time: now,
                  source: user.name + " · Dilaporkan warga",
                  source_type: "citizen",
                  notes: note.trim(),
                  completed: true,
                  current: false,
                },
              ],
            },
      ),
    );
    showToast("Catatan warga tersimpan.");
  };

  const confirmApplicationResult = async (
    id: string,
    note?: string,
    channel?: string,
  ) => {
    const record = records.find((item) => item.id === id);
    ensure(
      user.role === "warga" &&
        record?.owner_id === user.id &&
        (record?.current_status === "SELESAI" ||
          record?.mode === "citizen" ||
          Boolean(record?.official_submission)),
      "Konfirmasi penerimaan hasil hanya tersedia setelah tinjauan awal selesai atau pengajuan kanal resmi dicatat.",
    );
    ensure(
      !record!.official_submission?.resultReceivedAt &&
        record!.official_submission?.status !== "HASIL_DITERIMA_WARGA",
      "Penerimaan hasil sudah dicatat.",
    );
    const resultChannel =
      record!.official_submission?.channel || channel?.trim();
    ensure(
      Boolean(resultChannel && resultChannel.length >= 3),
      "Tuliskan kanal resmi tempat menerima hasil layanan.",
    );
    const now = formatNow();
    const cleanResultNote =
      note?.trim() ||
      "Warga mengonfirmasi telah menerima dokumen hasil dari kanal resmi instansi.";

    if (isApiMode) {
      await applicationsApi.confirmResultReceived(id, cleanResultNote);
    }

    setRecords((previous) =>
      previous.map((item) => {
        if (item.id !== id) return item;
        // Pisahkan status tinjauan pendamping (current_status tetap SELESAI pada mode tinjauan petugas)
        // dengan status konfirmasi hasil layanan pemerintah (official_submission.status = HASIL_DITERIMA_WARGA).
        const isCompanionReview =
          Boolean(item.assigned_officer_id) || item.mode !== "citizen";
        const nextCompanionStatus: ApplicationStatusCode = isCompanionReview
          ? item.current_status
          : "HASIL_DITERIMA_WARGA";

        return {
          ...item,
          current_status: nextCompanionStatus,
          official_submission: {
            status: "HASIL_DITERIMA_WARGA",
            recordedAt: item.official_submission?.recordedAt || now,
            channel: resultChannel!,
            officialNumber:
              item.official_submission?.officialNumber ||
              item.official_number ||
              "Belum dicatat (Dilaporkan warga)",
            officialReceiptNumber:
              item.official_submission?.officialReceiptNumber ||
              item.official_number ||
              undefined,
            officialNumberSource:
              item.official_submission?.officialNumberSource ||
              "citizen_reported",
            note: item.official_submission?.note,
            resultReceivedAt: now,
            resultNote: cleanResultNote,
            sourceLabel: "Dilaporkan warga",
          },
          updated_at: now,
          events: [
            ...item.events,
            {
              id: Date.now(),
              status: nextCompanionStatus,
              title: "Hasil layanan instansi diterima (Dilaporkan warga)",
              time: now,
              source: user.name + " · Dilaporkan warga",
              source_type: "citizen",
              notes: cleanResultNote,
              next_action:
                "Hasil layanan resmi telah dicatat diterima oleh warga. Status tinjauan awal pendamping tetap terjaga secara terpisah.",
              completed: true,
              current: !isCompanionReview,
            },
          ],
        };
      }),
    );
    showToast(
      "Penerimaan hasil layanan resmi berhasil dicatat (Dilaporkan warga).",
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        services,
        saveService: (service) => {
          ensure(user.role === "admin");
          setServices((previous) =>
            previous.map((item) => (item.id === service.id ? service : item)),
          );
          showToast("Panduan diterbitkan.");
        },
        selectedService,
        setSelectedService: (service) => {
          setSelected(service);
          try {
            localStorage.setItem(
              "daftarin:selected-service:v1",
              JSON.stringify(service),
            );
          } catch {
            setStorageUnavailable(true);
          }
        },
        selectedRegion,
        setSelectedRegion: (region) => setSelectedRegionState(region),
        conditionKey: activePreparation.conditionKey,
        setConditionKey: (nextCondition) => {
          updateActivePreparation((prev) => {
            if (prev.conditionKey === nextCondition) return prev;
            return {
              ...prev,
              conditionKey: nextCondition,
              dataVersion: prev.dataVersion + 1,
              updatedAt: formatNow(),
            };
          });
        },
        preparations,
        activePreparation,
        selectPreparation,
        manageDraft: (id, action) => {
          const prep = preparations.find(
            (item) => item.id === id && item.ownerId === user.id,
          );
          ensure(
            user.role === "warga" && Boolean(prep),
            "Persiapan tidak tersedia.",
          );
          const linked =
            records.some((item) => item.preparation_id === id) ||
            Boolean(prep!.linkedApplicationId);
          ensure(
            action !== "delete" || !linked,
            "Persiapan yang pernah dikirim hanya dapat diarsipkan agar riwayat tetap tersedia.",
          );
          setPreparations((previous) =>
            action === "delete"
              ? previous.filter((item) => item.id !== id)
              : previous.map((item) =>
                  item.id !== id
                    ? item
                    : {
                        ...item,
                        archivedAt:
                          action === "archive"
                            ? new Date().toISOString()
                            : undefined,
                      },
                ),
          );
          if (activePrepId === id && action !== "restore")
            setActivePrepId(
              preparations.find((item) => item.id !== id && !item.archivedAt)
                ?.id || "",
            );
          if (action === "delete")
            void deleteDraftFiles(id).catch(() =>
              showToast(
                "Draf dihapus, tetapi salinan berkas belum dapat dibersihkan. Gunakan pembersihan perangkat setelah menutup tab lain.",
                "error",
              ),
            );
          showToast(
            action === "delete"
              ? "Draf dihapus."
              : action === "restore"
                ? "Persiapan dipulihkan."
                : "Persiapan diarsipkan.",
          );
        },
        withdrawReview: async (id, reason) => {
          const record = records.find((item) => item.id === id);
          ensure(
            user.role === "warga" && record?.owner_id === user.id,
            "Permintaan tidak tersedia.",
          );
          ensure(
            ["DITERIMA", "VERIFIKASI", "DIPROSES", "PERLU_PERBAIKAN"].includes(
              record!.current_status,
            ) && !record!.official_submission,
            "Penarikan hanya berlaku untuk tinjauan pendamping aktif, sebelum pengajuan resmi dicatat.",
          );
          ensure(
            reason.trim().length >= 5,
            "Tuliskan alasan penarikan minimal 5 karakter.",
          );

          if (isApiMode) {
            await applicationsApi.withdraw(id, reason.trim());
          }

          const now = formatNow();
          setRecords((previous) =>
            previous.map((item) =>
              item.id !== id
                ? item
                : {
                    ...item,
                    current_status: "DITARIK",
                    revision_pending: false,
                    updated_at: now,
                    events: [
                      ...item.events.map((event) => ({
                        ...event,
                        current: false,
                      })),
                      {
                        id: Date.now(),
                        status: "DITARIK",
                        title: "Permintaan tinjauan ditarik warga",
                        time: now,
                        source: user.name,
                        source_type: "citizen",
                        notes: reason.trim(),
                        completed: true,
                        current: true,
                      },
                    ],
                  },
            ),
          );
          showToast(
            "Tinjauan ditarik. Riwayat tetap tersimpan; ini tidak membatalkan pengajuan di instansi.",
          );
        },
        escalateReview: (id, ticketId, reason) => {
          const record = records.find((item) => item.id === id);
          ensure(
            user.role === "petugas" && record?.assigned_officer_id === user.id,
            "Permintaan tidak ditugaskan kepadamu.",
          );
          ensure(
            !["SELESAI", "DITARIK", "HASIL_DITERIMA_WARGA"].includes(
              record!.current_status,
            ),
            "Tinjauan sudah ditutup.",
          );
          setRecords((previous) =>
            previous.map((item) =>
              item.id !== id
                ? item
                : {
                    ...item,
                    escalation: { ticketId, reason, status: "pending" },
                  },
            ),
          );
          showToast("Klarifikasi disimpan untuk admin.");
        },
        resolveReviewEscalation: (id, answer) => {
          ensure(
            user.role === "admin",
            "Hanya admin yang dapat menjawab klarifikasi.",
          );
          setRecords((previous) =>
            previous.map((item) =>
              item.id !== id || !item.escalation
                ? item
                : {
                    ...item,
                    escalation: {
                      ...item.escalation,
                      status: "resolved",
                      answer,
                    },
                  },
            ),
          );
        },
        setServiceAvailability: (id, paused, reason) => {
          ensure(
            user.role === "admin",
            "Hanya admin yang dapat mengatur panduan.",
          );
          ensure(
            reason.trim().length >= 10,
            "Jelaskan alasan minimal 10 karakter.",
          );
          setServices((previous) =>
            previous.map((item) =>
              item.id !== id
                ? item
                : {
                    ...item,
                    availability: paused ? "paused" : "active",
                    availabilityNote: reason.trim(),
                  },
            ),
          );
          showToast(
            paused
              ? "Persiapan baru dijeda. Riwayat tetap tersedia."
              : "Persiapan layanan diaktifkan kembali.",
          );
        },
        createPreparation,
        createLinkedRevisionPreparation,
        dismissMigrationNote,
        getPreparationReadiness,
        guestIntent,
        saveGuestIntent,
        consumeGuestIntent,
        preparationMeta: currentPrepMeta,
        prepMetaByService,
        confirmNeedStep: (
          target,
          nextCondition,
          serviceOverride,
          familyMember,
        ) => {
          ensure(
            target !== "anggota_keluarga" || Boolean(familyMember?.name),
            "Pilih anggota keluarga yang diurus.",
          );
          const targetSvc =
            serviceOverride ||
            services.find((s) => s.id === activePreparation.serviceId) ||
            selectedService;
          ensure(
            target !== "anggota_keluarga" ||
              familyMember?.authorization?.scope === "persiapan_dan_tinjauan",
            "Konfirmasikan kewenangan pendampingan sebelum melanjutkan.",
          );
          updateActivePreparation((prev) => {
            const changed =
              prev.serviceId !== targetSvc.id ||
              prev.conditionKey !== nextCondition ||
              prev.applicantTarget !== target ||
              JSON.stringify(prev.familyMember) !==
                JSON.stringify(familyMember);
            return {
              ...prev,
              serviceId: targetSvc.id,
              serviceName: targetSvc.name,
              region: targetSvc.region || selectedRegion,
              agency: targetSvc.agency,
              needConfirmed: true,
              applicantTarget: target,
              familyMember:
                target === "anggota_keluarga" && familyMember
                  ? { ...familyMember }
                  : undefined,
              formData:
                changed && target === "anggota_keluarga" && familyMember
                  ? {
                      ...prev.formData,
                      nama_lengkap:
                        targetSvc.id === 3 ? user.name : familyMember.name,
                      nik:
                        targetSvc.id === 3 ? user.nik || "" : familyMember.nik,
                    }
                  : changed && prev.applicantTarget !== target
                    ? {
                        ...prev.formData,
                        nama_lengkap: user.name,
                        nik: user.nik || "",
                      }
                    : prev.formData,
              conditionKey: nextCondition,
              dataVersion:
                changed && prev.needConfirmed
                  ? prev.dataVersion + 1
                  : prev.dataVersion,
              updatedAt: formatNow(),
            };
          });
          setSelected(targetSvc);
        },
        startPreparation: (service, initialCondition, options) => {
          setSelected(service);
          try {
            localStorage.setItem(
              "daftarin:selected-service:v1",
              JSON.stringify(service),
            );
          } catch {
            setStorageUnavailable(true);
          }
          const cond =
            initialCondition || getSelectedConditionOption(service).value;

          if (options?.createNew !== false) {
            return createPreparation({
              service,
              region: service.region || selectedRegion,
              conditionKey: cond,
              applicantTarget: options?.applicantTarget || "diri_sendiri",
              needConfirmed: options?.needConfirmed || false,
            });
          }

          const existing = preparations.find((p) => p.serviceId === service.id);
          if (existing) {
            setActivePrepId(existing.id);
            return existing;
          }
          return createPreparation({
            service,
            region: service.region || selectedRegion,
            conditionKey: cond,
            applicantTarget: options?.applicantTarget || "diri_sendiri",
            needConfirmed: options?.needConfirmed || false,
          });
        },
        readiness,
        setConsentAccepted: (accepted) => {
          updateActivePreparation((prev) => {
            if (prev.consentAccepted === accepted) return prev;
            return {
              ...prev,
              consentAccepted: accepted,
              updatedAt: formatNow(),
            };
          });
        },
        formData: activePreparation.formData,
        setFormData: (value) => {
          updateActivePreparation((prev) => {
            const nextForm =
              typeof value === "function" ? value(prev.formData) : value;
            return {
              ...prev,
              formData: nextForm,
              dataVersion: prev.dataVersion + 1,
              updatedAt: formatNow(),
            };
          });
        },
        updateFormField: (key, value) => {
          if (activePreparation.formData[key] === value) return;
          updateActivePreparation((prev) => ({
            ...prev,
            formData: { ...prev.formData, [key]: value },
            dataVersion: prev.dataVersion + 1,
            updatedAt: formatNow(),
          }));
        },
        loadDemoFormData: () => {
          const svc =
            services.find((s) => s.id === activePreparation.serviceId) ||
            selectedService;
          const option = getSelectedConditionOption(
            svc,
            activePreparation.conditionKey,
          );
          const isFamily =
            activePreparation.applicantTarget === "anggota_keluarga" &&
            svc.id !== 3;
          updateActivePreparation((prev) => ({
            ...prev,
            formData: {
              nama_lengkap: isFamily
                ? activePreparation.familyMember?.name ||
                  "Bima Contoh (Anggota Keluarga)"
                : user.name === "Pengunjung"
                  ? "Ayu Contoh"
                  : user.name,
              nik: isFamily
                ? activePreparation.familyMember?.nik || "3275011505150002"
                : user.nik && /^\d{16}$/.test(user.nik)
                  ? user.nik
                  : "0000000000000001",
              no_kk: "3275010908120005",
              telepon: user.phone || "080000000001",
              alamat: "Jl. Merdeka No. 12, RT 04/RW 02, Kota Contoh",
              alasan: `${option.label} — seluruh dokumen pendukung telah disiapkan sesuai kondisi permohonan.`,
            },
            dataVersion: prev.dataVersion + 1,
            updatedAt: formatNow(),
          }));
          showToast("Data pemohon contoh diisi dan disimpan ke draf ini.");
        },
        documents: activePreparation.documents,
        addDocument: (document, targetPrepId) => {
          const now = formatNow();
          updateActivePreparation((prev) => {
            const existing = prev.documents.find(
              (item) => item.id === document.id,
            );
            const nextVersion = existing ? (existing.version || 1) + 1 : 1;
            const enriched: DocumentItem = {
              ...document,
              version: document.version ?? nextVersion,
              uploadedAt: now,
              qualityPreset: document.qualityPreset || "user_file",
            };
            return {
              ...prev,
              documents: [
                ...prev.documents.filter((item) => item.id !== document.id),
                enriched,
              ],
              updatedAt: now,
            };
          }, targetPrepId);
        },
        removeDocument: (id) => {
          const now = formatNow();
          updateActivePreparation((prev) => ({
            ...prev,
            documents: prev.documents.filter((item) => item.id !== id),
            updatedAt: now,
          }));
          showToast(
            "Dokumen dihapus dari draf ini. Hasil pemeriksaan sebelumnya perlu diperbarui.",
            "info",
          );
        },
        updateDocumentStatus: (id, status) =>
          updateActivePreparation((prev) => ({
            ...prev,
            documents: prev.documents.map((item) =>
              item.id === id ? { ...item, status } : item,
            ),
            updatedAt: formatNow(),
          })),
        loadSampleDocuments: (mode, targetPrepId) => {
          const now = formatNow();
          const targetPrepObj = targetPrepId
            ? preparations.find((p) => p.id === targetPrepId) ||
              activePreparation
            : activePreparation;
          const svc =
            services.find((s) => s.id === targetPrepObj.serviceId) ||
            selectedService;
          const slots = documentSlots(svc, targetPrepObj.conditionKey);
          updateActivePreparation((prev) => {
            const otherDocs = prev.documents.filter(
              (item) => !slots.some((slot) => slot.id === item.id),
            );
            const nextDocs: DocumentItem[] = [];
            slots.forEach((slot, index) => {
              if (!slot.required) return;
              const existing = prev.documents.find(
                (item) => item.id === slot.id,
              );
              const nextVersion = existing ? (existing.version || 1) + 1 : 1;
              const isFirstSlot = index === 0;
              const isIssue = mode === "issue" && isFirstSlot;
              nextDocs.push({
                id: slot.id,
                name: slot.name,
                fileName: isIssue
                  ? `contoh-berkas-terpotong-v${nextVersion}.pdf`
                  : mode === "fixed"
                    ? `contoh-perbaikan-utuh-${index + 1}-v${nextVersion}.pdf`
                    : `contoh-dokumen-${index + 1}-v${nextVersion}.pdf`,
                size: isIssue ? "240 KB" : "310 KB",
                status: "TERUNGGAH",
                required: slot.required,
                fileType: index === 1 ? "image" : "pdf",
                version: nextVersion,
                uploadedAt: now,
                qualityPreset: isIssue ? "sample_issue" : "sample_clean",
                fixtureId: isIssue
                  ? `sample-kk-cropped-v${nextVersion}`
                  : `sample-doc-intact-${index + 1}-v${nextVersion}`,
              });
            });
            return {
              ...prev,
              documents: [...otherDocs, ...nextDocs],
              updatedAt: now,
            };
          }, targetPrepId);
          showToast(
            mode === "issue"
              ? "Dokumen contoh (dengan 1 berkas terpotong di bagian bawah) dimuat ke draf ini."
              : "Dokumen contoh (utuh & lengkap) dimuat sebagai versi baru pada draf ini.",
            "success",
          );
        },
        inspections: activePreparation.inspections,
        toggleResolveFinding: (id) =>
          updateActivePreparation((prev) => ({
            ...prev,
            inspections: prev.inspections.map((item) => {
              if (item.id !== id) return item;
              if (item.evaluationStatus === "not_evaluated") return item;
              return { ...item, resolved: !item.resolved };
            }),
            updatedAt: formatNow(),
          })),
        confirmFindingCorrection: (id, note) => {
          ensure(
            note.trim().length >= 3,
            "Tuliskan keterangan catatan warga minimal 3 karakter.",
          );
          const now = formatNow();
          let wasNotEvaluated = false;

          updateActivePreparation((prev) => ({
            ...prev,
            inspections: prev.inspections.map((item) => {
              if (item.id !== id) return item;
              // Konfirmasi mandiri warga TIDAK BOLEH mengubah status `not_evaluated` menjadi selesai/lulus otomatis
              if (item.evaluationStatus === "not_evaluated") {
                wasNotEvaluated = true;
                return {
                  ...item,
                  resolved: false,
                  evaluationStatus: "not_evaluated",
                  userCorrection: {
                    note: note.trim(),
                    correctedAt: now,
                    source:
                      "Catatan pemeriksaan mandiri warga (bukan hasil evaluasi otomatis sistem)",
                  },
                };
              }
              if (item.severity === "error") {
                return item;
              }
              return {
                ...item,
                resolved: true,
                resolvedReason:
                  "Catatan konfirmasi warga pada peringatan format",
                userCorrection: {
                  note: note.trim(),
                  correctedAt: now,
                  source: "Catatan konfirmasi warga",
                },
              };
            }),
            updatedAt: now,
          }));

          showToast(
            wasNotEvaluated
              ? "Catatan pemeriksaan mandiri warga disimpan. Status analisis otomatis tetap belum tersedia karena OCR/evaluator belum terhubung."
              : "Catatan konfirmasi warga disimpan.",
            "info",
          );
        },
        readinessScore: (() => {
          const currentFindings = activePreparation.inspections;
          if (!currentFindings.length) return 0;
          return Math.round(
            (currentFindings.filter((item) => item.resolved).length /
              currentFindings.length) *
              100,
          );
        })(),
        aiScanning: scanningPrepIds.includes(activePreparation.id),
        scanningPrepIds,
        runAIScanSimulation: (targetPrepId) => {
          const prep = targetPrepId
            ? preparations.find(
                (p) => p.id === targetPrepId && p.ownerId === user.id,
              )
            : preparations.find(
                (p) => p.id === activePreparation.id && p.ownerId === user.id,
              );
          if (!prep) {
            showToast(
              "Persiapan yang akan diperiksa tidak ditemukan.",
              "error",
            );
            return;
          }
          const prepId = prep.id;

          // Lock per preparation: ignore duplicate clicks while already scanning this preparation
          if (
            inFlightRunsRef.current[prepId] ||
            scanningPrepIds.includes(prepId)
          ) {
            return;
          }

          const svc =
            services.find((s) => s.id === prep.serviceId) ||
            selectedService ||
            DEFAULT_SERVICES[0];
          const slots = documentSlots(svc, prep.conditionKey);
          const missingReq = slots.filter(
            (s) =>
              s.required &&
              !prep.documents.some(
                (d) => d.id === s.id && d.status === "TERUNGGAH",
              ),
          );

          if (!prep.needConfirmed) {
            showToast(
              "Konfirmasi kebutuhan dan kondisi pengurusan pada Tahap 1 terlebih dahulu.",
              "warning",
            );
            return;
          }
          if (missingReq.length > 0) {
            showToast(
              `Masih ada ${missingReq.length} dokumen wajib yang belum dipilih pada tahap Dokumen.`,
              "warning",
            );
            return;
          }

          // Capture immutable input snapshot at the moment inspection starts
          const runId = `scan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          const capturedService: ServiceDetail = {
            ...svc,
            requirements: [...svc.requirements],
          };
          const capturedConditionKey = prep.conditionKey;
          const capturedTarget = prep.applicantTarget;
          const capturedFamily = prep.familyMember
            ? { ...prep.familyMember }
            : undefined;
          const capturedFormData: FormData = { ...prep.formData };
          const capturedDocs: DocumentItem[] = prep.documents.map((d) => ({
            ...d,
          }));
          const capturedRules: AdminRule[] = adminRules.map((r) => ({ ...r }));
          const capturedDataVersion = prep.dataVersion;

          const capturedDataSig = computeDataSignature(
            capturedConditionKey,
            capturedTarget,
            capturedFormData,
            capturedFamily,
          );
          const capturedDocSig = computeDocSignature(
            capturedService,
            capturedDocs,
            capturedConditionKey,
          );
          const capturedGuideSig = computeGuideSignature(capturedService);
          const capturedRulesSig = computeRulesSignature(
            capturedService,
            capturedRules,
          );

          inFlightRunsRef.current[prepId] = runId;
          setScanningPrepIds((prev) =>
            prev.includes(prepId) ? prev : [...prev, prepId],
          );

          timers.current.push(
            setTimeout(() => {
              if (inFlightRunsRef.current[prepId] !== runId) {
                return;
              }
              delete inFlightRunsRef.current[prepId];
              setScanningPrepIds((prev) =>
                prev.filter((item) => item !== prepId),
              );

              const evaluation = evaluatePreparationDraft({
                preparationId: prepId,
                service: capturedService,
                conditionKey: capturedConditionKey,
                applicantTarget: capturedTarget,
                formData: capturedFormData,
                documents: capturedDocs,
                adminRules: capturedRules,
                dataVersion: capturedDataVersion,
              });

              const now = formatNow();
              const snapshot: InspectionSnapshot = {
                runId,
                preparationId: prepId,
                inspectedAt: now,
                dataVersion: capturedDataVersion,
                dataSignature: capturedDataSig,
                conditionKey: capturedConditionKey,
                applicantTarget: capturedTarget,
                docSignature: capturedDocSig,
                guideSignature: capturedGuideSig,
                rulesSignature: capturedRulesSig,
                evaluatedScopes: evaluation.evaluatedScopes,
              };

              let inputChangedDuringScan = false;

              setPreparations((prev) =>
                prev.map((item) => {
                  if (item.id !== prepId) return item;
                  const liveDataSig = computeDataSignature(
                    item.conditionKey,
                    item.applicantTarget,
                    item.formData,
                    item.familyMember,
                  );
                  const liveDocSig = computeDocSignature(
                    capturedService,
                    item.documents,
                    item.conditionKey,
                  );
                  if (
                    item.dataVersion !== capturedDataVersion ||
                    liveDataSig !== capturedDataSig ||
                    liveDocSig !== capturedDocSig
                  ) {
                    inputChangedDuringScan = true;
                    return item;
                  }
                  return {
                    ...item,
                    inspections: evaluation.findings,
                    lastInspectionSnapshot: snapshot,
                    updatedAt: now,
                  };
                }),
              );

              if (inputChangedDuringScan) {
                showToast(
                  "Data, dokumen, atau persetujuan berubah saat pemeriksaan berjalan. Hasil lama diabaikan; silakan jalankan pemeriksaan ulang.",
                  "warning",
                );
                return;
              }

              const unresolvedCount = evaluation.findings.filter(
                (f) => !f.resolved || f.evaluationStatus === "not_evaluated",
              ).length;
              showToast(
                unresolvedCount > 0
                  ? `Pemeriksaan selesai: ${unresolvedCount} temuan atau cakupan yang belum dianalisis otomatis perlu ditinjau.`
                  : "Pemeriksaan selesai: seluruh cakupan pemeriksaan pada draf ini telah sesuai.",
                unresolvedCount > 0 ? "warning" : "success",
              );
            }, 700),
          );
        },
        applications,
        submitForOfficerReview: async (prepId, citizenNote) => {
          ensure(
            user.role === "warga" && !!account,
            "Masuk menggunakan akun warga untuk mengirim berkas ke petugas pendamping.",
          );
          const targetPrep = prepId
            ? preparations.find((p) => p.id === prepId && p.ownerId === user.id)
            : preparations.find(
                (p) => p.id === activePreparation.id && p.ownerId === user.id,
              );
          ensure(
            Boolean(targetPrep),
            "Pilih draf persiapan yang valid sebelum mengirim tinjauan.",
          );

          const existingLinked = records.find(
            (r) =>
              r.owner_id === user.id &&
              (r.id === targetPrep!.linkedApplicationId ||
                r.preparation_id === targetPrep!.id) &&
              r.mode === "demo_review",
          );
          ensure(
            !existingLinked,
            existingLinked?.current_status === "PERLU_PERBAIKAN"
              ? "Draf ini sudah memiliki permintaan tinjauan aktif yang menunggu perbaikan. Gunakan tombol 'Kirim perbaikan untuk ditinjau'."
              : "Draf ini sudah dikirim untuk ditinjau petugas. Buka halaman Pengajuan & Tinjauan untuk melihat statusnya.",
          );

          const prepReadiness = getPreparationReadiness(targetPrep!);
          ensure(
            prepReadiness.steps.step1Kebutuhan,
            "Konfirmasi kebutuhan dan kondisi permohonan pada Tahap 1 terlebih dahulu.",
          );
          ensure(
            prepReadiness.steps.step2Data,
            "Lengkapi seluruh data wajib pemohon pada Tahap 2 sesuai format yang ditentukan.",
          );
          ensure(
            prepReadiness.missingRequiredDocs.length === 0,
            "Unggah seluruh dokumen persyaratan wajib pada Tahap 3 sebelum mengirim.",
          );
          ensure(
            prepReadiness.unavailableRequiredDocs.length === 0,
            `Ada ${prepReadiness.unavailableRequiredDocs.length} berkas persyaratan wajib yang isinya tidak tersedia di penyimpanan. Pilih ulang berkas pada Tahap 3 sebelum mengirim.`,
          );
          const unavailableUploaded = targetPrep!.documents.find(
            (doc) =>
              doc.status === "TERUNGGAH" && !isDocumentContentAvailable(doc),
          );
          ensure(
            !unavailableUploaded,
            unavailableUploaded
              ? `Berkas "${unavailableUploaded.name}" (${unavailableUploaded.fileName}) tidak tersedia di penyimpanan. Pilih ulang berkas tersebut sebelum mengirim.`
              : "",
          );
          ensure(
            targetPrep!.consentAccepted,
            "Centang persetujuan pembagian data dan dokumen untuk tinjauan awal sebelum mengirim.",
          );

          const targetSvc =
            services.find((s) => s.id === targetPrep!.serviceId) ||
            selectedService;
          const now = formatNow();
          ensure(
            navigator.onLine,
            "Koneksi terputus. Draf tetap tersimpan; coba kirim lagi setelah terhubung.",
          );
          ensure(
            targetSvc.availability !== "paused",
            "Panduan sedang dikoreksi. Tunggu pembaruan atau minta bantuan petugas.",
          );

          let serverAppId: string | undefined;
          let serverInternalRef: string | undefined;

          if (isApiMode) {
            let prepServerId = targetPrep!.id;
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(prepServerId);
            if (!isUUID) {
              const svcUUID =
                (targetSvc as any).remoteId ||
                (typeof targetSvc.id === "string" && isUUID
                  ? targetSvc.id
                  : "33333333-3333-4333-8333-333333333333");
              const createdPrep = await preparationsApi.create({
                service_id: svcUUID,
                display_name: targetSvc.name,
              });
              prepServerId = createdPrep.data.id;
            }
            const subRes = await applicationsApi.submitPreparation(prepServerId, {
              citizen_note: citizenNote,
              consent_version: "v1.0",
              consent_confirmed: true,
            });
            if (subRes?.data) {
              serverAppId = subRes.data.application_id || subRes.data.id;
              serverInternalRef = subRes.data.internal_reference;
            }
          }

          const snapshot = buildSubmissionSnapshot(
            targetPrep!,
            targetSvc,
            1,
            now,
            citizenNote,
            null,
          );

          const maxNum = records.reduce((max, item) => {
            const match = (item.internal_reference || "").match(
              /TINJAU-\d{4}-(\d+)/,
            );
            const num = match ? parseInt(match[1], 10) : 0;
            return Math.max(max, isNaN(num) ? 0 : num);
          }, 0);
          const nextNum = Math.max(maxNum + 1, records.length + 1);
          const internalRef = serverInternalRef || `TINJAU-2026-${String(nextNum).padStart(4, "0")}`;
          const newId = serverAppId || `review-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

          const docSummary = snapshot.attachments
            .map((a) => `${a.name} (${a.fileName} · v${a.version || 1})`)
            .join(", ");

          const newAppRecord: ApplicationRecord = {
            id: newId,
            preparation_id: targetPrep!.id,
            internal_reference: internalRef,
            official_number: "",
            official_number_source: "not_provided",
            preparation_reference: targetPrep!.internalReference,
            service_id: targetSvc.id,
            service_name: targetSvc.name,
            condition_label: snapshot.conditionLabel,
            region: targetPrep!.region || targetSvc.region || selectedRegion,
            agency: targetPrep!.agency || targetSvc.agency,
            applicant_name: targetPrep!.formData.nama_lengkap,
            applicant_nik: targetPrep!.formData.nik,
            applicant_phone: targetPrep!.formData.telepon,
            applicant_target: targetPrep!.applicantTarget,
            channel: "Ruang Tinjauan Awal DaftarIn",
            created_at: now,
            submission_date: now,
            current_status: "DITERIMA",
            updated_at: now,
            estimated_completion: targetSvc.official_duration,
            owner_id: user.id,
            assigned_officer_id: mockAuth.reviewOfficers()[0]?.id,
            recipient_unit: DEFAULT_REVIEW_UNIT,
            mode: "demo_review",
            submitted_snapshot: snapshot,
            submission_history: [snapshot],
            attachments: snapshot.attachments,
            events: [
              {
                id: Date.now(),
                status: "DITERIMA",
                title: "Permintaan tinjauan awal dikirim oleh warga",
                time: now,
                source: user.name + " · kiriman warga",
                source_type: "citizen",
                notes:
                  (citizenNote?.trim() ? `${citizenNote.trim()} — ` : "") +
                  `Data pemohon dan ${snapshot.attachments.length} dokumen persyaratan (${docSummary}) dari persiapan ${targetPrep!.internalReference} dibagikan ke ${DEFAULT_REVIEW_UNIT} untuk pemeriksaan awal sebelum pengajuan di kanal resmi instansi.`,
                next_action:
                  "Petugas pendamping akan memeriksa kelengkapan dan keterbacaan berkas. Pantau pembaruan status tinjauan pada halaman ini.",
                completed: true,
                current: true,
              },
            ],
          };

          setRecords((previous) => [newAppRecord, ...previous]);
          updateActivePreparation(
            (prev) => ({
              ...prev,
              linkedApplicationId: newAppRecord.id,
              updatedAt: now,
            }),
            targetPrep!.id,
          );
          showToast(
            `Permintaan tinjauan ${internalRef} berhasil dikirim ke petugas pendamping (Status: Menunggu tinjauan).`,
          );
          return newAppRecord;
        },
        addApplication: (application, prepId) => {
          ensure(user.role === "warga" && !!account);
          const targetPrep = prepId
            ? preparations.find((p) => p.id === prepId && p.ownerId === user.id)
            : preparations.find(
                (p) => p.id === activePreparation.id && p.ownerId === user.id,
              );
          ensure(
            Boolean(targetPrep),
            "Pilih persiapan yang valid sebelum mencatat pengajuan.",
          );
          const targetSvc =
            services.find((s) => s.id === targetPrep!.serviceId) ||
            selectedService;

          const cleanOfficial = application.official_number.trim();
          if (cleanOfficial) {
            ensure(
              !records.some(
                (item) =>
                  item.owner_id === user.id &&
                  item.official_number &&
                  item.official_number.toLowerCase() ===
                    cleanOfficial.toLowerCase(),
              ),
              "Nomor tanda terima ini sudah pernah dicatat pada akunmu.",
            );
          }
          const conditionObj = getSelectedConditionOption(
            targetSvc,
            targetPrep!.conditionKey,
          );
          const nextIndex = records.length + 1;
          const internalRef =
            application.internal_reference ||
            `CATAT-2026-${String(nextIndex).padStart(4, "0")}`;
          const uploadedForPrep = targetPrep!.documents
            .filter((document) => document.status === "TERUNGGAH")
            .map((doc) => ({
              id: doc.id,
              name: doc.name,
              fileName: doc.fileName,
              size: doc.size,
              fileType: doc.fileType,
              version: doc.version || 1,
              uploadedAt: doc.uploadedAt,
              qualityPreset: doc.qualityPreset || "user_file",
              previewKey: doc.previewKey,
            }));

          const now = formatNow();
          const newAppRecord: ApplicationRecord = {
            ...application,
            preparation_id: targetPrep!.id,
            internal_reference: internalRef,
            preparation_reference:
              application.preparation_reference ||
              targetPrep!.internalReference,
            condition_label: application.condition_label || conditionObj.label,
            service_id: targetSvc.id,
            service_name: targetSvc.name,
            region: targetPrep!.region || targetSvc.region || selectedRegion,
            agency: targetPrep!.agency || targetSvc.agency,
            applicant_target: targetPrep!.applicantTarget,
            owner_id: user.id,
            mode: "citizen",
            official_number: cleanOfficial,
            official_number_source: cleanOfficial
              ? "citizen_reported"
              : "not_provided",
            official_submission: {
              status: "DIAJUKAN_WARGA",
              recordedAt: now,
              channel: application.channel || "Loket / Kanal Resmi Instansi",
              officialNumber:
                cleanOfficial || "Belum diterbitkan (Dilaporkan warga)",
              officialReceiptNumber: cleanOfficial || undefined,
              officialNumberSource: cleanOfficial
                ? "citizen_reported"
                : "not_provided",
              note: "Dicatat mandiri oleh warga setelah mengajukan di kanal resmi instansi.",
              sourceLabel: "Dilaporkan warga",
            },
            assigned_officer_id: undefined,
            attachments: uploadedForPrep,
          };

          setRecords((previous) => [newAppRecord, ...previous]);
          updateActivePreparation(
            (prev) => ({
              ...prev,
              linkedApplicationId: newAppRecord.id,
              updatedAt: now,
            }),
            targetPrep!.id,
          );
          showToast(
            "Catatan pengajuan kanal resmi disimpan (Dicatat warga). Belum terhubung otomatis ke sistem instansi.",
          );
        },
        officerUpdateApplication,
        officerStartReview,
        reviewQueue:
          user.role === "admin"
            ? records
                .filter(
                  (item) =>
                    item.current_status !== "DICATAT_WARGA" &&
                    item.mode !== "citizen",
                )
                .map(
                  ({
                    id,
                    internal_reference,
                    service_name,
                    applicant_name,
                    current_status,
                    assigned_officer_id,
                    revision_pending,
                  }) => ({
                    id,
                    internal_reference,
                    service_name,
                    applicant_name,
                    current_status,
                    assigned_officer_id,
                    revision_pending,
                  }),
                )
            : [],
        assignReviewOfficer,
        reviewServiceSource: (id, version, decision, note) => {
          ensure(
            user.role === "admin",
            "Hanya admin yang dapat meninjau sumber panduan.",
          );
          const service = services.find((item) => item.id === id);
          ensure(
            Boolean(service) && (service!.version || 1) === version,
            "Versi panduan telah berubah. Buka kembali sumber terbaru.",
          );
          ensure(
            note.trim().length >= 10,
            "Tuliskan hasil peninjauan minimal 10 karakter.",
          );
          ensure(
            ["sesuai", "perlu_perbaikan"].includes(decision),
            "Pilih hasil peninjauan yang benar.",
          );
          try {
            ensure(
              new URL(service!.source_url || "").protocol === "https:",
              "Tautan sumber harus memakai https.",
            );
          } catch {
            throw new Error(
              "Tambahkan tautan sumber yang benar pada panduan layanan.",
            );
          }
          setServices((previous) =>
            previous.map((item) =>
              item.id !== id
                ? item
                : {
                    ...item,
                    source_verified: decision === "sesuai",
                    source_review_status: decision,
                    source_review_version: version,
                    source_review_by: user.name,
                    source_note: note.trim(),
                    reviewed_at: new Date().toISOString(),
                  },
            ),
          );
          showToast("Peninjauan sumber disimpan.");
        },
        officerHistory:
          user.role === "petugas"
            ? records.flatMap((record) =>
                (record.evaluation_history?.length
                  ? record.evaluation_history
                  : record.latest_evaluation
                    ? [record.latest_evaluation]
                    : []
                )
                  .filter((evaluation) =>
                    evaluation.evaluatedById
                      ? evaluation.evaluatedById === user.id
                      : evaluation.evaluatedBy === user.name &&
                        record.assigned_officer_id === user.id,
                  )
                  .map((evaluation, index) => ({
                    id: `${record.id}-${evaluation.submissionVersion}-${index}`,
                    applicationId: record.id,
                    reference: record.internal_reference || "",
                    serviceName: record.service_name,
                    submissionVersion: evaluation.submissionVersion,
                    decision: evaluation.decision,
                    evaluatedAt: evaluation.evaluatedAt,
                    summaryNote:
                      record.assigned_officer_id === user.id
                        ? evaluation.summaryNote
                        : undefined,
                    canOpen: record.assigned_officer_id === user.id,
                  })),
              )
            : [],
        operationalEvents:
          user.role === "admin"
            ? records.flatMap((record) =>
                record.events
                  .filter(
                    (event) =>
                      event.source_type === "admin" ||
                      event.source_type === "officer",
                  )
                  .map((event) => ({
                    id: `${record.id}-${event.id}`,
                    message: event.title,
                    by: event.source,
                    time: event.time,
                    applicationId: record.id,
                    reference: record.internal_reference || "",
                    category:
                      event.source_type === "admin"
                        ? ("penugasan" as const)
                        : ("tinjauan" as const),
                  })),
              )
            : [],
        officerRequestRevision,
        officerCompleteReview,
        addCitizenNote,
        resubmitApplication: async (id, citizenNote, prepId) => {
          const record = records.find((item) => item.id === id);
          ensure(
            user.role === "warga" &&
              record?.owner_id === user.id &&
              record?.current_status === "PERLU_PERBAIKAN" &&
              !record?.revision_pending,
            "Permintaan tinjauan ini tidak sedang menunggu pengiriman perbaikan.",
          );

          // Validasi ikatan 1-ke-1 antara permintaan tinjauan dan persiapan asal (tanpa fallback ke activePreparation)
          const linkResolution = resolveApplicationPreparationLink({
            applicationId: id,
            requestedPrepId: prepId,
            applications: records,
            preparations,
            currentUserId: user.id,
          });

          if (linkResolution.status !== "valid") {
            throw new Error(linkResolution.message);
          }

          const targetPrep = linkResolution.preparation;
          if (prepId && targetPrep.id !== prepId) {
            throw new Error(
              "Persiapan yang dibuka tidak sesuai dengan persiapan asal permintaan tinjauan ini.",
            );
          }

          const prepReadiness = getPreparationReadiness(targetPrep);
          ensure(
            prepReadiness.hasUnsentDraftChanges ||
              (citizenNote || "").trim().length >= 5,
            "Belum ada perubahan pada data atau berkas. Jika hanya memberi klarifikasi, tuliskan penjelasan minimal 5 karakter sebelum mengirim perbaikan.",
          );
          ensure(
            prepReadiness.steps.step1Kebutuhan && prepReadiness.steps.step2Data,
            "Pastikan kebutuhan permohonan dan data wajib pemohon pada persiapan asal sudah lengkap.",
          );
          ensure(
            prepReadiness.missingRequiredDocs.length === 0,
            "Lengkapi seluruh dokumen persyaratan wajib pada persiapan asal ini sebelum mengirim perbaikan.",
          );
          ensure(
            prepReadiness.unavailableRequiredDocs.length === 0,
            `Ada ${prepReadiness.unavailableRequiredDocs.length} berkas persyaratan wajib yang isinya tidak tersedia di penyimpanan. Pilih ulang berkas pada Tahap 3 sebelum mengirim perbaikan.`,
          );
          const unavailableRevDoc = targetPrep.documents.find(
            (doc) =>
              doc.status === "TERUNGGAH" && !isDocumentContentAvailable(doc),
          );
          ensure(
            !unavailableRevDoc,
            unavailableRevDoc
              ? `Berkas "${unavailableRevDoc.name}" (${unavailableRevDoc.fileName}) tidak tersedia di penyimpanan. Pilih ulang berkas tersebut sebelum mengirim perbaikan.`
              : "",
          );
          ensure(
            targetPrep.consentAccepted,
            "Centang persetujuan pembagian berkas sebelum mengirim perbaikan untuk ditinjau.",
          );

          const targetSvc =
            services.find((s) => s.id === targetPrep.serviceId) ||
            selectedService;
          const now = formatNow();
          const nextSubVersion =
            (record!.submitted_snapshot?.submissionVersion || 1) + 1;
          ensure(
            navigator.onLine,
            "Koneksi terputus. Draf perbaikan tetap tersimpan; coba kirim lagi setelah terhubung.",
          );
          const nextSnapshot = buildSubmissionSnapshot(
            targetPrep,
            targetSvc,
            nextSubVersion,
            now,
            citizenNote,
            record!.submitted_snapshot,
          );

          const changesText =
            nextSnapshot.changesSummary &&
            nextSnapshot.changesSummary.length > 0
              ? nextSnapshot.changesSummary.join("; ")
              : "Data dan berkas diperbarui";

          if (isApiMode) {
            await applicationsApi.resubmit(id, {
              changes_summary: changesText,
              citizen_note: citizenNote,
              consent_version: "v1.0",
              consent_confirmed: true,
            });
          }

          setRecords((previous) =>
            previous.map((item) =>
              item.id !== id
                ? item
                : {
                    ...item,
                    preparation_id: targetPrep.id,
                    preparation_reference: targetPrep.internalReference,
                    applicant_name: targetPrep.formData.nama_lengkap,
                    applicant_nik: targetPrep.formData.nik,
                    applicant_phone: targetPrep.formData.telepon,
                    applicant_target: targetPrep.applicantTarget,
                    condition_label: nextSnapshot.conditionLabel,
                    revision_pending: true,
                    updated_at: now,
                    submitted_snapshot: nextSnapshot,
                    submission_history: [
                      ...(item.submission_history &&
                      item.submission_history.length > 0
                        ? item.submission_history
                        : item.submitted_snapshot
                          ? [item.submitted_snapshot]
                          : []),
                      nextSnapshot,
                    ],
                    attachments: nextSnapshot.attachments,
                    events: [
                      ...item.events,
                      {
                        id: Date.now(),
                        status: item.current_status,
                        title: `Perbaikan dikirim untuk ditinjau ulang (Kiriman #${nextSubVersion})`,
                        time: now,
                        source: user.name + " · kiriman perbaikan warga",
                        source_type: "citizen",
                        notes:
                          (citizenNote?.trim()
                            ? `${citizenNote.trim()} — `
                            : "") +
                          `Ringkasan perubahan pada persiapan ${targetPrep.internalReference}: ${changesText}. Menunggu tinjauan ulang petugas pendamping.`,
                        next_action:
                          "Tunggu petugas pendamping memeriksa berkas perbaikan dan memperbarui hasil tinjauan.",
                        completed: true,
                        current: false,
                      },
                    ],
                  },
            ),
          );
          updateActivePreparation(
            (prev) => ({
              ...prev,
              linkedApplicationId: id,
              updatedAt: now,
            }),
            targetPrep.id,
          );
          showToast(
            `Perbaikan berhasil dikirim pada permintaan ${record!.internal_reference} (Status: Perbaikan dikirim).`,
          );
        },
        recordOfficialSubmission,
        confirmApplicationResult,
        adminRules,
        toggleRuleActive: (id) => {
          ensure(user.role === "admin");
          setAdminRules((previous) =>
            previous.map((item) =>
              item.id === id ? { ...item, active: !item.active } : item,
            ),
          );
          showToast("Aturan pemeriksaan diperbarui.");
        },
        addAdminRule: (rule) => {
          ensure(user.role === "admin");
          ensure(rule.rule.trim().length > 0, "Tuliskan aturan pemeriksaan.");
          setAdminRules((previous) => [
            ...previous,
            { ...rule, id: crypto.randomUUID() },
          ]);
          showToast("Aturan ditambahkan.");
        },
        isChatOpen,
        openChat: () => setChatOpen(true),
        closeChat: () => setChatOpen(false),
        toasts,
        showToast,
        removeToast: (id) =>
          setToasts((previous) => previous.filter((item) => item.id !== id)),
      }}
    >
      {storageUnavailable && (
        <p role="alert" className="storage-notice">
          Perubahan belum dapat disimpan. Periksa ruang penyimpanan dan izin
          browser.
        </p>
      )}
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContextProvider is required.");
  return context;
};
