import React from 'react';
import { useApp } from '../context/AppContext';

export const FloatingAiButton: React.FC = () => {
  const { openChat, isChatOpen } = useApp();

  if (isChatOpen) return null;

  return (
    <aside aria-label="Bantuan Cepat">
      <button
        onClick={openChat}
        className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 bg-[#1769D2] hover:bg-[#1255AC] text-white pl-4 pr-5 py-3 rounded-full shadow-xl hover:shadow-2xl border-2 border-white/80 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
        title="Tanya Asisten AI DaftarIn seputar persyaratan dokumen dan regulasi kependudukan"
        type="button"
        aria-label="Buka Asisten AI DaftarIn"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
        </span>

        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px] text-white">
            support_agent
          </span>
        </div>

        <div className="text-left font-sans">
          <span className="block text-[13px] font-bold leading-tight tracking-wide">
            Tanya AI
          </span>
          <span className="hidden sm:block text-[10px] text-blue-100 font-medium leading-none mt-0.5">
            Bantuan 24 Jam
          </span>
        </div>
      </button>
    </aside>
  );
};

export default FloatingAiButton;
