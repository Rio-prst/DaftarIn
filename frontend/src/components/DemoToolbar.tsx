import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { EXAMPLE_ACCOUNTS, EXAMPLE_PASSWORD } from '../auth/mockAuth';
import { roleHome } from '../auth/types';
import { useApp } from '../context/AppContext';

interface ScreenMeta {
  num: string;
  id: string;
  title: string;
  path: string;
  roleHint: 'Publik' | 'Warga' | 'Petugas' | 'Admin';
}

const SCREENS: ScreenMeta[] = [
  { num: '01', id: 'landing', title: 'Landing Page Warga', path: '/', roleHint: 'Publik' },
  { num: '02', id: 'katalog', title: 'Katalog & Cari Layanan', path: '/katalog', roleHint: 'Publik' },
  { num: '03', id: 'panduan', title: 'Panduan Persyaratan Detail', path: '/panduan', roleHint: 'Publik' },
  { num: '04', id: 'masuk', title: 'Halaman Masuk (Login)', path: '/masuk', roleHint: 'Publik' },
  { num: '05', id: 'daftar', title: 'Pendaftaran Akun Warga', path: '/daftar', roleHint: 'Publik' },
  { num: '06', id: 'dashboard', title: 'Dasbor Mandiri Warga', path: '/dashboard', roleHint: 'Warga' },
  { num: '07', id: 'kebutuhan', title: 'Tahap 1: Kebutuhan & Subjek', path: '/persiapan/kebutuhan', roleHint: 'Warga' },
  { num: '08', id: 'data', title: 'Tahap 2: Formulir Data', path: '/persiapan/data', roleHint: 'Warga' },
  { num: '09', id: 'dokumen', title: 'Tahap 3: Unggah Berkas', path: '/persiapan/dokumen', roleHint: 'Warga' },
  { num: '10', id: 'pemeriksaan', title: 'Tahap 4: Pemeriksaan AI', path: '/persiapan/pemeriksaan', roleHint: 'Warga' },
  { num: '11', id: 'ringkasan', title: 'Tahap 5: Ringkasan & Kirim', path: '/persiapan/ringkasan', roleHint: 'Warga' },
  { num: '12', id: 'pelacakan', title: 'Pelacakan Status & Linimasa', path: '/pelacakan', roleHint: 'Warga' },
  { num: '13', id: 'petugas', title: 'Portal Petugas Verifikasi', path: '/petugas', roleHint: 'Petugas' },
  { num: '14', id: 'admin', title: 'Panel Kelola Aturan Admin', path: '/admin', roleHint: 'Admin' },
];

export const DemoToolbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout } = useAuth();
  const { openChat } = useApp();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);

  const currentScreenIndex = SCREENS.findIndex(
    (s) =>
      s.path === location.pathname ||
      (s.id === 'panduan' && (location.pathname === '/panduan' || location.pathname.startsWith('/layanan'))) ||
      (s.id === 'kebutuhan' && location.pathname.startsWith('/persiapan/kebutuhan'))
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

  const handleQuickRole = async (targetRole: 'warga' | 'petugas' | 'admin') => {
    setIsSwitching(true);
    try {
      const acc = EXAMPLE_ACCOUNTS.find((a) => a.role === targetRole);
      if (acc) {
        await login(acc.email, EXAMPLE_PASSWORD);
        navigate(roleHome[targetRole]);
      }
    } catch (e) {
      console.error('Failed to switch role:', e);
    } finally {
      setIsSwitching(false);
    }
  };

  if (!isExpanded) {
    return (
      <aside aria-label="Alat Pengembang">
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-6 left-6 z-40 bg-[#0E1B2D]/95 hover:bg-[#1769D2] text-white px-3.5 py-2.5 rounded-full shadow-xl border border-white/20 flex items-center gap-2 text-[12px] font-semibold transition-all backdrop-blur-md active:scale-95 cursor-pointer"
          title="Buka Navigasi Pengembang (Developer Toolbar)"
          type="button"
          aria-label="Buka Navigasi Developer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="material-symbols-outlined text-[16px] text-emerald-400">terminal</span>
          <span>Navigasi Dev ({currentScreen.num})</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 font-mono text-slate-300">
            {user ? user.role : 'tamu'}
          </span>
        </button>
      </aside>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-[780px] z-50 bg-[#0E1B2D]/95 text-white p-2.5 rounded-2xl border border-[#233F66] shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5 font-sans text-[12px]">
      {/* 1. Selector Layar + Prev / Next */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1.5 bg-[#142C4B] px-2 py-1 rounded-lg border border-[#233F66] shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-bold text-[10px] text-[#A6BCD7] tracking-wider uppercase font-mono">
            Layar:
          </span>
        </div>

        <button
          onClick={handlePrev}
          disabled={currentScreenIndex <= 0}
          className="p-1 rounded-lg bg-[#142C4B] hover:bg-[#1769D2] disabled:opacity-30 disabled:hover:bg-[#142C4B] border border-[#233F66] transition-colors"
          title="Layar Sebelumnya"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>

        <select
          value={currentScreenIndex !== -1 ? currentScreenIndex : 0}
          onChange={(e) => navigate(SCREENS[Number(e.target.value)].path)}
          className="bg-[#0B192C] text-white text-[12px] font-semibold py-1 px-2 rounded-lg border border-[#233F66] focus:border-[#1769D2] outline-none cursor-pointer max-w-[190px] sm:max-w-[240px] truncate"
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
          className="p-1 rounded-lg bg-[#142C4B] hover:bg-[#1769D2] disabled:opacity-30 disabled:hover:bg-[#142C4B] border border-[#233F66] transition-colors"
          title="Layar Selanjutnya"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>

      {/* 2. Role Switcher 1-Klik */}
      <div className="flex items-center gap-1 bg-[#0B192C] p-0.5 rounded-lg border border-[#233F66]">
        <button
          onClick={() => handleQuickRole('warga')}
          disabled={isSwitching}
          className={`px-2.5 py-1 rounded font-semibold text-[11px] transition-colors ${
            user?.role === 'warga'
              ? 'bg-[#1769D2] text-white shadow-2xs'
              : 'text-[#A6BCD7] hover:text-white'
          }`}
          title="Beralih peran ke Warga (Ayu Contoh)"
          type="button"
        >
          Warga
        </button>
        <button
          onClick={() => handleQuickRole('petugas')}
          disabled={isSwitching}
          className={`px-2.5 py-1 rounded font-semibold text-[11px] transition-colors ${
            user?.role === 'petugas'
              ? 'bg-[#1769D2] text-white shadow-2xs'
              : 'text-[#A6BCD7] hover:text-white'
          }`}
          title="Beralih peran ke Petugas Loket (Budi Santoso)"
          type="button"
        >
          Petugas
        </button>
        <button
          onClick={() => handleQuickRole('admin')}
          disabled={isSwitching}
          className={`px-2.5 py-1 rounded font-semibold text-[11px] transition-colors ${
            user?.role === 'admin'
              ? 'bg-[#1769D2] text-white shadow-2xs'
              : 'text-[#A6BCD7] hover:text-white'
          }`}
          title="Beralih peran ke Administrator Sistem (Rina Admin)"
          type="button"
        >
          Admin
        </button>
        {user && (
          <button
            onClick={() => logout()}
            className="px-1.5 py-1 text-rose-300 hover:text-rose-100 text-[11px] font-mono hover:bg-rose-900/40 rounded transition-colors"
            title="Keluar Akun (Logout)"
            type="button"
          >
            Keluar
          </button>
        )}
      </div>

      {/* 3. Aksi Cepat & Minimize */}
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          onClick={openChat}
          className="px-2.5 py-1 bg-[#1769D2]/30 hover:bg-[#1769D2] text-[#93C5FD] hover:text-white border border-[#1769D2]/50 rounded-lg transition-colors flex items-center gap-1 font-semibold text-[11px]"
          title="Buka Asisten AI DaftarIn"
          type="button"
        >
          <span className="material-symbols-outlined text-[14px]">support_agent</span>
          <span>Tanya AI</span>
        </button>

        <button
          onClick={() => setIsExpanded(false)}
          className="p-1 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors ml-1"
          title="Sembunyikan Bilah Pengembang"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">expand_more</span>
        </button>
      </div>
    </div>
  );
};

export default DemoToolbar;
