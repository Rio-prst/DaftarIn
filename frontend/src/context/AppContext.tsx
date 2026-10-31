import { useAuth } from "../auth/AuthContext";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { isDocumentContentAvailable } from "../components/DocumentPreviewModal";
import { subscribeFileStorage } from "../utils/fileStorage";
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
  category: "Konsistensi Data" | "Kualitas Berkas" | "Kelengkapan" | "Legalitas";
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
  source_type?: "citizen" | "officer" | "simulation";
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
  official_number_source?: "citizen_reported" | "simulation_assigned" | "not_provided";
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
    official_duration: "1–2 Hari Kerja sejak berkas dinyatakan lengkap di kanal resmi",
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
    source_title: "Acuan Regulasi: Permendagri No. 108 Tahun 2019 (Data Contoh)",
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
    source_title: "Acuan Regulasi: Permendagri No. 108 Tahun 2019 Pasal 43 (Data Contoh)",
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
    source_title: "Acuan Regulasi: Permendagri No. 108 Tahun 2019 Pasal 17–24 (Data Contoh)",
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
    source_title: "Acuan Regulasi: Permendagri No. 108 Tahun 2019 Pasal 59 (Data Contoh)",
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
  confirmNeedStep: (target: ApplicantTarget, condition: string, serviceOverride?: ServiceDetail) => void;
  startPreparation: (
    service: ServiceDetail,
    initialCondition?: string,
    options?: { createNew?: boolean; applicantTarget?: ApplicantTarget; needConfirmed?: boolean },
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
  addApplication: (application: ApplicationRecord, prepId?: string) => void;
  submitForOfficerReview: (
    prepId?: string,
    citizenNote?: string,
  ) => ApplicationRecord;
  officerStartReview: (id: string, note?: string) => void;
  officerRequestRevision: (
    id: string,
    detail: {
      targetItem: string;
      issueCategory: OfficerIssueCategory;
      problemDescription: string;
      requiredAction: string;
    },
    itemAssessments?: OfficerItemAssessment[],
  ) => void;
  officerCompleteReview: (
    id: string,
    note: string,
    itemAssessments: OfficerItemAssessment[],
  ) => void;
  officerUpdateApplication: (
    id: string,
    status: ApplicationStatusCode,
    note: string,
  ) => void;
  addCitizenNote: (id: string, note: string) => void;
  resubmitApplication: (id: string, citizenNote?: string, prepId?: string) => void;
  recordOfficialSubmission: (
    id: string,
    officialNumber: string,
    channel: string,
    note?: string,
  ) => void;
  confirmApplicationResult: (id: string, note?: string) => void;
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
  DICATAT_WARGA: "Pengajuan kanal resmi (Dilaporkan warga)",
  DITERIMA: "Menunggu tinjauan",
  VERIFIKASI: "Sedang ditinjau",
  PERLU_PERBAIKAN: "Perlu perbaikan",
  DIPROSES: "Tinjauan awal selesai",
  SELESAI: "Tinjauan awal selesai",
  HASIL_DITERIMA_WARGA: "Hasil layanan diterima (Dilaporkan warga)",
};

/**
 * Mengembalikan label status TINJAUAN PENDAMPING DaftarIn.
 * Konfirmasi hasil layanan pemerintah oleh warga TIDAK menimpa status tinjauan petugas.
 */
export function getReviewStatusLabel(
  record?: ApplicationRecord | null,
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
    record.current_status === "DIPROSES" ||
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

const initialAyuFindings: InspectionFinding[] = [
  {
    id: "finding-kk-crop-v1",
    serviceId: 1,
    scope: "analisis_isi_dokumen",
    evaluationStatus: "simulated_fixture",
    category: "Kualitas Berkas",
    title: "[Contoh Simulasi] Bagian bawah Kartu Keluarga (KK) Asli Lama terpotong",
    evidence:
      "Berkas \"kk-contoh-terpotong.pdf\" (Versi 1) menggunakan dokumen contoh dengan area tanda tangan/QR code di sisi bawah dokumen terpotong.",
    rule: "Keterbacaan empat sudut dokumen",
    action:
      "Ganti dengan berkas Kartu Keluarga yang memperlihatkan keempat sudut secara utuh pada tahap Dokumen, lalu kirim perbaikan ke petugas.",
    severity: "error",
    resolved: false,
    docTarget: "service-1-doc-0",
    documentVersion: 1,
    dataVersion: 1,
    ruleVersion: "v3",
    sourceUrl:
      "https://disdukcapil.pekalongankota.go.id/halaman/penerbitan-kartu-keluarga.html",
  },
  {
    id: "finding-ktp-clean-v1",
    serviceId: 1,
    scope: "analisis_isi_dokumen",
    evaluationStatus: "simulated_fixture",
    category: "Kualitas Berkas",
    title: "[Contoh Simulasi] KTP-el Kepala Keluarga & Pemohon terbaca utuh",
    evidence:
      "Berkas \"ktp-contoh.jpg\" (Versi 1) menggunakan dokumen contoh yang utuh.",
    rule: "Keterbacaan empat sudut dokumen",
    action: "Tidak diperlukan tindakan tambahan.",
    severity: "info",
    resolved: true,
    resolvedReason: "Dokumen contoh utuh (Dokumen v1)",
    docTarget: "service-1-doc-1",
    documentVersion: 1,
    dataVersion: 1,
    ruleVersion: "v3",
    sourceUrl:
      "https://disdukcapil.pekalongankota.go.id/halaman/penerbitan-kartu-keluarga.html",
  },
  {
    id: "finding-form-format-v1",
    serviceId: 1,
    scope: "format_formulir",
    evaluationStatus: "evaluated_passed",
    category: "Konsistensi Data",
    title: "Validasi dasar isian formulir (Nama, 16 angka NIK & Nomor KK) lengkap",
    evidence:
      "Format isian formulir terpenuhi untuk \"Ayu Contoh\" (Data Versi 1).",
    rule: "Validasi dasar format isian formulir permohonan",
    action: "Pastikan ejaan pada formulir sama persis dengan dokumen fisik.",
    severity: "info",
    resolved: true,
    resolvedReason: "Format formulir valid (Data v1)",
    docTarget: "service-1-doc-1",
    documentVersion: 1,
    dataVersion: 1,
    ruleVersion: "v3",
    sourceUrl:
      "https://disdukcapil.pekalongankota.go.id/halaman/penerbitan-kartu-keluarga.html",
  },
];

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

const initialAyuKkFormData: FormData = {
  nama_lengkap: "Ayu Contoh",
  nik: "0000000000000001",
  no_kk: "3275010908120005",
  telepon: "080000000001",
  alamat: "Jl. Merdeka No. 12, RT 04/RW 02, Kota Contoh",
  alasan: "Pembaruan elemen biodata keluarga pada Kartu Keluarga",
};

const initialAyuKkAttachments: SubmittedAttachment[] = [
  {
    id: "service-1-doc-0",
    name: DEFAULT_SERVICES[0].requirements[0],
    fileName: "kk-contoh-terpotong.pdf",
    size: "240 KB",
    fileType: "pdf",
    version: 1,
    uploadedAt: "28 Oktober 2026, 09.15 WIB",
    qualityPreset: "sample_issue",
    fixtureId: "sample-kk-cropped-v1",
  },
  {
    id: "service-1-doc-1",
    name: DEFAULT_SERVICES[0].requirements[1],
    fileName: "ktp-contoh.jpg",
    size: "210 KB",
    fileType: "image",
    version: 1,
    uploadedAt: "28 Oktober 2026, 09.15 WIB",
    qualityPreset: "sample_clean",
    fixtureId: "sample-ktp-intact-v1",
  },
];

const initialAyuKkSnapshot: SubmissionSnapshot = {
  submissionVersion: 1,
  submittedAt: "28 Oktober 2026, 09.30 WIB",
  applicantTarget: "diri_sendiri",
  conditionKey: "perubahan_biodata_keluarga",
  conditionLabel: "Pembaruan elemen data / susunan keluarga umum",
  formData: initialAyuKkFormData,
  dataSignature: computeDataSignature(
    "perubahan_biodata_keluarga",
    "diri_sendiri",
    initialAyuKkFormData,
  ),
  docSignature:
    "service-1-doc-0:v1:kk-contoh-terpotong.pdf:sample_issue|service-1-doc-1:v1:ktp-contoh.jpg:sample_clean|service-1-doc-2:missing:opt|service-1-doc-3:missing:opt",
  attachments: initialAyuKkAttachments,
  citizenNote: "Mohon tinjauan awal untuk pembaruan elemen biodata keluarga kami.",
};

const initialApplications: ApplicationRecord[] = [
  {
    id: "sample-kk-01",
    preparation_id: "prep-sample-kk-01",
    internal_reference: "TINJAU-2026-0001",
    preparation_reference: "PREP-2026-0001",
    applicant_target: "diri_sendiri",
    condition_key: "perubahan_biodata_keluarga",
    condition_label: "Pembaruan elemen data / susunan keluarga umum",
    mode: "simulation",
    owner_id: "citizen-ayu",
    assigned_officer_id: "officer-budi",
    recipient_unit: DEFAULT_REVIEW_UNIT,
    official_number: "TINJAU-2026-0001",
    official_number_source: "simulation_assigned",
    service_id: 1,
    service_name: DEFAULT_SERVICES[0].name,
    region: "Kota Contoh",
    agency: DEFAULT_SERVICES[0].agency,
    channel: DEFAULT_SERVICES[0].official_channel,
    attachments: initialAyuKkAttachments,
    submitted_snapshot: initialAyuKkSnapshot,
    submission_history: [initialAyuKkSnapshot],
    latest_revision_detail: {
      targetItem: DEFAULT_SERVICES[0].requirements[0],
      issueCategory: "sulit_dibaca",
      issueCategoryLabel: OFFICER_ISSUE_CATEGORY_LABELS.sulit_dibaca,
      problemDescription:
        "Bagian bawah berkas Kartu Keluarga Lama (area tanggal penerbitan, tanda tangan kepala keluarga, dan kode QR) terpotong pada foto kiriman ke-1.",
      requiredAction:
        "Unggah ulang foto atau PDF Kartu Keluarga Lama yang memperlihatkan keempat sudut dokumen secara utuh, lalu kirim perbaikan untuk ditinjau.",
      requestedBy: "Budi Santoso · Petugas Tinjauan Contoh (Simulasi)",
      requestedAt: "29 Oktober 2026, 10.00 WIB",
    },
    applicant_name: "Ayu Contoh",
    applicant_nik: "0000000000000001",
    current_status: "PERLU_PERBAIKAN",
    created_at: "28 Oktober 2026, 09.30 WIB",
    updated_at: "29 Oktober 2026, 10.00 WIB",
    events: [
      {
        id: 1,
        status: "DITERIMA",
        title: "Dikirim warga untuk tinjauan awal petugas (Kiriman ke-1)",
        time: "28 Oktober 2026, 09.30 WIB",
        source: "Ayu Contoh · kiriman tinjauan warga",
        source_type: "citizen",
        notes:
          "Warga membagikan data dan 2 berkas dari draf PREP-2026-0001 kepada Unit Tinjauan Pendamping Adminduk (Nomor Tinjauan Internal: TINJAU-2026-0001). Kiriman ini merupakan tinjauan pendamping dan belum menjadi pengajuan resmi di SIAK/instansi.",
        completed: true,
      },
      {
        id: 2,
        status: "PERLU_PERBAIKAN",
        title: "Perlu perbaikan: Kartu Keluarga (KK) Asli Lama",
        time: "29 Oktober 2026, 10.00 WIB",
        source: "Budi Santoso · petugas contoh (simulasi)",
        source_type: "officer",
        notes:
          "[Berkas sulit dibaca / bagian terpotong — Kartu Keluarga (KK) Asli Lama] Bagian bawah berkas Kartu Keluarga Lama (area tanggal penerbitan, tanda tangan kepala keluarga, dan kode QR) terpotong pada foto kiriman ke-1. Tindakan: Unggah ulang foto atau PDF Kartu Keluarga Lama yang memperlihatkan keempat sudut dokumen secara utuh, lalu kirim perbaikan untuk ditinjau.",
        next_action:
          "Buka persiapan PREP-2026-0001, ganti berkas Kartu Keluarga Lama, lalu tekan 'Kirim perbaikan untuk ditinjau'.",
        revision_detail: {
          targetItem: DEFAULT_SERVICES[0].requirements[0],
          issueCategory: "sulit_dibaca",
          issueCategoryLabel: OFFICER_ISSUE_CATEGORY_LABELS.sulit_dibaca,
          problemDescription:
            "Bagian bawah berkas Kartu Keluarga Lama (area tanggal penerbitan, tanda tangan kepala keluarga, dan kode QR) terpotong pada foto kiriman ke-1.",
          requiredAction:
            "Unggah ulang foto atau PDF Kartu Keluarga Lama yang memperlihatkan keempat sudut dokumen secara utuh, lalu kirim perbaikan untuk ditinjau.",
          requestedBy: "Budi Santoso · Petugas Tinjauan Contoh (Simulasi)",
          requestedAt: "29 Oktober 2026, 10.00 WIB",
        },
        completed: true,
        current: true,
      },
    ],
  },
  {
    id: "sample-kia-02",
    preparation_id: "prep-sample-kia-02",
    internal_reference: "TINJAU-2026-0002",
    preparation_reference: "PREP-2026-0002",
    applicant_target: "anggota_keluarga",
    condition_key: "kia_5_ke_atas",
    condition_label: "Usia 5 tahun sampai kurang dari 17 tahun",
    mode: "simulation",
    owner_id: "citizen-ayu",
    assigned_officer_id: "officer-budi",
    recipient_unit: DEFAULT_REVIEW_UNIT,
    official_number: "TINJAU-2026-0002",
    official_number_source: "simulation_assigned",
    service_id: 5,
    service_name: DEFAULT_SERVICES[4].name,
    region: "Kota Contoh",
    agency: DEFAULT_SERVICES[4].agency,
    channel: DEFAULT_SERVICES[4].official_channel,
    attachments: [
      {
        id: "service-5-doc-0",
        name: "Kutipan Akta Kelahiran Anak",
        fileName: "akta-anak-contoh.pdf",
        size: "190 KB",
        fileType: "pdf",
        version: 1,
        qualityPreset: "sample_clean",
      },
      {
        id: "service-5-doc-1",
        name: "Kartu Keluarga Orang Tua",
        fileName: "kk-orangtua-contoh.pdf",
        size: "220 KB",
        fileType: "pdf",
        version: 1,
        qualityPreset: "sample_clean",
      },
    ],
    submitted_snapshot: {
      submissionVersion: 1,
      submittedAt: "26 Oktober 2026, 08.30 WIB",
      applicantTarget: "anggota_keluarga",
      conditionKey: "kia_5_ke_atas",
      conditionLabel: "Usia 5 tahun sampai kurang dari 17 tahun",
      formData: {
        nama_lengkap: "Raka Contoh (Anak dari Ayu Contoh)",
        nik: "3275011204160003",
        no_kk: "3275010908120005",
        telepon: "080000000001",
        alamat: "Jl. Merdeka No. 12, RT 04/RW 02, Kota Contoh",
        alasan: "Permohonan penerbitan KIA untuk anak usia 9 tahun.",
      },
      dataSignature: "seed-kia",
      docSignature: "seed-kia-docs",
      attachments: [
        {
          id: "service-5-doc-0",
          name: "Kutipan Akta Kelahiran Anak",
          fileName: "akta-anak-contoh.pdf",
          size: "190 KB",
          fileType: "pdf",
          version: 1,
          qualityPreset: "sample_clean",
        },
        {
          id: "service-5-doc-1",
          name: "Kartu Keluarga Orang Tua",
          fileName: "kk-orangtua-contoh.pdf",
          size: "220 KB",
          fileType: "pdf",
          version: 1,
          qualityPreset: "sample_clean",
        },
      ],
    },
    official_submission: {
      recordedAt: "28 Oktober 2026, 14.00 WIB",
      channel: "Loket Disdukcapil Kota Contoh",
      officialNumber: "REG-KIA-2026-0118 (Dicatat warga)",
      officialNumberSource: "citizen_reported",
      note: "Berkas yang sudah selesai ditinjau awal telah diserahkan ke Loket 2 Disdukcapil.",
    },
    applicant_name: "Raka Contoh (diajukan Ayu Contoh)",
    applicant_nik: "3275011204160003",
    current_status: "SELESAI",
    created_at: "26 Oktober 2026, 08.30 WIB",
    updated_at: "28 Oktober 2026, 13.00 WIB",
    events: [
      {
        id: 1,
        status: "DITERIMA",
        title: "Dikirim warga untuk tinjauan awal petugas",
        time: "26 Oktober 2026, 08.30 WIB",
        source: "Ayu Contoh · kiriman tinjauan warga",
        source_type: "citizen",
        notes:
          "Permohonan tinjauan awal KIA dikirim ke Unit Tinjauan Pendamping Adminduk (TINJAU-2026-0002).",
        completed: true,
      },
      {
        id: 2,
        status: "SELESAI",
        title: "Tinjauan awal selesai — Siap diajukan ke kanal resmi",
        time: "28 Oktober 2026, 13.00 WIB",
        source: "Budi Santoso · petugas contoh (simulasi)",
        source_type: "officer",
        notes:
          "Kelengkapan berkas dan kesesuaian data permohonan KIA telah selesai ditinjau awal oleh petugas pendamping. Warga dapat melanjutkan pengajuan melalui Loket Disdukcapil / Kantor Kecamatan dengan membawa berkas asli. Hasil tinjauan awal ini bukan persetujuan resmi pemerintah atau penerbitan SIAK.",
        next_action:
          "Ajukan berkas melalui kanal resmi instansi, catat tanda terima resmi jika ada, dan konfirmasi setelah dokumen hasil layanan diterima.",
        completed: true,
        current: true,
      },
    ],
  },
  {
    id: "sample-akta-03",
    preparation_id: "prep-sample-akta-03",
    internal_reference: "TINJAU-2026-0003",
    preparation_reference: "PREP-2026-0003",
    applicant_target: "anggota_keluarga",
    condition_key: "lahir_faskes_tercatat",
    condition_label: "Lahir di faskes/bidan & perkawinan orang tua tercatat",
    mode: "simulation",
    owner_id: "citizen-dewi",
    assigned_officer_id: "officer-budi",
    recipient_unit: DEFAULT_REVIEW_UNIT,
    official_number: "TINJAU-2026-0003",
    official_number_source: "simulation_assigned",
    service_id: 3,
    service_name: DEFAULT_SERVICES[2].name,
    region: "Kota Contoh",
    agency: DEFAULT_SERVICES[2].agency,
    channel: DEFAULT_SERVICES[2].official_channel,
    attachments: [
      {
        id: "service-3-doc-0",
        name: DEFAULT_SERVICES[2].requirements[0],
        fileName: "surat-keterangan-lahir-contoh.pdf",
        size: "215 KB",
        fileType: "pdf",
        version: 1,
        qualityPreset: "sample_clean",
      },
      {
        id: "service-3-doc-1",
        name: DEFAULT_SERVICES[2].requirements[1],
        fileName: "buku-nikah-orangtua-contoh.pdf",
        size: "260 KB",
        fileType: "pdf",
        version: 1,
        qualityPreset: "sample_clean",
      },
      {
        id: "service-3-doc-2",
        name: DEFAULT_SERVICES[2].requirements[2],
        fileName: "ktp-orangtua-contoh.jpg",
        size: "195 KB",
        fileType: "image",
        version: 1,
        qualityPreset: "sample_clean",
      },
      {
        id: "service-3-doc-3",
        name: DEFAULT_SERVICES[2].requirements[3],
        fileName: "kk-orangtua-contoh.pdf",
        size: "240 KB",
        fileType: "pdf",
        version: 1,
        qualityPreset: "sample_clean",
      },
    ],
    submitted_snapshot: {
      submissionVersion: 1,
      submittedAt: "30 Oktober 2026, 09.00 WIB",
      applicantTarget: "anggota_keluarga",
      conditionKey: "lahir_faskes_tercatat",
      conditionLabel: "Lahir di faskes/bidan & perkawinan orang tua tercatat",
      formData: {
        nama_lengkap: "Dewi Contoh (untuk Nadia Contoh)",
        nik: "3275024506940004",
        no_kk: "3275021102180009",
        telepon: "081200000004",
        alamat: "Jl. Kenanga No. 8, RT 02/RW 05, Kota Contoh",
        alasan: "Pencatatan kelahiran anak pertama lahir di RSUD Kota Contoh.",
      },
      dataSignature: "seed-akta",
      docSignature: "seed-akta-docs",
      attachments: [
        {
          id: "service-3-doc-0",
          name: DEFAULT_SERVICES[2].requirements[0],
          fileName: "surat-keterangan-lahir-contoh.pdf",
          size: "215 KB",
          fileType: "pdf",
          version: 1,
          qualityPreset: "sample_clean",
        },
        {
          id: "service-3-doc-1",
          name: DEFAULT_SERVICES[2].requirements[1],
          fileName: "buku-nikah-orangtua-contoh.pdf",
          size: "260 KB",
          fileType: "pdf",
          version: 1,
          qualityPreset: "sample_clean",
        },
        {
          id: "service-3-doc-2",
          name: DEFAULT_SERVICES[2].requirements[2],
          fileName: "ktp-orangtua-contoh.jpg",
          size: "195 KB",
          fileType: "image",
          version: 1,
          qualityPreset: "sample_clean",
        },
        {
          id: "service-3-doc-3",
          name: DEFAULT_SERVICES[2].requirements[3],
          fileName: "kk-orangtua-contoh.pdf",
          size: "240 KB",
          fileType: "pdf",
          version: 1,
          qualityPreset: "sample_clean",
        },
      ],
      citizenNote: "Mohon tinjauan kelengkapan berkas akta kelahiran anak kami.",
    },
    applicant_name: "Dewi Contoh (untuk Nadia Contoh)",
    applicant_nik: "3275024506940004",
    current_status: "DITERIMA",
    created_at: "30 Oktober 2026, 09.00 WIB",
    updated_at: "30 Oktober 2026, 09.00 WIB",
    events: [
      {
        id: 1,
        status: "DITERIMA",
        title: "Dikirim warga — Menunggu tinjauan petugas",
        time: "30 Oktober 2026, 09.00 WIB",
        source: "Dewi Contoh · kiriman tinjauan warga",
        source_type: "citizen",
        notes:
          "Permintaan tinjauan awal Akta Kelahiran dikirim ke Unit Tinjauan Pendamping Adminduk (TINJAU-2026-0003).",
        completed: true,
        current: true,
      },
    ],
  },
];

function createAyuSamplePreparation(
  services: ServiceDetail[],
  adminRules: AdminRule[],
): PreparationRecord {
  const kkService = services.find((s) => s.id === 1) || DEFAULT_SERVICES[0];
  const conditionKey = "perubahan_biodata_keluarga";
  const applicantTarget: ApplicantTarget = "diri_sendiri";
  const formData: FormData = {
    nama_lengkap: "Ayu Contoh",
    nik: "0000000000000001",
    no_kk: "3275010908120005",
    telepon: "080000000001",
    alamat: "Jl. Merdeka No. 12, Kota Contoh",
    alasan: "Pembaruan elemen biodata keluarga pada Kartu Keluarga",
  };
  const documents: DocumentItem[] = kkService.requirements
    .slice(0, 2)
    .map((name, index) => ({
      id: "service-1-doc-" + index,
      name,
      fileName: index ? "ktp-contoh.jpg" : "kk-contoh-terpotong.pdf",
      size: index ? "210 KB" : "240 KB",
      status: "TERUNGGAH" as const,
      required: true,
      fileType: index ? ("image" as const) : ("pdf" as const),
      version: 1,
      uploadedAt: "28 Oktober 2026, 09.15 WIB",
      qualityPreset: index
        ? ("sample_clean" as const)
        : ("sample_issue" as const),
      fixtureId: index ? "sample-ktp-intact-v1" : "sample-kk-cropped-v1",
    }));

  const snapshot: InspectionSnapshot = {
    runId: "scan-seed-ayu-kk-1",
    preparationId: "prep-sample-kk-01",
    inspectedAt: "28 Oktober 2026, 09.20 WIB",
    dataVersion: 1,
    dataSignature: computeDataSignature(conditionKey, applicantTarget, formData),
    conditionKey,
    applicantTarget,
    docSignature: computeDocSignature(kkService, documents, conditionKey),
    guideSignature: computeGuideSignature(kkService),
    rulesSignature: computeRulesSignature(kkService, adminRules),
    evaluatedScopes: [
      "keberadaan_berkas",
      "analisis_isi_dokumen",
      "format_formulir",
    ],
  };

  return {
    id: "prep-sample-kk-01",
    internalReference: "PREP-2026-0001",
    ownerId: "citizen-ayu",
    serviceId: kkService.id,
    serviceName: kkService.name,
    region: kkService.region || "Kota Contoh",
    agency: kkService.agency,
    applicantTarget,
    conditionKey,
    needConfirmed: true,
    formData,
    documents,
    consentAccepted: true,
    inspections: initialAyuFindings,
    dataVersion: 1,
    lastInspectionSnapshot: snapshot,
    linkedApplicationId: "sample-kk-01",
    createdAt: "28 Oktober 2026, 09.10 WIB",
    updatedAt: "28 Oktober 2026, 09.20 WIB",
  };
}

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
  adminRules: AdminRule[],
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
            linkedApplicationId:
              item.id === "prep-sample-kk-01" && !item.linkedApplicationId
                ? "sample-kk-01"
                : item.linkedApplicationId,
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
      const cond =
        meta.conditionKey || getSelectedConditionOption(svc).value;
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
            meta.lastInspectedDataSignature ||
            "legacy-unknown-data-signature",
          conditionKey: cond,
          applicantTarget: target,
          docSignature:
            meta.lastInspectedDocSignature ||
            "legacy-unknown-doc-signature",
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

    if (
      user.id === "citizen-ayu" &&
      !migrated.some((p) => p.id === "prep-sample-kk-01")
    ) {
      migrated.unshift(createAyuSamplePreparation(services, adminRules));
    }

    return migrated;
  }

  if (user.id === "citizen-ayu") {
    return [createAyuSamplePreparation(services, adminRules)];
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
  const { user: account } = useAuth();
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
    loadOrMigratePreparations(user, services, adminRules),
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
      const nextPreps = loadOrMigratePreparations(user, services, adminRules);
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
    const stored = readStored("daftarin:applications:v1", initialApplications);
    return stored.map((rec) => {
      const template = initialApplications.find((item) => item.id === rec.id);
      const merged: ApplicationRecord = template
        ? {
            ...template,
            ...rec,
            preparation_id: rec.preparation_id || template.preparation_id,
            internal_reference: rec.internal_reference?.startsWith("TINJAU-")
              ? rec.internal_reference
              : template.internal_reference,
            recipient_unit: rec.recipient_unit || template.recipient_unit,
            applicant_target: rec.applicant_target || template.applicant_target,
            submitted_snapshot:
              rec.submitted_snapshot || template.submitted_snapshot,
            submission_history:
              rec.submission_history && rec.submission_history.length > 0
                ? rec.submission_history
                : template.submission_history,
            latest_revision_detail:
              rec.latest_revision_detail || template.latest_revision_detail,
            official_submission:
              rec.official_submission || template.official_submission,
          }
        : rec;

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
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
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
      if (event.key === "daftarin:applications:v1")
        setRecords(readStored(event.key, initialApplications));
      if (event.key === "daftarin:services:v1")
        setServices(readStored(event.key, DEFAULT_SERVICES));
      if (event.key === "daftarin:rules:v1")
        setAdminRules(readStored(event.key, initialRules));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const showToast = (
    message: string,
    type: ToastNotice["type"] = "success",
  ) => {
    const id = Date.now() + Math.random();
    setToasts((previous) => [...previous, { id, message, type }]);
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
    const attachments: SubmittedAttachment[] = prep.documents
      .filter((doc) => doc.status === "TERUNGGAH")
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
    );
    const docSignature = computeDocSignature(
      svc,
      prep.documents,
      prep.conditionKey,
    );

    const changesSummary: string[] = [];
    if (prevSnapshot) {
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
        if ((prevSnapshot.formData[key] || "").trim() !== (prep.formData[key] || "").trim()) {
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
      submittedAt,
      applicantTarget: prep.applicantTarget,
      conditionKey: prep.conditionKey,
      conditionLabel: condObj.label,
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
    const region = options?.region || svc.region || selectedRegion || "Kota Contoh";
    const cond =
      options?.conditionKey || getSelectedConditionOption(svc).value;
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
        nama_lengkap:
          target === "diri_sendiri" && account ? account.name : "",
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
          localStorage.setItem(
            scope + "preparations:v3",
            JSON.stringify(next),
          );
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
    const condOpt =
      getSelectedConditionOption(svc).value;
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
      applicantTarget: "diri_sendiri",
      conditionKey: condOpt,
      needConfirmed: true,
      formData: {
        nama_lengkap: appRecord!.applicant_name || user.name || "",
        nik:
          appRecord!.applicant_nik && /^\d{16}$/.test(appRecord!.applicant_nik)
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
      if (
        !prev.some((p) => p.id === idToUpdate && p.ownerId === user.id)
      ) {
        return prev;
      }
      return prev.map((item) =>
        item.id === idToUpdate && item.ownerId === user.id
          ? updater(item)
          : item,
      );
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
      DIPROSES:
        "Berkas sedang dalam pemeriksaan lanjutan petugas pendamping.",
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

  const officerStartReview = (id: string, note?: string) => {
    const record = records.find((item) => item.id === id);
    ensure(
      user.role === "petugas" && record?.assigned_officer_id === user.id,
      "Hanya petugas yang ditugaskan yang dapat memulai tinjauan ini.",
    );
    ensure(
      record!.current_status === "DITERIMA" ||
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

  const officerRequestRevision = (
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
      user.role === "petugas" && record?.assigned_officer_id === user.id,
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
      evaluatedAt: now,
      itemAssessments: itemAssessments || [],
      revisionDetail: fullDetail,
    };

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

  const officerCompleteReview = (
    id: string,
    note: string,
    itemAssessments: OfficerItemAssessment[],
  ) => {
    const record = records.find((item) => item.id === id);
    ensure(
      user.role === "petugas" && record?.assigned_officer_id === user.id,
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
      evaluatedAt: now,
      itemAssessments,
    };

    const itemsSummaryText = itemAssessments
      .map(
        (a) =>
          `${a.itemName}: ${OFFICER_ITEM_VERDICT_LABELS[a.verdict] || a.verdict}`,
      )
      .join(" · ");

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
                officialNumber: cleanNum || "Belum diterbitkan (Dilaporkan warga)",
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
                    (cleanNum ? ` dengan nomor tanda terima resmi ${cleanNum}. ` : ". ") +
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
    showToast("Catatan pengajuan di kanal resmi instansi (Dilaporkan warga) berhasil disimpan.");
  };

  const addCitizenNote = (id: string, note: string) => {
    const record = records.find((item) => item.id === id);
    ensure(user.role === "warga" && record?.owner_id === user.id);
    ensure(
      note.trim().length > 0 && note.trim().length <= 2000,
      "Tulis catatan maksimal 2.000 karakter.",
    );
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

  const confirmApplicationResult = (id: string, note?: string) => {
    const record = records.find((item) => item.id === id);
    ensure(
      user.role === "warga" &&
        record?.owner_id === user.id &&
        (record?.current_status === "SELESAI" ||
          record?.mode === "citizen" ||
          Boolean(record?.official_submission)),
      "Konfirmasi penerimaan hasil hanya tersedia setelah tinjauan awal selesai atau pengajuan kanal resmi dicatat.",
    );
    const now = formatNow();
    const cleanResultNote =
      note?.trim() ||
      "Warga mengonfirmasi telah menerima dokumen hasil dari kanal resmi instansi.";
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
            channel:
              item.official_submission?.channel ||
              item.channel ||
              "Kanal Resmi Instansi",
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
    showToast("Penerimaan hasil layanan resmi berhasil dicatat (Dilaporkan warga).");
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
        createPreparation,
        createLinkedRevisionPreparation,
        dismissMigrationNote,
        getPreparationReadiness,
        guestIntent,
        saveGuestIntent,
        consumeGuestIntent,
        preparationMeta: currentPrepMeta,
        prepMetaByService,
        confirmNeedStep: (target, nextCondition, serviceOverride) => {
          const targetSvc =
            serviceOverride ||
            services.find((s) => s.id === activePreparation.serviceId) ||
            selectedService;
          updateActivePreparation((prev) => {
            const changed =
              prev.serviceId !== targetSvc.id ||
              prev.conditionKey !== nextCondition ||
              prev.applicantTarget !== target;
            return {
              ...prev,
              serviceId: targetSvc.id,
              serviceName: targetSvc.name,
              region: targetSvc.region || selectedRegion,
              agency: targetSvc.agency,
              needConfirmed: true,
              applicantTarget: target,
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
            activePreparation.applicantTarget === "anggota_keluarga";
          updateActivePreparation((prev) => ({
            ...prev,
            formData: {
              nama_lengkap: isFamily
                ? "Bima Contoh (Anggota Keluarga)"
                : user.name === "Pengunjung"
                  ? "Ayu Contoh"
                  : user.name,
              nik: isFamily
                ? "3275011505150002"
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
            ? preparations.find((p) => p.id === targetPrepId) || activePreparation
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
                resolvedReason: "Catatan konfirmasi warga pada peringatan format",
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
            showToast("Persiapan yang akan diperiksa tidak ditemukan.", "error");
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
        submitForOfficerReview: (prepId, citizenNote) => {
          ensure(
            user.role === "warga" && !!account,
            "Masuk menggunakan akun warga untuk mengirim berkas ke petugas pendamping.",
          );
          const targetPrep = prepId
            ? preparations.find(
                (p) => p.id === prepId && p.ownerId === user.id,
              )
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
          const internalRef = `TINJAU-2026-${String(nextNum).padStart(4, "0")}`;
          const newId = `review-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

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
            assigned_officer_id: "officer-budi",
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
            ? preparations.find(
                (p) => p.id === prepId && p.ownerId === user.id,
              )
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
            condition_label:
              application.condition_label || conditionObj.label,
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
        officerRequestRevision,
        officerCompleteReview,
        addCitizenNote,
        resubmitApplication: (id, citizenNote, prepId) => {
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
