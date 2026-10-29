import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { openChat } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            href="#/cara-kerja"
            onClick={(e) => {
              e.preventDefault();
              if (location.pathname === '/') {
                document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.location.hash = '#/';
                setTimeout(() => {
                  document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }
            }}
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
            className="hidden sm:inline-block px-4 py-2 text-[14px] font-semibold text-[#142C4B] hover:text-[#1769D2] transition-colors"
          >
            Masuk
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-[#1769D2] hover:bg-[#1256AE] text-white text-[14px] font-semibold rounded-lg transition-colors shadow-sm"
          >
            Buka Dasbor
          </Link>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#142C4B] hover:bg-slate-100 transition"
            aria-label="Toggle Mobile Menu"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#DDE5EF] px-6 py-4 space-y-3 shadow-lg">
          <Link
            to="/katalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-[#142C4B] py-2 border-b border-slate-100"
          >
            Cari Layanan
          </Link>
          <a
            href="#/cara-kerja"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              window.location.hash = '#/';
              setTimeout(() => {
                document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' });
              }, 150);
            }}
            className="block text-sm font-semibold text-[#142C4B] py-2 border-b border-slate-100"
          >
            Cara Kerja
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
            <span>Bantuan AI</span>
          </button>
          <div className="pt-2 flex items-center gap-3">
            <Link
              to="/masuk"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2 text-center rounded-lg border border-[#CBD7E6] text-xs font-bold text-[#142C4B]"
            >
              Masuk
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 py-2 text-center rounded-lg bg-[#142C4B] text-white text-xs font-bold"
            >
              Buka Dasbor
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
