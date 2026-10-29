import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const ServiceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedService, openChat } = useApp();
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'persyaratan' | 'prosedur' | 'dasar'>('persyaratan');
  const [showOfficialModal, setShowOfficialModal] = useState(false);

  const currentService = selectedService || {
    id: 3,
    name: 'Penerbitan Akta Kelahiran Baru',
    description: 'Panduan persiapan mandiri dokumen pelaporan kelahiran anak sebelum diajukan ke dinas atau loket kecamatan.',
    official_fee: 'Gratis (Rp 0 - UU 24/2013)',
    official_duration: '1 - 3 Hari Kerja',
    agency: 'Dinas Kependudukan dan Pencatatan Sipil',
    requirements: [
      'Surat Keterangan Lahir (Faskes/Rumah Sakit/Bidan) Asli',
      'Buku Nikah / Kutipan Akta Perkawinan Orang Tua',
      'Kartu Keluarga (KK) Asli Orang Tua',
      'KTP-el Kedua Orang Tua & 2 Saksi',
    ],
  };

  return (
    <div className="bg-[#F5F7FB] text-[#172B45] antialiased min-h-screen flex flex-col font-sans selection:bg-[#1769D2] selection:text-white overflow-x-hidden">
      {/* TopNavBar Header */}
      <header className="bg-white border-b border-[#DDE5EF] shadow-xs sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 mx-auto flex items-center justify-between h-[72px] max-w-6xl">
          <div className="flex items-center gap-6 sm:gap-8">
            <a
              className="flex items-center gap-2.5 text-[#142C4B] hover:opacity-90 transition-opacity"
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
            >
              <div className="w-9 h-9 rounded-lg bg-[#142C4B] text-white flex items-center justify-center shadow-sm">
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
                className="text-[#1769D2] font-semibold text-sm border-b-2 border-[#1769D2] pb-1 flex items-center gap-1.5 transition-colors"
                href="#/katalog"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/katalog');
                }}
              >
                <span>Cari Layanan</span>
              </a>
              <a
                className="text-[#52657A] hover:text-[#142C4B] text-sm font-medium pb-1 transition-colors"
                href="#/cara-kerja"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                  setTimeout(() => document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' }), 150);
                }}
              >
                Cara Kerja
              </a>
              <button
                type="button"
                className="text-[#52657A] hover:text-[#142C4B] text-sm font-medium pb-1 transition-colors flex items-center gap-1"
                onClick={openChat}
              >
                <span className="material-symbols-outlined text-[18px] text-[#1769D2]">smart_toy</span>
                <span>Bantuan AI</span>
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              className="px-4 py-2 text-sm font-semibold text-[#142C4B] border border-[#DDE5EF] rounded-lg hover:bg-slate-50 transition"
              type="button"
              onClick={() => navigate('/masuk')}
            >
              Masuk
            </button>
            <button
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1769D2] hover:bg-[#1257B0] rounded-lg shadow-xs transition"
              type="button"
              onClick={() => navigate('/persiapan/data')}
            >
              Mulai Persiapan
            </button>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb & Header Section */}
        <section aria-labelledby="page-title" className="mb-6">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex flex-wrap items-center space-x-2 text-xs text-[#52657A]">
              <li>
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
              </li>
              <li className="flex items-center space-x-1">
                <span className="material-symbols-outlined text-xs text-[#8DA0B6]">chevron_right</span>
                <a
                  className="hover:text-[#1769D2] transition-colors"
                  href="#/katalog"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/katalog');
                  }}
                >
                  Katalog Layanan
                </a>
              </li>
              <li aria-current="page" className="flex items-center space-x-1 text-[#142C4B] font-semibold">
                <span className="material-symbols-outlined text-xs text-[#8DA0B6]">chevron_right</span>
                <span>{currentService.name}</span>
              </li>
            </ol>
          </nav>

          {/* Badge / Pill */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1769D2] text-xs font-bold border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1769D2]"></span>
              Kota Contoh · Disdukcapil (Simulasi Standar)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-[#52657A] text-[11px] font-semibold border border-slate-200">
              <span className="material-symbols-outlined text-[13px] text-emerald-600">verified_user</span>
              Persiapan Pra-Permohonan Mandiri
            </span>
          </div>

          {/* Main Headline */}
          <div className="max-w-4xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#142C4B] tracking-tight mb-2" id="page-title">
              Panduan {currentService.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#52657A] leading-relaxed">
              {currentService.description} Membantu warga memeriksa kelengkapan draf berkas secara mandiri agar proses verifikasi di loket berjalan mulus tanpa bolak-balik.
            </p>
          </div>
        </section>

        {/* Metadata 4 Cards Grid */}
        <section aria-label="Metadata Singkat Layanan" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#CBD7E6] shadow-2xs">
            <div className="flex items-center gap-2 text-[#52657A] text-xs mb-1">
              <span className="material-symbols-outlined text-lg text-[#1769D2]">account_balance</span>
              <span>Instansi Terkait</span>
            </div>
            <p className="text-sm font-bold text-[#142C4B]">{currentService.agency}</p>
            <span className="text-[11px] text-[#52657A] block mt-0.5">Loket Terpadu & Kanal Online</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#CBD7E6] shadow-2xs">
            <div className="flex items-center gap-2 text-[#52657A] text-xs mb-1">
              <span className="material-symbols-outlined text-lg text-emerald-600">payments</span>
              <span>Biaya Resmi</span>
            </div>
            <p className="text-sm font-bold text-emerald-700">{currentService.official_fee || 'Rp 0 (100% Gratis)'}</p>
            <span className="text-[11px] text-[#52657A] block mt-0.5">Bebas retribusi UU No. 24/2013</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#CBD7E6] shadow-2xs">
            <div className="flex items-center gap-2 text-[#52657A] text-xs mb-1">
              <span className="material-symbols-outlined text-lg text-[#1769D2]">schedule</span>
              <span>Estimasi Layanan</span>
            </div>
            <p className="text-sm font-bold text-[#142C4B]">{currentService.official_duration || '1 - 3 Hari Kerja'}</p>
            <span className="text-[11px] text-[#52657A] block mt-0.5">Setelah berkas terverifikasi lengkap</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#CBD7E6] shadow-2xs">
            <div className="flex items-center gap-2 text-[#52657A] text-xs mb-1">
              <span className="material-symbols-outlined text-lg text-[#1769D2]">inventory_2</span>
              <span>Dokumen Inti</span>
            </div>
            <p className="text-sm font-bold text-[#142C4B]">{currentService.requirements?.length || 4} Berkas Utama</p>
            <span className="text-[11px] text-[#52657A] block mt-0.5">Dapat diperiksa dengan OCR AI</span>
          </div>
        </section>

        {/* Main Split Grid (8 cols / 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tabs */}
            <div className="border-b border-[#CBD7E6] flex items-center space-x-6 overflow-x-auto pb-px" role="tablist">
              <button
                onClick={() => setActiveTab('persyaratan')}
                className={`pb-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'persyaratan'
                    ? 'text-[#1769D2] border-b-2 border-[#1769D2]'
                    : 'text-[#52657A] hover:text-[#142C4B]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">inventory</span>
                <span>Persyaratan Berkas ({currentService.requirements?.length || 4})</span>
              </button>

              <button
                onClick={() => setActiveTab('prosedur')}
                className={`pb-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'prosedur'
                    ? 'text-[#1769D2] border-b-2 border-[#1769D2]'
                    : 'text-[#52657A] hover:text-[#142C4B]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">alt_route</span>
                <span>Alur & Prosedur</span>
              </button>

              <button
                onClick={() => setActiveTab('dasar')}
                className={`pb-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'dasar'
                    ? 'text-[#1769D2] border-b-2 border-[#1769D2]'
                    : 'text-[#52657A] hover:text-[#142C4B]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">gavel</span>
                <span>Dasar Hukum & Rujukan</span>
              </button>
            </div>

            {/* TAB CONTENT: PERSYARATAN */}
            {activeTab === 'persyaratan' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#1769D2] text-[20px] shrink-0 mt-0.5">info</span>
                  <div className="text-xs text-[#142C4B] leading-relaxed">
                    <strong>Pemeriksaan Mandiri:</strong> Kumpulkan salinan dokumen fisik berikut. Pastikan ejaan nama, NIK, dan tanggal sesuai antara KTP dan Kartu Keluarga untuk menghindari selisih data pada SIAK.
                  </div>
                </div>

                <div className="bg-white border border-[#CBD7E6] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                  <h2 className="text-base font-bold text-[#142C4B] pb-3 border-b border-slate-100">
                    Daftar Dokumen Persyaratan Resmi
                  </h2>
                  <div className="space-y-3">
                    {currentService.requirements?.map((req, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-[#1769D2] bg-white transition flex items-start gap-3"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1769D2] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xs sm:text-sm font-bold text-[#142C4B]">{req}</h3>
                          <p className="text-[11px] text-[#52657A] mt-0.5">
                            Format fisik/digital: Pindaian utuh beresolusi jelas, seluruh tepi dokumen tidak terpotong, cap stempel terbaca.
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-[#52657A] shrink-0">
                          Wajib
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PROSEDUR */}
            {activeTab === 'prosedur' && (
              <div className="bg-white border border-[#CBD7E6] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
                <h2 className="text-base font-bold text-[#142C4B] pb-3 border-b border-slate-100">
                  Tahapan Alur Pelayanan (Pra-Pendaftaran s.d. Terbit)
                </h2>
                <div className="relative pl-6 border-l-2 border-[#1769D2] space-y-6">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-[#1769D2] text-white flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <h3 className="text-sm font-bold text-[#142C4B]">Persiapan Berkas Mandiri di Portal DaftarIn</h3>
                    <p className="text-xs text-[#52657A] mt-1">
                      Warga mengisi draf data identitas dan mengunggah pindaian berkas. Model AI memeriksa keselarasan ejaan huruf nama, NIK, dan kejelasan stempel faskes.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-[#142C4B] text-white flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <h3 className="text-sm font-bold text-[#142C4B]">Pencetakan Bukti Struk Kesiapan Berkas</h3>
                    <p className="text-xs text-[#52657A] mt-1">
                      Warga mencetak lembar struk ringkasan berkas ber-QR Code untuk ditunjukkan saat verifikasi loket fisik atau diunggah ke kanal resmi daerah.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-[#142C4B] text-white flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <h3 className="text-sm font-bold text-[#142C4B]">Verifikasi Yuridis oleh Petugas Disdukcapil</h3>
                    <p className="text-xs text-[#52657A] mt-1">
                      Petugas loket memvalidasi fisik berkas asli dengan data pendaftaran SIAK nasional. Jika ada ketidaksesuaian, catatan revisi disampaikan via pelacakan.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    <h3 className="text-sm font-bold text-[#142C4B]">Penerbitan Kutipan Dokumen & Tanda Tangan Elektronik (TTE)</h3>
                    <p className="text-xs text-[#52657A] mt-1">
                      Kutipan dokumen resmi diterbitkan dalam format PDF ber-barcode TTE tersertifikasi Balai Sertifikasi Elektronik (BSrE) BSSN.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DASAR HUKUM */}
            {activeTab === 'dasar' && (
              <div className="bg-white border border-[#CBD7E6] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                <h2 className="text-base font-bold text-[#142C4B] pb-3 border-b border-slate-100">
                  Landasan Regulasi & Rujukan Hukum
                </h2>
                <div className="space-y-3 text-xs text-[#52657A]">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-[#142C4B] text-xs">Undang-Undang No. 24 Tahun 2013</div>
                    <p className="text-[11px] mt-1">
                      Perubahan atas UU No. 23 Tahun 2006 tentang Administrasi Kependudukan. Menetapkan bahwa pengurusan dokumen kependudukan tidak dipungut biaya retribusi apapun (Pasal 79A).
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-[#142C4B] text-xs">Permendagri No. 108 Tahun 2019</div>
                    <p className="text-[11px] mt-1">
                      Peraturan Pelaksanaan Perpres No. 96 Tahun 2018 tentang Persyaratan dan Tata Cara Pendaftaran Penduduk dan Pencatatan Sipil.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-[#142C4B] text-xs">Permendagri No. 109 Tahun 2019</div>
                    <p className="text-[11px] mt-1">
                      Bentuk dan Tata Cara Penerbitan Dokumen Kependudukan Berformat Kertas Putih A4 80 gram dan Tanda Tangan Elektronik (TTE).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Action Card */}
          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-[#CBD7E6] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1769D2]">
                  Checklist Kesiapan
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Bebas Biaya
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#142C4B] mb-1">
                  Mulai Pengecekan Mandiri
                </h3>
                <p className="text-xs text-[#52657A] leading-relaxed">
                  Lengkapi draf identitas dan unggah pindaian untuk diaudit otomatis oleh AI sebelum diajukan ke dinas.
                </p>
              </div>

              <div className="bg-[#F8FAFD] p-3.5 rounded-xl border border-[#DDE5EF] space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#52657A]">
                  <span>Status Panduan:</span>
                  <span className="font-bold text-[#142C4B]">Terverifikasi SIAK</span>
                </div>
                <div className="flex justify-between items-center text-[#52657A]">
                  <span>Estimasi Pengecekan AI:</span>
                  <span className="font-bold text-[#1769D2]">~10 Detik</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-[#1769D2] h-full rounded-full w-1/4"></div>
                </div>
                <span className="text-[10px] text-[#52657A] block text-right">Tahap 1 dari 4: Baca Panduan</span>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  onClick={() => navigate('/persiapan/data')}
                  className="w-full py-3 px-4 rounded-xl bg-[#1769D2] hover:bg-[#1257B0] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">description</span>
                  <span>Mulai Persiapan Berkas</span>
                </button>

                <button
                  onClick={() => setShowOfficialModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#CBD7E6] hover:bg-slate-50 text-[#142C4B] text-xs font-semibold flex items-center justify-center gap-2 transition"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#1769D2]">open_in_new</span>
                  <span>Lihat Petunjuk Kanal Resmi</span>
                </button>
              </div>

              <p className="text-[11px] text-[#52657A] pt-2 border-t border-slate-100 flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-emerald-600 mt-0.5 shrink-0">lock</span>
                <span>Data draf disimpan di peramban lokal secara aman tanpa diserahkan ke pihak ketiga.</span>
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Official Channel Modal */}
      {showOfficialModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#CBD7E6] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1769D2]">account_balance</span>
                <h3 className="font-bold text-base text-[#142C4B]">Kanal Resmi Pendaftaran</h3>
              </div>
              <button
                onClick={() => setShowOfficialModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-xs text-[#52657A]">
              Setelah berkas Anda siap melalui pra-verifikasi DaftarIn, ajukan berkas melalui kanal resmi berwenang berikut:
            </p>
            <div className="space-y-2.5 text-xs font-semibold">
              <a
                href="https://layanan.dukcapil.kemendagri.go.id"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl border border-[#CBD7E6] hover:border-[#1769D2] hover:bg-blue-50/50 flex items-center justify-between transition block text-[#142C4B]"
              >
                <div>
                  <div className="font-bold text-[#1769D2]">Portal Ditjen Dukcapil Kemendagri</div>
                  <div className="text-[11px] text-[#52657A] font-normal">layanan.dukcapil.kemendagri.go.id</div>
                </div>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-[#142C4B]">
                <div className="font-bold">Loket Pelayanan Terpadu Disdukcapil Daerah</div>
                <div className="text-[11px] text-[#52657A] font-normal mt-0.5">
                  Bawa struk kesiapan berkas beserta fisik dokumen asli langsung ke loket dinas kependudukan setempat.
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowOfficialModal(false)}
                className="px-4 py-2 bg-[#1769D2] text-white text-xs font-bold rounded-xl"
              >
                Mengerti & Tutup
              </button>
            </div>
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
              © 2026 DaftarIn Civic Transparency Portal. Literasi mandiri persiapan dokumen kependudukan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#A6BCD7]">
            <a className="hover:text-white transition-colors" href="#/">Beranda</a>
            <a className="hover:text-white transition-colors" href="#/katalog">Katalog Layanan</a>
            <a className="hover:text-white transition-colors" href="#/persiapan/data">Mulai Persiapan</a>
            <a className="hover:text-white transition-colors" href="#/pelacakan">Pelacakan SIAK</a>
            <button type="button" onClick={openChat} className="hover:text-white transition-colors">Bantuan AI</button>
          </div>
        </div>
        <div className="border-t border-white/10 py-3.5 px-4 sm:px-6 bg-[#0E1E34] text-center text-[11px] text-[#A6BCD7]">
          <strong>Pemberitahuan:</strong> Prototipe independen. Bukan kanal pemerintah resmi. Bebas biaya retribusi (UU 24/2013).
        </div>
      </footer>
    </div>
  );
};
