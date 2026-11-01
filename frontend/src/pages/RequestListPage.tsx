import { Link, useLocation, useSearchParams } from "react-router-dom";
import { WorkspaceLayout } from "../components/WorkspaceLayout";
import { OfficialSubmissionEntry } from "../components/OfficialSubmissionEntry";
import {
  useApp,
  getReviewStatusLabel,
  getOfficialSubmissionStatusLabel,
  type ApplicationRecord,
} from "../context/AppContext";
import { recordTime, caseNextAction } from "../utils/dashboard";

const done = (item: ApplicationRecord, officer = false) => officer
  ? ["SELESAI", "HASIL_DITERIMA_WARGA"].includes(item.current_status)
  : caseNextAction(item).resultReceived || item.current_status==='DITARIK';
const displayTime = (value?: string) => {
  const time = recordTime(value);
  return time
    ? new Date(time).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : value || "Belum tercatat";
};
const filters = {
  citizen: [
    { value: "", label: "Semua" },
    { value: "active", label: "Aktif" },
    { value: "action", label: "Perlu tindakanmu" },
    { value: "waiting_officer", label: "Menunggu petugas" },
    { value: "complete", label: "Selesai" },
  ],
  officer: [
    { value: "", label: "Semua" },
    { value: "waiting", label: "Perlu ditinjau" },
    { value: "reviewing", label: "Sedang ditinjau" },
    { value: "revision", label: "Menunggu warga" },
  ],
};
function matches(item: ApplicationRecord, filter: string, officer = false) {
  switch (filter) {
    case "active":
      return !done(item, officer);
    case "complete":
      return done(item, officer);
    case "action":
      return caseNextAction(item).needsCitizen;
    case "waiting_officer":
      return !caseNextAction(item).resultReceived && !item.official_submission &&
        (["DITERIMA", "VERIFIKASI", "DIPROSES"].includes(item.current_status) ||
          (item.current_status === "PERLU_PERBAIKAN" && Boolean(item.revision_pending)));
    case "waiting":
      return (
        item.current_status === "DITERIMA" ||
        (item.current_status === "PERLU_PERBAIKAN" &&
          Boolean(item.revision_pending))
      );
    case "reviewing":
      return ["VERIFIKASI", "DIPROSES"].includes(item.current_status);
    case "revision":
      return (
        item.current_status === "PERLU_PERBAIKAN" && !item.revision_pending
      );
    default:
      return true;
  }
}
export function RequestListPage({ kind }: { kind: "citizen" | "officer" }) {
  const { applications } = useApp();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const officer = kind === "officer";
  const base = officer ? "/petugas" : "/pelacakan";
  const query = params.get("q") || "";
  const filter = filters[kind].some(
    (item) => item.value === params.get("status"),
  )
    ? params.get("status") || ""
    : "";
  const oldest = params.get("sort") === "oldest";
  const all = applications.filter(
    (item) =>
      !officer ||
      (!['DICATAT_WARGA','SELESAI','HASIL_DITERIMA_WARGA','DITARIK'].includes(item.current_status) &&
        Boolean(item.assigned_officer_id)),
  );
  const items = all
    .filter(
      (item) =>
        matches(item, filter, officer) &&
        [
          item.service_name,
          item.applicant_name,
          item.internal_reference,
          item.official_number,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort(
      (a, b) =>
        (oldest ? 1 : -1) *
          (recordTime(a.updated_at || a.created_at) -
            recordTime(b.updated_at || b.created_at)) ||
        a.id.localeCompare(b.id),
    );
  const pageCount = Math.max(1, Math.ceil(items.length / 10));
  const requestedPage = Number(params.get("page") || 1);
  const page = Number.isSafeInteger(requestedPage)
    ? Math.max(1, Math.min(pageCount, requestedPage))
    : 1;
  const rows = items.slice((page - 1) * 10, page * 10);
  const update = (key: string, value: string, replace = false) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next, { replace });
  };
  return (
    <WorkspaceLayout
      title={officer ? "Antrean tinjauan" : "Pengajuan saya"}
      description={
        officer
          ? "Pilih permintaan untuk memeriksa data dan berkas warga."
          : "Lihat pengajuan aktif dan riwayat tinjauanmu."
      }
    >
      {!officer && <OfficialSubmissionEntry />}
      <div
        className="flex flex-wrap gap-x-5 gap-y-1 border-b border-slate-200 mb-5"
        role="group"
        aria-label={officer ? "Filter antrean" : "Filter pengajuan"}
      >
        {filters[kind].map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => update("status", item.value)}
            className={
              "min-h-[44px] border-b-2 py-2 text-sm font-medium " +
              (filter === item.value
                ? "border-[#17324D] text-[#17324D]"
                : "border-transparent text-slate-600")
            }
          >
            {item.label}{" "}
            <span className="ml-1 text-xs">
              ({all.filter((row) => matches(row, item.value, officer)).length})
            </span>
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_220px] mb-5">
        <div className="form-field">
          <label htmlFor="request-search">
            {officer
              ? "Cari nama warga, layanan, atau nomor"
              : "Cari layanan atau nomor pengajuan"}
          </label>
          <input
            id="request-search"
            type="search"
            value={query}
            maxLength={160}
            onChange={(event) => update("q", event.target.value, true)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="request-sort">Urutkan</label>
          <select
            id="request-sort"
            value={oldest ? "oldest" : "newest"}
            onChange={(event) =>
              update("sort", event.target.value === "oldest" ? "oldest" : "")
            }
          >
            <option value="newest">Pembaruan terbaru</option>
            <option value="oldest">Pembaruan terlama</option>
          </select>
        </div>
      </div>
      <p role="status" className="text-sm text-slate-600 mb-3">
        {items.length} {officer ? "permintaan tinjauan" : "pengajuan"}
        {query || filter ? " sesuai filter" : " tercatat"}
      </p>
      {rows.length ? (
        <div className="plain-panel !py-0">
          <ul
            aria-label={
              officer ? "Daftar antrean tinjauan" : "Daftar pengajuan"
            }
          >
            {rows.map((item) => (
              <li
                key={item.id}
                className="border-b border-slate-200 last:border-0"
              >
                <Link
                  to={base + "/" + encodeURIComponent(item.id)}
                  state={{ returnTo: location.pathname + location.search }}
                  className="block py-5 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#17324D]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="font-semibold min-w-0 break-words">
                      {officer ? item.applicant_name : item.service_name}
                    </h2>
                    <span
                      className={
                        item.current_status === "PERLU_PERBAIKAN" &&
                        !item.revision_pending
                          ? "status-attention"
                          : "status-neutral"
                      }
                    >
                      {getReviewStatusLabel(item)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 break-words">
                    {officer
                      ? item.service_name
                      : "Untuk " + item.applicant_name}
                  </p>
                  <p className="text-sm text-slate-500 mt-2 break-words">
                    {item.internal_reference ||
                      item.official_number ||
                      "Catatan pengajuan"}{" "}
                    · Diperbarui{" "}
                    {displayTime(item.updated_at || item.created_at)}
                  </p>
                  {!officer && (
                    <p className="text-sm text-slate-600 mt-2">
                      Pengajuan instansi:{" "}
                      {getOfficialSubmissionStatusLabel(item)}
                    </p>
                  )}
                  {!officer && <p className="text-sm text-slate-700 mt-2">{caseNextAction(item).actor} · {caseNextAction(item).label}</p>}
                  <span className="text-link inline-block mt-3 text-sm">
                    {officer ? "Buka tinjauan" : "Lihat rincian"} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="empty-state">
          <h2>
            {all.length
              ? "Tidak ada hasil yang sesuai"
              : officer
                ? "Belum ada permintaan yang ditugaskan"
                : "Belum ada pengajuan"}
          </h2>
          <p>
            {all.length
              ? "Coba kata kunci atau status lain."
              : officer
                ? "Permintaan yang ditugaskan akan tampil di sini."
                : "Pilih layanan dan kirim persiapan untuk ditinjau petugas."}
          </p>
          {all.length ? (
            <button
              type="button"
              className="button-secondary"
              onClick={() => setParams({})}
            >
              Hapus filter
            </button>
          ) : (
            !officer && (
              <Link className="button-primary" to="/katalog">
                Cari layanan
              </Link>
            )
          )}
        </div>
      )}
      {pageCount > 1 && (
        <nav
          aria-label="Halaman daftar"
          className="flex flex-wrap items-center justify-between gap-3 mt-5"
        >
          <button
            type="button"
            className="button-secondary"
            disabled={page === 1}
            onClick={() => update("page", String(page - 1))}
          >
            Sebelumnya
          </button>
          <span className="text-sm">
            Halaman {page} dari {pageCount}
          </span>
          <button
            type="button"
            className="button-secondary"
            disabled={page === pageCount}
            onClick={() => update("page", String(page + 1))}
          >
            Berikutnya
          </button>
        </nav>
      )}
      {!officer && filter === "complete" && (
        <p className="text-sm text-slate-600 mt-5">
          Tinjauan yang selesai tidak otomatis berarti dokumen pemerintah sudah
          diterbitkan. Status pengajuan instansi ditampilkan terpisah.
        </p>
      )}
    </WorkspaceLayout>
  );
}
