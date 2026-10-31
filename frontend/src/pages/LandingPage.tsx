import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useApp } from "../context/AppContext";

const services = [
  {
    id: 3,
    label: "Akta kelahiran",
    description: "Siapkan dokumen untuk pencatatan kelahiran.",
    icon: "child_care",
  },
  {
    id: 1,
    label: "Kartu keluarga",
    description: "Perbarui data dan susunan anggota keluarga.",
    icon: "groups",
  },
  {
    id: 2,
    label: "KTP-el",
    description: "Temukan panduan penerbitan atau penggantian KTP.",
    icon: "badge",
  },
  {
    id: 4,
    label: "Pindah domisili",
    description: "Persiapkan berkas perpindahan penduduk.",
    icon: "moving",
  },
];
const steps = [
  ["Pilih layanan", "Baca panduan sesuai kebutuhan dan wilayahmu."],
  ["Siapkan berkas", "Isi data dan unggah dokumen untuk diperiksa."],
  ["Perbaiki temuan", "Lihat bagian yang perlu dilengkapi atau diperjelas."],
  ["Ajukan ke instansi", "Gunakan kanal resmi, lalu catat perkembanganmu."],
];
export function LandingPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.state?.scrollTo === "cara-kerja") {
      document
        .getElementById("cara-kerja")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.key, location.state]);
  const { services: guideServices, setSelectedService, openChat } = useApp();
  const search = (event: FormEvent) => {
    event.preventDefault();
    navigate(
      "/katalog" +
        (query.trim() ? "?q=" + encodeURIComponent(query.trim()) : ""),
    );
  };
  return (
    <div className="min-h-screen bg-white text-[#142C4B] flex flex-col">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <section className="landing-hero page-width">
          <div>
            <p className="eyebrow">Persiapan layanan kependudukan</p>
            <h1>
              Siapkan berkasmu.
              <br />
              <span className="text-[#1769D2]">Lebih jelas langkahnya.</span>
            </h1>
            <p className="hero-description">
              Cari persyaratan, periksa kelengkapan dokumen, dan catat
              pengajuanmu sebelum datang ke instansi.
            </p>
            <form onSubmit={search} className="service-search" role="search">
              <span
                className="material-symbols-outlined text-slate-400"
                aria-hidden="true"
              >
                search
              </span>
              <label htmlFor="service-search" className="sr-only">
                Cari layanan kependudukan
              </label>
              <input
                id="service-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Akta kelahiran, KK, KTP…"
                type="search"
              />
              <button className="button-primary" type="submit">
                Cari layanan
              </button>
            </form>
            <p className="mt-4 text-sm text-slate-500">
              Panduan bisa dibaca tanpa akun.
            </p>
          </div>
          <div className="hero-document" aria-hidden="true">
            <div className="document-heading">
              <span className="material-symbols-outlined">folder_open</span>
              <span>Persiapan berkas</span>
            </div>
            <h2>Akta kelahiran</h2>
            <div className="document-row">
              <span className="material-symbols-outlined">description</span>
              <span>Data pemohon</span>
              <span className="document-check">✓</span>
            </div>
            <div className="document-row">
              <span className="material-symbols-outlined">description</span>
              <span>Dokumen pendukung</span>
              <span className="document-check">✓</span>
            </div>
            <div className="document-row">
              <span className="material-symbols-outlined">fact_check</span>
              <span>Pemeriksaan berkas</span>
              <span className="text-slate-400">—</span>
            </div>
            <p>Lengkapi satu langkah, lanjutkan berikutnya.</p>
          </div>
        </section>
        <section
          className="page-width landing-section"
          aria-labelledby="services-heading"
        >
          <div className="section-heading">
            <h2 id="services-heading">Mau mengurus apa?</h2>
            <Link to="/katalog" className="text-link">
              Semua layanan <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="service-grid">
            {services.map((service) => (
              <Link
                key={service.id}
                to={"/layanan/" + service.id}
                className="service-link"
                onClick={() => {
                  const selected = guideServices.find(
                    (item) => item.id === service.id,
                  );
                  if (selected) setSelectedService(selected);
                }}
              >
                <span
                  className="material-symbols-outlined service-icon"
                  aria-hidden="true"
                >
                  {service.icon}
                </span>
                <h3>{service.label}</h3>
                <p>{service.description}</p>
                <span className="text-link">
                  Lihat panduan <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section
          id="cara-kerja"
          className="how-section scroll-mt-24"
          aria-labelledby="steps-heading"
        >
          <div className="page-width">
            <h2 id="steps-heading">Dari persiapan sampai pengajuan.</h2>
            <ol className="how-grid">
              {steps.map(([title, description], index) => (
                <li key={title}>
                  <span className="step-number">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </li>
              ))}
            </ol>
            <p className="how-note">
              Pemeriksaan membantu menemukan kekurangan awal. Penerimaan berkas
              tetap ditentukan oleh instansi tujuan.
            </p>
          </div>
        </section>
        <section
          className="page-width landing-section faq-section"
          aria-labelledby="faq-heading"
        >
          <div>
            <h2 id="faq-heading">Ada yang ingin ditanyakan?</h2>
            <p className="mt-4 text-slate-500 leading-relaxed">
              Mulai dari panduan. Jika masih bingung, bantuan tersedia di setiap
              langkah.
            </p>
            <button type="button" onClick={openChat} className="text-link mt-5">
              Buka bantuan <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="faq-list">
            <details>
              <summary>Apakah perlu membuat akun?</summary>
              <p>
                Panduan layanan dapat dibaca tanpa akun. Masuk saat kamu ingin
                menyimpan persiapan dan mengunggah dokumen.
              </p>
            </details>
            <details>
              <summary>Apakah berkas langsung dikirim ke pemerintah?</summary>
              <p>
                Belum. Setelah berkas siap, ajukan melalui situs atau loket
                resmi instansi tujuan.
              </p>
            </details>
            <details>
              <summary>Bagaimana cara mengecek dokumen?</summary>
              <p>
                Pilih layanan, isi data, lalu unggah berkas. Sistem akan
                memeriksa kelengkapan berkas dan keabsahan NIK secara otomatis
                sebelum diajukan.
              </p>
            </details>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
