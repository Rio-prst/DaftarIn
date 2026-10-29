import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  role?: 'warga' | 'petugas' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ role: overrideRole }) => {
  const location = useLocation();
  const { user, setUserRole, showToast } = useApp();

  const activeRole = overrideRole || user.role;

  const citizenNav = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Cari Layanan', path: '/katalog', icon: 'search' },
    { label: 'Persiapan Saya', path: '/persiapan/data', icon: 'edit_document' },
    { label: 'Pengajuan Saya', path: '/pelacakan', icon: 'timeline' },
    { label: 'Portal Petugas', path: '/petugas', icon: 'badge' },
    { label: 'Admin Aturan', path: '/admin', icon: 'admin_panel_settings' },
  ];

  const officerNav = [
    { label: 'Antrean Verifikasi', path: '/petugas', icon: 'rule' },
    { label: 'Pelacakan Publik', path: '/pelacakan', icon: 'timeline' },
    { label: 'Dasbor Warga', path: '/dashboard', icon: 'person' },
    { label: 'Cari Layanan', path: '/katalog', icon: 'search' },
    { label: 'Admin Aturan', path: '/admin', icon: 'admin_panel_settings' },
  ];

  const adminNav = [
    { label: 'Kelola Aturan AI', path: '/admin', icon: 'tune' },
    { label: 'Katalog Layanan', path: '/katalog', icon: 'list_alt' },
    { label: 'Antrean Petugas', path: '/petugas', icon: 'badge' },
    { label: 'Dasbor Warga', path: '/dashboard', icon: 'dashboard' },
    { label: 'Pelacakan Pengajuan', path: '/pelacakan', icon: 'timeline' },
  ];

  const navItems = activeRole === 'admin' ? adminNav : activeRole === 'petugas' ? officerNav : citizenNav;

  const handleLogout = () => {
    setUserRole('warga');
    showToast('Keluar dari sesi dan kembali ke peran umum.', 'info');
  };

  return (
    <aside className="w-[240px] bg-[#142C4B] min-h-screen text-white flex flex-col fixed left-0 top-0 bottom-0 z-40 select-none font-sans">
      {/* Brand Block 72px */}
      <div className="h-[72px] px-5 flex items-center gap-3 border-b border-white/10 shrink-0">
        <div className="w-9 h-9 bg-[#1769D2] rounded-lg flex items-center justify-center text-white shadow-sm shrink-0">
          <span className="material-symbols-outlined text-[20px]">fact_check</span>
        </div>
        <div>
          <span className="font-display font-bold text-[18px] tracking-tight block leading-tight">
            JejakMasWowo
          </span>
          <span className="text-[11px] text-[#C8DCF5] font-medium block">
            Layanan warga
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path.includes('/persiapan') && location.pathname.includes('/persiapan'));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`h-[44px] px-3 rounded-lg flex items-center gap-3 text-[14px] font-medium transition-all ${
                isActive
                  ? 'bg-[#1769D2] text-white font-semibold shadow-sm'
                  : 'text-[#C8DCF5] hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User/Simulation info */}
      <div className="p-4 border-t border-white/10 space-y-2 shrink-0">
        <Link
          to="/"
          onClick={handleLogout}
          className="flex items-center gap-2 text-[13px] text-[#C8DCF5] hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="text-[11px] text-[#7E94B8] pt-2 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Prototipe · Simulasi v2</span>
          </div>
          <span className="font-mono text-[10px] text-white/50">v2.1</span>
        </div>
      </div>
    </aside>
  );
};
