import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface TopBarProps {
  breadcrumbs: string[];
  onOpenHelp?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ breadcrumbs, onOpenHelp }) => {
  const { user, openChat, showToast } = useApp();
  const [showNotif, setShowNotif] = useState(false);

  const handleHelpClick = () => {
    if (onOpenHelp) onOpenHelp();
    else openChat();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="h-[72px] bg-white border-b border-[#DDE5EF] sticky top-0 z-30 flex items-center justify-between px-6 md:px-8 font-sans">
      {/* Left: Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-[#52657A] truncate">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-[#C4C6CE]">/</span>}
            <span
              className={
                idx === breadcrumbs.length - 1
                  ? 'font-bold text-[#142C4B]'
                  : 'hover:text-[#1769D2] cursor-pointer'
              }
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </nav>

      {/* Right: Simulation badge, Help, Bell, User Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-semibold text-[#142C4B] bg-[#EDF4FF] border border-[#D9EAFF] rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1769D2]"></span>
          Kota Contoh · Simulasi
        </span>

        <button
          onClick={handleHelpClick}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1769D2] hover:bg-[#F5F7FB] px-3 py-1.5 rounded-lg border border-[#DDE5EF] transition-colors shadow-sm"
          title="Tanya Regulasi & Bantuan Dokumen ke Mas Wowo AI"
        >
          <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          <span className="hidden sm:inline">Tanya AI</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="w-9 h-9 rounded-full border border-[#DDE5EF] flex items-center justify-center text-[#52657A] hover:bg-[#F5F7FB] transition-colors relative"
            title="Notifikasi Pengajuan"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="w-2 h-2 rounded-full bg-[#1769D2] absolute top-2 right-2 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-[#1769D2] absolute top-2 right-2"></span>
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-[#DDE5EF] p-4 text-[13px] z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#DDE5EF] mb-2 font-bold text-[#142C4B]">
                <span>Notifikasi Terkini</span>
                <span className="text-[11px] text-[#1769D2] font-semibold">2 Baru</span>
              </div>
              <div className="space-y-2.5">
                <div
                  onClick={() => {
                    setShowNotif(false);
                    showToast('Membuka hasil pemeriksaan AI...', 'info');
                  }}
                  className="p-2 bg-[#F5F7FB] hover:bg-[#EDF4FF] rounded-lg cursor-pointer transition-colors"
                >
                  <p className="font-semibold text-[#142C4B]">Pemeriksaan AI Selesai</p>
                  <p className="text-[11px] text-[#52657A] mt-0.5">2 catatan perhatian ditemukan pada draf KK.</p>
                </div>
                <div
                  onClick={() => {
                    setShowNotif(false);
                    showToast('Membuka status pelacakan SIAK...', 'info');
                  }}
                  className="p-2 bg-[#F5F7FB] hover:bg-[#EDF4FF] rounded-lg cursor-pointer transition-colors"
                >
                  <p className="font-semibold text-[#142C4B]">Update Status SIAK</p>
                  <p className="text-[11px] text-[#52657A] mt-0.5">Petugas Budi Santoso memverifikasi berkas.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#DDE5EF]">
          <div className="w-9 h-9 rounded-full bg-[#142C4B] text-white flex items-center justify-center font-bold text-[13px] shadow-sm">
            {getInitials(user.name)}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-[13px] font-bold text-[#172B45] block leading-tight">
              {user.name}
            </span>
            <span className="text-[11px] text-[#52657A] block capitalize">
              {user.role === 'warga' ? 'Warga Pemohon' : user.role === 'petugas' ? 'Petugas Verifikator' : 'Administrator'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
