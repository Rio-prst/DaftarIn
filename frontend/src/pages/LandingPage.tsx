import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useApp } from "../context/AppContext";
import { useAuth } from "../auth/AuthContext";
import { roleHome } from "../auth/types";

const services = [
  {
    id: 1,
    label: "Kartu Keluarga (KK)",
    description: "Perbarui susunan anggota keluarga, pisah KK, atau tambah anak baru.",
    icon: "groups",
    badge: "Paling Banyak Diurus"
  },
  {
    id: 2,
    label: "KTP Elektronik (KTP-el)",
    description: "Panduan penerbitan KTP baru usia 17 tahun, penggantian rusak, atau hilang.",
    icon: "badge",
    badge: "Cepat 1 Hari"
  },
  {
    id: 3,
    label: "Akta Kelahiran",
    description: "Pencatatan kelahiran baru atau pengurusan akta terlambat tanpa denda.",
    icon: "child_care",
    badge: "Terintegrasi NIK"
  },
  {
    id: 4,
    label: "Pindah Domisili (SKPWNI)",
    description: "Persiapan surat pindah datang/keluar antar kelurahan, kota, atau provinsi.",
    icon: "moving",
    badge: "Antar Wilayah"
  },
];

const steps = [
  [
    "Pilih Layanan",
    "Pilih dokumen kependudukan yang ingin diurus sesuai kebutuhan dan domisili Anda."
  ],
  [
    "Lengkapi Data & Berkas",
    "Isi biodata pemohon dan unggah foto dokumen pendukung dengan jelas dari HP."
  ],
  [
    "Pemeriksaan Otomatis AI",
    "Sistem cerdas memindai ketajaman foto, membaca NIK, dan mencocokkan data formulir."
  ],
  [
    "Dapatkan Tanda Terima",
    "Peroleh struk tanda terima resmi dan bawa berkas lengkap ke loket kelurahan."
  ],
];

export function LandingPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { services: guideServices, setSelectedService, openChat } = useApp();

  useEffect(() => {
    if (location.state?.scrollTo === "cara-kerja") {
      document
        .getElementById("cara-kerja")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.key, location.state]);

  const search = (event: FormEvent) => {
    event.preventDefault();
    navigate(
      "/katalog" +
        (query.trim() ? "?q=" + encodeURIComponent(query.trim()) : ""),
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F223D] flex flex-col font-sans">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        {/* Hero Section Inklusif & Ramah Lansia */}
        <section className="landing-hero page-width py-10 sm:py-16">
          <div className="max-w-[620px]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#1769D2] text-[13px] sm:text-[14px] font-semibold mb-4 shadow-2xs">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Portal Resmi Persiapan Administrasi Kependudukan</span>
            </div>

            <h1 className="text-[32px] sm:text-[44px] md:text-[50px] font-extrabold tracking-tight text-[#0F223D] leading-[1.15]">
              Urus Berkas Warga,
              <br />
              <span className="text-[#1769D2]">Pasti &amp; Lebih Jelas.</span>
            </h1>

            <p className="mt-4 sm:mt-5 text-[16px] sm:text-[18px] text-slate-700 leading-relaxed font-normal">
              Periksa persyaratan KTP, Kartu Keluarga, dan Akta secara mandiri.
              Didukung pemindai forensik AI untuk memastikan foto dokumen tajam
              dan NIK valid sebelum datang ke kantor kelurahan.
            </p>

            {/* Pencarian Cepat (Tinggi 52px Nyaman Ditekan) */}
            <form onSubmit={search} className="service-search mt-6 sm:mt-8 shadow-xs" role="search">
              <span
                className="material-symbols-outlined text-slate-400 text-[24px]"
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
                placeholder="Ketik layanan: KTP, KK, Akta Kelahiran, Pindah…"
                type="search"
                className="text-[15px] sm:text-[16px] text-[#0F223D] placeholder:text-slate-400"
              />
              <button className="button-primary min-h-[48px] px-6 text-[15px]" type="submit">
                Cari
              </button>
            </form>

            {/* Tombol Aksi Langsung Bagi Pemula / Lansia */}
            <div className="mt-5 flex flex-wrap items-center gap-3.5">
              <Link
                to={user ? roleHome[user.role] : "/persiapan"}
                className="button-primary min-h-[48px] px-6 text-[15px] font-semibold flex items-center gap-2 shadow-xs active:scale-98 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">play_circle</span>
                <span>{user ? "Masuk ke Ruang Kerja Saya" : "Mulai Siapkan Dokumen Sekarang"}</span>
              </Link>
              <button
                type="button"
                onClick={openChat}
                className="button-secondary min-h-[48px] px-5 text-[15px] font-medium flex items-center gap-2 hover:bg-slate-100 transition-all"
              >
                <span className="material-symbols-outlined text-[20px] text-[#1769D2]">
                  support_agent
                </span>
                <span>Tanya Asisten AI</span>
              </button>
            </div>
            <p className="mt-3 text-[13px] sm:text-[14px] text-slate-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
              100% Bebas Biaya (Gratis Rp 0) · Panduan resmi Kemendagri RI
            </p>
          </div>

          {/* Kartu Pratinjau Alur Berkas Cerdas */}
          <div className="hero-document bg-white border border-slate-200/90 shadow-lg rounded-2xl p-6 sm:p-7" aria-hidden="true">
            <div className="document-heading flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1769D2] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">folder_special</span>
              </div>
              <div>
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
                  Daftar Periksa Berkas
                </span>
                <h3 className="text-[16px] font-bold text-slate-900 leading-none mt-0.5">
                  Pembaruan Kartu Keluarga
                </h3>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="document-row p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[14px]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                    check_circle
                  </span>
                  <span className="font-medium text-slate-800">1. Biodata &amp; NIK Pemohon</span>
                </div>
                <span className="text-[12px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Lengkap
                </span>
              </div>

              <div className="document-row p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[14px]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                    check_circle
                  </span>
                  <span className="font-medium text-slate-800">2. Foto Dokumen Pendukung</span>
                </div>
                <span className="text-[12px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Terunggah
                </span>
              </div>

              <div className="document-row p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-[14px]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#1769D2] text-[20px] animate-pulse">
                    document_scanner
                  </span>
                  <span className="font-semibold text-blue-950">3. Pemindaian AI &amp; Validasi</span>
                </div>
                <span className="text-[12px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  92% Siap
                </span>
              </div>

              <div className="document-row p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[14px]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">
                    receipt_long
                  </span>
                  <span className="font-medium text-slate-500">4. Struk Tanda Terima Cetak</span>
                </div>
                <span className="text-[12px] font-medium text-slate-400">
                  Siap Unduh
                </span>
              </div>
            </div>

            <p className="mt-4 pt-3.5 border-t border-slate-100 text-[13px] text-slate-500 text-center font-medium">
              Selesaikan berkas secara bertahap tanpa takut salah langkah.
            </p>
          </div>
        </section>

        {/* Pilihan Layanan Utama */}
        <section
          className="page-width landing-section py-12"
          aria-labelledby="services-heading"
        >
          <div className="section-heading flex items-center justify-between mb-8">
            <div>
              <h2 id="services-heading" className="text-[26px] sm:text-[32px] font-bold text-[#0F223D]">
                Layanan Kependudukan Populer
              </h2>
              <p className="text-[15px] sm:text-[16px] text-slate-600 mt-1">
                Pilih dokumen yang ingin Anda urus untuk melihat syarat dan mulai persiapan.
              </p>
            </div>
            <Link to="/katalog" className="text-link text-[15px] font-semibold shrink-0">
              Lihat Semua <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="service-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((service) => (
              <Link
                key={service.id}
                to={"/layanan/" + service.id}
                className="service-link bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-[#1769D2] hover:shadow-md transition-all group flex flex-col justify-between"
                onClick={() => {
                  const selected = guideServices.find(
                    (item) => item.id === service.id,
                  );
                  if (selected) setSelectedService(selected);
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="material-symbols-outlined text-[32px] text-[#1769D2] p-2.5 rounded-xl bg-blue-50 group-hover:scale-105 transition-transform"
                      aria-hidden="true"
                    >
                      {service.icon}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {service.badge}
                    </span>
                  </div>
                  <h3 className="text-[18px] font-bold text-slate-900 group-hover:text-[#1769D2] transition-colors">
                    {service.label}
                  </h3>
                  <p className="text-[14px] text-slate-600 mt-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[#1769D2] group-hover:underline">
                    Lihat Panduan
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#1769D2] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4 Tahap Alur Persiapan Berkas */}
        <section
          id="cara-kerja"
          className="how-section scroll-mt-24 py-14 bg-slate-900 text-white"
          aria-labelledby="steps-heading"
        >
          <div className="page-width">
            <div className="text-center max-w-[640px] mx-auto mb-10">
              <span className="text-[13px] font-bold uppercase tracking-wider text-blue-400">
                Alur Praktis 4 Tahap
              </span>
              <h2 id="steps-heading" className="text-[28px] sm:text-[36px] font-bold text-white mt-1">
                Cara Kerja DaftarIn
              </h2>
              <p className="text-[15px] sm:text-[16px] text-slate-300 mt-2">
                Dirancang ramah bagi seluruh warga untuk mencegah penolakan berkas di kantor kelurahan.
              </p>
            </div>

            <ol className="how-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map(([title, description], index) => (
                <li key={title} className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 relative">
                  <span className="step-number text-[32px] font-black text-blue-400 font-mono">
                    0{index + 1}
                  </span>
                  <h3 className="text-[18px] font-bold text-white mt-2 mb-2">
                    {title}
                  </h3>
                  <p className="text-[14px] text-slate-300 leading-relaxed">
                    {description}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-10 p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center max-w-[700px] mx-auto text-[13px] sm:text-[14px] text-slate-300">
              ℹ️ Pemeriksaan cerdas ini memastikan kelengkapan dokumen awal Anda. Pengesahan akhir dan penerbitan fisik tetap dilakukan secara sah oleh pejabat Disdukcapil di loket resmi.
            </div>
          </div>
        </section>

        {/* Tanya Jawab (FAQ) Lengkap & Tanpa Teks Demo */}
        <section
          className="page-width landing-section faq-section py-14"
          aria-labelledby="faq-heading"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <span className="text-[13px] font-bold uppercase tracking-wider text-[#1769D2]">
                Pusat Bantuan
              </span>
              <h2 id="faq-heading" className="text-[26px] sm:text-[32px] font-bold text-[#0F223D] mt-1">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="mt-3 text-[15px] text-slate-600 leading-relaxed">
                Temukan jawaban cepat seputar pengurusan berkas kependudukan, persyaratan, dan biaya layanan.
              </p>
              <button
                type="button"
                onClick={openChat}
                className="mt-5 button-primary min-h-[48px] px-5 text-[15px] font-semibold flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span>Buka Tanya Jawab AI</span>
              </button>
            </div>

            <div className="lg:col-span-8 faq-list space-y-3.5">
              <details className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs group">
                <summary className="font-bold text-[16px] sm:text-[17px] text-[#0F223D] cursor-pointer flex items-center justify-between list-none">
                  <span>Apakah pengurusan dokumen di DaftarIn dipungut biaya?</span>
                  <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                    expand_more
                  </span>
                </summary>
                <p className="mt-3 text-[15px] text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
                  Tidak. Seluruh pengurusan dokumen kependudukan (KTP-el, KK, Akta Kelahiran, dan Surat Pindah) di Republik Indonesia adalah <strong>100% GRATIS (Rp 0)</strong> sesuai amanat UU No. 24 Tahun 2013 Pasal 79A.
                </p>
              </details>

              <details className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs group">
                <summary className="font-bold text-[16px] sm:text-[17px] text-[#0F223D] cursor-pointer flex items-center justify-between list-none">
                  <span>Bagaimana cara kerja pemindaian cerdas AI pada berkas saya?</span>
                  <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                    expand_more
                  </span>
                </summary>
                <p className="mt-3 text-[15px] text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
                  Sistem kecerdasan buatan (AI) DaftarIn membaca foto dokumen yang Anda unggah secara otomatis di browser. AI menguji ketajaman teks (apakah buram), keseragaman pencahayaan (bebas silau pantulan flash), kelengkapan 4 sudut kartu, dan memeriksa keabsahan susunan 16 digit NIK. Jika data cocok, Anda dapat menyalin data langsung ke formulir dengan satu klik.
                </p>
              </details>

              <details className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs group">
                <summary className="font-bold text-[16px] sm:text-[17px] text-[#0F223D] cursor-pointer flex items-center justify-between list-none">
                  <span>Apakah perlu mendaftar akun untuk membaca panduan persyaratan?</span>
                  <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                    expand_more
                  </span>
                </summary>
                <p className="mt-3 text-[15px] text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
                  Tidak perlu. Seluruh katalog persyaratan dan panduan resmi dapat dibaca bebas tanpa perlu login. Akun warga hanya digunakan saat Anda ingin menyimpan draf formulir, mengunggah foto berkas, dan mengunduh tanda terima persiapan.
                </p>
              </details>

              <details className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs group">
                <summary className="font-bold text-[16px] sm:text-[17px] text-[#0F223D] cursor-pointer flex items-center justify-between list-none">
                  <span>Bagaimana jika ejaan nama pada KTP dan Ijazah berbeda?</span>
                  <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                    expand_more
                  </span>
                </summary>
                <p className="mt-3 text-[15px] text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
                  Berdasarkan Permendagri No. 73 Tahun 2022, rujukan utama penulisan nama adalah Akta Kelahiran. Jika ada perbedaan huruf, cukup lampirkan Akta Kelahiran dan Ijazah terakhir Anda pada berkas pendukung tanpa perlu penetapan pengadilan selama perbaikan tidak mengubah identitas mendasar.
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
