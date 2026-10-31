import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { useApp } from "../context/AppContext";
import {
  documentSlots,
  getSelectedConditionOption,
  getServiceConditionConfig,
} from "../types/preparation";

function ServiceGuideContent({ isWorkspace }: { isWorkspace: boolean }) {
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const {
    services,
    selectedService,
    setSelectedService,
    selectedRegion,
    preparations,
    createPreparation,
    selectPreparation,
    getPreparationReadiness,
    guestIntent,
    saveGuestIntent,
  } = useApp();
  const navigate = useNavigate();
  const service = id
    ? services.find((item) => String(item.id) === id || item.slug === id)
    : selectedService;

  const [guideCondition, setGuideCondition] = useState<string>(() => {
    if (!service) return "";
    if (guestIntent && guestIntent.serviceId === service.id) {
      return guestIntent.conditionKey;
    }
    return getSelectedConditionOption(service).value;
  });

  useEffect(() => {
    if (service) {
      if (service.id !== selectedService.id) {
        setSelectedService(service);
      }
      const validOpt = getSelectedConditionOption(service, guideCondition);
      if (validOpt.value !== guideCondition) {
        setGuideCondition(validOpt.value);
      }
    }
  }, [service, selectedService.id, setSelectedService, guideCondition]);

  if (!service) {
    return (
      <div className="empty-state">
        <h1>Layanan tidak ditemukan</h1>
        <p>Pilih layanan dari katalog untuk membaca panduannya.</p>
        <Link to="/katalog" className="text-link">
          Kembali ke cari layanan →
        </Link>
      </div>
    );
  }

  const conditionConfig = getServiceConditionConfig(service);
  const activeCondition = getSelectedConditionOption(service, guideCondition);
  const slots = documentSlots(service, activeCondition.value);
  const requiredCount = slots.filter((slot) => slot.required).length;
  const servicePreparations = preparations.filter(
    (p) => p.serviceId === service.id && p.id !== "prep-draft-uninitialized",
  );

  const handleSelectCondition = (nextVal: string) => {
    setGuideCondition(nextVal);
    saveGuestIntent({
      serviceId: service.id,
      region: service.region || selectedRegion,
      conditionKey: nextVal,
    });
  };

  const handleStartNewPreparation = () => {
    saveGuestIntent({
      serviceId: service.id,
      region: service.region || selectedRegion,
      conditionKey: activeCondition.value,
    });

    if (authUser && authUser.role === "warga") {
      const created = createPreparation({
        service,
        region: service.region || selectedRegion,
        conditionKey: activeCondition.value,
        applicantTarget: "diri_sendiri",
        needConfirmed: false,
      });
      navigate(
        `/persiapan/kebutuhan?prep=${encodeURIComponent(created.id)}&fromGuide=1`,
      );
      return;
    }

    navigate(
      `/persiapan/kebutuhan?new=1&service=${service.id}&condition=${encodeURIComponent(activeCondition.value)}`,
    );
  };

  const handleResumePreparation = (prepId: string) => {
    const targetPrep = servicePreparations.find((p) => p.id === prepId);
    if (!targetPrep) return;
    selectPreparation(targetPrep.id);
    const prepReadiness = getPreparationReadiness(targetPrep);
    navigate(prepReadiness.steps.resumePath);
  };

  return (
    <>
      {!isWorkspace ? (
        <nav
          className="text-sm text-slate-500 mb-7"
          aria-label="Lokasi halaman"
        >
          <Link to="/katalog">Cari layanan</Link>
          <span aria-hidden="true" className="mx-3">
            /
          </span>
          <span aria-current="page">Panduan</span>
        </nav>
      ) : (
        <div className="mb-4">
          <Link to="/katalog" className="text-link text-sm">
            ← Kembali ke daftar layanan
          </Link>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs text-slate-500">
          {service.category} · {service.region || "Kota Contoh"} ·{" "}
          {service.agency}
        </span>
        <span className="status-neutral">
          {service.source_verified
            ? "Standar instansi terverifikasi"
            : "Data panduan contoh (belum diverifikasi instansi daerah)"}
        </span>
      </div>
      <h1 className={isWorkspace ? "" : "page-title max-w-3xl"}>
        {service.name}
      </h1>
      <p className="mt-3 text-slate-600 leading-relaxed max-w-2xl">
        {service.description}
      </p>

      <div className="guide-grid">
        <div>
          <section className="guide-section">
            <h2>1. Kondisi permohonan</h2>
            <p className="text-sm text-slate-500 mt-2">
              {conditionConfig.question} Pilihan ini menentukan dokumen wajib
              dan akan diteruskan saat kamu memulai persiapan baru.
            </p>
            <div
              className="mt-5 grid gap-3"
              role="radiogroup"
              aria-label={conditionConfig.question}
            >
              {conditionConfig.options.map((option) => {
                const isSelected = activeCondition.value === option.value;
                return (
                  <label
                    key={option.value}
                    className={
                      "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition " +
                      (isSelected
                        ? "border-[#1769D2] bg-[#F5F9FF]"
                        : "border-slate-200 bg-white hover:border-slate-300")
                    }
                  >
                    <input
                      type="radio"
                      name="service-condition"
                      value={option.value}
                      checked={isSelected}
                      onChange={() => handleSelectCondition(option.value)}
                      className="mt-1 w-4 h-4 accent-[#1769D2]"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-sm block text-[#142C4B]">
                        {option.label}
                      </span>
                      <span className="text-xs text-slate-600 block mt-1 leading-relaxed">
                        {option.description}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="guide-section">
            <h2>2. Dokumen yang disiapkan ({requiredCount} wajib)</h2>
            <p className="text-sm text-slate-500 mt-2">
              Persyaratan untuk kondisi <strong>{activeCondition.label}</strong>
              :
            </p>
            <ol className="requirements-list">
              {slots.map((slot, index) => (
                <li
                  key={slot.id}
                  className="flex items-start justify-between gap-4 bg-white px-4 rounded-lg border border-slate-200 mb-2"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="text-xs text-slate-400 mt-1"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <span className="font-medium block">{slot.name}</span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        {slot.conditionNote}
                      </span>
                    </div>
                  </div>
                  <span
                    className={
                      slot.required
                        ? "status-attention shrink-0"
                        : "status-neutral shrink-0"
                    }
                  >
                    {slot.required ? "Wajib" : "Tambahan"}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="guide-section">
            <h2>3. Tahapan pengurusan</h2>
            <ol className="guide-steps">
              <li>
                <h3>Siapkan dan periksa berkas di DaftarIn</h3>
                <p>
                  Konfirmasi kebutuhan, isi data pemohon, unggah dokumen wajib,
                  dan jalankan pemeriksaan awal sebelum menuju loket.
                </p>
              </li>
              <li>
                <h3>Ajukan melalui kanal resmi instansi</h3>
                <p>
                  DaftarIn tidak mengirim berkas otomatis ke pemerintah. Bawa
                  atau ajukan berkas melalui{" "}
                  <strong>{service.official_channel}</strong>.
                </p>
              </li>
              <li>
                <h3>Catat tanda terima dan pantau progres</h3>
                <p>
                  Simpan nomor tanda terima dari instansi di menu Pengajuan Saya
                  untuk memantau tahapan dan menindaklanjuti perbaikan.
                </p>
              </li>
            </ol>
          </section>
        </div>

        <aside className="guide-aside bg-white">
          <h2 className="font-semibold text-base">Mulai persiapan berkas</h2>
          <p className="text-sm text-slate-600 leading-relaxed mt-2">
            Kondisi dipilih: <strong>{activeCondition.label}</strong> (
            {requiredCount} dokumen wajib).
          </p>

          <button
            type="button"
            className="button-primary w-full mt-4"
            onClick={handleStartNewPreparation}
          >
            {servicePreparations.length > 0
              ? "Buat persiapan baru (Urusan terpisah) →"
              : "Mulai persiapan baru (Tahap 1) →"}
          </button>

          {servicePreparations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-2.5">
              <p className="text-xs font-semibold text-slate-600">
                Atau lanjutkan persiapan yang sudah ada ({servicePreparations.length}):
              </p>
              {servicePreparations.map((prep) => {
                const prepReadiness = getPreparationReadiness(prep);
                const condLabel = getSelectedConditionOption(
                  service,
                  prep.conditionKey,
                ).label;
                return (
                  <div
                    key={prep.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-semibold text-slate-700">
                        {prep.internalReference}
                      </span>
                      <span className="text-slate-500">
                        {prep.applicantTarget === "anggota_keluarga"
                          ? "Anggota keluarga"
                          : "Diri sendiri"}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Pemohon: {prep.formData.nama_lengkap || "Belum diisi"} ·{" "}
                      {condLabel}
                    </p>
                    <button
                      type="button"
                      className="button-secondary w-full !py-1.5 !text-xs mt-1"
                      onClick={() => handleResumePreparation(prep.id)}
                    >
                      Lanjutkan ({prepReadiness.steps.resumeLabel}) →
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <dl className="guide-meta mt-6 border-t border-slate-200 pt-5">
            <div>
              <dt>Instansi & wilayah</dt>
              <dd>
                {service.agency} · {service.region || "Kota Contoh"}
              </dd>
            </div>
            <div>
              <dt>Biaya & estimasi waktu (acuan contoh)</dt>
              <dd>
                {service.official_fee || "Belum tercatat"} ·{" "}
                {service.official_duration || "Belum tercatat"}
              </dd>
            </div>
            <div>
              <dt>Kanal pengajuan resmi</dt>
              <dd>{service.official_channel}</dd>
            </div>
            <div>
              <dt>Status sumber panduan</dt>
              <dd>
                <span className="block font-medium text-slate-800">
                  {service.source_title || "Acuan Regulasi Nasional"}
                </span>
                <span className="block text-xs text-slate-500 mt-1 leading-relaxed">
                  {service.source_note ||
                    "Tautan mengarah ke portal umum; standar pelayanan daerah belum diverifikasi otomatis."}
                </span>
                <span className="block text-xs text-slate-400 mt-1">
                  Ditinjau {service.reviewed_at || "26 Oktober 2026"} · Versi{" "}
                  {service.version || 1}
                </span>
                {service.source_url && (
                  <a
                    className="text-link mt-2 text-xs"
                    href={service.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Buka portal rujukan umum ↗
                  </a>
                )}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </>
  );
}

export function ServiceDetailPage() {
  const { user } = useAuth();
  const isCitizenWorkspace = user?.role === "warga";

  if (isCitizenWorkspace) {
    return (
      <div className="flex min-h-screen bg-[#F7F8FA] text-[#142C4B]">
        <Sidebar role="warga" />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar
            breadcrumbs={["Cari layanan", "Panduan layanan"]}
            role="warga"
          />
          <main
            id="main-content"
            tabIndex={-1}
            className="workspace-content w-full flex-1"
          >
            <ServiceGuideContent isWorkspace={true} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="page-width catalog-main">
        <ServiceGuideContent isWorkspace={false} />
      </main>
      <Footer />
    </div>
  );
}
