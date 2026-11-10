import { DocumentIllustration } from "../components/DocumentIllustration";
import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useApp } from "../context/AppContext";
import { useAuth } from "../auth/AuthContext";

const services = [
  {
    id: 3,
    searchTerm: "Akta Kelahiran",
    label: "Akta Kelahiran Baru",
    description:
      "Panduan menyiapkan berkas pencatatan kelahiran dan penerbitan akta.",
    icon: "child_care",
    badge: "Panduan persyaratan",
  },
  {
    id: 1,
    searchTerm: "Kartu Keluarga",
    label: "Pembaruan Kartu Keluarga (KK)",
    description:
      "Perbarui susunan anggota keluarga, pisah KK, atau tambah anak baru.",
    icon: "groups",
    badge: "Paling Banyak Diurus",
  },
  {
    id: 2,
    searchTerm: "KTP",
    label: "Penerbitan KTP Elektronik",
    description:
      "Panduan penerbitan KTP-el baru usia 17 tahun, penggantian rusak, atau hilang.",
    icon: "badge",
    badge: "Lihat alur layanan",
  },
  {
    id: 4,
    searchTerm: "Pindah",
    label: "Pindah Domisili (SKPWNI)",
    description:
      "Panduan menyiapkan berkas pindah domisili sesuai wilayah tujuan.",
    icon: "moving",
    badge: "Panduan pindah domisili",
  },
];

const steps = [
  {
    num: "01",
    title: "Pilih Layanan",
    desc: "Pilih layanan dan kebutuhanmu untuk melihat persyaratan yang sesuai.",
    icon: "checklist",
    label: "Langkah 1",
  },
  {
    num: "02",
    title: "Lengkapi Data",
    desc: "Isi data pemohon dan alasan pengurusan. Gunakan data contoh pada versi demo.",
    icon: "edit_note",
    label: "Langkah 2",
  },
  {
    num: "03",
    title: "Unggah Dokumen",
    desc: "Tambahkan berkas yang diminta. Sistem memeriksa format dan kelengkapan dasar.",
    icon: "upload_file",
    label: "Langkah 3",
  },
  {
    num: "04",
    title: "Tinjau & Kirim",
    desc: "Periksa kembali isian dan setujui pembagian data untuk tinjauan petugas contoh.",
    icon: "fact_check",
    label: "Langkah 4",
  },
];

export function LandingPage() {
  const [query, setQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<number>(3); // Default: Akta Kelahiran
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useAuth();
  const { services: guideServices, setSelectedService } = useApp();
  const selectedGuide = guideServices.find(
    (service) => service.id === selectedTab,
  );

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

  const handleStartService = (serviceId: number) => {
    if (mode === "api") {
      const service = services.find((item) => item.id === serviceId);
      navigate(service ? "/katalog?q=" + encodeURIComponent(service.searchTerm) : "/katalog");
      return;
    }
    const selected = guideServices.find((item) => item.id === serviceId);
    if (selected) setSelectedService(selected);
    navigate(`/layanan/${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-white text-[#17324D] flex flex-col font-sans selection:bg-[#17324D] selection:text-white">
      {/* 1. TOP ANNOUNCEMENT RIBBON — DEEP CIVIC NAVY */}
      <div className="landing-demo-ribbon px-4 py-2 text-xs sm:text-sm">
        <div className="max-w-6xl mx-auto w-full flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#17324D] text-white font-bold text-xs tracking-wider font-mono shadow-xs">
              Versi demo
            </span>
            <span className="text-slate-200 text-xs sm:text-sm font-medium">
              Gunakan data contoh, bukan NIK atau dokumen pribadi asli.
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-sky-200 font-mono">
            <span>Belum terhubung ke instansi</span>
          </div>
        </div>
      </div>

      <Navbar />

      <main id="main-content" tabIndex={-1}>
        {/* 2. HERO SECTION */}
        <section className="landing-hero-band relative pt-10 pb-16 md:pt-14 md:pb-24 overflow-hidden border-b">
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="landing-hero-layout">
              {/* Left Column (7 cols): Editorial Headline & Unified Pill Search + CTA */}
              <div className="min-w-0 space-y-6 text-left">
                {/* Civic Pill Tag */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#C5CDD0] shadow-xs text-xs sm:text-sm font-semibold text-[#17324D]">
                  <span>Pendamping persiapan dokumen kependudukan</span>
                </div>

                {/* H1 with Latin Serif Italic Accent */}
                <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-[52px] leading-[1.12] tracking-tight text-[#17324D]">
                  Urus dokumen kependudukan,{" "}
                  <span className="font-latin text-[#17324D] font-normal text-[1.1em] block sm:inline">
                    satu langkah demi satu.
                  </span>
                </h1>

                {/* Subhead Ramah Lansia (Teks 16-18px) */}
                <p className="text-base sm:text-[18px] text-[#52616B] leading-relaxed max-w-xl">
                  Bingung berkas apa yang perlu dibawa? Temukan persyaratan
                  sesuai kebutuhan, cek kelengkapan, dan minta tinjauan sebelum
                  mengajukan lewat kanal resmi instansi.
                </p>

                {/* Search & Actions Bar: Sempurna 1 Garis Sejajar h-[52px] */}
                <div className="pt-2 flex flex-col sm:flex-row md:flex-col xl:flex-row items-stretch sm:items-center md:items-stretch xl:items-center gap-3 max-w-xl">
                  <form
                    onSubmit={search}
                    className="min-w-0 flex-1 h-[52px] bg-white pl-4 pr-1.5 rounded-full border border-slate-300 shadow-xs flex items-center gap-2 focus-within:border-[#17324D] focus-within:ring-2 focus-within:ring-[#17324D]/20 transition-all"
                    role="search"
                  >
                    <span className="material-symbols-outlined text-slate-400 text-[22px]">
                      search
                    </span>
                    <label htmlFor="hero-search" className="sr-only">
                      Cari syarat layanan kependudukan
                    </label>
                    <input
                      id="hero-search"
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Cari layanan, mis. KK"
                      className="min-w-0 w-full text-sm sm:text-base font-normal outline-none text-[#17324D] placeholder:text-slate-400 bg-transparent"
                    />
                    <button
                      type="submit"
                      className="h-[40px] px-5 rounded-full bg-[#17324D] hover:bg-[#17324D] text-white text-sm font-semibold shrink-0 transition-all active:scale-95 shadow-2xs"
                    >
                      Cari
                    </button>
                  </form>

                  {/* Master CTA Button (Exact h-[52px] Alignment & Cohesive Title Case) */}
                  <button
                    onClick={() => navigate("/kebutuhan")}
                    className="button-accent h-[52px] px-6 rounded-xl bg-[#17324D] hover:bg-[#24496C] text-white text-base font-semibold shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center justify-center gap-2.5"
                    type="button"
                  >
                    <span>Mulai dari kebutuhan</span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-base text-white">
                        arrow_forward
                      </span>
                    </div>
                  </button>
                </div>

                {/* Clean Micro Indicators (Jelas & Terbaca 13-14px) */}
                <div className="pt-1 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-[#52616B] font-medium">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">
                      verified
                    </span>
                    <span>Persyaratan sesuai kebutuhan</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#17324D]">
                      lock
                    </span>
                    <span>{mode === "demo" ? "Data demo tersimpan di perangkat ini" : "Draf tersimpan di akun Anda"}</span>
                  </span>
                </div>
              </div>

              <figure className="landing-hero-visual">
                <DocumentIllustration />
              </figure>
            </div>
          </div>
        </section>

        {/* 3. FAST SERVICE SELECTION (INTERACTIVE CIVIC DOSSIER – UNIFIED PILL TABS) */}
        <section
          className="py-16 px-6 max-w-6xl mx-auto w-full"
          id="kenapa-kami"
        >
          <div className="bg-white rounded-3xl border border-[#C5CDD0] p-8 md:p-12 shadow-sm space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2.5">
              <span className="px-3.5 py-1 rounded-full bg-[#FCE4DA] text-[#17324D] font-mono font-bold text-xs uppercase tracking-wider">
                NAVIGASI PENGURUSAN MANDIRI
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#17324D]">
                Pilih Dokumen yang Ingin Anda Siapkan
              </h2>
              <p className="text-sm sm:text-base text-[#52616B]">
                Pilih jenis berkas untuk melihat daftar periksa fisik, estimasi
                pengerjaan, dan kanal pengajuan resmi.
              </p>
            </div>

            {/* Unified Pill Buttons for Service Selector (Consistent Title Case) */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setSelectedTab(svc.id)}
                  aria-pressed={selectedTab === svc.id}
                  className={`min-h-[48px] max-w-full px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2.5 ${
                    selectedTab === svc.id
                      ? "bg-[#17324D] text-white shadow-md scale-102"
                      : "bg-[#FAF7F2] text-[#52616B] hover:bg-slate-100 border border-[#C5CDD0]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {svc.icon}
                  </span>
                  <span>{svc.label}</span>
                </button>
              ))}
            </div>

            {/* Dossier Requirements Overview */}
            <div className="bg-[#FAF7F2] border border-[#C5CDD0] rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-left">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#52616B] uppercase tracking-wider block font-mono">
                  Berkas awal
                </span>
                <div className="font-bold text-base sm:text-lg text-[#17324D]">
                  {selectedGuide?.name || "Lihat panduan layanan"}
                </div>
                <p className="text-xs sm:text-sm text-[#52616B] leading-relaxed">
                  {selectedGuide?.requirements.slice(0, 2).join(" · ")} Lihat
                  panduan untuk persyaratan sesuai kondisi permohonan.
                </p>
              </div>

              <div className="space-y-1.5 md:border-l md:border-r md:border-[#C5CDD0] md:px-6">
                <span className="text-xs font-bold text-[#52616B] uppercase tracking-wider block font-mono">
                  Acuan biaya &amp; waktu
                </span>
                <div className="font-bold text-base sm:text-lg text-[#087F68] flex items-center gap-1.5">
                  <span>
                    {selectedGuide?.official_fee || "Lihat panduan layanan"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#52616B] leading-relaxed">
                  {selectedGuide?.official_duration ||
                    "Ikuti informasi instansi tujuan."}{" "}
                  Acuan pada demo; pastikan kembali melalui kanal resmi
                  instansi.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleStartService(selectedTab)}
                  className="w-full h-[48px] px-6 rounded-full bg-[#17324D] hover:bg-[#24496C] text-white font-semibold text-sm shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  type="button"
                >
                  <span>Lihat Panduan &amp; Mulai Cek</span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm text-white">
                      arrow_forward
                    </span>
                  </div>
                </button>
                <span className="text-xs text-center text-[#52616B]">
                  Bebas diakses tanpa perlu membuat akun di awal.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. ALUR 4 TAHAP PROSEDURAL (PUNCHY, SEQUENTIAL, ACCESSIBLE) */}
        <section
          id="cara-kerja"
          className="py-16 px-6 max-w-6xl mx-auto space-y-12 w-full text-center"
        >
          <div className="space-y-2.5 max-w-2xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-[#FCE4DA] text-[#17324D] font-mono font-bold text-xs uppercase tracking-wider">
              SISTEMATIKA PROSES
            </span>
            <h2 className="text-3xl font-extrabold font-display text-[#17324D]">
              Empat langkah untuk menyiapkan berkas
            </h2>
            <p className="text-sm sm:text-base text-[#52616B]">
              Alur terstruktur dan berurutan untuk memastikan berkas Anda bebas
              penolakan sebelum ke kantor dinas.
            </p>
          </div>

          {/* 4 Cards with Consistent Elevation, Clear Milestone Numerals & Action Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left relative">
            {steps.map((st) => (
              <div
                key={st.num}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 hover:border-[#17324D] hover:shadow-md transition-all shadow-xs flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-11 h-11 rounded-xl bg-[#17324D] group-hover:bg-[#17324D] text-white flex items-center justify-center font-black font-mono text-sm shadow-xs transition-colors">
                      {st.num}
                    </span>
                    <span className="material-symbols-outlined text-[24px] text-[#17324D] p-2 rounded-xl bg-blue-50">
                      {st.icon}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[#17324D] group-hover:text-[#17324D] transition-colors">
                    {st.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
                <div className="pt-2 text-xs font-semibold text-[#17324D] flex items-center gap-1">
                  <span>{st.label}</span>
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. CIVIC TRANSPARENCY & LEGAL GUARANTEE (ELEVATED, TRUSTWORTHY, NO CLUTTER) */}
        <section
          id="dasar-hukum"
          className="py-16 bg-[#FAF7F2] border-y border-[#E2E8F0]"
        >
          <div className="max-w-6xl mx-auto px-6 space-y-10">
            <div className="text-center space-y-2.5 max-w-2xl mx-auto">
              <span className="px-3.5 py-1 rounded-full bg-blue-100/70 text-[#17324D] font-mono font-bold text-xs uppercase tracking-wider">
                TENTANG LAYANAN
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#17324D]">
                Komitmen Transparansi &amp; Integritas Publik
              </h2>
              <p className="text-sm sm:text-base text-[#52616B]">
                Lihat rujukan persyaratan, pahami batas layanan, dan pilih data
                yang ingin kamu bagikan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Guarantee Card 1 */}
              <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#17324D] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[26px]">
                        account_balance
                      </span>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full font-mono">
                      Panduan layanan
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[#17324D]">
                    Rujukan persyaratan
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Setiap panduan memuat persyaratan dan rujukan yang tersedia.
                    Cocokkan kembali dengan informasi instansi tujuan sebelum
                    mengajukan.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs font-mono text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100">
                    UU No. 24/2013
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100">
                    Permendagri 108/2019
                  </span>
                </div>
              </div>

              {/* Guarantee Card 2 */}
              <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[26px]">
                        verified_user
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-mono">
                      Tanpa pembayaran
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[#17324D]">
                    Demo tanpa biaya
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    DaftarIn tidak meminta pembayaran untuk mencoba alur
                    persiapan. Informasi biaya layanan instansi dapat dilihat
                    pada panduan masing-masing.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs font-mono text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100">
                    Tidak ada transaksi pembayaran
                  </span>
                </div>
              </div>

              {/* Guarantee Card 3 */}
              <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#17324D] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[26px]">
                        lock
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-full font-mono">
                      Privasi Peramban
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[#17324D]">
                    Penyimpanan di perangkat
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Akun, draf, dan berkas demo disimpan di browser pada
                    perangkat ini. Data belum tersinkron antarperangkat. Gunakan
                    identitas dan dokumen contoh.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs font-mono text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100">
                    Gunakan data contoh
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ ACCORDION (TEKS JELAS & BERSIH) */}
        <section
          id="faq"
          className="py-16 px-6 max-w-3xl mx-auto space-y-8 w-full text-left"
        >
          <div className="text-center space-y-2.5">
            <span className="text-[#17324D] font-mono font-bold text-xs uppercase tracking-wider">
              PERTANYAAN UMUM
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#17324D]">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-3.5">
            <details className="bg-white rounded-2xl border border-[#C5CDD0] p-5 shadow-xs group">
              <summary className="font-bold text-base text-[#17324D] cursor-pointer flex items-center justify-between list-none">
                <span>Apakah ada biaya menggunakan DaftarIn?</span>
                <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                Versi demo DaftarIn dapat dicoba tanpa pembayaran. Untuk biaya
                layanan instansi, lihat informasi pada panduan dan kanal resmi
                tujuan.
              </p>
            </details>

            <details className="bg-white rounded-2xl border border-[#C5CDD0] p-5 shadow-xs group">
              <summary className="font-bold text-base text-[#17324D] cursor-pointer flex items-center justify-between list-none">
                <span>
                  Apakah foto berkas saya langsung dikirim ke kantor pemerintah?
                </span>
                <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                Belum. Tombol kirim pada demo hanya membagikan salinan data
                kepada akun petugas contoh di browser yang sama. Pengajuan resmi
                tetap melalui kanal instansi tujuan.
              </p>
            </details>

            <details className="bg-white rounded-2xl border border-[#C5CDD0] p-5 shadow-xs group">
              <summary className="font-bold text-base text-[#17324D] cursor-pointer flex items-center justify-between list-none">
                <span>Apakah berkas sudah diperiksa dengan AI?</span>
                <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                Belum. Sistem saat ini memeriksa format isian, jenis dan ukuran
                berkas, serta kelengkapan dokumen wajib. Pembacaan isi dokumen
                dengan OCR/AI dan verifikasi NIK ke Dukcapil belum terhubung.
                Petugas contoh dapat meninjau data dan berkas yang kamu kirim.
              </p>
            </details>
          </div>
        </section>

        {/* 7. BOTTOM CTA */}
        <section className="bg-[#17324D] text-white py-16 px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight text-white">
              Sudah Siap Menyiapkan Dokumen Tanpa Ragu?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Mulai dari panduan layanan. Simpan draf dan lanjutkan persiapan
              saat kamu siap.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate("/katalog")}
                className="h-[52px] px-8 rounded-full bg-[#17324D] hover:bg-[#24496C] text-white font-semibold text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5"
                type="button"
              >
                <span>Mulai Persiapan Mandiri</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-white">
                    arrow_forward
                  </span>
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
