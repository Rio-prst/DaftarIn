import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, type ApplicationRecord } from '../context/AppContext';
import { PreparationStepper } from '../components/PreparationStepper';

export const PreparationSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedService, formData, addApplication, showToast, openChat } = useApp();

  const handleSimulateSubmission = () => {
    const newApp: ApplicationRecord = {
      id: `APP-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      official_number: `DISDUKCAPIL-BKS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      service_id: selectedService.id,
      service_name: selectedService.name,
      channel: 'Loket Pelayanan Terpadu Disdukcapil Kota Contoh',
      applicant_name: formData.nama_lengkap || 'Ayu Contoh',
      applicant_nik: formData.nik || '3275012345670001',
      current_status: 'DITERIMA',
      created_at: '28 Oktober 2026, 09:15 WIB',
      events: [
        {
          id: 1,
          status: 'DITERIMA',
          title: 'Permohonan Diterima di Loket Pelayanan',
          time: '28 Oktober 2026, 09:15 WIB',
          source: 'Petugas Loket Disdukcapil (Meja 3)',
          notes: 'Berkas permohonan fisik dan formulir pendaftaran diterima lengkap. Nomor bukti diterbitkan.',
          completed: true,
          current: true,
        },
        {
          id: 2,
          status: 'VERIFIKASI',
          title: 'Pemeriksaan Kesesuaian Biodata SIAK Terpusat',
          time: 'Estimasi: 1 - 2 Jam ke depan',
          source: 'Petugas Verifikator (Budi Santoso)',
          notes: 'Verifikasi keselarasan NIK pemohon dan data pernikahan di database nasional SIAK.',
          completed: false,
        },
      ],
    };
    addApplication(newApp);
    showToast('Tanda terima resmi dicatatkan ke Linimasa Pelacakan SIAK!', 'success');
    navigate('/pelacakan');
  };

  const handlePrintReceipt = () => {
    showToast('Menyiapkan struk bukti kesiapan fisik berkas...', 'info');
    window.print();
  };

  return (
    <div className="bg-[#F5F7FB] text-on-surface flex min-h-screen font-sans selection:bg-[#1769D2] selection:text-white">
      {/* Left Sidebar (Desktop: 240px, Mobile: hidden) */}
      <aside className="hidden md:flex w-[240px] bg-[#142C4B] text-white flex-col shrink-0 min-h-screen">
        <div className="h-[72px] px-5 flex items-center gap-3 border-b border-[#233F66]">
          <div className="w-8 h-8 rounded bg-[#1769D2] flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-white text-[20px]">fact_check</span>
          </div>
          <div>
            <div className="font-heading font-black text-base tracking-tight leading-none text-white">
              DaftarIn
            </div>
            <div className="text-[10px] text-[#A6BCD7] mt-1 leading-none font-semibold">
              JejakMasWowo · Layanan Warga
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          <a
            className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition"
            href="#/dashboard"
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard');
            }}
          >
            <span className="material-symbols-outlined text-[#C3D4EA] text-[20px]">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a
            className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition"
            href="#/katalog"
            onClick={(e) => {
              e.preventDefault();
              navigate('/katalog');
            }}
          >
            <span className="material-symbols-outlined text-[#C3D4EA] text-[20px]">search</span>
            <span>Cari Layanan</span>
          </a>
          <a
            className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-semibold bg-[#1769D2] text-white shadow-sm"
            href="#/persiapan/data"
            onClick={(e) => {
              e.preventDefault();
              navigate('/persiapan/data');
            }}
          >
            <span className="material-symbols-outlined text-white text-[20px]">assignment</span>
            <span>Persiapan Saya</span>
          </a>
          <a
            className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition"
            href="#/pelacakan"
            onClick={(e) => {
              e.preventDefault();
              navigate('/pelacakan');
            }}
          >
            <span className="material-symbols-outlined text-[#C3D4EA] text-[20px]">send</span>
            <span>Pengajuan Saya</span>
          </a>
        </nav>

        <div className="p-4 border-t border-[#233F66] space-y-2">
          <a
            className="h-[40px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition"
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            <span className="material-symbols-outlined text-[#C3D4EA] text-[18px]">logout</span>
            <span>Keluar</span>
          </a>
          <div className="text-[11px] text-[#7E98B9] flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Prototipe · Simulasi v2</span>
          </div>
        </div>
      </aside>

      {/* Main Region */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-[72px] bg-white border-b border-[#DDE5EF] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-[#52657A]">
            <span>Persiapan</span>
            <span className="material-symbols-outlined text-base text-[#8DA0B6]">chevron_right</span>
            <span className="font-medium text-[#172B45]">{selectedService?.name || 'Akta Kelahiran'}</span>
            <span className="material-symbols-outlined text-base text-[#8DA0B6]">chevron_right</span>
            <span className="font-semibold text-[#1769D2]">Ringkasan Kesiapan</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F7FB] border border-[#DDE5EF] rounded-full text-xs font-medium text-[#52657A]">
              <span className="material-symbols-outlined text-[#52657A] text-[16px]">location_on</span>
              <span>Kota Contoh · Simulasi</span>
            </div>
            <button
              className="h-9 px-3 rounded-lg border border-[#DDE5EF] bg-white text-xs font-semibold text-[#172B45] hover:bg-[#F5F7FB] flex items-center gap-1.5 transition"
              type="button"
              onClick={() => openChat()}
            >
              <span className="material-symbols-outlined text-[#52657A] text-[18px]">help_outline</span>
              <span>Bantuan</span>
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-[#DDE5EF]">
              <div className="w-8 h-8 rounded-full bg-[#142C4B] text-white flex items-center justify-center font-semibold text-xs">
                AC
              </div>
              <span className="text-sm font-semibold text-[#172B45]">Ayu Contoh</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 w-full flex-1 overflow-y-auto">
          {/* Page-heading */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-[28px] leading-[36px] font-bold text-[#172B45] font-display">
                Tinjau Kesiapan Berkas Pengajuan
              </h1>
              <p className="text-[14px] text-[#52657A] mt-1">
                Layanan: <strong>{selectedService?.name || 'Penerbitan Akta Kelahiran Baru (contoh)'}</strong> · Ref: <span className="font-mono text-[#142C4B]">PREP-2026-000001</span>
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#ECF8F3] text-[#087F68] border border-[#B8DECF] shadow-xs">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Status Kesiapan: 100% Siap Diajukan</span>
            </div>
          </div>

          {/* Stepper Folder Tabs */}
          <PreparationStepper currentStep={5} />

          {/* Grid Layout: Left Document Dossier (7 cols) + Right Thermal Receipt Struk (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
            {/* Left: Dossier & Verified Documents (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Data Identitas Pemohon */}
              <div className="bg-white border border-[#DDE5EF] rounded-xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#DDE5EF]">
                  <h2 className="font-heading text-base font-bold text-[#142C4B] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#1769D2]">badge</span>
                    <span>Data Persiapan Mandiri Terverifikasi</span>
                  </h2>
                  <span className="text-xs font-mono font-semibold text-[#1769D2] bg-[#E7F0FF] px-2.5 py-0.5 rounded">
                    ID: PREP-2026-000001
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs font-sans">
                  <div>
                    <span className="text-[#52657A] block text-[11px]">Nama Pemohon (KTP Fisik):</span>
                    <span className="font-bold text-sm text-[#142C4B]">{formData.nama_lengkap || 'Ayu Contoh'}</span>
                  </div>
                  <div>
                    <span className="text-[#52657A] block text-[11px]">Nomor Induk Kependudukan:</span>
                    <span className="font-mono font-semibold text-sm text-[#142C4B]">{formData.nik || '3275012345670001'}</span>
                  </div>
                  <div>
                    <span className="text-[#52657A] block text-[11px]">Subjek Layanan:</span>
                    <span className="font-medium text-[#142C4B]">{selectedService?.name || 'Penerbitan Kutipan Akta Kelahiran Baru'}</span>
                  </div>
                  <div>
                    <span className="text-[#52657A] block text-[11px]">Lokasi Loket Tujuan:</span>
                    <span className="font-medium text-[#142C4B]">Kantor Disdukcapil Kota Contoh</span>
                  </div>
                </div>
              </div>

              {/* Card 2: 3 Berkas Lampiran Siap Bawa */}
              <div className="bg-white border border-[#DDE5EF] rounded-xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#DDE5EF]">
                  <h2 className="font-heading text-base font-bold text-[#142C4B] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#087F68]">folder_check</span>
                    <span>Daftar Berkas Fisik yang Wajib Dibawa (3 Dokumen)</span>
                  </h2>
                  <span className="text-xs font-semibold text-[#087F68] bg-[#ECF8F3] px-2 py-0.5 rounded">
                    Lengkap 3/3
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 border border-[#DDE5EF] rounded-lg flex items-center justify-between bg-[#F8FAFD] hover:border-[#1769D2] transition">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#087F68] text-[24px]">task</span>
                      <div>
                        <div className="text-sm font-semibold text-[#142C4B]">
                          Surat Keterangan Kelahiran (RSUD) Asli
                        </div>
                        <div className="text-xs text-[#52657A]">
                          SKK-2026-X-0884 · Koreksi ejaan nama telah diselaraskan [citizen_corrected]
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#087F68] bg-[#ECF8F3] px-2.5 py-1 rounded">
                      ✓ Valid
                    </span>
                  </div>

                  <div className="p-3.5 border border-[#DDE5EF] rounded-lg flex items-center justify-between bg-[#F8FAFD] hover:border-[#1769D2] transition">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#087F68] text-[24px]">task</span>
                      <div>
                        <div className="text-sm font-semibold text-[#142C4B]">
                          Kartu Keluarga (KK) Orang Tua Asli
                        </div>
                        <div className="text-xs text-[#52657A]">
                          Format cetak barcode digital BSrE 4 sudut utuh
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#087F68] bg-[#ECF8F3] px-2.5 py-1 rounded">
                      ✓ Valid
                    </span>
                  </div>

                  <div className="p-3.5 border border-[#DDE5EF] rounded-lg flex items-center justify-between bg-[#F8FAFD] hover:border-[#1769D2] transition">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#087F68] text-[24px]">task</span>
                      <div>
                        <div className="text-sm font-semibold text-[#142C4B]">
                          Buku Nikah / Akta Perkawinan Asli
                        </div>
                        <div className="text-xs text-[#52657A]">
                          Lampiran legalisir KUA / Pencatatan Sipil terlampir
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#087F68] bg-[#ECF8F3] px-2.5 py-1 rounded">
                      ✓ Valid
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Thermal Receipt Struk Bukti Kesiapan (5 cols) */}
            <div className="lg:col-span-5 w-full">
              <div className="thermal-receipt rounded-2xl p-6 border-2 border-dashed border-[#CBD7E6] bg-white relative overflow-hidden font-mono text-xs text-[#1E293B] shadow-sm">
                {/* Watermark Logo */}
                <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 rounded-full border-8 border-slate-100 flex items-center justify-center opacity-40 pointer-events-none select-none">
                  <span className="font-bold text-slate-300 text-3xl font-sans uppercase">SIAK</span>
                </div>
                {/* Official Receipt Header */}
                <div className="text-center pb-4 border-b border-dashed border-slate-300 space-y-1">
                  <div className="w-10 h-10 rounded-full bg-[#142C4B] text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">account_balance</span>
                  </div>
                  <h3 className="font-bold text-sm tracking-wider uppercase font-sans text-[#142C4B]">
                    PORTAL DAFTARIN / JEJAKMASWOWO
                  </h3>
                  <p className="text-[10px] text-slate-500 font-sans">
                    BUKTI AUDIT MANDIRI KESIAPAN BERKAS LOKET
                  </p>
                  <div className="text-[10px] text-slate-400">
                    SIAK COMPATIBLE PROTOCOL v1.0
                  </div>
                </div>

                {/* Receipt Metadata Table */}
                <div className="py-4 space-y-2 border-b border-dashed border-slate-300 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">NO. DRAF</span>
                    <span className="font-bold text-[#142C4B]">PREP-2026-000001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">WAKTU AUDIT</span>
                    <span>28 OKT 2026, 09:15 WIB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PEMOHON</span>
                    <span className="font-bold">{(formData.nama_lengkap || 'AYU CONTOH').toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">NIK</span>
                    <span>{formData.nik || '3275012345670001'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">LAYANAN</span>
                    <span>AKTA KELAHIRAN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">STATUS BIAYA</span>
                    <span className="font-bold text-emerald-700">GRATIS (RP 0)</span>
                  </div>
                </div>

                {/* Checkpoint Breakdown */}
                <div className="py-3 space-y-1.5 border-b border-dashed border-slate-300 text-[10px]">
                  <div className="font-bold text-slate-700 mb-1">HASIL FORENSIK DOKUMEN:</div>
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>[✓] SKK RSUD EJAAN NAMA</span>
                    <span>DISINKRONKAN</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>[✓] KARTU KELUARGA 4 SUDUT</span>
                    <span>TERBACA JELAS</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>[✓] BUKU NIKAH LEGALISIR</span>
                    <span>LENGKAP</span>
                  </div>
                </div>

                {/* Barcode & Wet Stamp Seal Area */}
                <div className="pt-5 pb-3 flex items-center justify-between relative min-h-[90px]">
                  {/* Barcode Strip */}
                  <div className="space-y-1">
                    <div className="h-9 w-32 bg-slate-800 rounded-xs flex items-center justify-center text-white text-[9px] font-mono tracking-widest">
                      |||||||||||||||||||||
                    </div>
                    <div className="text-[8px] text-slate-500 tracking-wider text-center">
                      *JMW-PREP-2026-BKS*
                    </div>
                  </div>

                  {/* Wet Stamp Seal */}
                  <div className="official-wet-stamp text-emerald-700 border-emerald-700 scale-90">
                    <span className="text-[8px] leading-tight">VALIDASI MANDIRI</span>
                    <span className="text-[9px] leading-tight font-black">SIAP AJUKAN LOKET</span>
                    <span className="text-[7px] text-slate-500 font-sans mt-0.5">DISDUKCAPIL SIMULASI</span>
                  </div>
                </div>

                {/* Notice text */}
                <p className="text-[9px] text-slate-500 font-sans text-center border-t border-slate-200 pt-3">
                  Tunjukkan bukti ini bersama berkas fisik asli di Loket Pelayanan Terpadu Disdukcapil untuk proses percepatan verifikasi.
                </p>

                {/* Action Buttons inside Receipt */}
                <div className="mt-4 pt-2 space-y-2 font-sans">
                  <button
                    onClick={handleSimulateSubmission}
                    className="w-full h-11 px-4 rounded-xl bg-[#1769D2] hover:bg-[#1257B0] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Simulasi Catat Pengajuan Resmi</span>
                  </button>

                  <button
                    onClick={handlePrintReceipt}
                    className="w-full h-10 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    <span>Cetak / Unduh Struk Bukti (PDF)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Action Bar */}
        <div className="h-[64px] bg-white border-t border-[#DDE5EF] px-8 flex items-center justify-between shrink-0">
          <button
            className="h-[44px] px-4 rounded-lg border border-[#DDE5EF] bg-white text-sm font-semibold text-[#172B45] hover:bg-[#F5F7FB] flex items-center gap-2 transition"
            type="button"
            onClick={() => navigate('/persiapan/pemeriksaan')}
          >
            <span className="material-symbols-outlined text-[#52657A]">arrow_back</span>
            <span>Kembali ke Pemeriksaan AI</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              className="h-[44px] px-6 rounded-lg bg-[#1769D2] text-white text-sm font-semibold hover:bg-[#1257B0] flex items-center gap-2 shadow-sm transition"
              type="button"
              onClick={handleSimulateSubmission}
            >
              <span>Lanjut ke Pelacakan Status SIAK</span>
              <span className="material-symbols-outlined text-white text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
