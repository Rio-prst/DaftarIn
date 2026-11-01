import type { ApplicationRecord } from "../context/AppContext";
import type { PreparationRecord } from "../types/preparation";

export function recordTime(value?: string): number {
  if (!value) return 0;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return Date.parse(value) || 0;
  const numeric = value.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2})[.:](\d{2})(?:[.:](\d{2}))?)?/,
  );
  if (numeric)
    return Date.UTC(
      +numeric[3],
      +numeric[2] - 1,
      +numeric[1],
      +(numeric[4] || 0) - 7,
      +(numeric[5] || 0),
      +(numeric[6] || 0),
    );
  const months = [
    "januari",
    "februari",
    "maret",
    "april",
    "mei",
    "juni",
    "juli",
    "agustus",
    "september",
    "oktober",
    "november",
    "desember",
  ];
  const match = value.match(
    /(\d{1,2})\s+([a-z]+)\s+(\d{4})(?:[,\s]+(\d{1,2})[.:](\d{2}))?/i,
  );
  if (!match) return 0;
  const month = months.indexOf(match[2].toLowerCase());
  if (month < 0) return 0;
  return Date.UTC(
    +match[3],
    month,
    +match[1],
    +(match[4] || 0) - 7,
    +(match[5] || 0),
  );
}

export interface CaseNextAction {
  description: string;
  actor: string;
  label: string;
  href: string;
  needsCitizen: boolean;
  priority: number;
  resultReceived: boolean;
  closed: boolean;
}

export function revisionEntryPath(app: ApplicationRecord, prep: PreparationRecord): string {
  const target = app.latest_revision_detail?.targetItem || '';
  const formIssue = app.latest_evaluation?.itemAssessments.some(item => item.itemType === 'form_data' && item.verdict !== 'sesuai');
  const step = formIssue ? 'data' : /kondisi|kebutuhan|subjek/i.test(target) ? 'kebutuhan'
    : /formulir|data pemohon|nama|nik|alamat|nomor kk/i.test(target) ? 'data' : 'dokumen';
  return `/persiapan/${step}?` + new URLSearchParams({ prep: prep.id, application: app.id });
}

export function caseNextAction(
  app: ApplicationRecord,
  prep?: PreparationRecord,
): CaseNextAction {
  const href = "/pelacakan/" + encodeURIComponent(app.id);
  const base = {
    href,
    label: "Lihat perkembangan",
    needsCitizen: false,
    priority: 100,
    resultReceived: false,
    closed: false,
  };
  if(app.current_status==='DITARIK')return {...base,closed:true,description:'Tinjauan sudah ditarik. Riwayat tetap tersedia dan pengajuan instansi tidak ikut dibatalkan.',actor:'Tinjauan ditutup',label:'Lihat riwayat'};
  if (
    app.official_submission?.status === "HASIL_DITERIMA_WARGA" ||
    app.official_submission?.resultReceivedAt ||
    app.current_status === "HASIL_DITERIMA_WARGA"
  ) {
    return {
      ...base,
      description:
        "Kamu telah mencatat penerimaan hasil layanan. Riwayat dan catatan pengurusan tetap tersedia.",
      actor: "Hasil diterima · dilaporkan warga",
      label: "Lihat riwayat",
      resultReceived: true,
    };
  }
  if (app.current_status === "PERLU_PERBAIKAN" && !app.revision_pending) {
    return {
      ...base,
      href:
        prep && prep.needConfirmed
          ? revisionEntryPath(app, prep)
          : href,
      label:
        prep && prep.needConfirmed
          ? "Perbaiki berkas"
          : "Lihat catatan perbaikan",
      description:
        app.latest_revision_detail?.requiredAction ||
        "Perbaiki data atau berkas sesuai catatan petugas, lalu kirim ulang pada permintaan yang sama.",
      actor: "Menunggu tindakanmu",
      needsCitizen: true,
      priority: 0,
    };
  }
  if (app.current_status === "PERLU_PERBAIKAN" && app.revision_pending) {
    return {
      ...base,
      description:
        "Perbaikan sudah dikirim dan menunggu tinjauan petugas. Kamu tidak perlu membuat permintaan baru.",
      actor: "Petugas pendamping",
      label: "Lihat kiriman perbaikan",
    };
  }
  if (app.official_submission || app.current_status === "DICATAT_WARGA") {
    return {
      ...base,
      description:
        "Pengajuan melalui kanal resmi sudah kamu catat. Pembaruan instansi belum tersinkron otomatis; catat perkembangannya setelah menerima informasi resmi.",
      actor: "Instansi tujuan · status dilaporkan warga",
      label: "Lihat catatan pengajuan resmi",
    };
  }
  if (app.current_status === "SELESAI") {
    return {
      ...base,
      description:
        "Tinjauan pendamping selesai. Ikuti panduan kanal resmi untuk mengajukan ke instansi, lalu catat tanda terima yang benar-benar kamu terima.",
      actor: "Menunggu tindakanmu",
      label: "Lihat langkah pengajuan resmi",
      needsCitizen: true,
      priority: 20,
    };
  }
  if (app.current_status === "VERIFIKASI" || app.current_status === "DIPROSES") {
    return {
      ...base,
      description:
        "Petugas sedang meninjau salinan data dan berkas yang kamu kirim. Perubahan draf tidak otomatis mengubah salinan ini.",
      actor: "Petugas pendamping",
      label: "Lihat tinjauan",
    };
  }
  return {
    ...base,
    description:
      "Kiriman sudah tercatat dan menunggu petugas memulai tinjauan. Perkembangan akan muncul di halaman ini.",
    actor: "Petugas pendamping",
    label: "Lihat kiriman",
  };
}
