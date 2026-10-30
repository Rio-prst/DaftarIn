import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp, DEFAULT_SERVICES, type ServiceDetail } from '../context/AppContext';

interface ExtendedServiceItem extends ServiceDetail {
  icon: string;
  categoryGroup: 'kependudukan' | 'surat' | 'pencatatan';
  agencyType: 'disdukcapil' | 'kelurahan' | 'kecamatan';
  processType: 'baru' | 'pembaruan' | 'pembetulan' | 'pindah';
  badgeNote: string;
}

const CATALOG_ITEMS: ExtendedServiceItem[] = [
  {
    ...DEFAULT_SERVICES[2], // Akta Kelahiran
    id: 3,
    icon: 'child_friendly',
    categoryGroup: 'pencatatan',
    agencyType: 'disdukcapil',
    processType: 'baru',
    badgeNote: 'Standar Blangko Resmi Disdukcapil (SIAK)',
  },
  {
    ...DEFAULT_SERVICES[0], // KK
    id: 1,
    icon: 'groups',
    categoryGroup: 'kependudukan',
    agencyType: 'disdukcapil',
    processType: 'pembaruan',
    badgeNote: 'Integrasi Barcode TTE Kepala Dinas',
  },
  {
    ...DEFAULT_SERVICES[1], // KTP-el
    id: 2,
    icon: 'badge',
    categoryGroup: 'kependudukan',
    agencyType: 'disdukcapil',
    processType: 'baru',
    badgeNote: 'Perekaman Biometrik & Fisik Blanko',
  },
  {
    ...DEFAULT_SERVICES[3], // SKPWNI
    id: 4,
    icon: 'swap_horiz',
    categoryGroup: 'surat',
    agencyType: 'disdukcapil',
    processType: 'pindah',
    badgeNote: 'Penerbitan Surat Pengantar Antar Wilayah',
  },
  {
    ...DEFAULT_SERVICES[4], // KIA
    id: 5,
    icon: 'credit_card',
    categoryGroup: 'kependudukan',
    agencyType: 'disdukcapil',
    processType: 'baru',
    badgeNote: 'Identitas Anak Usia 0-17 Tahun',
  },
  {
    ...DEFAULT_SERVICES[5], // Akta Kematian
    id: 6,
    icon: 'history_edu',
    categoryGroup: 'pencatatan',
    agencyType: 'kelurahan',
    processType: 'baru',
    badgeNote: 'Penyesuaian Status Waris & KK',
  },
];

export const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openChat, setSelectedService, showToast } = useApp();

  const [category, setCategory] = useState<'semua' | 'kependudukan' | 'surat' | 'pencatatan'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<'sering' | 'cepat'>('sering');
  const [selectedRegion, setSelectedRegion] = useState('Kota Contoh');
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  // Sync Search Query from URL parameters (e.g. from Landing Page Hero search)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
      showToast(`Menerapkan pencarian: "${q}"`, 'info');
    }
  }, [location.search]);

  // Filtering Logic
  const filteredServices = useMemo(() => {
    return CATALOG_ITEMS.filter((item) => {
      // Category Filter
      if (category !== 'semua' && item.categoryGroup !== category) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchAgency = item.agency.toLowerCase().includes(q);
        const matchReqs = item.requirements.some((r) => r.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchAgency && !matchReqs) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (selectedSort === 'cepat') {
        return a.official_duration.localeCompare(b.official_duration);
      }
      return (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0);
    });
  }, [category, searchQuery, selectedSort]);

  const handleSelectService = (item: ExtendedServiceItem) => {
    setSelectedService(item);
    showToast(`Panduan "${item.name}" dipilih.`, 'info');
    navigate('/panduan');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showToast(`Pencarian "${searchQuery.trim()}": ${filteredServices.length} layanan ditemukan.`, 'info');
    }
  };

  const handleSwitchRegion = (regionName: string) => {
    setSelectedRegion(regionName);
    setShowRegionModal(false);
    showToast(`Wilayah simulasi diubah ke: ${regionName}`, 'success');
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    showToast('Terima kasih! Saran layanan Anda telah dicatat ke antrean literasi.', 'success');
    setFeedbackText('');
    setShowFeedbackModal(false);
  };

  return (
    <div className="bg-[#F5F7FB] text-[#172B45] min-h-screen flex flex-col font-sans antialiased selection:bg-[#1769D2] selection:text-white">
      {/* TopNavBar Header */}
      <header className="bg-white border-b border-[#DDE5EF] shadow-xs sticky top-0 z-40">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[72px]">
          <div className="flex items-center gap-6 sm:gap-8">
            <a
              className="flex items-center gap-2.5 text-[#142C4B] hover:opacity-90 transition-opacity"
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
            >
              <div className="w-9 h-9 rounded-lg bg-[#142C4B] flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-xl">fact_check</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-[#142C4B] leading-none">
                  DaftarIn
                </span>
                <span className="text-[10px] text-[#52657A] tracking-wider uppercase mt-0.5">
                  JejakMasWowo · Layanan Warga
                </span>
              </div>
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a
                className="text-[#1769D2] font-semibold text-sm border-b-2 border-[#1769D2] pb-1 flex items-center gap-1 transition-colors"
                href="#/katalog"
              >
                <span>Cari Layanan</span>
              </a>
              <a
                className="text-[#52657A] hover:text-[#142C4B] text-sm font-medium pb-1 transition-colors flex items-center gap-1"
                href="#/cara-kerja"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                  setTimeout(() => document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' }), 150);
                }}
              >
                <span>Cara Kerja</span>
              </a>
              <button
                type="button"
                onClick={openChat}
                className="text-[#52657A] hover:text-[#142C4B] text-sm font-medium pb-1 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px] text-[#1769D2]">smart_toy</span>
                <span>Bantuan AI</span>
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/masuk')}
              className="px-4 py-2 rounded-lg border border-[#DDE5EF] bg-white text-[#142C4B] text-sm font-semibold hover:bg-slate-50 transition"
              type="button"
            >
              Masuk
            </button>
            <button
              onClick={() => navigate('/persiapan/data')}
              className="px-4 py-2 rounded-lg bg-[#1769D2] hover:bg-[#1257B0] text-white text-sm font-semibold shadow-sm transition"
              type="button"
            >
              Mulai Persiapan
            </button>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-[#52657A]">
          <a
            className="hover:text-[#1769D2] transition-colors flex items-center gap-1"
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Beranda</span>
          </a>
          <span className="material-symbols-outlined text-xs text-[#8DA0B6]">chevron_right</span>
          <span className="text-[#142C4B] font-semibold">Katalog Layanan Publik</span>
        </nav>

        {/* Page Heading Cluster */}
        <section className="mb-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#142C4B] tracking-tight">
              Mau mengurus dokumen apa hari ini?
            </h1>
            <p className="text-sm sm:text-base text-[#52657A]">
              Temukan panduan persyaratan resmi, alur tahapan, dan alat periksa mandiri sebelum datang ke loket dinas.
            </p>
          </div>
          <div className="mt-3.5 p-3.5 bg-white border border-[#CBD7E6] rounded-xl flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 text-xs text-[#52657A]">
              <span className="material-symbols-outlined text-[#1769D2] text-[20px] shrink-0">info</span>
              <span>Seluruh panduan mengacu pada UU No. 24/2013 & Permendagri No. 108/2019 (Bebas Biaya).</span>
            </div>
            <button
              onClick={() => setShowRegionModal(true)}
              className="px-3 py-1 bg-[#F5F7FB] hover:bg-slate-100 border border-[#CBD7E6] rounded-lg text-xs font-semibold text-[#142C4B] shrink-0 flex items-center gap-1 transition"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px] text-[#1769D2]">location_on</span>
              <span>{selectedRegion}</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>
          </div>
        </section>

        {/* Prominent Search & Region Toolbar */}
        <section className="mb-8">
          <div className="bg-white border border-[#CBD7E6] rounded-2xl p-3 sm:p-4 shadow-xs">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch gap-3">
              <div
                onClick={() => setShowRegionModal(true)}
                className="relative md:w-64 shrink-0 h-12 flex items-center justify-between px-3.5 bg-[#F8FAFD] border border-[#CBD7E6] rounded-xl cursor-pointer hover:border-[#1769D2] transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="material-symbols-outlined text-[#1769D2] text-[20px]">location_on</span>
                  <span className="text-xs font-bold text-[#142C4B] truncate">{selectedRegion}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#1769D2] text-[10px] font-bold uppercase">
                  Pilih Wilayah
                </span>
              </div>

              <div className="relative flex-grow">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8DA0B6] material-symbols-outlined text-[20px]">
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 bg-white border border-[#CBD7E6] rounded-xl text-sm font-medium text-[#142C4B] placeholder-[#8DA0B6] focus:outline-none focus:border-[#1769D2] focus:ring-2 focus:ring-[#1769D2]/15 transition-all"
                  placeholder="Cari layanan: akta lahir, kartu keluarga, KTP, pindah datang..."
                  type="text"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8DA0B6] hover:text-[#142C4B]"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>

              <button
                className="h-12 px-6 bg-[#1769D2] hover:bg-[#1257B0] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition shrink-0"
                type="submit"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span>Cari</span>
              </button>
            </form>
          </div>
        </section>

        {/* Catalogue Body: 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Filter Column */}
          <aside className="lg:col-span-3 space-y-5">
            <div className="bg-white border border-[#CBD7E6] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E8F0] mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#142C4B] text-[20px]">tune</span>
                  <h2 className="text-sm font-bold text-[#142C4B]">Filter Layanan</h2>
                </div>
                <button
                  onClick={() => {
                    setCategory('semua');
                    setSearchQuery('');
                    showToast('Filter pencarian direset.', 'info');
                  }}
                  className="text-xs text-[#1769D2] hover:underline font-bold"
                  type="button"
                >
                  Reset
                </button>
              </div>

              {/* Group 1: Kategori Layanan */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#142C4B] uppercase tracking-wider">
                  Kategori Utama
                </h3>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2.5 cursor-pointer py-1">
                    <input
                      checked={category === 'semua'}
                      onChange={() => setCategory('semua')}
                      className="w-4 h-4 text-[#1769D2] focus:ring-[#1769D2]"
                      name="kategori"
                      type="radio"
                    />
                    <span className={category === 'semua' ? 'font-bold text-[#1769D2]' : 'text-[#52657A]'}>
                      Semua Kategori ({CATALOG_ITEMS.length})
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer py-1">
                    <input
                      checked={category === 'kependudukan'}
                      onChange={() => setCategory('kependudukan')}
                      className="w-4 h-4 text-[#1769D2] focus:ring-[#1769D2]"
                      name="kategori"
                      type="radio"
                    />
                    <span className={category === 'kependudukan' ? 'font-bold text-[#1769D2]' : 'text-[#52657A]'}>
                      Kependudukan & Identitas (3)
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer py-1">
                    <input
                      checked={category === 'pencatatan'}
                      onChange={() => setCategory('pencatatan')}
                      className="w-4 h-4 text-[#1769D2] focus:ring-[#1769D2]"
                      name="kategori"
                      type="radio"
                    />
                    <span className={category === 'pencatatan' ? 'font-bold text-[#1769D2]' : 'text-[#52657A]'}>
                      Pencatatan Sipil (2)
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer py-1">
                    <input
                      checked={category === 'surat'}
                      onChange={() => setCategory('surat')}
                      className="w-4 h-4 text-[#1769D2] focus:ring-[#1769D2]"
                      name="kategori"
                      type="radio"
                    />
                    <span className={category === 'surat' ? 'font-bold text-[#1769D2]' : 'text-[#52657A]'}>
                      Surat Pindah (SKPWNI) (1)
                    </span>
                  </label>
                </div>
              </div>

              {/* Group 2: Legalitas & Biaya */}
              <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>100% Bebas Biaya Retribusi</span>
                </div>
                <p className="text-[11px] text-[#52657A] leading-relaxed">
                  Tidak ada pungutan liar. Seluruh formulir resmi disediakan gratis oleh Dinas Dukcapil.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Service Grid Column */}
          <section className="lg:col-span-9 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#142C4B]">Daftar Layanan Tersedia</span>
                <span className="px-2.5 py-0.5 bg-blue-50 text-[#1769D2] text-xs rounded-full font-bold">
                  {filteredServices.length} Layanan
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#52657A]">
                <span>Urutan:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value as 'sering' | 'cepat')}
                  className="bg-white border border-[#CBD7E6] text-[#142C4B] font-semibold rounded-lg py-1.5 px-3 text-xs focus:ring-1 focus:ring-[#1769D2]"
                >
                  <option value="sering">Paling Sering Diakses</option>
                  <option value="cepat">Waktu Pengurusan Tercepat</option>
                </select>
              </div>
            </div>

            {/* Grid of Cards */}
            {filteredServices.length === 0 ? (
              <div className="bg-white border border-[#CBD7E6] rounded-2xl p-10 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-[#52657A]">
                  <span className="material-symbols-outlined text-2xl">search_off</span>
                </div>
                <h3 className="font-bold text-base text-[#142C4B]">Tidak ada layanan yang cocok</h3>
                <p className="text-xs text-[#52657A] max-w-sm mx-auto">
                  Coba gunakan kata kunci lain seperti "Akta", "KK", atau pilih "Semua Kategori".
                </p>
                <button
                  onClick={() => {
                    setCategory('semua');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-[#1769D2] text-white text-xs font-bold rounded-lg hover:bg-[#1257B0] transition"
                  type="button"
                >
                  Tampilkan Semua Layanan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredServices.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#CBD7E6] hover:border-[#1769D2] rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1769D2] shrink-0 group-hover:scale-105 transition-transform">
                          <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#ECF8F3] text-emerald-800 text-[11px] font-bold">
                            {item.official_fee}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[#52657A] text-[10px] font-semibold">
                            {item.agency}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-[#142C4B] mb-1.5 group-hover:text-[#1769D2] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs sm:text-[13px] text-[#52657A] line-clamp-2 mb-4 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="space-y-1.5 border-t border-slate-100 pt-3 mb-4 text-xs text-[#52657A]">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[15px] text-[#1769D2]">location_on</span>
                          <span>Wilayah: <strong>{selectedRegion}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[15px] text-[#1769D2]">schedule</span>
                          <span>Estimasi: {item.official_duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[15px] text-[#1769D2]">description</span>
                          <span>{item.requirements.length} Persyaratan Wajib</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-3">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#52657A]">
                          <span className="material-symbols-outlined text-[14px] text-emerald-600">verified_user</span>
                          <span>{item.badgeNote}</span>
                        </span>
                      </div>
                      <button
                        onClick={() => handleSelectService(item)}
                        className="w-full py-2.5 px-4 bg-[#F5F7FB] hover:bg-[#1769D2] hover:text-white text-[#142C4B] text-xs font-bold rounded-xl border border-[#CBD7E6] hover:border-[#1769D2] flex items-center justify-center gap-2 transition-all shadow-2xs"
                        type="button"
                      >
                        <span>Lihat Panduan & Alur</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Lower Banner: Belum Menemukan Layanan? */}
        <section className="mt-10 bg-white border border-[#CBD7E6] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="material-symbols-outlined text-[#1769D2] text-2xl">help_center</span>
                <h3 className="text-base sm:text-lg font-bold text-[#142C4B]">
                  Belum menemukan jenis pengurusan yang kamu cari?
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#52657A] max-w-xl">
                Kamu dapat mengganti cakupan wilayah dinas atau mengirimkan usulan penambahan modul panduan dokumen sipil lainnya.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => setShowRegionModal(true)}
                className="px-4 py-2.5 bg-[#F8FAFD] border border-[#CBD7E6] text-[#142C4B] text-xs font-bold rounded-xl hover:bg-slate-100 transition shadow-xs flex items-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-[#1769D2]">swap_horiz</span>
                <span>Ganti Wilayah Simulasi</span>
              </button>
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="px-4 py-2.5 bg-[#1769D2] hover:bg-[#1257B0] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                <span>Kirim Masukan Layanan</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Region Picker Modal */}
      {showRegionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#CBD7E6] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1769D2]">location_on</span>
                <h3 className="font-bold text-base text-[#142C4B]">Pilih Wilayah Simulasi</h3>
              </div>
              <button
                onClick={() => setShowRegionModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-xs text-[#52657A]">
              Pilih wilayah untuk menyesuaikan jam layanan loket, regulasi perwali, dan kanal resmi Disdukcapil:
            </p>
            <div className="space-y-2">
              {['Kota Contoh (Simulasi Standar)', 'Kota Bekasi (Disdukcapil Juanda)', 'Kota Depok (Dukcapil Online)', 'DKI Jakarta (Alpukat Betawi)'].map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => handleSwitchRegion(reg.split(' (')[0])}
                  className={`w-full p-3 rounded-xl text-left text-xs font-semibold flex items-center justify-between border transition ${
                    selectedRegion === reg.split(' (')[0]
                      ? 'bg-blue-50 border-[#1769D2] text-[#1769D2]'
                      : 'bg-white border-[#CBD7E6] text-[#142C4B] hover:bg-slate-50'
                  }`}
                >
                  <span>{reg}</span>
                  {selectedRegion === reg.split(' (')[0] && (
                    <span className="material-symbols-outlined text-sm">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#CBD7E6] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1769D2]">feedback</span>
                <h3 className="font-bold text-base text-[#142C4B]">Usulan Panduan Layanan</h3>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <p className="text-xs text-[#52657A]">
                Layanan kependudukan apa yang ingin Anda tambahkan ke portal transparansi mandiri ini?
              </p>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Contoh: Penerbitan Surat Keterangan Pindah Luar Negeri (SKPLN)..."
                rows={3}
                required
                className="w-full p-3 bg-white border border-[#CBD7E6] rounded-xl text-xs text-[#142C4B] focus:outline-none focus:border-[#1769D2]"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 border border-[#CBD7E6] text-xs font-semibold text-[#52657A] rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1769D2] hover:bg-[#1257B0] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Kirim Usulan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#142C4B] text-white border-t border-[#233F66] mt-16">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1769D2] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px]">fact_check</span>
              </div>
              <span className="font-bold text-base text-white">DaftarIn (JejakMasWowo)</span>
            </div>
            <p className="text-xs text-[#A6BCD7] max-w-md">
              © 2026 DaftarIn Civic Transparency Portal. Membantu warga memeriksa mandiri kelengkapan berkas kependudukan sebelum ke loket resmi dinas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#A6BCD7]">
            <a className="hover:text-white transition-colors" href="#/">Beranda</a>
            <a className="hover:text-white transition-colors" href="#/katalog">Katalog Layanan</a>
            <a className="hover:text-white transition-colors" href="#/panduan">Panduan Detail</a>
            <a className="hover:text-white transition-colors" href="#/pelacakan">Pelacakan SIAK</a>
            <button type="button" onClick={openChat} className="hover:text-white transition-colors">Konsultasi AI</button>
          </div>
        </div>
        <div className="border-t border-white/10 py-3.5 px-4 sm:px-6 bg-[#0E1E34] text-center text-[11px] text-[#A6BCD7]">
          <strong>Pemberitahuan Resmi:</strong> Prototipe literasi independen tugas MIA. Bukan portal resmi penerbit dokumen negara. Bebas biaya retribusi.
        </div>
      </footer>
    </div>
  );
};
