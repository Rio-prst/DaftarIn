import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PreparationStepper } from '../components/PreparationStepper';

export const PreparationDataPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedService, formData, setFormData, showToast, openChat } = useApp();

  // Wizard Sub-Step (1 to 4)
  const [subStep, setSubStep] = useState<number>(1);
  const [targetWho, setTargetWho] = useState<'anak' | 'sendiri'>('anak');
  const [faskes, setFaskes] = useState<'rsud' | 'non_faskes'>('rsud');
  const [marriageStatus, setMarriageStatus] = useState<'tercatat' | 'siri'>('tercatat');
  const [isClassicView, setIsClassicView] = useState<boolean>(false);

  // Auto-fill Ayu Contoh
  const handleLoadDemo = () => {
    setFormData({
      nama_lengkap: 'Ayu Contoh',
      nik: '3275012345670001',
      no_kk: '3275010908120005',
      telepon: '081298765432',
      alamat: 'Jl. Melati No. 12, RT 02/05, Kota Contoh',
      alasan: 'Penerbitan akta kelahiran pertama untuk anak kandung.',
    });
    showToast('Data contoh "Ayu Contoh" berhasil dimuat ke formulir!', 'success');
  };

  const handleNextSubStep = () => {
    if (subStep < 4) {
      setSubStep((prev) => prev + 1);
    } else {
      navigate('/persiapan/dokumen');
    }
  };

  const handlePrevSubStep = () => {
    if (subStep > 1) {
      setSubStep((prev) => prev - 1);
    } else {
      navigate('/panduan');
    }
  };

  return (
    <div className="bg-[#F5F7FB] text-on-surface flex min-h-screen font-sans selection:bg-[#1769D2] selection:text-white">
      {/* Left Sidebar (Desktop: 240px, Mobile: hidden with mobile drawer) */}
      <aside className="hidden md:flex w-[240px] bg-[#142C4B] text-white flex-col shrink-0 min-h-screen">
        <div className="h-[72px] px-5 flex items-center gap-3 border-b border-[#233F66]">
          <div className="w-8 h-8 rounded bg-[#1769D2] flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-white text-[20px]">fact_check</span>
          </div>
          <div>
            <div className="font-heading font-black text-base tracking-tight leading-none text-white">
              DaftarIn
            </div>
            <div className="text-[10px] text-[#A6BCD7] mt-1 leading-none font-semibold">
              JejakMasWowo · Layanan Warga
            </div>
          </div>
        </div>

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

        <div className="p-4 border-t border-[#233F66] space-y-2">
          <button
            className="h-[40px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition w-full"
            type="button"
            onClick={() => navigate('/')}
          >
            <span className="material-symbols-outlined text-[#C3D4EA] text-[18px]">logout</span>
            <span>Keluar</span>
          </button>
          <div className="text-[11px] text-[#7E98B9] flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Mode Persiapan Mandiri</span>
          </div>
        </div>
      </aside>

      {/* Main Region */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Topbar */}
        <header className="h-[72px] bg-white border-b border-[#DDE5EF] px-4 sm:px-8 flex items-center justify-between shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2 text-sm text-[#52657A]">
            <span>Persiapan</span>
            <span className="material-symbols-outlined text-base text-[#8DA0B6]">chevron_right</span>
            <span className="font-medium text-[#172B45]">{selectedService?.name || 'Akta Kelahiran'}</span>
            <span className="material-symbols-outlined text-base text-[#8DA0B6]">chevron_right</span>
            <span className="font-semibold text-[#1769D2]">Data Pemohon</span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher (Taxfix Conversational vs Classic Form) */}
            <button
              onClick={() => setIsClassicView(!isClassicView)}
              className="px-3 py-1.5 rounded-lg border border-[#CBD7E6] text-xs font-semibold text-[#142C4B] hover:bg-[#F5F7FB] transition flex items-center gap-1.5 shadow-xs"
              type="button"
              title="Ganti antara mode tanya-jawab santai dan formulir penuh"
            >
              <span className="material-symbols-outlined text-[16px] text-[#1769D2]">
                {isClassicView ? 'chat' : 'format_list_bulleted'}
              </span>
              <span>{isClassicView ? 'Mode Panduan Santai (Taxfix)' : 'Formulir Lengkap'}</span>
            </button>

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
                {formData.nama_lengkap ? formData.nama_lengkap.slice(0, 2).toUpperCase() : 'AC'}
              </div>
              <span className="text-sm font-semibold text-[#172B45]">{formData.nama_lengkap || 'Ayu Contoh'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-8 w-full flex-1 overflow-y-auto">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-[28px] leading-[36px] font-bold text-[#172B45] font-display">
                Lengkapi Data Pengurusan
              </h1>
              <p className="text-[14px] text-[#52657A] mt-1">
                Layanan: <strong>{selectedService?.name || 'Penerbitan Akta Kelahiran Baru (contoh)'}</strong> · Sesi: <span className="font-mono text-[#142C4B]">JMW-PREP-20261028-001</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadDemo}
                className="px-3.5 py-1.5 bg-[#EBF1F8] hover:bg-[#D5E6FF] text-[#1769D2] border border-[#CBD7E6] rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                type="button"
              >
                <span>⚡ Isi Otomatis Data Contoh (Ayu Contoh)</span>
              </button>
            </div>
          </div>

          {/* Stepper Folder Tabs */}
          <PreparationStepper currentStep={2} />

          {/* MODE 1: TAXFIX-STYLE CONVERSATIONAL WIZARD */}
          {!isClassicView ? (
            <div className="max-w-2xl mx-auto py-4 space-y-6">
              {/* Progress Indicator Card */}
              <div className="bg-white border border-[#DDE5EF] rounded-2xl p-5 shadow-xs flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-[#1769D2] uppercase tracking-wider">
                    LANGKAH {subStep} DARI 4
                  </div>
                  <div className="text-sm font-bold text-[#142C4B]">
                    {subStep === 1 && 'Subjek Pengurusan Dokumen'}
                    {subStep === 2 && 'Tempat Persalinan / Kelahiran'}
                    {subStep === 3 && 'Status Pernikahan Orang Tua'}
                    {subStep === 4 && 'Biodata Pemohon & Bayi'}
                  </div>
                </div>

                {/* Pill Progress Bar */}
                <div className="w-36 bg-[#EBF1F8] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#1769D2] h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(subStep / 4) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* CARD STEP 1: PENGURUSAN UNTUK SIAPA */}
              {subStep === 1 && (
                <div className="bg-white border-2 border-[#CBD7E6] rounded-2xl p-7 shadow-sm space-y-5 wizard-step-enter">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#1769D2] uppercase tracking-wider">Pertanyaan 1</span>
                    <h2 className="text-2xl font-bold text-[#142C4B] font-display">
                      Pengajuan akta ini untuk siapa?
                    </h2>
                    <p className="text-xs text-[#52657A]">
                      Pilih subjek pengurusan agar sistem dapat memvalidasi hubungan keluarga di Kartu Keluarga.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setTargetWho('anak')}
                      className={`p-5 rounded-xl border-2 text-left transition-all ${
                        targetWho === 'anak'
                          ? 'border-[#1769D2] bg-[#EBF1F8] shadow-sm ring-2 ring-[#1769D2]/30'
                          : 'border-[#DDE5EF] hover:border-[#94A3B8] bg-white'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#142C4B] text-white flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-[22px]">family_restroom</span>
                      </div>
                      <div className="font-bold text-base text-[#142C4B]">Anak / Anggota Keluarga</div>
                      <p className="text-xs text-[#52657A] mt-1 leading-relaxed">
                        Mendaftarkan akta untuk anak kandung yang baru lahir dalam satu susunan KK orang tua.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetWho('sendiri')}
                      className={`p-5 rounded-xl border-2 text-left transition-all ${
                        targetWho === 'sendiri'
                          ? 'border-[#1769D2] bg-[#EBF1F8] shadow-sm ring-2 ring-[#1769D2]/30'
                          : 'border-[#DDE5EF] hover:border-[#94A3B8] bg-white'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#142C4B] text-white flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-[22px]">person</span>
                      </div>
                      <div className="font-bold text-base text-[#142C4B]">Diri Sendiri</div>
                      <p className="text-xs text-[#52657A] mt-1 leading-relaxed">
                        Mengurus penerbitan kutipan akta kelahiran atas nama pemohon pribadi yang bersangkutan.
                      </p>
                    </button>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-[#DDE5EF]">
                    <button
                      onClick={() => navigate('/panduan')}
                      className="px-4 py-2.5 rounded-xl border border-[#CBD7E6] text-xs font-bold text-[#52657A] hover:bg-slate-50 transition flex items-center gap-1.5"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      <span>Kembali ke Panduan</span>
                    </button>
                    <button
                      onClick={handleNextSubStep}
                      className="px-6 py-3 bg-[#1769D2] hover:bg-[#1257B0] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition"
                      type="button"
                    >
                      <span>Lanjutkan</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CARD STEP 2: TEMPAT PERSALINAN */}
              {subStep === 2 && (
                <div className="bg-white border-2 border-[#CBD7E6] rounded-2xl p-7 shadow-sm space-y-5 wizard-step-enter">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#1769D2] uppercase tracking-wider">Pertanyaan 2</span>
                    <h2 className="text-2xl font-bold text-[#142C4B] font-display">
                      Di mana tempat persalinan / kelahiran berlangsung?
                    </h2>
                    <p className="text-xs text-[#52657A]">
                      Tempat kelahiran menentukan jenis surat pembuktian lahir yang wajib dilampirkan.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setFaskes('rsud')}
                      className={`w-full p-4 rounded-xl border-2 text-left flex items-start gap-4 transition-all ${
                        faskes === 'rsud'
                          ? 'border-[#1769D2] bg-[#EBF1F8] shadow-sm ring-2 ring-[#1769D2]/30'
                          : 'border-[#DDE5EF] hover:border-[#94A3B8] bg-white'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[20px]">local_hospital</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-[#142C4B]">
                          Fasilitas Kesehatan Resmi (RSUD, RS Swasta, Puskesmas, Klinik, Bidan)
                        </div>
                        <p className="text-xs text-[#52657A] mt-0.5">
                          Memerlukan Surat Keterangan Kelahiran (SKK) asli berstempel faskes dan tanda tangan dokter/bidan penolong.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFaskes('non_faskes')}
                      className={`w-full p-4 rounded-xl border-2 text-left flex items-start gap-4 transition-all ${
                        faskes === 'non_faskes'
                          ? 'border-[#1769D2] bg-[#EBF1F8] shadow-sm ring-2 ring-[#1769D2]/30'
                          : 'border-[#DDE5EF] hover:border-[#94A3B8] bg-white'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[20px]">home</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-[#142C4B]">
                          Kelahiran di Luar Fasilitas Medis (Rumah / Tempat Lain)
                        </div>
                        <p className="text-xs text-[#52657A] mt-0.5">
                          Memerlukan Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) Kebenaran Data Kelahiran bermeterai.
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      onClick={handlePrevSubStep}
                      className="px-4 py-2.5 rounded-xl border border-[#CBD7E6] text-xs font-bold text-[#52657A] hover:bg-slate-50 transition"
                      type="button"
                    >
                      ← Sebelumnya
                    </button>
                    <button
                      onClick={handleNextSubStep}
                      className="px-6 py-3 bg-[#1769D2] hover:bg-[#1257B0] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition"
                      type="button"
                    >
                      <span>Lanjutkan</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CARD STEP 3: STATUS PERNIKAHAN */}
              {subStep === 3 && (
                <div className="bg-white border-2 border-[#CBD7E6] rounded-2xl p-7 shadow-sm space-y-5 wizard-step-enter">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#1769D2] uppercase tracking-wider">Pertanyaan 3</span>
                    <h2 className="text-2xl font-bold text-[#142C4B] font-display">
                      Bagaimana status perkawinan orang tua pada Kartu Keluarga?
                    </h2>
                    <p className="text-xs text-[#52657A]">
                      Menentukan hubungan hukum anak dan pencantuman nama ayah pada kutipan akta resmi.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setMarriageStatus('tercatat')}
                      className={`w-full p-4 rounded-xl border-2 text-left flex items-start gap-4 transition-all ${
                        marriageStatus === 'tercatat'
                          ? 'border-[#1769D2] bg-[#EBF1F8] shadow-sm ring-2 ring-[#1769D2]/30'
                          : 'border-[#DDE5EF] hover:border-[#94A3B8] bg-white'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-sky-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[20px]">menu_book</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-[#142C4B]">
                          Kawin Tercatat (Buku Nikah KUA / Akta Perkawinan Catatan Sipil)
                        </div>
                        <p className="text-xs text-[#52657A] mt-0.5">
                          Status suami-istri sah secara agama dan negara. Akta mencantumkan nama ayah dan ibu kandung.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMarriageStatus('siri')}
                      className={`w-full p-4 rounded-xl border-2 text-left flex items-start gap-4 transition-all ${
                        marriageStatus === 'siri'
                          ? 'border-[#1769D2] bg-[#EBF1F8] shadow-sm ring-2 ring-[#1769D2]/30'
                          : 'border-[#DDE5EF] hover:border-[#94A3B8] bg-white'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[20px]">assignment_late</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-[#142C4B]">
                          Kawin Belum Tercatat / Belum Memiliki Buku Nikah Resmi
                        </div>
                        <p className="text-xs text-[#52657A] mt-0.5">
                          Memerlukan SPTJM Kebenaran Pasangan Suami Istri (Format Permendagri No. 108/2019).
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      onClick={handlePrevSubStep}
                      className="px-4 py-2.5 rounded-xl border border-[#CBD7E6] text-xs font-bold text-[#52657A] hover:bg-slate-50 transition"
                      type="button"
                    >
                      ← Sebelumnya
                    </button>
                    <button
                      onClick={handleNextSubStep}
                      className="px-6 py-3 bg-[#1769D2] hover:bg-[#1257B0] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition"
                      type="button"
                    >
                      <span>Lanjutkan</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CARD STEP 4: FORM BIODATA PEMOHON & BAYI */}
              {subStep === 4 && (
                <div className="bg-white border-2 border-[#CBD7E6] rounded-2xl p-7 shadow-sm space-y-5 wizard-step-enter">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#1769D2] uppercase tracking-wider">Pertanyaan 4</span>
                      <h2 className="text-2xl font-bold text-[#142C4B] font-display">
                        Konfirmasi Data Identitas Draf
                      </h2>
                      <p className="text-xs text-[#52657A]">
                        Data ini akan dicocokkan dengan teks hasil pindaian OCR pada dokumen fisik Anda.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLoadDemo}
                      className="px-3 py-1.5 bg-[#EBF1F8] hover:bg-[#D5E6FF] text-[#1769D2] border border-[#CBD7E6] rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
                    >
                      <span>⚡ Muat Draf Ayu Contoh</span>
                    </button>
                  </div>

                  <div className="space-y-4 pt-1 font-sans">
                    <div>
                      <label className="block text-xs font-bold text-[#142C4B] mb-1">
                        Nama Lengkap Pemohon (Sesuai KTP Fisik)
                      </label>
                      <input
                        type="text"
                        value={formData.nama_lengkap}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, nama_lengkap: e.target.value }))
                        }
                        placeholder="Contoh: Ayu Contoh"
                        className="w-full h-11 px-3.5 bg-white border border-[#CBD7E6] rounded-xl text-sm font-semibold text-[#142C4B] focus:outline-none focus:border-[#1769D2] focus:ring-2 focus:ring-[#1769D2]/20"
                      />
                      <span className="text-[11px] text-[#52657A] mt-1 block">
                        Pastikan ejaan persis sama dengan KTP asli untuk menghindari ketidaksesuaian saat OCR.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-[#142C4B]">
                            NIK Pemohon (16 Digit)
                          </label>
                          {formData.nik.length === 16 ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              ✓ 16 Digit
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#52657A]">
                              {formData.nik.length}/16 Digit
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          maxLength={16}
                          value={formData.nik}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, nik: e.target.value.replace(/\D/g, '') }))
                          }
                          placeholder="3275012345670001"
                          className={`w-full h-11 px-3.5 bg-white border rounded-xl text-sm font-mono text-[#142C4B] focus:outline-none focus:ring-2 ${
                            formData.nik.length === 16
                              ? 'border-emerald-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                              : 'border-[#CBD7E6] focus:border-[#1769D2] focus:ring-[#1769D2]/20'
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-[#142C4B]">
                            Nomor Kartu Keluarga (KK)
                          </label>
                          {formData.no_kk.length === 16 ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              ✓ 16 Digit
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#52657A]">
                              {formData.no_kk.length}/16 Digit
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          maxLength={16}
                          value={formData.no_kk}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, no_kk: e.target.value.replace(/\D/g, '') }))
                          }
                          placeholder="3275010908120005"
                          className={`w-full h-11 px-3.5 bg-white border rounded-xl text-sm font-mono text-[#142C4B] focus:outline-none focus:ring-2 ${
                            formData.no_kk.length === 16
                              ? 'border-emerald-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                              : 'border-[#CBD7E6] focus:border-[#1769D2] focus:ring-[#1769D2]/20'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#142C4B] mb-1">
                        Nomor WhatsApp / Kontak Notifikasi
                      </label>
                      <input
                        type="tel"
                        value={formData.telepon}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, telepon: e.target.value }))
                        }
                        placeholder="081298765432"
                        className="w-full h-11 px-3.5 bg-white border border-[#CBD7E6] rounded-xl text-sm font-mono text-[#142C4B] focus:outline-none focus:border-[#1769D2] focus:ring-2 focus:ring-[#1769D2]/20"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-[#DDE5EF]">
                    <button
                      onClick={handlePrevSubStep}
                      className="px-4 py-2.5 rounded-xl border border-[#CBD7E6] text-xs font-bold text-[#52657A] hover:bg-slate-50 transition"
                      type="button"
                    >
                      ← Sebelumnya
                    </button>
                    <button
                      onClick={() => {
                        if (!formData.nama_lengkap.trim() || !formData.nik.trim()) {
                          showToast('Mohon lengkapi Nama Lengkap dan NIK (16 digit) pemohon.', 'warning');
                          return;
                        }
                        showToast('Data pemohon berhasil dikonfirmasi!', 'success');
                        navigate('/persiapan/dokumen');
                      }}
                      className="px-6 py-3 bg-[#1769D2] hover:bg-[#1257B0] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition"
                      type="button"
                    >
                      <span>Lanjut ke Unggah Berkas</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* MODE 2: CLASSIC FULL FORM */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white border border-[#DDE5EF] rounded-xl p-6 space-y-4 shadow-xs">
                  <h2 className="font-heading text-lg font-bold text-[#142C4B]">
                    Formulir Lengkap Data Pemohon
                  </h2>
                  <div className="space-y-4 text-xs font-sans">
                    <div>
                      <label className="block font-bold text-[#142C4B] mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        value={formData.nama_lengkap}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, nama_lengkap: e.target.value }))
                        }
                        className="w-full h-10 px-3 border border-[#CBD7E6] rounded-lg text-sm text-[#142C4B]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#142C4B] mb-1">NIK</label>
                        <input
                          type="text"
                          maxLength={16}
                          value={formData.nik}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, nik: e.target.value }))
                          }
                          className="w-full h-10 px-3 border border-[#CBD7E6] rounded-lg text-sm font-mono text-[#142C4B]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#142C4B] mb-1">No KK</label>
                        <input
                          type="text"
                          maxLength={16}
                          value={formData.no_kk}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, no_kk: e.target.value }))
                          }
                          className="w-full h-10 px-3 border border-[#CBD7E6] rounded-lg text-sm font-mono text-[#142C4B]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white border border-[#DDE5EF] rounded-xl p-5 space-y-3 shadow-xs">
                  <h3 className="font-bold text-sm text-[#142C4B]">Ringkasan Draf</h3>
                  <div className="text-xs space-y-2 text-[#52657A]">
                    <div className="flex justify-between">
                      <span>Layanan:</span>
                      <strong className="text-[#142C4B]">Akta Kelahiran</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Pemohon:</span>
                      <strong className="text-[#142C4B]">{formData.nama_lengkap}</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/persiapan/dokumen')}
                    className="w-full h-10 bg-[#1769D2] text-white rounded-lg font-bold text-xs mt-2"
                    type="button"
                  >
                    Lanjut ke Dokumen →
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
