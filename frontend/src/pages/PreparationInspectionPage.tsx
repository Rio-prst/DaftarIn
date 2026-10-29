import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PreparationStepper } from '../components/PreparationStepper';

export const PreparationInspectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, openChat } = useApp();

  // Forensic Inspector State
  const [zoom, setZoom] = useState(100);
  const [loupeActive, setLoupeActive] = useState(false);
  const [contrastFilter, setContrastFilter] = useState(false);
  const [caliperVisible, setCaliperVisible] = useState(true);
  const [nameCorrected, setNameCorrected] = useState(false);
  const [docReplaced, setDocReplaced] = useState(false);

  const handleApplyCorrection = () => {
    setNameCorrected(true);
    showToast('Koreksi mandiri diterapkan: Ejaan diselaraskan menjadi "Ayu Contoh" [citizen_corrected].', 'success');
  };

  const handleSimulateReupload = () => {
    setDocReplaced(true);
    showToast('Dokumen pemindaian resolusi tinggi berhasil diperbarui!', 'success');
  };

  return (
    <div className="bg-[#F5F7FB] text-on-surface flex min-h-screen font-sans selection:bg-[#1769D2] selection:text-white">
      {/* Left Sidebar (Desktop: 240px, Mobile: hidden) */}
      <aside className="hidden md:flex w-[240px] bg-[#142C4B] text-white flex-col shrink-0 min-h-screen">
        {/* Brand Block */}
        <div className="h-[72px] px-5 flex items-center gap-3 border-b border-[#233F66]">
          <div className="w-8 h-8 rounded bg-[#1769D2] flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-white text-[20px]">fact_check</span>
          </div>
          <div>
            <div className="font-heading font-bold text-base tracking-tight leading-none text-white">
              JejakMasWowo
            </div>
            <div className="text-[12px] text-[#A6BCD7] mt-1 leading-none">Layanan warga</div>
          </div>
        </div>

        {/* Navigation Rows */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          <a
            className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition"
            href="#/dashboard"
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard');
            }}
          >
            <span className="material-symbols-outlined text-[#C3D4EA] text-[20px]">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a
            className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition"
            href="#/katalog"
            onClick={(e) => {
              e.preventDefault();
              navigate('/katalog');
            }}
          >
            <span className="material-symbols-outlined text-[#C3D4EA] text-[20px]">search</span>
            <span>Cari Layanan</span>
          </a>
          <a
            className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-semibold bg-[#1769D2] text-white shadow-sm"
            href="#/persiapan/data"
            onClick={(e) => {
              e.preventDefault();
              navigate('/persiapan/data');
            }}
          >
            <span className="material-symbols-outlined text-white text-[20px]">assignment</span>
            <span>Persiapan Saya</span>
          </a>
          <a
            className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition"
            href="#/pelacakan"
            onClick={(e) => {
              e.preventDefault();
              navigate('/pelacakan');
            }}
          >
            <span className="material-symbols-outlined text-[#C3D4EA] text-[20px]">send</span>
            <span>Pengajuan Saya</span>
          </a>
        </nav>

        {/* Sidebar Bottom */}
        <div className="p-4 border-t border-[#233F66] space-y-2">
          <a
            className="h-[40px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition"
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            <span className="material-symbols-outlined text-[#C3D4EA] text-[18px]">logout</span>
            <span>Keluar</span>
          </a>
          <div className="text-[11px] text-[#7E98B9] flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Katalog Resmi Disdukcapil</span>
          </div>
        </div>
      </aside>

      {/* Main Region */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-[72px] bg-white border-b border-[#DDE5EF] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-[#52657A]">
            <span>Persiapan</span>
            <span className="material-symbols-outlined text-base text-[#8DA0B6]">chevron_right</span>
            <span>Akta Kelahiran</span>
            <span className="material-symbols-outlined text-base text-[#8DA0B6]">chevron_right</span>
            <span className="font-semibold text-[#172B45]">Audit AI Dokumen</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F7FB] border border-[#DDE5EF] rounded-full text-xs font-medium text-[#52657A]">
              <span className="material-symbols-outlined text-[#52657A] text-[16px]">location_on</span>
              <span>Kota Contoh · Loket Disdukcapil</span>
            </div>
            <button
              className="h-9 px-3 rounded-lg border border-[#DDE5EF] bg-white text-xs font-semibold text-[#172B45] hover:bg-[#F5F7FB] flex items-center gap-1.5 transition"
              type="button"
              onClick={() => openChat()}
            >
              <span className="material-symbols-outlined text-[#52657A] text-[18px]">help_outline</span>
              <span>Bantuan</span>
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-[#DDE5EF]">
              <div className="w-8 h-8 rounded-full bg-[#142C4B] text-white flex items-center justify-center font-semibold text-xs">
                AC
              </div>
              <span className="text-sm font-semibold text-[#172B45]">Ayu Contoh</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 w-full flex-1 overflow-y-auto">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-[28px] leading-[36px] font-bold text-[#172B45] font-display">
                Hasil Pemeriksaan Dokumen (Audit Forensik OCR)
              </h1>
              <p className="text-[14px] text-[#52657A] mt-1">
                Ref. ID: <strong className="font-mono text-[#142C4B]">PREP-2026-000001</strong> · Evaluasi Ketentuan Persyaratan Akta Kelahiran
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1.5 rounded-lg bg-[#EBF1F8] border border-[#CBD7E6] text-xs font-mono font-semibold text-[#142C4B]">
                OCR ENGINE: TESSERACT-5 + MULTIMODAL
              </span>
            </div>
          </div>

          {/* Canonical Manila Folder Stepper (Step 4 active) */}
          <PreparationStepper currentStep={4} />

          {/* Compact Single Notification Callout */}
          <div className="mb-6 p-4 rounded-xl bg-[#FFF8E8] border border-[#F1E0B6] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#996000] text-[22px]">verified_user</span>
              <div>
                <span className="text-sm font-bold text-[#996000]">
                  {nameCorrected && docReplaced
                    ? 'Seluruh temuan telah berhasil diselaraskan pemohon!'
                    : '2 Catatan Temuan Perlu Perhatian Sebelum ke Loket Fisik'}
                </span>
                <span className="text-xs text-[#52657A] ml-2 hidden md:inline">
                  Pemeriksaan awal bersifat pendampingan mandiri untuk mencegah berkas ditolak petugas loket.
                </span>
              </div>
            </div>
            <div className="text-xs font-semibold px-3 py-1 bg-white border border-[#F1E0B6] text-[#996000] rounded-full shrink-0">
              {nameCorrected && docReplaced ? '100% Siap Diajukan' : 'Perlu Konfirmasi'}
            </div>
          </div>

          {/* Balanced 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Forensic Light-Table Document Viewer (col-span-7) */}
            <div className="lg:col-span-7 bg-[#1A2536] border border-[#2D3F58] rounded-xl overflow-hidden shadow-md text-white">
              {/* Light-Table Top Control Bar */}
              <div className="h-12 px-4 border-b border-[#2D3F58] flex items-center justify-between bg-[#141E2D]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-400 text-[18px]">document_scanner</span>
                  <span className="text-xs font-semibold tracking-wide text-slate-200">
                    BLANGKO SKK: SURAT KETERANGAN KELAHIRAN
                  </span>
                </div>

                {/* Tactile Tools Controls */}
                <div className="flex items-center gap-1.5 text-xs">
                  {/* Loupe Toggle */}
                  <button
                    onClick={() => setLoupeActive(!loupeActive)}
                    className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 border transition ${
                      loupeActive
                        ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                        : 'bg-[#1E2B3E] text-slate-300 border-[#324560] hover:text-white'
                    }`}
                    title="Aktifkan Mode Kaca Pembesar 2x"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">search</span>
                    <span>Loupe 2x</span>
                  </button>

                  {/* Contrast Filter */}
                  <button
                    onClick={() => setContrastFilter(!contrastFilter)}
                    className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 border transition ${
                      contrastFilter
                        ? 'bg-amber-500 text-white border-amber-400'
                        : 'bg-[#1E2B3E] text-slate-300 border-[#324560] hover:text-white'
                    }`}
                    title="Tingkatkan Kontras Tinta"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">contrast</span>
                    <span>Filter</span>
                  </button>

                  {/* Caliper Bounding Box Toggle */}
                  <button
                    onClick={() => setCaliperVisible(!caliperVisible)}
                    className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 border transition ${
                      caliperVisible
                        ? 'bg-[#273B54] text-sky-300 border-sky-400/50'
                        : 'bg-[#1E2B3E] text-slate-400 border-[#324560]'
                    }`}
                    title="Tampilkan / Sembunyikan Kotak Koordinat OCR"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">crop_free</span>
                    <span>Caliper</span>
                  </button>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 bg-[#1E2B3E] border border-[#324560] rounded p-0.5 ml-1">
                    <button
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#2A3C54] text-slate-300"
                      onClick={() => setZoom((z) => Math.max(75, z - 25))}
                      type="button"
                    >
                      −
                    </button>
                    <span className="font-mono text-[11px] px-1 text-sky-300 font-semibold">{zoom}%</span>
                    <button
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#2A3C54] text-slate-300"
                      onClick={() => setZoom((z) => Math.min(150, z + 25))}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Light-Table Canvas Surface */}
              <div
                className={`p-6 min-h-[500px] flex items-center justify-center overflow-hidden relative select-none ${
                  contrastFilter ? 'bg-[#0F1722]' : 'bg-[#1E2A3B]'
                }`}
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              >
                {/* Simulated Document Canvas (Authentic Indonesian Birth Certificate) */}
                <div
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'center center',
                    filter: contrastFilter ? 'contrast(1.25) brightness(0.95)' : 'none',
                  }}
                  className="w-full max-w-[480px] bg-[#FCFBF7] text-[#1A202C] border-2 border-[#D1D5DB] rounded-lg p-6 shadow-2xl relative font-serif text-[12px] leading-relaxed transition-all duration-150"
                >
                  {/* Watermark in background */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
                    <div className="w-56 h-56 rounded-full border-8 border-current flex items-center justify-center text-center font-bold text-3xl uppercase tracking-widest font-sans">
                      KOTA CONTOH
                    </div>
                  </div>

                  {/* Header Blangko */}
                  <div className="text-center pb-3 border-b-2 border-[#1A202C] mb-4">
                    <div className="font-bold text-xs uppercase tracking-widest font-sans text-slate-700">
                      PEMERINTAH KOTA CONTOH · DINAS KESEHATAN
                    </div>
                    <div className="font-bold text-base tracking-wide font-sans text-[#0F172A] mt-0.5">
                      RUMAH SAKIT UMUM DAERAH KOTA CONTOH
                    </div>
                    <div className="text-[10px] text-slate-600 font-sans">
                      SURAT KETERANGAN KELAHIRAN (SKK) · No: 474.1/0884-SKK/RSUD/X/2026
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-2 text-[11px] font-sans">
                    <p className="text-[10px] italic text-slate-600 mb-1">
                      Yang bertanda tangan di bawah ini menerangkan dengan sebenarnya bahwa:
                    </p>

                    <div className="grid grid-cols-12 gap-1 py-0.5">
                      <span className="col-span-4 text-slate-600">Hari, Tanggal Lahir</span>
                      <span className="col-span-8 font-semibold">: Sabtu, 24 Oktober 2026 (08.45 WIB)</span>
                    </div>

                    <div className="grid grid-cols-12 gap-1 py-0.5">
                      <span className="col-span-4 text-slate-600">Tempat Persalinan</span>
                      <span className="col-span-8 font-semibold">: Ruang VK Melati 03, RSUD Kota Contoh</span>
                    </div>

                    {/* TARGET FIELD: NAMA BAYI (CALIPER INSPECTION) */}
                    <div className="grid grid-cols-12 gap-1 py-1 items-center relative">
                      <span className="col-span-4 text-slate-600 font-semibold">Nama Anak / Bayi</span>
                      <div className="col-span-8 relative">
                        {caliperVisible && (
                          <div
                            className={`p-1 rounded transition-all ${
                              nameCorrected
                                ? 'bg-emerald-50 border-2 border-emerald-500'
                                : 'bg-amber-100/90 border-2 border-amber-500'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[9px] font-mono font-bold">
                              <span className={nameCorrected ? 'text-emerald-800' : 'text-amber-800'}>
                                {nameCorrected ? '✓ KOREKSI DISIMPAN' : '[CALIPER OCR: X=148 Y=92]'}
                              </span>
                              <span className="bg-white/80 px-1 rounded text-slate-700">CONF: 94.2%</span>
                            </div>
                            <div className="text-xs font-bold text-[#0F172A] mt-0.5 flex items-center gap-1.5 font-mono">
                              <span>: {nameCorrected ? 'Ayu Contoh' : 'Ayu Cntoh'}</span>
                              {!nameCorrected && (
                                <span className="bg-amber-600 text-white text-[9px] px-1 rounded font-sans">
                                  Kurang 'o'
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {!caliperVisible && (
                          <span className="font-bold">: {nameCorrected ? 'Ayu Contoh' : 'Ayu Cntoh'}</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-1 py-0.5">
                      <span className="col-span-4 text-slate-600">Jenis Kelamin</span>
                      <span className="col-span-8">: Perempuan</span>
                    </div>

                    <div className="grid grid-cols-12 gap-1 py-0.5">
                      <span className="col-span-4 text-slate-600">Nama Ibu Kandung</span>
                      <span className="col-span-8 font-semibold">: Ayu Puspita (NIK: 3275016205980002)</span>
                    </div>

                    <div className="grid grid-cols-12 gap-1 py-0.5">
                      <span className="col-span-4 text-slate-600">Nama Ayah</span>
                      <span className="col-span-8 font-semibold">: Budi Santoso (NIK: 3275011403950001)</span>
                    </div>
                  </div>

                  {/* Stamp & Barcode Footer */}
                  <div className="pt-4 mt-3 border-t border-slate-300 flex items-center justify-between font-sans">
                    {/* Barcode */}
                    <div className="space-y-0.5">
                      <div className="font-mono text-[9px] tracking-widest text-slate-600">
                        *474108842026X*
                      </div>
                      <div className="h-6 w-28 bg-slate-800 rounded-xs flex items-center justify-center text-white text-[8px] font-mono tracking-widest">
                        |||||||||||||||||||
                      </div>
                    </div>

                    {/* Wet Stamp Seal */}
                    <div className="official-wet-stamp text-violet-800 border-violet-800">
                      <span className="text-[8px] leading-tight">TERTANDA &amp; CAP RESMI</span>
                      <span className="text-[10px] leading-tight">RSUD KOTA CONTOH</span>
                      <span className="text-[7px] text-slate-500 font-sans mt-0.5">Dr. Hendra, Sp.OG</span>
                    </div>
                  </div>

                  {/* Loupe Floating Magnifier Overlay Simulation */}
                  {loupeActive && (
                    <div className="absolute top-28 right-8 w-36 h-36 rounded-full border-4 border-sky-400 bg-white/95 shadow-2xl p-2 pointer-events-none flex flex-col items-center justify-center text-center z-30">
                      <span className="text-[9px] font-mono text-sky-700 font-bold">LOUPE OPTICAL 2X</span>
                      <span className="text-base font-bold font-mono text-amber-700 underline my-0.5">
                        {nameCorrected ? 'Ayu Contoh' : 'Ayu Cntoh'}
                      </span>
                      <span className="text-[8px] text-slate-500">Kesesuaian Tinta: 94.2%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Diagnostic Metrics Bar */}
              <div className="h-10 px-4 bg-[#141E2D] border-t border-[#2D3F58] flex items-center justify-between text-[11px] text-slate-300 font-mono">
                <div className="flex items-center gap-4">
                  <span>DPI: <strong className="text-emerald-400">300 (Optimal)</strong></span>
                  <span>SKEW: <strong className="text-emerald-400">0.3°</strong></span>
                  <span>CONFIDENCE: <strong className="text-sky-300">94.2%</strong></span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Nilai baca mesin [machine_read]
                </span>
              </div>
            </div>

            {/* Right: Actionable Findings Panel (col-span-5) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-[#DDE5EF]">
                <h2 className="font-heading text-[18px] font-bold text-[#142C4B]">
                  Rincian Temuan Pemeriksaan
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-[#EBF1F8] border border-[#CBD7E6] rounded-full text-[#142C4B]">
                  {nameCorrected && docReplaced ? '0 Temuan Aktif' : '2 Temuan Perlu Aksi'}
                </span>
              </div>

              {/* Finding Card 1: Ejaan Nama */}
              <div
                className={`border rounded-xl p-5 space-y-3 shadow-xs transition-all ${
                  nameCorrected
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-white border-l-4 border-l-amber-500 border-[#DDE5EF]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      nameCorrected ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {nameCorrected ? '✓ Terkoreksi Pemohon' : 'Konsistensi Data · Halaman 1'}
                  </span>
                  <span className="material-symbols-outlined text-[20px] text-slate-600">
                    {nameCorrected ? 'verified' : 'spellcheck'}
                  </span>
                </div>

                <h3 className="font-heading text-base font-bold text-[#142C4B]">
                  Perbedaan Huruf Ejaan Nama
                </h3>

                <div className="grid grid-cols-2 gap-2 bg-[#F5F7FB] p-3 rounded-lg text-xs font-sans">
                  <div>
                    <span className="text-[#52657A] block text-[11px]">Formulir Anda:</span>
                    <span className="font-semibold text-[#142C4B]">Ayu Contoh</span>
                  </div>
                  <div>
                    <span className="text-[#52657A] block text-[11px]">Terbaca OCR:</span>
                    <span className={`font-semibold ${nameCorrected ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {nameCorrected ? 'Ayu Contoh (Diselaraskan)' : 'Ayu Cntoh ⚠'}
                    </span>
                  </div>
                </div>

                <p className="text-[13px] text-[#52657A] leading-relaxed">
                  Huruf 'o' tidak terbaca tegas pada cetakan awal. Anda dapat menerapkan koreksi langsung tanpa perlu scan ulang.
                </p>

                <div className="pt-1">
                  {!nameCorrected ? (
                    <button
                      onClick={handleApplyCorrection}
                      className="w-full h-10 px-4 rounded-lg bg-[#1769D2] hover:bg-[#1257B0] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">done_all</span>
                      <span>Konfirmasi &amp; Koreksi Menjadi "Ayu Contoh"</span>
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-100/70 border border-emerald-300 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Status: Diselaraskan sebagai data resmi pemohon [citizen_corrected].</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Finding Card 2: Cap Rumah Sakit */}
              <div
                className={`border rounded-xl p-5 space-y-3 shadow-xs transition-all ${
                  docReplaced
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-white border-l-4 border-l-amber-500 border-[#DDE5EF]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      docReplaced ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {docReplaced ? '✓ Berkas Diperbarui' : 'Kualitas Berkas · Halaman 2'}
                  </span>
                  <span className="material-symbols-outlined text-[20px] text-slate-600">
                    document_scanner
                  </span>
                </div>

                <h3 className="font-heading text-base font-bold text-[#142C4B]">
                  Cap Fasilitas Kesehatan Kurang Tegas
                </h3>

                <p className="text-[13px] text-[#52657A] leading-relaxed">
                  Cap stempel rumah sakit pada sudut kanan bawah berkas fisik sedikit pudar saat dipindai kamera HP.
                </p>

                <div className="p-3 rounded-lg bg-[#ECF8F3] border border-[#C5E8D8] text-xs text-[#087F68] flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">lightbulb</span>
                  <span>
                    <strong>Saran Praktis:</strong> Foto tegak lurus pada bidang datar dengan cahaya alami merata.
                  </span>
                </div>

                <div className="pt-1">
                  {!docReplaced ? (
                    <button
                      onClick={handleSimulateReupload}
                      className="w-full h-10 px-4 rounded-lg border border-[#DDE5EF] bg-white text-xs font-semibold text-[#172B45] hover:bg-[#F5F7FB] flex items-center justify-center gap-1.5 transition"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">upload_file</span>
                      <span>Simulasikan Pindaian Ulang Dokumen Jelas</span>
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-100/70 border border-emerald-300 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Pindaian tajam telah tersimpan di versi dokumen aktif.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Action Bar */}
        <div className="h-[64px] bg-white border-t border-[#DDE5EF] px-8 flex items-center justify-between shrink-0">
          <button
            className="h-[44px] px-4 rounded-lg border border-[#DDE5EF] bg-white text-sm font-semibold text-[#172B45] hover:bg-[#F5F7FB] flex items-center gap-2 transition"
            type="button"
            onClick={() => navigate('/persiapan/dokumen')}
          >
            <span className="material-symbols-outlined text-[#52657A]">arrow_back</span>
            <span>Kembali ke Dokumen</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              className="h-[44px] px-4 rounded-lg border border-[#DDE5EF] bg-white text-sm font-semibold text-[#172B45] hover:bg-[#F5F7FB] transition"
              type="button"
              onClick={() => showToast('Draf pemeriksaan berhasil disimpan!', 'success')}
            >
              Simpan draf
            </button>
            <button
              className="h-[44px] px-6 rounded-lg bg-[#1769D2] text-white text-sm font-semibold hover:bg-[#1257B0] flex items-center gap-2 shadow-sm transition"
              type="button"
              onClick={() => navigate('/persiapan/ringkasan')}
            >
              <span>Lanjut ke Ringkasan Kesiapan</span>
              <span className="material-symbols-outlined text-white text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
