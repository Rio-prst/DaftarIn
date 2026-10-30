import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface ScreenMeta {
  num: string;
  id: string;
  title: string;
  path: string;
  acuanFile: string;
  roleHint: 'Publik' | 'Warga' | 'Petugas' | 'Admin';
}

const SCREENS: ScreenMeta[] = [
  { num: '01', id: 'landing', title: 'Landing Page Warga', path: '/', acuanFile: '/acuan_01_landing/code.html', roleHint: 'Publik' },
  { num: '02', id: 'katalog', title: 'Katalog & Cari Layanan', path: '/katalog', acuanFile: '/acuan_02_katalog/code.html', roleHint: 'Publik' },
  { num: '03', id: 'panduan', title: 'Panduan Persyaratan Detail', path: '/panduan', acuanFile: '/acuan_03_panduan/code.html', roleHint: 'Publik' },
  { num: '04', id: 'masuk', title: 'Masuk Akun Simulasi', path: '/masuk', acuanFile: '/acuan_04_masuk/code.html', roleHint: 'Publik' },
  { num: '05', id: 'dashboard', title: 'Dasbor Mandiri Warga', path: '/dashboard', acuanFile: '/acuan_05_dashboard/code.html', roleHint: 'Warga' },
  { num: '06', id: 'data', title: 'Tahap 2: Formulir Data', path: '/persiapan/data', acuanFile: '/acuan_06_data/code.html', roleHint: 'Warga' },
  { num: '07', id: 'dokumen', title: 'Tahap 3: Unggah Berkas', path: '/persiapan/dokumen', acuanFile: '/acuan_07_dokumen/code.html', roleHint: 'Warga' },
  { num: '08', id: 'pemeriksaan', title: 'Tahap 4: Pemeriksaan AI', path: '/persiapan/pemeriksaan', acuanFile: '/acuan_08_pemeriksaan_ai/code.html', roleHint: 'Warga' },
  { num: '09', id: 'ringkasan', title: 'Tahap 5: Ringkasan & Loket', path: '/persiapan/ringkasan', acuanFile: '/acuan_09_ringkasan/code.html', roleHint: 'Warga' },
  { num: '10', id: 'pelacakan', title: 'Pelacakan Linimasa SIAK', path: '/pelacakan', acuanFile: '/acuan_10_pelacakan/code.html', roleHint: 'Warga' },
  { num: '11', id: 'petugas', title: 'Portal Petugas Verifikasi', path: '/petugas', acuanFile: '/acuan_11_petugas/code.html', roleHint: 'Petugas' },
  { num: '12', id: 'admin', title: 'Panel Kelola Aturan AI', path: '/admin', acuanFile: '/acuan_12_admin/code.html', roleHint: 'Admin' },
];

export const DemoToolbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUserRole, openChat } = useApp();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const currentScreenIndex = SCREENS.findIndex(s =>
    s.path === location.pathname ||
    (s.id === 'panduan' && (location.pathname === '/panduan' || location.pathname.startsWith('/layanan')))
  );

  const currentScreen = currentScreenIndex !== -1 ? SCREENS[currentScreenIndex] : SCREENS[0];

  const handlePrev = () => {
    if (currentScreenIndex > 0) {
      navigate(SCREENS[currentScreenIndex - 1].path);
    }
  };

  const handleNext = () => {
    if (currentScreenIndex < SCREENS.length - 1) {
      navigate(SCREENS[currentScreenIndex + 1].path);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 z-50 bg-[#142C4B] hover:bg-[#1769D2] text-white px-3.5 py-2 rounded-full shadow-2xl border border-white/20 flex items-center gap-2 text-[12px] font-semibold transition-all backdrop-blur-md"
        title="Buka Navigasi Demo Layar & Peran"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m3.407-4.243L5.566 4.666" /></svg>
        <span>Navigasi Demo ({currentScreen.num})</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-3 right-3 left-3 sm:left-auto z-50 sm:max-w-[760px] bg-[#0E1B2D]/95 text-white p-2.5 rounded-xl border border-[#233F66] shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 font-sans text-[12px]">
      {/* Left: Current Screen Dropdown & Prev/Next */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-[#142C4B] px-2.5 py-1 rounded-lg border border-[#233F66]">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-bold text-[11px] text-[#A6BCD7] tracking-wider uppercase">Layar Demo:</span>
        </div>

        <button
          onClick={handlePrev}
          disabled={currentScreenIndex <= 0}
          className="p-1 rounded bg-[#142C4B] hover:bg-[#1769D2] disabled:opacity-30 disabled:hover:bg-[#142C4B] border border-[#233F66] transition-colors"
          title="Layar Sebelumnya"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>

        <select
          value={currentScreenIndex !== -1 ? currentScreenIndex : 0}
          onChange={(e) => navigate(SCREENS[Number(e.target.value)].path)}
          className="bg-[#0B192C] text-white text-[12px] font-semibold py-1 px-2 rounded-lg border border-[#233F66] focus:border-[#1769D2] outline-none cursor-pointer max-w-[210px] sm:max-w-[250px] truncate"
        >
          {SCREENS.map((s, idx) => (
            <option key={s.id} value={idx}>
              {s.num}. {s.title} ({s.roleHint})
            </option>
          ))}
        </select>

        <button
          onClick={handleNext}
          disabled={currentScreenIndex >= SCREENS.length - 1}
          className="p-1 rounded bg-[#142C4B] hover:bg-[#1769D2] disabled:opacity-30 disabled:hover:bg-[#142C4B] border border-[#233F66] transition-colors"
          title="Layar Selanjutnya"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>

      {/* Center: Role Switcher */}
      <div className="flex items-center gap-1 bg-[#0B192C] p-0.5 rounded-lg border border-[#233F66]">
        <button
          onClick={() => setUserRole('warga')}
          className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors ${
            user.role === 'warga' ? 'bg-[#1769D2] text-white' : 'text-[#A6BCD7] hover:text-white'
          }`}
          title="Masuk sebagai Ayu Contoh (Warga Pemohon)"
        >
          Warga
        </button>
        <button
          onClick={() => setUserRole('petugas')}
          className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors ${
            user.role === 'petugas' ? 'bg-[#1769D2] text-white' : 'text-[#A6BCD7] hover:text-white'
          }`}
          title="Masuk sebagai Budi Santoso (Petugas Verifikator)"
        >
          Petugas
        </button>
        <button
          onClick={() => setUserRole('admin')}
          className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors ${
            user.role === 'admin' ? 'bg-[#1769D2] text-white' : 'text-[#A6BCD7] hover:text-white'
          }`}
          title="Masuk sebagai Admin Sistem"
        >
          Admin
        </button>
      </div>

      {/* Right: Acuan link, Chatbot shortcut & Minimize */}
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          onClick={openChat}
          className="px-2.5 py-1 bg-[#1769D2]/30 hover:bg-[#1769D2] text-[#93C5FD] hover:text-white border border-[#1769D2]/50 rounded-lg transition-colors flex items-center gap-1 font-semibold text-[11px]"
          title="Buka Konsultasi Mas Wowo AI"
        >
          <svg className="w-3.5 h-3.5 text-[#93C5FD]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
          <span>Tanya AI</span>
        </button>

        <a
          href={currentScreen.acuanFile}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[#C8DCF5] hover:text-white transition-colors flex items-center gap-1 text-[11px]"
          title="Buka File Mockup Acuan Asli Google Stitch untuk membandingkan presisi visual"
        >
          <span>Acuan Stitch</span>
          <svg className="w-3.5 h-3.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
        </a>

        <button
          onClick={() => setIsExpanded(false)}
          className="p-1 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors ml-1"
          title="Sembunyikan Bilah Demo"
        >
          <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </button>
      </div>
    </div>
  );
};
