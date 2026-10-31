import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { useApp } from "../context/AppContext";
import { getSelectedConditionOption } from "../types/preparation";

const AVAILABLE_REGIONS = [
  "Kota Contoh",
  "Kabupaten Lain (Belum tersedia)",
];

function CatalogContent({ isWorkspace }: { isWorkspace: boolean }) {
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState("");
  const [alphabetical, setAlphabetical] = useState(false);
  const {
    services: catalogServices,
    setSelectedService,
    selectedRegion,
    setSelectedRegion,
    preparations,
    saveGuestIntent,
  } = useApp();
  const query = params.get("q") || "";
  const categories = [
    ...new Set(catalogServices.map((service) => service.category)),
  ];
  const isUnsupportedRegion = selectedRegion !== "Kota Contoh";

  const services = useMemo(() => {
    if (isUnsupportedRegion) return [];
    const matches = catalogServices.filter(
      (service) =>
        (!category || service.category === category) &&
        (
          service.name +
          " " +
          service.description +
          " " +
          service.agency +
          " " +
          service.requirements.join(" ")
        )
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    );
    return alphabetical
      ? [...matches].sort((a, b) => a.name.localeCompare(b.name, "id"))
      : matches;
  }, [query, category, alphabetical, catalogServices, isUnsupportedRegion]);

  const search = (value: string) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set("q", value);
        else next.delete("q");
        return next;
      },
      { replace: true },
    );

  return (
    <>
      {!isWorkspace && (
        <nav
          className="text-sm text-slate-500 mb-7"
          aria-label="Lokasi halaman"
        >
          <Link to="/">Beranda</Link>
          <span aria-hidden="true" className="mx-3">
            /
          </span>
          <span aria-current="page">Cari layanan</span>
        </nav>
      )}
      <h1 className={isWorkspace ? "" : "page-title"}>Cari layanan</h1>
      <p className="text-slate-500 text-sm mt-2">
        Pilih wilayah dan layanan untuk melihat panduan persyaratan serta
        memulai persiapan berkas.
      </p>
      <form
        className="catalog-search"
        role="search"
        onSubmit={(event: FormEvent) => event.preventDefault()}
      >
        <label htmlFor="catalog-search" className="sr-only">
          Cari layanan
        </label>
        <span
          className="material-symbols-outlined text-slate-400"
          aria-hidden="true"
        >
          search
        </span>
        <input
          id="catalog-search"
          type="search"
          placeholder="Cari nama layanan, dokumen, atau kebutuhanmu (mis. KK, akta, pindah)…"
          value={query}
          onChange={(event) => search(event.target.value)}
        />
      </form>
      <div className="catalog-controls">
        <div>
          <label htmlFor="service-region">Wilayah layanan</label>
          <select
            id="service-region"
            value={selectedRegion}
            onChange={(event) => setSelectedRegion(event.target.value)}
          >
            {AVAILABLE_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="service-category">Kategori</label>
          <select
            id="service-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Semua kategori</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="service-sort">Urutkan</label>
          <select
            id="service-sort"
            value={alphabetical ? "name" : "default"}
            onChange={(event) =>
              setAlphabetical(event.target.value === "name")
            }
          >
            <option value="default">Utama &amp; populer</option>
            <option value="name">Nama A–Z</option>
          </select>
        </div>
        <p className="text-xs text-slate-500">
          Instansi: Disdukcapil {selectedRegion}
        </p>
      </div>

      {isUnsupportedRegion ? (
        <div className="empty-state">
          <h2>Panduan untuk wilayah ini belum tersedia</h2>
          <p>
            Persyaratan layanan dapat berbeda di setiap kabupaten/kota. DaftarIn
            hanya menampilkan panduan untuk wilayah yang sumber aturannya sudah
            tercatat.
          </p>
          <button
            type="button"
            className="button-secondary"
            onClick={() => setSelectedRegion("Kota Contoh")}
          >
            Kembali ke Kota Contoh
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-5" aria-live="polite">
            {services.length} layanan di {selectedRegion}
          </p>
          {services.length ? (
            <div className="catalog-grid">
              {services.map((service) => {
                const draftCount = preparations.filter(
                  (p) =>
                    p.serviceId === service.id &&
                    p.id !== "prep-draft-uninitialized",
                ).length;
                return (
                  <article className="catalog-card bg-white" key={service.id}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500">
                        {service.category} · {service.region || "Kota Contoh"}
                      </p>
                      {draftCount > 0 && (
                        <span className="status-neutral">
                          {draftCount} draf persiapan
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold mt-3">
                      {service.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {service.agency}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-3 flex-1">
                      {service.description}
                    </p>
                    <dl className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>
                        <dt className="text-slate-400">Biaya (acuan contoh)</dt>
                        <dd className="font-medium mt-0.5">
                          {service.official_fee || "Belum tercatat"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Estimasi waktu</dt>
                        <dd className="font-medium mt-0.5">
                          {service.official_duration || "Belum tercatat"}
                        </dd>
                      </div>
                    </dl>
                    <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
                      <Link
                        className="text-link"
                        to={"/layanan/" + service.id}
                        onClick={() => {
                          setSelectedService(service);
                          saveGuestIntent({
                            serviceId: service.id,
                            region: service.region || selectedRegion,
                            conditionKey:
                              getSelectedConditionOption(service).value,
                          });
                        }}
                      >
                        Baca panduan <span aria-hidden="true">→</span>
                      </Link>
                      <span className="text-xs text-slate-400">
                        Panduan v{service.version || 1}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <h2>Tidak ada layanan yang sesuai</h2>
              <p>Coba kata kunci lain atau hapus filter kategori.</p>
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  search("");
                  setCategory("");
                }}
              >
                Hapus pencarian dan filter
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export function CatalogPage() {
  const { user } = useAuth();
  const isCitizenWorkspace = user?.role === "warga";

  if (isCitizenWorkspace) {
    return (
      <div className="flex min-h-screen bg-[#F7F8FA] text-[#142C4B]">
        <Sidebar role="warga" />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar breadcrumbs={["Cari layanan"]} role="warga" />
          <main
            id="main-content"
            tabIndex={-1}
            className="workspace-content w-full flex-1"
          >
            <CatalogContent isWorkspace={true} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="page-width catalog-main">
        <CatalogContent isWorkspace={false} />
      </main>
      <Footer />
    </div>
  );
}
