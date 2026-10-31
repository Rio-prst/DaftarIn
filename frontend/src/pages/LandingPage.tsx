import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/AuthContext';
import { roleHome } from '../auth/types';
import heroEnzyImg from '../assets/hero_enzy.png';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { openChat, services, setSelectedService: setContextService } = useApp();
  const { user } = useAuth();

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedService, setSelectedService] = useState<'akta' | 'kk' | 'ktp'>('akta');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/katalog' + (searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : ''));
  };

  const handleStartService = (type: 'akta' | 'kk' | 'ktp') => {
    const serviceIdMap = { akta: 3, kk: 1, ktp: 2 };
    const matched = services.find((s) => s.id === serviceIdMap[type]);
    if (matched) setContextService(matched);
    navigate(user ? '/persiapan' : '/panduan');
  };

  return (
    <div className="bg-white text-[#142C4B] antialiased min-h-screen flex flex-col font-sans selection:bg-[#1769D2] selection:text-white">
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

      {/* 2. MINIMALIST BESPOKE NAVBAR */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-40 transition-all">
        <div className="w-full px-6 max-w-6xl mx-auto flex items-center justify-between h-[72px]">
          {/* Logo Brand: DaftarIn */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#142C4B] group-hover:bg-[#1769D2] text-white flex items-center justify-center font-bold shadow-xs transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-2xl tracking-tight leading-none text-[#142C4B]">
                DaftarIn
              </span>
              <span className="text-xs font-semibold text-[#1769D2] tracking-wider uppercase mt-0.5 font-mono">
                Layanan Warga Mandiri
              </span>
            </div>
          </div>

          {/* Navigation Links (Ukuran Nyaman 15px, Bersih & Konsisten) */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-[#52657A]">
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
            <a href="#cara-kerja" className="hover:text-[#1769D2] transition-colors">
              Alur Verifikasi
            </a>
            <a href="#dasar-hukum" className="hover:text-[#1769D2] transition-colors">
              Dasar Regulasi
            </a>
            <button
              onClick={openChat}
              className="hover:text-[#1769D2] transition-colors flex items-center gap-1.5"
              type="button"
            >
              <svg className="w-4 h-4 text-[#1769D2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
              <span>Tanya Asisten AI</span>
            </button>
          </nav>

          {/* Action Header: Konsisten & Rapi */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate(roleHome[user.role])}
                className="h-[42px] px-5 rounded-full bg-[#142C4B] hover:bg-[#1769D2] text-white font-semibold text-sm tracking-wide shadow-xs transition-all flex items-center gap-2"
                type="button"
              >
                <span>Ruang Saya ({user.name.split(' ')[0]})</span>
                <span className="material-symbols-outlined text-[18px]">account_circle</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/masuk')}
                  className="h-[42px] px-4 rounded-full text-sm font-semibold text-[#52657A] hover:text-[#142C4B] transition"
                  type="button"
                >
                  Masuk
                </button>
                <button
                  onClick={() => navigate('/daftar')}
                  className="h-[42px] px-5 rounded-full bg-[#1769D2] hover:bg-[#1255AC] text-white font-semibold text-sm shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
                  type="button"
                >
                  Daftar
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (EDITORIAL CIVIC CRAFT + AUTHENTIC INDONESIAN HERO ENZY) */}
      <section className="relative pt-10 pb-16 md:pt-14 md:pb-24 overflow-hidden bg-gradient-to-r from-white via-[#F8FAFD] to-[#E9F3F2] border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column (7 cols): Editorial Headline & Unified Capsule Input + CTA */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Civic Pill Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#CBD7E6] shadow-xs text-xs sm:text-sm font-semibold text-[#142C4B]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Asisten audit berkas kependudukan pra-loket resmi</span>
              </div>

              {/* H1 with Latin Serif Italic Accent */}
              <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-[52px] leading-[1.12] tracking-tight text-[#142C4B]">
                Urus dokumen kependudukan,{' '}
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
                  onSubmit={handleSearchSubmit}
                  className="flex-1 h-[52px] bg-white pl-4 pr-1.5 rounded-full border border-slate-300 shadow-xs flex items-center gap-2 focus-within:border-[#1769D2] focus-within:ring-2 focus-within:ring-[#1769D2]/20 transition-all"
                >
                  <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                  onClick={() => navigate(user ? '/persiapan' : '/panduan')}
                  className="h-[52px] px-6 rounded-full bg-[#1769D2] hover:bg-[#1255AC] text-white text-[15px] font-semibold shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center justify-center gap-2.5"
                  type="button"
                >
                  <span>Mulai Cek Berkas</span>
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Clean Micro Indicators (Jelas & Terbaca 13-14px) */}
              <div className="pt-1 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-[#52657A] font-medium">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Rp 0 bebas retribusi (UU 24/2013)</span>
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#1769D2] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-6.75 6.75l-4.5-4.5 4.5-4.5m13.5 0l4.5 4.5-4.5 4.5" />
                  </svg>
                  <span>Privasi lokal peramban &amp; aman</span>
                </span>
              </div>
            </div>

            {/* Right Column (5 cols): AUTHENTIC INDONESIAN HERO ENZY SEAMLESSLY BLENDED */}
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
                    <svg className="w-5 h-5 text-[#142C4B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
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

      {/* 4. FAST SERVICE SELECTION (INTERACTIVE CIVIC DOSSIER – UNIFIED PILL TABS) */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full" id="kenapa-kami">
        <div className="bg-white rounded-3xl border border-[#CBD7E6] p-8 md:p-12 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <span className="px-3.5 py-1 rounded-full bg-[#EBF1F8] text-[#1769D2] font-mono font-bold text-xs uppercase tracking-wider">
              NAVIGASI PENGURUSAN MANDIRI
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#142C4B]">
              Pilih Dokumen yang Ingin Kamu Siapkan
            </h2>
            <p className="text-sm sm:text-base text-[#52657A]">
              Pilih jenis berkas untuk melihat daftar periksa fisik, estimasi pengerjaan, dan kanal pengajuan resmi.
            </p>
          </div>

          {/* Unified Pill Buttons for Service Selector (Consistent Title Case) */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedService('akta')}
              className={`h-[48px] px-6 rounded-full font-semibold text-sm transition-all flex items-center gap-2.5 ${
                selectedService === 'akta'
                  ? 'bg-[#142C4B] text-white shadow-md scale-102'
                  : 'bg-[#F8FAFD] text-[#52657A] hover:bg-slate-100 border border-[#CBD7E6]'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span>Akta Kelahiran Baru</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedService('kk')}
              className={`h-[48px] px-6 rounded-full font-semibold text-sm transition-all flex items-center gap-2.5 ${
                selectedService === 'kk'
                  ? 'bg-[#142C4B] text-white shadow-md scale-102'
                  : 'bg-[#F8FAFD] text-[#52657A] hover:bg-slate-100 border border-[#CBD7E6]'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <span>Pembaruan Kartu Keluarga (KK)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedService('ktp')}
              className={`h-[48px] px-6 rounded-full font-semibold text-sm transition-all flex items-center gap-2.5 ${
                selectedService === 'ktp'
                  ? 'bg-[#142C4B] text-white shadow-md scale-102'
                  : 'bg-[#F8FAFD] text-[#52657A] hover:bg-slate-100 border border-[#CBD7E6]'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
              </svg>
              <span>Penerbitan KTP-el</span>
            </button>
          </div>

          {/* Dossier Requirements Overview */}
          <div className="bg-[#F8FAFD] border border-[#CBD7E6] rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-left">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#52657A] uppercase tracking-wider block font-mono">
                Berkas Fisik Wajib
              </span>
              <div className="font-bold text-base sm:text-lg text-[#142C4B]">
                {selectedService === 'akta' && '3 Dokumen Fisik Inti'}
                {selectedService === 'kk' && '2 Dokumen Kependudukan'}
                {selectedService === 'ktp' && '1 Salinan KK Terbaru'}
              </div>
              <p className="text-xs sm:text-sm text-[#52657A] leading-relaxed">
                {selectedService === 'akta' && 'Surat Kelahiran Faskes (RSUD/Bidan), Kartu Keluarga, dan Buku Nikah Orang Tua.'}
                {selectedService === 'kk' && 'Kartu Keluarga asli lama dan surat bukti mutasi (Buku Nikah / Ijazah).'}
                {selectedService === 'ktp' && 'Salinan KK ber-barcode TTE dan fisik KTP lama (jika rusak).'}
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
                onClick={() => handleStartService(selectedService)}
                className="w-full h-[48px] px-6 rounded-full bg-[#1769D2] hover:bg-[#1255AC] text-white font-semibold text-sm shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                type="button"
              >
                <span>Lihat Panduan &amp; Mulai Cek</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </button>
              <span className="text-xs text-center text-[#52657A]">
                Bebas diakses tanpa perlu membuat akun di awal.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ALUR 4 TAHAP PROSEDURAL */}
      <section id="cara-kerja" className="py-16 px-6 max-w-6xl mx-auto space-y-12 w-full text-center">
        <div className="space-y-2.5 max-w-2xl mx-auto">
          <span className="px-3.5 py-1 rounded-full bg-[#EBF1F8] text-[#1769D2] font-mono font-bold text-xs uppercase tracking-wider">
            SISTEMATIKA PROSES
          </span>
          <h2 className="text-3xl font-extrabold font-display text-[#142C4B]">
            4 Tahap Dari Rumah Hingga Selesai di Loket
          </h2>
          <p className="text-sm sm:text-base text-[#52657A]">
            Setiap langkah dirancang untuk meminimalisir kesalahan administratif sebelum pengajuan resmi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="bg-white rounded-2xl border border-[#CBD7E6] p-6 space-y-3 hover:border-[#1769D2] transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#EBF1F8] text-[#1769D2] flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[#142C4B]">Pilih Kebutuhan Layanan</h3>
            <p className="text-xs sm:text-sm text-[#52657A] leading-relaxed">
              Tentukan jenis permohonan melalui kuesioner panduan sederhana untuk mengetahui daftar berkas wajib.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#CBD7E6] p-6 space-y-3 hover:border-[#1769D2] transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#EBF1F8] text-[#1769D2] flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[#142C4B]">Unggah Foto Berkas Fisik</h3>
            <p className="text-xs sm:text-sm text-[#52657A] leading-relaxed">
              Ambil pindaian dokumen menggunakan kamera HP Anda pada permukaan datar dengan pencahayaan merata.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#CBD7E6] p-6 space-y-3 hover:border-[#1769D2] transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#EBF1F8] text-[#1769D2] flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[#142C4B]">Pemeriksaan AI &amp; Ejaan</h3>
            <p className="text-xs sm:text-sm text-[#52657A] leading-relaxed">
              Model cerdas memeriksa ketajaman foto berkas, keabsahan NIK, dan mencocokkan data pada formulir.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#CBD7E6] p-6 space-y-3 hover:border-[#1769D2] transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#EBF1F8] text-[#1769D2] flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[#142C4B]">Serahkan ke Loket Resmi</h3>
            <p className="text-xs sm:text-sm text-[#52657A] leading-relaxed">
              Bawa susunan berkas rapi bersama struk tanda terima ke loket pelayanan kelurahan atau Disdukcapil.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CIVIC TRANSPARENCY & LEGAL BASIS */}
      <section id="dasar-hukum" className="py-16 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#142C4B]">
              Komitmen Transparansi &amp; Integritas Publik
            </h2>
            <p className="text-sm sm:text-base text-[#52657A]">
              DaftarIn adalah instrumen literasi tata kelola berkas kependudukan mandiri, bukan perantara ilegal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-[#F8FAFD] border border-[#CBD7E6] space-y-3">
              <svg className="w-6 h-6 text-[#1769D2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
              </svg>
              <h3 className="font-bold text-base text-[#142C4B]">Regulasi Resmi Negara</h3>
              <p className="text-xs sm:text-sm text-[#52657A] leading-relaxed">
                Seluruh panduan mengacu pada UU No. 24 Tahun 2013 dan Permendagri No. 108 Tahun 2019 mengenai standar administrasi kependudukan nasional.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFD] border border-[#CBD7E6] space-y-3">
              <svg className="w-6 h-6 text-[#087F68]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <h3 className="font-bold text-base text-[#142C4B]">Tanpa Pungutan Liar</h3>
              <p className="text-xs sm:text-sm text-[#52657A] leading-relaxed">
                Pengurusan mandiri di loket pemerintah tidak dikenakan biaya apapun. Hindari pihak-pihak yang menjanjikan jalur cepat dengan imbalan materi.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFD] border border-[#CBD7E6] space-y-3">
              <svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <h3 className="font-bold text-base text-[#142C4B]">Kedaulatan Data Warga</h3>
              <p className="text-xs sm:text-sm text-[#52657A] leading-relaxed">
                Data disimpan aman di peramban Anda. Platform tidak menjual atau membagikan identitas pribadi Anda kepada pihak manapun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION (TEKS JELAS & TANPA LABEL DEMO) */}
      <section id="faq" className="py-16 px-6 max-w-3xl mx-auto space-y-8 w-full text-left">
        <div className="text-center space-y-2.5">
          <span className="text-[#1769D2] font-mono font-bold text-xs uppercase tracking-wider">
            PERTANYAAN UMUM
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#142C4B]">
            Pertanyaan yang Sering Diajukan
          </h2>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-[#CBD7E6] overflow-hidden shadow-xs">
            <button
              onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#142C4B] hover:bg-slate-50 transition"
              type="button"
            >
              <span>Apakah ada biaya menggunakan DaftarIn?</span>
              <svg className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === 0 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {openFaq === 0 && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#52657A] border-t border-slate-100 leading-relaxed">
                <strong>100% Gratis!</strong> Sesuai UU No. 24/2013, seluruh pelayanan administrasi kependudukan di Indonesia bebas retribusi (Rp 0). Platform ini tidak memungut biaya apapun.
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#CBD7E6] overflow-hidden shadow-xs">
            <button
              onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#142C4B] hover:bg-slate-50 transition"
              type="button"
            >
              <span>Apakah foto berkas saya langsung dikirim ke kantor pemerintah?</span>
              <svg className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === 1 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {openFaq === 1 && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#52657A] border-t border-slate-100 leading-relaxed">
                Belum. DaftarIn berfungsi sebagai instrumen audit awal mandiri. Berkas fisik tetap Anda serahkan langsung ke loket pelayanan kelurahan atau diunggah ke website resmi Disdukcapil daerah Anda.
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#CBD7E6] overflow-hidden shadow-xs">
            <button
              onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#142C4B] hover:bg-slate-50 transition"
              type="button"
            >
              <span>Bagaimana cara kerja pemeriksaan berkas dengan AI?</span>
              <svg className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === 2 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {openFaq === 2 && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#52657A] border-t border-slate-100 leading-relaxed">
                Sistem AI memeriksa ketajaman foto, mendeteksi pantulan silau, memastikan sudut kartu tidak terpotong, dan memeriksa keabsahan susunan 16 digit NIK secara otomatis sebelum berkas dibawa ke loket.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. BOTTOM HERO CTA */}
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
              onClick={() => navigate(user ? '/persiapan' : '/panduan')}
              className="h-[52px] px-8 rounded-full bg-[#1769D2] hover:bg-[#1255AC] text-white font-semibold text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5"
              type="button"
            >
              <span>Mulai Persiapan Mandiri</span>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-[#0B1E36] text-white/70 border-t border-[#1C3B61] py-10 px-6 text-xs sm:text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1769D2] flex items-center justify-center text-white font-bold">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-sm sm:text-base text-white">DaftarIn</span>
            <span className="text-slate-400">· Portal Literasi Mandiri Dokumen Kependudukan Warga</span>
          </div>
          <div className="text-slate-400 text-xs sm:text-sm">
            © 2026 DaftarIn · Layanan Warga Mandiri.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
