import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const TrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { applications, advanceApplicationStatus, showToast, openChat } = useApp();
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [customNotes, setCustomNotes] = useState<Array<{ id: number; text: string; time: string }>>([]);

  const currentApp = applications.length > 0 ? applications[0] : null;

  const handleAdvanceStatus = () => {
    if (currentApp) {
      advanceApplicationStatus(currentApp.id);
      showToast('Status siklus pelacakan berhasil dimajukan ke tahap berikutnya!', 'info');
    }
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    const now = new Date();
    const timeStr = `Hari ini, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    setCustomNotes((prev) => [{ id: Date.now(), text: noteText, time: timeStr }, ...prev]);
    showToast('Catatan mandiri warga berhasil ditambahkan ke linimasa pengajuan!', 'success');
    setNoteText('');
    setShowAddNote(false);
  };

  const handlePrintDossier = () => {
    showToast('Menyiapkan lembar disposisi dan bukti tanda terima pelacakan...', 'info');
    window.print();
  };

  return (
    <div className="bg-[#F5F7FB] text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Simulation Master Controller Ribbon */}
      <div className="bg-[#142C4B] text-white px-6 py-2.5 flex flex-wrap items-center justify-between text-xs border-b border-[#233F66] z-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">⚡ Mode Evaluasi / Simulasi Alur:</span>
          <span>Klik tombol untuk memajukan status pelacakan secara berurutan:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAdvanceStatus}
            className="px-3.5 py-1.5 bg-[#1769D2] hover:bg-[#1256AE] rounded-lg font-bold text-white transition-colors flex items-center gap-1.5 shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">fast_forward</span>
            <span>Simulasi Maju Tahap Status SIAK</span>
          </button>
          <button
            onClick={() => navigate('/petugas')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold text-white transition-colors flex items-center gap-1"
            type="button"
          >
            <span>Meja Petugas Verifikasi</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex w-full min-h-screen">
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
              className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition"
              href="#/persiapan/data"
              onClick={(e) => {
                e.preventDefault();
                navigate('/persiapan/data');
              }}
            >
              <span className="material-symbols-outlined text-[#C3D4EA] text-[20px]">assignment</span>
              <span>Persiapan Saya</span>
            </a>
            <a
              className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-semibold bg-[#1769D2] text-white shadow-sm"
              href="#/pelacakan"
            >
              <span className="material-symbols-outlined text-white text-[20px]">timeline</span>
              <span>Pengajuan Saya</span>
            </a>
          </nav>

          <div className="p-4 border-t border-[#233F66] space-y-2">
            <button
              className="h-[40px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition w-full"
              type="button"
              onClick={() => navigate('/')}
            >
              <span className="material-symbols-outlined text-[#C3D4EA] text-[18px]">logout</span>
              <span>Keluar</span>
            </button>
            <div className="text-[11px] text-[#7E98B9] flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Status Pelacakan SIAK Aktif</span>
            </div>
          </div>
        </aside>

        {/* Main Canvas Region */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="h-[72px] bg-white border-b border-[#DDE5EF] px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-sm text-[#52657A]">
              <span>Pengajuan Saya</span>
              <span className="material-symbols-outlined text-base text-[#8DA0B6]">chevron_right</span>
              <span>Akta Kelahiran (contoh)</span>
              <span className="material-symbols-outlined text-base text-[#8DA0B6]">chevron_right</span>
              <span className="font-semibold text-[#172B45]">Detail Pelacakan Bersumber</span>
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

          {/* Main Scrollable Body */}
          <main className="p-8 w-full flex-1 overflow-y-auto space-y-6">
            {/* Slip Tanda Terima Registrasi Loket Resmi */}
            <div className="bg-white border-2 border-[#CBD7E6] rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#142C4B] text-white">
                      DISDUKCAPIL-BKS-2026-8812
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                      ✓ Terdaftar di Meja 3 Pelayanan Terpadu
                    </span>
                  </div>
                  <h1 className="text-[26px] font-bold text-[#142C4B] font-display">
                    Perkembangan Pengajuan Akta Kelahiran
                  </h1>
                  <p className="text-xs text-[#52657A]">
                    Tanda terima resmi dicatat pada <strong>26 Oktober 2026, 09:15 WIB</strong> oleh Petugas Loket Disdukcapil.
                  </p>
                </div>

                {/* Compact Identifiers & QR Code Slip */}
                <div className="flex items-center gap-4 bg-[#F8FAFD] border border-[#CBD7E6] rounded-xl p-3 shrink-0">
                  <div className="space-y-1 text-left font-mono">
                    <div className="text-[10px] text-[#52657A] uppercase">KODE AUDIT PREP</div>
                    <div className="text-xs font-bold text-[#142C4B]">PREP-2026-000001</div>
                    <div className="text-[10px] text-[#52657A] uppercase mt-1">STATUS SIAK</div>
                    <div className="text-xs font-bold text-amber-700">VERIFIKASI PETUGAS</div>
                  </div>
                  <div className="w-16 h-16 bg-white border border-slate-300 rounded p-1 flex items-center justify-center">
                    <div className="w-full h-full bg-slate-900 rounded-xs flex items-center justify-center text-[7px] text-white font-mono text-center">
                      QR CODE TTE
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2-Column Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (8 cols): Action Card, Timeline, Notes */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Action Needed Card with Official Stamp */}
                <section className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 relative overflow-hidden shadow-xs">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <span className="material-symbols-outlined text-[24px]">priority_high</span>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-200 text-amber-950 border border-amber-300">
                          Catatan Dari Verifikator
                        </span>
                        {/* Stamp Miring */}
                        <div className="official-wet-stamp text-amber-800 border-amber-800 scale-75 origin-right">
                          <span className="text-[8px] leading-tight">PERLU TINDAKAN</span>
                          <span className="text-[9px] font-black">CATATAN LOKET</span>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-amber-950">
                          Pindaian Halaman Kedua Perlu Ditegaskan
                        </h2>
                        <p className="text-xs text-amber-900 mt-0.5">
                          "Cap fasilitas kesehatan pada lampiran surat kelahiran buram dan tepi barcode terpotong. Mohon lampirkan ulang pindaian yang jelas agar TTE dapat disahkan."
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                          onClick={() => navigate('/persiapan/pemeriksaan')}
                          className="px-4 py-2 bg-[#1769D2] hover:bg-[#1257B0] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit_document</span>
                          <span>Buka Persiapan &amp; Unggah Perbaikan</span>
                        </button>
                        <button
                          onClick={() => openChat()}
                          className="px-3.5 py-2 bg-white border border-[#CBD7E6] text-[#142C4B] rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
                          type="button"
                        >
                          Tanya Ketentuan Cap ke Mas Wowo AI
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. Main Vertical Timeline with Official Verification Seals */}
                <section className="bg-white border border-[#DDE5EF] rounded-2xl p-6 shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-[#DDE5EF] pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-[#142C4B] font-display">
                        Riwayat Tahapan Pengajuan SIAK Bersumber
                      </h2>
                      <p className="text-xs text-[#52657A] mt-0.5">
                        Setiap transisi status diverifikasi petugas resmi dengan stempel integritas digital.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-[#EBF1F8] text-[#142C4B] px-3 py-1 rounded-full border border-[#CBD7E6]">
                      5 TAHAP
                    </span>
                  </div>

                  {/* Vertical Timeline Items */}
                  <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#CBD7E6]">
                    {/* Event 1: Diterima */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-white z-10 text-xs font-bold">
                        ✓
                      </div>
                      <div className="pl-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-[#142C4B]">
                            1. Permohonan Diterima di Kanal Loket Pelayanan
                          </h3>
                          <div className="official-wet-stamp text-emerald-700 border-emerald-700 scale-75 origin-right">
                            <span className="text-[7px]">CAP VERIFIKASI</span>
                            <span className="text-[8px] font-black">LOKET MEJA 03</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-[#52657A] font-mono">
                          26 Oktober 2026, 09:15 WIB · Dicatat oleh: Petugas Loket Disdukcapil
                        </div>
                        <p className="text-xs text-slate-700 pt-1 leading-relaxed">
                          Berkas fisik dan lampiran SKK asli diterima lengkap di loket fisik pelayanan.
                        </p>
                      </div>
                    </div>

                    {/* Event 2: Verifikasi Awal */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-white z-10 text-xs font-bold">
                        ✓
                      </div>
                      <div className="pl-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-[#142C4B]">
                            2. Verifikasi Data SIAK Terpusat &amp; Dokumen KK
                          </h3>
                          <div className="official-wet-stamp text-sky-700 border-sky-700 scale-75 origin-right">
                            <span className="text-[7px]">PARAF PETUGAS</span>
                            <span className="text-[8px] font-black">SIAK MATCHED</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-[#52657A] font-mono">
                          27 Oktober 2026, 14:30 WIB · Dicatat oleh: Budi Santoso (NIP: 19850314...)
                        </div>
                        <p className="text-xs text-slate-700 pt-1 leading-relaxed">
                          Kesesuaian NIK orang tua pada database kependudukan nasional terverifikasi sinkron.
                        </p>
                      </div>
                    </div>

                    {/* Event 3: Perlu Perbaikan (Active Amber) */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center ring-4 ring-amber-100 z-10 text-xs font-bold">
                        !
                      </div>
                      <div className="pl-3 space-y-1 bg-amber-50/70 p-4 rounded-xl border border-amber-300">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                            <span>3. Penundaan Sementara: Perlu Perbaikan Berkas</span>
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          </h3>
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                            Tahap Saat Ini
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-800 font-mono">
                          28 Oktober 2026, 10:00 WIB · Verifikator Disdukcapil
                        </div>
                        <p className="text-xs text-amber-950 pt-1 font-medium leading-relaxed">
                          Petugas menandai pindaian SKK halaman 2 buram. Menunggu lampiran perbaikan dari pemohon.
                        </p>
                      </div>
                    </div>

                    {/* Event 4: Diproses Ulang (Pending) */}
                    <div className="relative opacity-50">
                      <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center ring-4 ring-white z-10 text-xs font-bold">
                        4
                      </div>
                      <div className="pl-3 space-y-1">
                        <h3 className="text-sm font-semibold text-slate-600">
                          4. Pencetakan Blanko Kutipan Akta &amp; Tanda Tangan Elektronik (TTE)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Akan diproses setelah berkas perbaikan terverifikasi ulang.
                        </p>
                      </div>
                    </div>

                    {/* Event 5: Selesai */}
                    <div className="relative opacity-50">
                      <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center ring-4 ring-white z-10 text-xs font-bold">
                        5
                      </div>
                      <div className="pl-3 space-y-1">
                        <h3 className="text-sm font-semibold text-slate-600">
                          5. Kutipan Akta Kelahiran Siap Diambil / Diunduh Digital
                        </h3>
                        <p className="text-xs text-slate-500">
                          Pengambilan fisik di Loket Pengambilan atau unduh via email resmi.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3. Citizen Notes Section */}
                <section className="bg-white border border-[#DDE5EF] rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#DDE5EF] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#1769D2]">sticky_note_2</span>
                      <h2 className="text-base font-bold text-[#142C4B]">Catatan Mandiri Warga</h2>
                    </div>
                    <button
                      onClick={() => setShowAddNote(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#EBF1F8] hover:bg-[#D5E6FF] text-[#1769D2] text-xs font-bold flex items-center gap-1 transition"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Tambah Catatan Warga</span>
                    </button>
                  </div>

                  <p className="text-xs text-[#52657A]">
                    Catatan ini dicatat secara mandiri oleh pemohon untuk pengingat tahapan fisik dan ditandai dengan label <strong>[Catatan Warga]</strong>.
                  </p>

                  <div className="space-y-3">
                    {customNotes.map((cn) => (
                      <div key={cn.id} className="p-3.5 rounded-xl bg-[#F0F7FF] border border-[#BBD7F8] flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1769D2] text-white flex items-center justify-center shrink-0 text-xs font-bold">
                          AC
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#142C4B]">Catatan Warga Baru</span>
                            <span className="text-[#52657A] font-mono text-[11px]">{cn.time}</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">{cn.text}</p>
                          <span className="inline-block text-[10px] font-mono text-[#1769D2] font-semibold">
                            [Label Sumber: citizen_note]
                          </span>
                        </div>
                      </div>
                    ))}

                    <div className="p-3.5 rounded-xl bg-[#F8FAFD] border border-[#CBD7E6] flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#142C4B] text-white flex items-center justify-center shrink-0 text-xs font-bold">
                        AC
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#142C4B]">Ayu Contoh (Pemohon)</span>
                          <span className="text-[#52657A] font-mono text-[11px]">26 Okt 2026, 11:00 WIB</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          Menyerahkan berkas fisik asli ke petugas di Loket 3, diberi tahu bahwa perbaikan foto cap bisa langsung diunggah lewat akun simulasi.
                        </p>
                        <span className="inline-block text-[10px] font-mono text-[#1769D2] font-semibold">
                          [Label Sumber: citizen_note]
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Rail (4 cols): Thermal Receipt Dossier & Quick Actions */}
              <div className="lg:col-span-4 space-y-6">
                {/* Thermal Receipt Summary of Tracking */}
                <div className="thermal-receipt rounded-2xl p-6 border-2 border-dashed border-[#CBD7E6] bg-white space-y-4 font-mono text-xs">
                  <div className="text-center pb-3 border-b border-dashed border-slate-300">
                    <div className="text-[10px] text-slate-500 uppercase">LEMBAR DISPOSISI LOKET</div>
                    <div className="font-bold text-sm text-[#142C4B]">RESUME PELACAKAN SIAK</div>
                    <div className="text-[10px] text-emerald-700 font-bold mt-1">DOKUMEN RESMI TERDAFTAR</div>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">NO. BUKTI</span>
                      <span className="font-bold">BKS-2026-8812</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">STANDAR WAKTU</span>
                      <span>1 - 2 HARI KERJA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">TARIF RESMI</span>
                      <span className="font-bold text-emerald-700">RP 0 (GRATIS)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">VERIFIKATOR</span>
                      <span>BUDI SANTOSO</span>
                    </div>
                  </div>

                  {/* Stamp Area */}
                  <div className="pt-3 pb-1 flex items-center justify-center">
                    <div className="official-wet-stamp text-sky-800 border-sky-800">
                      <span className="text-[8px]">PROTOTIPE INDEPENDEN</span>
                      <span className="text-[9px] font-black">AUDIT TRAIL VALID</span>
                      <span className="text-[7px] text-slate-500">KOTA CONTOH</span>
                    </div>
                  </div>

                  {/* Action Print / Download PDF */}
                  <div className="pt-2 border-t border-dashed border-slate-300 font-sans">
                    <button
                      onClick={handlePrintDossier}
                      className="w-full h-10 rounded-xl bg-[#142C4B] hover:bg-[#0E1E34] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                      <span>Unduh / Cetak Bukti Disposisi (PDF)</span>
                    </button>
                  </div>
                </div>

                {/* Context Card: Bantuan Resmi */}
                <div className="bg-white border border-[#DDE5EF] rounded-2xl p-5 space-y-3 text-xs">
                  <h3 className="font-bold text-sm text-[#142C4B] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#1769D2]">support_agent</span>
                    <span>Saluran Bantuan Langsung</span>
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Jika ada kendala nomor registrasi fisik tidak ditemukan di sistem, Anda dapat menghubungi loket informasi Disdukcapil Kota Contoh.
                  </p>
                  <button
                    onClick={() => openChat()}
                    className="w-full py-2.5 px-3 rounded-lg border border-[#CBD7E6] hover:bg-slate-50 text-[#142C4B] font-semibold flex items-center justify-center gap-1.5 transition"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                    <span>Konsultasi Regulasi dengan Mas Wowo AI</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal Tambah Catatan Warga */}
      {showAddNote && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DDE5EF] space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-[#DDE5EF] pb-3">
              <h3 className="font-bold text-[16px] text-[#142C4B] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1769D2]">note_add</span>
                <span>Tambah Catatan Mandiri Warga</span>
              </h3>
              <button onClick={() => setShowAddNote(false)} className="text-[#74777E] hover:text-[#172B45]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="text-[13px] text-[#52657A]">
              Catatan ini disimpan pada riwayat mandiri dan ditandai dengan label <strong>[Catatan Warga]</strong>.
            </p>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Contoh: Berkas fisik asli sudah diserahkan ke Meja 3 Loket Pelayanan Terpadu..."
              className="w-full p-3 text-[13px] border border-[#DDE5EF] rounded-lg outline-none focus:border-[#1769D2] text-[#172B45]"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddNote(false)}
                className="px-4 py-2 text-[13px] font-semibold text-[#52657A] hover:bg-[#F5F7FB] rounded-lg border border-[#DDE5EF]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-[#1769D2] hover:bg-[#1256AE] rounded-lg"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
