import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#142C4B] text-white py-12 px-4 border-t border-white/10 font-sans mt-auto">
      <div className="max-w-[1152px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1769D2] rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
            </div>
            <span className="font-display font-bold text-[18px] tracking-tight">
              JejakMasWowo
            </span>
          </div>
          <p className="text-[13px] text-[#C8DCF5] leading-relaxed max-w-[440px]">
            Platform pendamping mandiri persiapan berkas layanan publik kependudukan. Membantu warga memeriksa kelengkapan persyaratan dan mendeteksi potensi ketidaksesuaian dokumen sebelum diajukan ke loket resmi.
          </p>
          <div className="text-[11px] text-[#7E94B8]">
            Prototipe Sistem Rekayasa Perangkat Lunak Layanan Publik Kota · 2026
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold text-[14px] text-white mb-3 tracking-wider uppercase">
            Layanan Populer
          </h4>
          <ul className="space-y-2 text-[13px] text-[#C8DCF5]">
            <li><Link to="/layanan/1" className="hover:text-white transition-colors">Pembaruan Kartu Keluarga</Link></li>
            <li><Link to="/layanan/2" className="hover:text-white transition-colors">Penerbitan KTP-el Baru/Rusak</Link></li>
            <li><Link to="/layanan/3" className="hover:text-white transition-colors">Penerbitan Akta Kelahiran</Link></li>
            <li><Link to="/layanan/4" className="hover:text-white transition-colors">Surat Pindah (SKPWNI)</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-[14px] text-white mb-3 tracking-wider uppercase">
            Akses Portal
          </h4>
          <ul className="space-y-2 text-[13px] text-[#C8DCF5]">
            <li><Link to="/dashboard" className="hover:text-white transition-colors">Dasbor Warga</Link></li>
            <li><Link to="/pelacakan" className="hover:text-white transition-colors">Pelacakan Linimasa</Link></li>
            <li><Link to="/petugas" className="hover:text-white transition-colors">Meja Kerja Petugas</Link></li>
            <li><Link to="/admin" className="hover:text-white transition-colors">Panel Admin Aturan</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1152px] mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#7E94B8] gap-3">
        <p>© 2026 JejakMasWowo. Hak cipta dilindungi undang-undang.</p>
        <p className="italic">
          *Pemeriksaan AI bersifat simulasi pendamping dan bukan pengesahan yuridis pejabat instansi.
        </p>
      </div>
    </footer>
  );
};
