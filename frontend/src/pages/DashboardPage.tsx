import { Link } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import {
  documentSlots,
  getSelectedConditionOption,
} from "../types/preparation";
import {
  getOfficialSubmissionStatusLabel,
  getReviewStatusLabel,
  useApp,
} from "../context/AppContext";

export function DashboardPage() {
  const {
    user,
    services,
    preparations,
    selectPreparation,
    getPreparationReadiness,
    applications,
  } = useApp();

  const validPreparations = preparations.filter(
    (p) => p.id !== "prep-draft-uninitialized",
  );
  const latestPrep = validPreparations[0];
  const latestService = latestPrep
    ? services.find((s) => s.id === latestPrep.serviceId) || services[0]
    : services[0];
  const latestReadiness = latestPrep
    ? getPreparationReadiness(latestPrep)
    : null;

  const slots = latestPrep
    ? documentSlots(latestService, latestPrep.conditionKey)
    : [];
  const requiredSlots = slots.filter((slot) => slot.required);
  const uploadedRequired = latestPrep
    ? latestPrep.documents.filter(
        (document) =>
          requiredSlots.some((slot) => slot.id === document.id) &&
          document.status === "TERUNGGAH",
      ).length
    : 0;

  const activeCondition = latestPrep
    ? getSelectedConditionOption(latestService, latestPrep.conditionKey)
    : getSelectedConditionOption(latestService);

  const needsAttention =
    latestReadiness?.state === "PERLU_DILENGKAPI" ||
    latestReadiness?.state === "PERLU_PERIKSA_ULANG";

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-[#142C4B]">
      <Sidebar role="warga" />
      <div className="flex-1 min-w-0">
        <TopBar breadcrumbs={["Dashboard"]} role="warga" />
        <main id="main-content" tabIndex={-1} className="workspace-content">
          <div className="section-heading">
            <div>
              <p className="text-sm text-slate-500 mb-1">
                Halo, {user.name.split(" ")[0]}
              </p>
              <h1>Persiapan dan pengajuanmu</h1>
            </div>
            <Link to="/katalog" className="button-primary">
              Cari layanan
            </Link>
          </div>

          <section
            className="workspace-section"
            aria-labelledby="preparation-heading"
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 id="preparation-heading" className="text-[17px] font-semibold">
                {latestPrep ? "Persiapan terakhir" : "Mulai persiapan"}
              </h2>
              {validPreparations.length > 0 && (
                <Link to="/persiapan" className="text-link text-sm">
                  Lihat semua persiapan ({validPreparations.length}) →
                </Link>
              )}
            </div>
            {latestPrep && latestReadiness ? (
              <div className="preparation-card justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-600">
                      {latestPrep.internalReference}
                    </span>
                    <span className="text-xs text-slate-500">
                      · {latestPrep.agency || "Disdukcapil Kota Contoh"}
                    </span>
                    <span
                      className={
                        needsAttention ? "status-attention" : "status-neutral"
                      }
                    >
                      {latestReadiness.label}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mt-2">
                    {latestPrep.serviceName}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Subjek:{" "}
                    {latestPrep.applicantTarget === "anggota_keluarga"
                      ? "Anggota keluarga"
                      : "Diri sendiri"}{" "}
                    ({latestPrep.formData.nama_lengkap || "Nama belum diisi"}) ·
                    Kondisi: {activeCondition.label} · {uploadedRequired} dari{" "}
                    {requiredSlots.length} dokumen wajib terunggah
                  </p>
                </div>
                <Link
                  to={latestReadiness.steps.resumePath}
                  onClick={() => selectPreparation(latestPrep.id)}
                  className="button-primary shrink-0"
                >
                  {latestReadiness.steps.resumeLabel}{" "}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            ) : (
              <div className="empty-state">
                <h3>Siapkan berkas untuk layanan yang kamu butuhkan</h3>
                <p>
                  Pilih layanan, konfirmasi kebutuhanmu pada tahap pertama, lalu
                  lengkapi data dan dokumenmu.
                </p>
                <Link to="/katalog" className="button-primary">
                  Mulai persiapan
                </Link>
              </div>
            )}
          </section>

          <section
            className="workspace-section"
            aria-labelledby="applications-heading"
          >
            <h2 id="applications-heading">
              Pengajuan saya ({applications.length})
            </h2>
            {applications.length ? (
              <div className="application-list">
                {applications.map((application) => (
                  <Link
                    key={application.id}
                    to={
                      "/pelacakan?id=" +
                      encodeURIComponent(application.id)
                    }
                    className="application-row"
                  >
                    <div className="min-w-0">
                      <h3 className="font-semibold">
                        {application.service_name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {application.internal_reference}
                        {application.official_submission?.officialReceiptNumber
                          ? ` · Tanda terima resmi: ${application.official_submission.officialReceiptNumber}`
                          : application.official_number
                            ? ` · ${application.official_number}`
                            : ""}{" "}
                        · {application.channel}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <span
                        className={
                          application.current_status === "SELESAI" ||
                          application.current_status === "HASIL_DITERIMA_WARGA"
                            ? "status-ready"
                            : application.current_status ===
                                  "PERLU_PERBAIKAN" &&
                                !application.revision_pending
                              ? "status-attention"
                              : "status-neutral"
                        }
                      >
                        Tinjauan: {getReviewStatusLabel(application)}
                      </span>
                      {(application.official_submission ||
                        application.current_status === "DICATAT_WARGA" ||
                        application.current_status ===
                          "HASIL_DITERIMA_WARGA") && (
                        <span className="status-ready">
                          {getOfficialSubmissionStatusLabel(application)}
                        </span>
                      )}
                      <span aria-hidden="true">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>Belum ada pengajuan yang dicatat</h3>
                <p>
                  Setelah mengajukan ke instansi resmi, catat nomor tanda
                  terimamu untuk memantau perkembangannya di sini.
                </p>
                <Link to="/pelacakan" className="text-link">
                  Buka pelacakan →
                </Link>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
