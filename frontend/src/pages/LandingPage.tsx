import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useApp } from "../context/AppContext";
import { useAuth } from "../auth/AuthContext";
import heroEnzyImg from "../assets/hero_enzy.png";

const services = [
  {
    id: 3,
    label: "Akta Kelahiran Baru",
    description: "Pencatatan kelahiran baru dan penerbitan akta resmi tanpa denda.",
    icon: "child_care",
    badge: "Terintegrasi NIK",
  },
  {
    id: 1,
    label: "Pembaruan Kartu Keluarga (KK)",
    description: "Perbarui susunan anggota keluarga, pisah KK, atau tambah anak baru.",
    icon: "groups",
    badge: "Paling Banyak Diurus",
  },
  {
    id: 2,
    label: "Penerbitan KTP Elektronik",
    description: "Panduan penerbitan KTP-el baru usia 17 tahun, penggantian rusak, atau hilang.",
    icon: "badge",
    badge: "1–2 Hari Kerja",
  },
  {
    id: 4,
    label: "Pindah Domisili (SKPWNI)",
    description: "Persiapan surat pindah antar kelurahan, kabupaten, atau provinsi tanpa pengantar RT/RW.",
    icon: "moving",
    badge: "Bebas Surat RT/RW",
  },
];

const steps = [
  {
    num: "01",
    title: "Pilih Layanan",
    desc: "Jawab panduan singkat untuk menentukan berkas fisik wajib yang perlu disiapkan.",
    icon: "checklist",
    label: "Langkah 1",
  },
  {
    num: "02",
    title: "Foto Berkas",
    desc: "Pindai berkas fisik (KTP/KK/Surat) langsung dari kamera HP pada permukaan datar.",
    icon: "photo_camera",
    label: "Langkah 2",
  },
  {
    num: "03",
    title: "Pemeriksaan AI",
    desc: "Sistem cerdas memvalidasi NIK, ejaan nama, dan ketajaman foto dokumen secara instan.",
    icon: "verified",
    label: "Langkah 3",
  },
  {
    num: "04",
    title: "Ke Loket Resmi",
    desc: "Bawa susunan berkas rapi bersama tanda terima ke loket Kelurahan atau Disdukcapil.",
    icon: "storefront",
    label: "Selesai di Loket",
  },
];

export function LandingPage() {
  const [query, setQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<number>(3); // Default: Akta Kelahiran
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { services: guideServices, setSelectedService } = useApp();

  useEffect(() => {
    if (location.state?.scrollTo === "cara-kerja") {
      document.getElementById("cara-kerja")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.key, location.state]);

  const search = (event: FormEvent) => {
    event.preventDefault();
    navigate("/katalog" + (query.trim() ? "?q=" + encodeURIComponent(query.trim()) : ""));
  };

  const handleStartService = (serviceId: number) => {
    const selected = guideServices.find((item) => item.id === serviceId);
    if (selected) setSelectedService(selected);
    navigate(user ? "/persiapan" : `/layanan/${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-white text-[#142C4B] flex flex-col font-sans selection:bg-[#1769D2] selection:text-white">
      {/* 1. TOP ANNOUNCEMENT RIBBON — DEEP CIVIC NAVY */}
      <div className="bg-[#142C4B] text-white px-4 py-2 text-xs sm:text-sm border-b border-[#233F66]">
        <div className="max-w-6xl mx-auto w-full flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#1769D2] text-white font-bold text-xs tracking-wider font-mono shadow-xs">
              100% GRATIS
            </span>
            <span className="text-slate-200 text-xs sm:text-sm font-medium">
              Sesuai UU No. 24/2013: Seluruh pengurusan berkas kependudukan resmi Rp 0 (bebas biaya tanpa calo).
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-sky-200 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Standar SIAK Disdukcapil RI</span>
          </div>
        </div>
      </div>

      <Navbar />

      <main id="main-content" tabIndex={-1}>
        {/* 2. HERO SECTION — BESPOKE CIVIC CRAFT + ENZY HERO BLENDED */}
        <section className="relative pt-10 pb-16 md:pt-14 md:pb-24 overflow-hidden bg-gradient-to-r from-white via-[#F8FAFD] to-[#E9F3F2] border-b border-[#E2E8F0]">
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Left Column (7 cols): Editorial Headline & Unified Pill Search + CTA */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Civic Pill Tag */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#CBD7E6] shadow-xs text-xs sm:text-sm font-semibold text-[#142C4B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Asisten audit berkas kependudukan pra-loket resmi</span>
                </div>

                {/* H1 with Latin Serif Italic Accent */}
                <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-[52px] leading-[1.12] tracking-tight text-[#142C4B]">
                  Urus dokumen kependudukan,{" "}
                  <span className="font-latin text-[#1769D2] font-normal text-[1.1em] block sm:inline">
                    tanpa drama dan bolak-balik.
                  </span>
                </h1>

                {/* Subhead Ramah Lansia (Teks 16-18px) */}
                <p className="text-base sm:text-[18px] text-[#52657A] leading-relaxed max-w-xl">
                  Pra-verifikasi mandiri ejaan nama KTP-el, nomor Kartu Keluarga, dan kelengkapan dokumen sebelum ke loket dinas. Bebas calo dan Rp 0 resmi sesuai amanat UU No. 24/2013.
                </p>

                {/* Search & Actions Bar: Sempurna 1 Garis Sejajar h-[52px] */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
                  <form
                    onSubmit={search}
                    className="flex-1 h-[52px] bg-white pl-4 pr-1.5 rounded-full border border-slate-300 shadow-xs flex items-center gap-2 focus-within:border-[#1769D2] focus-within:ring-2 focus-within:ring-[#1769D2]/20 transition-all"
                    role="search"
                  >
                    <span className="material-symbols-outlined text-slate-400 text-[22px]">search</span>
                    <label htmlFor="hero-search" className="sr-only">
                      Cari syarat layanan kependudukan
                    </label>
                    <input
                      id="hero-search"
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Cari syarat berkas (Akta, KK, KTP)..."
                      className="w-full text-[14px] sm:text-[15px] font-normal outline-none text-[#142C4B] placeholder:text-slate-400 bg-transparent"
                    />
                    <button
                      type="submit"
                      className="h-[40px] px-5 rounded-full bg-[#142C4B] hover:bg-[#1769D2] text-white text-[14px] font-semibold shrink-0 transition-all active:scale-95 shadow-2xs"
                    >
                      Cari
                    </button>
                  </form>

                  {/* Master CTA Button (Exact h-[52px] Alignment & Cohesive Title Case) */}
                  <button
                    onClick={() => navigate(user ? "/persiapan" : "/katalog")}
                    className="h-[52px] px-6 rounded-full bg-[#1769D2] hover:bg-[#1255AC] text-white text-[15px] font-semibold shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center justify-center gap-2.5"
                    type="button"
                  >
                    <span>Mulai Cek Berkas</span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px] text-white">arrow_forward</span>
                    </div>
                  </button>
                </div>

                {/* Clean Micro Indicators (Jelas & Terbaca 13-14px) */}
                <div className="pt-1 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-[#52657A] font-medium">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                    <span>Rp 0 bebas retribusi (UU 24/2013)</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#1769D2]">lock</span>
                    <span>Privasi lokal peramban &amp; aman</span>
                  </span>
                </div>
              </div>

              {/* Right Column (5 cols): Authentic Indonesian Figure Enzy Storia Blended */}
              <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[430px]">
                  <img
                    src={heroEnzyImg}
                    alt="Warga Indonesia tersenyum ramah menyiapkan dokumen kependudukan secara mandiri"
                    className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-sm block"
                  />

                  {/* Floating Glassmorphic Badge directly over photo */}
                  <div className="absolute left-[4%] bottom-[8%] sm:left-[6%] sm:bottom-[10%] z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3.5 shadow-xl border border-white/90 max-w-[280px]">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1769D2] flex items-center justify-center font-bold shrink-0">
                      <span className="material-symbols-outlined text-[24px]">calendar_month</span>
                    </div>
                    <div className="text-left font-sans">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#142C4B] tracking-tight">
                          Target selesai loket
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      </div>
                      <span className="font-display font-extrabold text-base text-[#087F68] tracking-tight block">
                        1 – 2 hari kerja
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. FAST SERVICE SELECTION (INTERACTIVE CIVIC DOSSIER – UNIFIED PILL TABS) */}
        <section className="py-16 px-6 max-w-6xl mx-auto w-full" id="kenapa-kami">
          <div className="bg-white rounded-3xl border border-[#CBD7E6] p-8 md:p-12 shadow-sm space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2.5">
              <span className="px-3.5 py-1 rounded-full bg-[#EBF1F8] text-[#1769D2] font-mono font-bold text-xs uppercase tracking-wider">
                NAVIGASI PENGURUSAN MANDIRI
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#142C4B]">
                Pilih Dokumen yang Ingin Anda Siapkan
              </h2>
              <p className="text-sm sm:text-base text-[#52657A]">
                Pilih jenis berkas untuk melihat daftar periksa fisik, estimasi pengerjaan, dan kanal pengajuan resmi.
              </p>
            </div>

            {/* Unified Pill Buttons for Service Selector (Consistent Title Case) */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {services.slice(0, 3).map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setSelectedTab(svc.id)}
                  className={`h-[48px] px-6 rounded-full font-semibold text-sm transition-all flex items-center gap-2.5 ${
                    selectedTab === svc.id
                      ? "bg-[#142C4B] text-white shadow-md scale-102"
                      : "bg-[#F8FAFD] text-[#52657A] hover:bg-slate-100 border border-[#CBD7E6]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{svc.icon}</span>
                  <span>{svc.label}</span>
                </button>
              ))}
            </div>

            {/* Dossier Requirements Overview */}
            <div className="bg-[#F8FAFD] border border-[#CBD7E6] rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-left">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#52657A] uppercase tracking-wider block font-mono">
                  Berkas Fisik Wajib
                </span>
                <div className="font-bold text-base sm:text-lg text-[#142C4B]">
                  {selectedTab === 3 && "3 Dokumen Fisik Inti"}
                  {selectedTab === 1 && "2 Dokumen Kependudukan"}
                  {selectedTab === 2 && "1 Salinan KK Terbaru"}
                </div>
                <p className="text-xs sm:text-sm text-[#52657A] leading-relaxed">
                  {selectedTab === 3 && "Surat Kelahiran Faskes (RSUD/Bidan), Kartu Keluarga, dan Buku Nikah Orang Tua."}
                  {selectedTab === 1 && "Kartu Keluarga asli lama dan surat bukti mutasi (Buku Nikah / Ijazah)."}
                  {selectedTab === 2 && "Salinan KK ber-barcode TTE dan fisik KTP lama (jika rusak)."}
                </p>
              </div>

              <div className="space-y-1.5 md:border-l md:border-r md:border-[#CBD7E6] md:px-6">
                <span className="text-xs font-bold text-[#52657A] uppercase tracking-wider block font-mono">
                  Biaya &amp; Standar Waktu
                </span>
                <div className="font-bold text-base sm:text-lg text-[#087F68] flex items-center gap-1.5">
                  <span>Rp 0 (Gratis Sesuai UU)</span>
                </div>
                <p className="text-xs sm:text-sm text-[#52657A] leading-relaxed">
                  Standar penyelesaian: <strong>1 – 2 hari kerja</strong> setelah berkas fisik diverifikasi loket resmi.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleStartService(selectedTab)}
                  className="w-full h-[48px] px-6 rounded-full bg-[#1769D2] hover:bg-[#1255AC] text-white font-semibold text-sm shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  type="button"
                >
                  <span>Lihat Panduan &amp; Mulai Cek</span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px] text-white">arrow_forward</span>
                  </div>
                </button>
                <span className="text-xs text-center text-[#52657A]">
                  Bebas diakses tanpa perlu membuat akun di awal.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. ALUR 4 TAHAP PROSEDURAL (PUNCHY, SEQUENTIAL, ACCESSIBLE) */}
        <section id="cara-kerja" className="py-16 px-6 max-w-6xl mx-auto space-y-12 w-full text-center">
          <div className="space-y-2.5 max-w-2xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-[#EBF1F8] text-[#1769D2] font-mono font-bold text-xs uppercase tracking-wider">
              SISTEMATIKA PROSES
            </span>
            <h2 className="text-3xl font-extrabold font-display text-[#142C4B]">
              4 Tahap Dari Rumah Hingga Selesai di Loket
            </h2>
            <p className="text-sm sm:text-base text-[#52657A]">
              Alur terstruktur dan berurutan untuk memastikan berkas Anda bebas penolakan sebelum ke kantor dinas.
            </p>
          </div>

          {/* 4 Cards with Consistent Elevation, Clear Milestone Numerals & Action Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left relative">
            {steps.map((st) => (
              <div
                key={st.num}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 hover:border-[#1769D2] hover:shadow-md transition-all shadow-xs flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-11 h-11 rounded-xl bg-[#142C4B] group-hover:bg-[#1769D2] text-white flex items-center justify-center font-black font-mono text-sm shadow-xs transition-colors">
                      {st.num}
                    </span>
                    <span className="material-symbols-outlined text-[24px] text-[#1769D2] p-2 rounded-xl bg-blue-50">
                      {st.icon}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[#142C4B] group-hover:text-[#1769D2] transition-colors">
                    {st.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
                <div className="pt-2 text-xs font-semibold text-[#1769D2] flex items-center gap-1">
                  <span>{st.label}</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. CIVIC TRANSPARENCY & LEGAL GUARANTEE (ELEVATED, TRUSTWORTHY, NO CLUTTER) */}
        <section id="dasar-hukum" className="py-16 bg-[#F8FAFD] border-y border-[#E2E8F0]">
          <div className="max-w-6xl mx-auto px-6 space-y-10">
            <div className="text-center space-y-2.5 max-w-2xl mx-auto">
              <span className="px-3.5 py-1 rounded-full bg-blue-100/70 text-[#1769D2] font-mono font-bold text-xs uppercase tracking-wider">
                JAMINAN TATA KELOLA PUBLIK
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#142C4B]">
                Komitmen Transparansi &amp; Integritas Publik
              </h2>
              <p className="text-sm sm:text-base text-[#52657A]">
                DaftarIn menjamin kepastian syarat berkas, transparansi biaya Rp 0, dan perlindungan privasi data warga secara mandiri.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Guarantee Card 1 */}
              <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1769D2] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[26px]">account_balance</span>
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full font-mono">
                      Standar Nasional
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[#142C4B]">
                    Regulasi Resmi Negara
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Seluruh alur panduan dan daftar periksa mengacu langsung pada standar kependudukan nasional yang sah dan selalu dimutakhirkan.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs font-mono text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100">UU No. 24/2013</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100">Permendagri 108/2019</span>
                </div>
              </div>

              {/* Guarantee Card 2 */}
              <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[26px]">verified_user</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-mono">
                      Biaya Resmi: Rp 0
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[#142C4B]">
                    100% Bebas Pungutan Liar
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Pengurusan mandiri di loket resmi bebas biaya retribusi. Tolak dan laporkan segala bentuk percaloan atau jalur kilat berbayar.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs font-mono text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">Pasal 79A UU 24/2013</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100">Halo Dukcapil 1500537</span>
                </div>
              </div>

              {/* Guarantee Card 3 */}
              <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#142C4B] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[26px]">lock</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-full font-mono">
                      Privasi Peramban
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[#142C4B]">
                    Kedaulatan Data Warga
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Formulir dan berkas diproses di peramban Anda. Kami tidak menyimpan, mengumpulkan, atau membagikan identitas pribadi Anda ke pihak ketiga.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs font-mono text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100">100% Aman di Browser</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100">Bebas Pelacak</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ ACCORDION (TEKS JELAS & BERSIH) */}
        <section id="faq" className="py-16 px-6 max-w-3xl mx-auto space-y-8 w-full text-left">
          <div className="text-center space-y-2.5">
            <span className="text-[#1769D2] font-mono font-bold text-xs uppercase tracking-wider">
              PERTANYAAN UMUM
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#142C4B]">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-3.5">
            <details className="bg-white rounded-2xl border border-[#CBD7E6] p-5 shadow-xs group">
              <summary className="font-bold text-base text-[#142C4B] cursor-pointer flex items-center justify-between list-none">
                <span>Apakah ada biaya menggunakan DaftarIn?</span>
                <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                <strong>100% Gratis!</strong> Sesuai UU No. 24/2013, seluruh pelayanan administrasi kependudukan di Indonesia bebas retribusi (Rp 0). Platform ini tidak memungut biaya apapun.
              </p>
            </details>

            <details className="bg-white rounded-2xl border border-[#CBD7E6] p-5 shadow-xs group">
              <summary className="font-bold text-base text-[#142C4B] cursor-pointer flex items-center justify-between list-none">
                <span>Apakah foto berkas saya langsung dikirim ke kantor pemerintah?</span>
                <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                Belum. DaftarIn berfungsi sebagai instrumen audit awal mandiri. Berkas fisik tetap Anda serahkan langsung ke loket pelayanan kelurahan atau diunggah ke website resmi Disdukcapil daerah Anda.
              </p>
            </details>

            <details className="bg-white rounded-2xl border border-[#CBD7E6] p-5 shadow-xs group">
              <summary className="font-bold text-base text-[#142C4B] cursor-pointer flex items-center justify-between list-none">
                <span>Bagaimana cara kerja pemeriksaan berkas dengan AI?</span>
                <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                Sistem AI memeriksa ketajaman foto, mendeteksi pantulan silau, memastikan sudut kartu tidak terpotong, dan memeriksa keabsahan susunan 16 digit NIK secara otomatis sebelum berkas dibawa ke loket.
              </p>
            </details>
          </div>
        </section>

        {/* 7. BOTTOM CTA */}
        <section className="bg-[#142C4B] text-white py-16 px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight text-white">
              Sudah Siap Menyiapkan Dokumen Tanpa Ragu?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Hanya butuh 3 menit untuk memeriksa kelengkapan berkasmu. Gratis, aman, dan langsung jelas langkahnya.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate(user ? "/persiapan" : "/katalog")}
                className="h-[52px] px-8 rounded-full bg-[#1769D2] hover:bg-[#1255AC] text-white font-semibold text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5"
                type="button"
              >
                <span>Mulai Persiapan Mandiri</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-white">arrow_forward</span>
                </div>
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
