import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { openChat } = useApp();

  return (
    <header className="h-[72px] bg-white border-b border-[#DDE5EF] sticky top-0 z-40 font-sans">
      <div className="max-w-[1152px] mx-auto h-full px-4 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1769D2] rounded-lg flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[20px]">fact_check</span>
          </div>
          <div>
            <span className="font-display font-bold text-[19px] tracking-tight block text-[#142C4B] leading-tight">
              JejakMasWowo
            </span>
            <span className="text-[11px] text-[#52657A] font-medium block">
              Layanan warga
            </span>
          </div>
        </Link>

        {/* Public Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-[14px] font-semibold text-[#52657A]">
          <Link
            to="/katalog"
            className={`transition-colors hover:text-[#1769D2] ${
              location.pathname === '/katalog' ? 'text-[#1769D2] font-bold' : ''
            }`}
          >
            Cari Layanan
          </Link>
          <a
            href="/#cara-kerja"
            className="transition-colors hover:text-[#1769D2]"
          >
            Cara Kerja
          </a>
          <button
            onClick={openChat}
            className="transition-colors hover:text-[#1769D2] flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            Bantuan AI
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/masuk"
            className="px-4 py-2 text-[14px] font-semibold text-[#142C4B] hover:text-[#1769D2] transition-colors"
          >
            Masuk
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-[#1769D2] hover:bg-[#1256AE] text-white text-[14px] font-semibold rounded-lg transition-colors shadow-sm"
          >
            Buka Dasbor
          </Link>
        </div>
      </div>
    </header>
  );
};
