import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import heroWomanImg from '../assets/taxfix_hero_woman.png';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { openChat } = useApp();

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedService, setSelectedService] = useState<'akta' | 'kk' | 'ktp'>('akta');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white text-[#142C4B] antialiased min-h-screen flex flex-col font-sans selection:bg-[#1769D2] selection:text-white overflow-x-hidden">
      {/* 1. TOP ANNOUNCEMENT RIBBON — DEEP CIVIC NAVY */}
      <div className="bg-[#142C4B] text-white px-4 py-2 text-xs border-b border-[#233F66]">
        <div className="max-w-6xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#1769D2] text-white font-black text-[10px] tracking-wider uppercase font-mono shadow-xs">
              100% GRATIS
            </span>
            <span className="text-slate-200 text-[11px] sm:text-xs">
              Sesuai UU No. 24/2013: Pengurusan berkas kependudukan resmi Rp 0 (bebas biaya &amp; tanpa calo).
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-sky-200 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Standar SIAK Disdukcapil</span>
          </div>
        </div>
      </div>

      {/* 2. MINIMALIST NAVBAR — CIVIC BLUE & NAVY */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-40 transition-all">
        <div className="w-full px-6 max-w-6xl mx-auto flex items-center justify-between h-[72px]">
          {/* Logo Brand: JejakMasWowo with Cobalt Accent */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#142C4B] group-hover:bg-[#1769D2] text-white flex items-center justify-center font-bold shadow-sm transition-colors">
              <span className="material-symbols-outlined text-[20px]">fact_check</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-tight leading-none text-[#142C4B]">
                DaftarIn
              </span>
              <span className="text-[10px] font-bold text-[#1769D2] tracking-wider uppercase">
                JejakMasWowo · Layanan Warga
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#52657A]">
            <a
              href="#/katalog"
              onClick={(e) => {
                e.preventDefault();
                navigate('/katalog');
              }}
              className="hover:text-[#1769D2] transition-colors"
            >
              Katalog Layanan
            </a>
            <a
              href="#cara-kerja"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#1769D2] transition-colors"
            >
              Cara Kerja
            </a>
            <a
              href="#kenapa-kami"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('kenapa-kami')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#1769D2] transition-colors"
            >
              Kenapa JejakMasWowo
            </a>
            <button
              onClick={openChat}
              className="hover:text-[#1769D2] transition-colors flex items-center gap-1.5"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-[#1769D2]">smart_toy</span>
              <span>Tanya Mas Wowo AI</span>
            </button>
          </nav>

          {/* Action Header: Login + Cobalt Pill Button + Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/masuk')}
              className="hidden sm:inline-block text-sm font-bold text-[#52657A] hover:text-[#142C4B] px-2 py-1.5 transition"
              type="button"
            >
              Masuk
            </button>
            <button
              onClick={() => navigate('/panduan')}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#1769D2] hover:bg-[#1257B0] text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:scale-105 active:scale-95 transition-all"
              type="button"
            >
              Mulai Gratis
            </button>
            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#142C4B] hover:bg-slate-100 transition"
              aria-label="Navigasi Menu Mobile"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E2E8F0] px-6 py-4 space-y-3 shadow-lg">
            <a
              href="#/katalog"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                navigate('/katalog');
              }}
              className="block text-sm font-semibold text-[#142C4B] py-2 border-b border-slate-100"
            >
              Katalog Layanan
            </a>
            <a
              href="#cara-kerja"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="block text-sm font-semibold text-[#142C4B] py-2 border-b border-slate-100"
            >
              Cara Kerja
            </a>
            <a
              href="#kenapa-kami"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                document.getElementById('kenapa-kami')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="block text-sm font-semibold text-[#142C4B] py-2 border-b border-slate-100"
            >
              Kenapa JejakMasWowo
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openChat();
              }}
              className="w-full text-left flex items-center gap-2 text-sm font-semibold text-[#1769D2] py-2 border-b border-slate-100"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              <span>Tanya Mas Wowo AI</span>
            </button>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/masuk');
                }}
                className="flex-1 py-2 rounded-lg border border-[#CBD7E6] text-xs font-bold text-[#142C4B] text-center"
                type="button"
              >
                Masuk
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="flex-1 py-2 rounded-lg bg-[#142C4B] text-white text-xs font-bold text-center"
                type="button"
              >
                Dasbor Warga
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION (TAXFIX COMPOSITION + CIVIC BLUE & NAVY PALETTE) */}
      <section className="relative pt-10 pb-16 md:pt-14 md:pb-20 overflow-hidden bg-gradient-to-b from-[#EBF3FF] via-[#F4F7FD] to-white border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Bold Headline & Empathy Copy */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-[58px] leading-[1.06] tracking-tight text-[#142C4B]">
                Urus berkas kependudukan tanpa drama.
              </h1>

              <p className="text-base sm:text-lg text-[#52657A] leading-relaxed max-w-xl">
                Dengan panduan mandiri JejakMasWowo, seluruh persyaratan Akta Kelahiran, KK, dan KTP-el diperiksa otomatis sebelum ke loket dinas. Duduk santai, verifikator sistem kami memastikan dokumenmu langsung sah sekali datang.
              </p>

              {/* White Pill Button with Cobalt Blue Arrow Circle */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  onClick={() => navigate('/panduan')}
                  className="group inline-flex items-center justify-between gap-6 pl-7 pr-2.5 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#142C4B] font-bold text-base shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                  type="button"
                >
                  <span>Sekarang mulai gratis</span>
                  <span className="w-10 h-10 rounded-full bg-[#1769D2] text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform shadow-xs shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </button>
              </div>

              {/* Micro-Badges under CTA */}
              <div className="pt-2 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#142C4B]">
                  <span className="px-2 py-0.5 rounded-full bg-[#E7F0FF] text-[#1769D2] font-black text-[10px] tracking-wider uppercase font-mono border border-[#C5DCFA]">
                    BARU
                  </span>
                  <span className="text-[#52657A] font-medium">
                    Sekarang tersedia fitur audit ejaan nama KTP vs Kartu Keluarga otomatis!
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[#52657A]">
                  <span className="text-amber-500 font-bold">★ 4.9/5</span>
                  <span>
                    <strong>+14.200 dokumen warga</strong> telah diperiksa mandiri dan lolos loket tanpa penolakan.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual with Localized Floating Glass Badge */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[560px]">
                <img
                  src={heroWomanImg}
                  alt="Warga santai menikmati es krim karena urusan dokumen sudah beres"
                  className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-md block"
                />

                {/* Floating Glassmorphic Overlay Badge */}
                <div className="absolute left-[20%] bottom-[19%] sm:left-[22%] sm:bottom-[20%] z-20 glass-card rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-xl border border-white/80 max-w-[260px] sm:max-w-[280px]">
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs text-slate-800 flex items-center justify-center font-bold shrink-0">
                    <svg className="w-5 h-5 text-[#142C4B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <div className="text-left font-sans">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[#142C4B] tracking-tight">
                        Target Selesai
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <span className="font-display font-extrabold text-base sm:text-lg text-[#087F68] tracking-tight block">
                      1 - 2 Hari Kerja
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SERVICE SELECTOR (FAST SIMULATOR) */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full" id="kenapa-kami">
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 md:p-12 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#EBF1F8] text-[#1769D2] font-mono font-bold text-xs uppercase tracking-wider">
              SIMULATOR KEBUTUHAN CEPAT
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#142C4B]">
              Mau Mengurus Apa Hari Ini?
            </h2>
            <p className="text-xs sm:text-sm text-[#52657A]">
              Pilih dokumen yang ingin kamu siapkan untuk melihat panduan berkas &amp; estimasi waktu secara langsung.
            </p>
          </div>

          {/* Interactive Service Toggle Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedService('akta')}
              className={`px-6 py-3 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                selectedService === 'akta'
                  ? 'bg-[#142C4B] text-white shadow-md scale-105'
                  : 'bg-[#F8FAFD] text-[#52657A] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              <span>👶</span>
              <span>Akta Kelahiran Baru</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedService('kk')}
              className={`px-6 py-3 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                selectedService === 'kk'
                  ? 'bg-[#142C4B] text-white shadow-md scale-105'
                  : 'bg-[#F8FAFD] text-[#52657A] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              <span>👨‍👩‍👧‍👦</span>
              <span>Pembaruan Kartu Keluarga</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedService('ktp')}
              className={`px-6 py-3 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                selectedService === 'ktp'
                  ? 'bg-[#142C4B] text-white shadow-md scale-105'
                  : 'bg-[#F8FAFD] text-[#52657A] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              <span>🪪</span>
              <span>KTP-el Baru / Penggantian</span>
            </button>
          </div>

          {/* Dynamic Result Card */}
          <div className="bg-[#F8FAFD] border border-[#CBD7E6] rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-left">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#52657A] uppercase tracking-wider block">
                Dokumen Wajib Dibawa
              </span>
              <div className="font-bold text-base text-[#142C4B]">
                {selectedService === 'akta' && '3 Dokumen Fisik Asli'}
                {selectedService === 'kk' && '2 Dokumen Kependudukan'}
                {selectedService === 'ktp' && '1 Dokumen KK Terbaru'}
              </div>
              <p className="text-xs text-[#52657A]">
                {selectedService === 'akta' && 'Surat Lahir RSUD, Kartu Keluarga, dan Buku Nikah Orang Tua.'}
                {selectedService === 'kk' && 'KK Asli Lama dan berkas mutasi data (Buku Nikah / Ijazah).'}
                {selectedService === 'ktp' && 'Salinan KK terbaru & fisik KTP lama (jika rusak).'}
              </p>
            </div>

            <div className="space-y-1 md:border-l md:border-r md:border-[#CBD7E6] md:px-6">
              <span className="text-[11px] font-bold text-[#52657A] uppercase tracking-wider block">
                Biaya &amp; Standar Waktu
              </span>
              <div className="font-bold text-base text-[#087F68] flex items-center gap-1.5">
                <span>Rp 0 (Gratis Penuh)</span>
              </div>
              <p className="text-xs text-[#52657A]">
                Standar penerbitan: <strong>1 - 2 Hari Kerja</strong> setelah berkas diverifikasi petugas loket.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate('/panduan')}
                className="w-full py-3.5 px-4 rounded-full bg-[#1769D2] hover:bg-[#1257B0] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition flex items-center justify-center gap-2"
                type="button"
              >
                <span>Lihat Panduan &amp; Mulai Cek</span>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <span className="text-[10px] text-center text-[#52657A]">
                Bebas diakses tanpa perlu login.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 4 LANGKAH SANTAI MENUJU DOKUMEN SAH */}
      <section id="cara-kerja" className="py-16 px-6 max-w-6xl mx-auto space-y-12 w-full text-center">
        <div className="space-y-2 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-[#EBF1F8] text-[#1769D2] font-mono font-bold text-xs uppercase tracking-wider">
            STEP-BY-STEP PRAKTIS
          </span>
          <h2 className="text-3xl font-extrabold font-display text-[#142C4B]">
            4 Langkah Mudah Menuju Dokumen Sah
          </h2>
          <p className="text-xs sm:text-sm text-[#52657A]">
            Tinggalkan cara lama yang bikin pusing. Siapkan berkasmu santai lewat HP.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="bg-[#F8FAFD] rounded-2xl border border-[#CBD7E6] p-6 space-y-3 hover:border-[#1769D2] hover:bg-white transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#1769D2] flex items-center justify-center font-bold text-base">
              1
            </div>
            <h3 className="font-bold text-base text-[#142C4B]">Pilih Layanan</h3>
            <p className="text-xs text-[#52657A] leading-relaxed">
              Jawab pertanyaan santai untuk menentukan jenis formulir dan kondisi yang kamu butuhkan.
            </p>
          </div>

          <div className="bg-[#F8FAFD] rounded-2xl border border-[#CBD7E6] p-6 space-y-3 hover:border-[#1769D2] hover:bg-white transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#087F68] flex items-center justify-center font-bold text-base">
              2
            </div>
            <h3 className="font-bold text-base text-[#142C4B]">Foto Berkas dari HP</h3>
            <p className="text-xs text-[#52657A] leading-relaxed">
              Cukup ambil foto KTP, Kartu Keluarga, atau surat kelahiranmu dengan pencahayaan yang jelas.
            </p>
          </div>

          <div className="bg-[#F8FAFD] rounded-2xl border border-[#CBD7E6] p-6 space-y-3 hover:border-[#1769D2] hover:bg-white transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center font-bold text-base">
              3
            </div>
            <h3 className="font-bold text-base text-[#142C4B]">AI Audit Kesalahan</h3>
            <p className="text-xs text-[#52657A] leading-relaxed">
              Model AI langsung mendeteksi jika ada perbedaan ejaan huruf atau foto yang terpotong.
            </p>
          </div>

          <div className="bg-[#F8FAFD] rounded-2xl border border-[#CBD7E6] p-6 space-y-3 hover:border-[#1769D2] hover:bg-white transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#9333EA] flex items-center justify-center font-bold text-base">
              4
            </div>
            <h3 className="font-bold text-base text-[#142C4B]">Bawa Struk ke Loket</h3>
            <p className="text-xs text-[#52657A] leading-relaxed">
              Cetak struk bukti tanda terima digital kami, serahkan ke petugas loket, langsung beres!
            </p>
          </div>
        </div>
      </section>

      {/* 6. CERITA WARGA */}
      <section id="testimoni" className="py-16 bg-[#F8FAFD] border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#142C4B]">
              Cerita Warga yang Sudah Lolos Sekali Datang
            </h2>
            <p className="text-xs sm:text-sm text-[#52657A]">
              Dengar langsung pengalaman mereka yang menghemat waktu dan tenaga.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-white border border-[#CBD7E6] space-y-3 shadow-xs">
              <div className="text-amber-500 text-sm font-bold">★★★★★</div>
              <p className="text-xs text-[#142C4B] leading-relaxed italic">
                "Waktu ngurus akta anak pertama, biasanya orang cerita bolak-balik 3 kali karena typo nama di surat lahir RS. Pas pake JejakMasWowo langsung ketahuan hurufnya kurang satu. Mantap banget!"
              </p>
              <div className="pt-2 border-t border-[#F1F5F9] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1769D2] text-white font-bold flex items-center justify-center text-xs">
                  AP
                </div>
                <div>
                  <div className="font-bold text-xs text-[#142C4B]">Ayu Puspita (24 thn)</div>
                  <div className="text-[10px] text-[#52657A]">Ibu Rumah Tangga · Akta Kelahiran</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#CBD7E6] space-y-3 shadow-xs">
              <div className="text-amber-500 text-sm font-bold">★★★★★</div>
              <p className="text-xs text-[#142C4B] leading-relaxed italic">
                "Gue kerja kantoran jadi cuti itu mahal. Pake fitur tanya jawab santainya langsung ngerti bedanya surat pindah domisili antar-provinsi. Ke dukcapil cuma 20 menit langsung kelar."
              </p>
              <div className="pt-2 border-t border-[#F1F5F9] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#142C4B] text-white font-bold flex items-center justify-center text-xs">
                  BS
                </div>
                <div>
                  <div className="font-bold text-xs text-[#142C4B]">Budi Santoso (29 thn)</div>
                  <div className="text-[10px] text-[#52657A]">Karyawan Swasta · Pembaruan KK</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#CBD7E6] space-y-3 shadow-xs">
              <div className="text-amber-500 text-sm font-bold">★★★★★</div>
              <p className="text-xs text-[#142C4B] leading-relaxed italic">
                "Fitur struk thermal sama cap stempel verifikasinya keren parah! Pas dibawa ke kelurahan, bapak petugasnya langsung paham susunan dokumen kita udah rapi."
              </p>
              <div className="pt-2 border-t border-[#F1F5F9] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                  RD
                </div>
                <div>
                  <div className="font-bold text-xs text-[#142C4B]">Rizky Darmawan (21 thn)</div>
                  <div className="text-[10px] text-[#52657A]">Mahasiswa · KTP-el Pemula</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section id="faq" className="py-16 px-6 max-w-3xl mx-auto space-y-8 w-full text-left">
        <div className="text-center space-y-2">
          <span className="text-[#1769D2] font-mono font-bold text-xs uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#142C4B]">
            Pertanyaan yang Sering Diajukan
          </h2>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-[#CBD7E6] overflow-hidden shadow-xs">
            <button
              onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#142C4B] hover:bg-slate-50 transition"
              type="button"
            >
              <span>Apakah ada biaya menggunakan JejakMasWowo?</span>
              <span className={`material-symbols-outlined text-slate-500 transition-transform ${openFaq === 0 ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            {openFaq === 0 && (
              <div className="px-5 pb-5 pt-1 text-xs text-[#52657A] border-t border-slate-100 leading-relaxed">
                <strong>100% Gratis!</strong> Sesuai UU No. 24/2013, seluruh pelayanan administrasi kependudukan di Indonesia bebas retribusi. Kami tidak pernah memungut biaya apapun.
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#CBD7E6] overflow-hidden shadow-xs">
            <button
              onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#142C4B] hover:bg-slate-50 transition"
              type="button"
            >
              <span>Apakah dokumen saya aman?</span>
              <span className={`material-symbols-outlined text-slate-500 transition-transform ${openFaq === 1 ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            {openFaq === 1 && (
              <div className="px-5 pb-5 pt-1 text-xs text-[#52657A] border-t border-slate-100 leading-relaxed">
                Sangat aman. Pemrosesan OCR dilakukan sementara di perangkat Anda dan kami tidak menyimpan salinan data sensitif atau memperjualbelikannya kepada pihak ketiga.
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#CBD7E6] overflow-hidden shadow-xs">
            <button
              onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#142C4B] hover:bg-slate-50 transition"
              type="button"
            >
              <span>Apakah AI menggantikan petugas loket?</span>
              <span className={`material-symbols-outlined text-slate-500 transition-transform ${openFaq === 2 ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            {openFaq === 2 && (
              <div className="px-5 pb-5 pt-1 text-xs text-[#52657A] border-t border-slate-100 leading-relaxed">
                Tidak. AI hanya membantu persiapan berkas awal agar tidak ada yang kurang. Keputusan sah penerimaan berkas tetap dilakukan oleh petugas verifikator resmi Disdukcapil.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. BOTTOM HERO CTA — DEEP NAVY WITH COBALT BUTTON */}
      <section className="bg-[#142C4B] text-white py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight text-white">
            Sudah Siap Mengurus Dokumen Tanpa Ragu?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Hanya butuh 3 menit untuk memeriksa kelengkapan berkasmu. Gratis, aman, dan langsung jelas langkahnya.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/panduan')}
              className="px-8 py-4 rounded-full bg-[#1769D2] hover:bg-[#1257B0] text-white font-bold text-sm shadow-xl transition active:scale-95 flex items-center gap-2"
              type="button"
            >
              <span>Mulai Persiapan Mandiri</span>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-[#0B1E36] text-white/70 border-t border-[#1C3B61] py-10 px-6 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-base text-white">
              JejakMasWowo
            </span>
            <span className="text-slate-400">· Portal Literasi Mandiri Dokumen Kependudukan Warga</span>
          </div>
          <div className="text-slate-400">
            © 2026 JejakMasWowo · Prototipe Literasi Publik. Bukan portal resmi pemerintah.
          </div>
        </div>
      </footer>
    </div>
  );
};
