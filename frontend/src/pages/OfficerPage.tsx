import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface QueueItem {
  id: string;
  officialNumber: string;
  service: string;
  refId: string;
  applicant: string;
  channel: string;
  email: string;
  submittedAt: string;
  statusBadge: string;
  statusBadgeClass: string;
  lastNote: string;
  defaultStatus: 'DITERIMA' | 'VERIFIKASI' | 'PERLU_PERBAIKAN' | 'DIPROSES' | 'SELESAI';
  defaultAction: string;
  defaultNotes: string;
  attachments: Array<{
    name: string;
    format: string;
    size: string;
    status: string;
    isWarning?: boolean;
    icon: string;
  }>;
}

const QUEUE_ITEMS: QueueItem[] = [
  {
    id: 'DEMO-AK-014',
    officialNumber: 'DEMO-AK-014',
    service: 'Akta Kelahiran (contoh)',
    refId: 'SIM-2026-AK014',
    applicant: 'Ayu Contoh (Tersamarkan)',
    channel: 'Loket Pelayanan Disdukcapil (contoh)',
    email: 'ayu.contoh@email.simulasi',
    submittedAt: '26 Okt 2026, 09:15 WIB',
    statusBadge: 'Perlu Tindakan Petugas',
    statusBadgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    lastNote: 'Catatan terakhir: Hasil pemeriksaan awal OCR ada catatan halaman kedua kurang terbaca.',
    defaultStatus: 'PERLU_PERBAIKAN',
    defaultAction: 'Unggah ulang halaman kedua Surat Keterangan Lahir agar seluruh tulisan dan stempel terbaca utuh.',
    defaultNotes: 'Cap fasilitas kesehatan pada lampiran surat kelahiran buram dan tepi dokumen terpotong saat pemindaian. Mohon lampirkan ulang pindai yang jelas.',
    attachments: [
      {
        name: 'Kartu Keluarga (contoh)',
        format: 'Format PDF · Ukuran 420 KB',
        size: '420 KB',
        status: 'Terbaca jelas',
        isWarning: false,
        icon: 'description',
      },
      {
        name: 'Surat Keterangan Lahir (contoh)',
        format: 'Format PDF · Ukuran 850 KB',
        size: '850 KB',
        status: 'Catatan pemindaian halaman 2 terpotong / buram',
        isWarning: true,
        icon: 'description',
      },
    ],
  },
  {
    id: 'DEMO-KK-008',
    officialNumber: 'DEMO-KK-008',
    service: 'Kartu Keluarga (contoh)',
    refId: 'SIM-2026-KK008',
    applicant: 'Budi S. (Tersamarkan)',
    channel: 'Kanal Daring Warga (Simulasi)',
    email: 'budi.santoso@email.simulasi',
    submittedAt: '27 Okt 2026, 14:00 WIB',
    statusBadge: 'Menunggu Verifikasi Awal',
    statusBadgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    lastNote: 'Seluruh berkas persyaratan draf telah diunggah. Menunggu verifikasi fisik NIK SIAK.',
    defaultStatus: 'VERIFIKASI',
    defaultAction: 'Verifikasi keselarasan NIK pemohon dan data pernikahan di database nasional SIAK.',
    defaultNotes: 'Pemeriksaan awal berkas Kartu Keluarga. Dokumen fisik pendukung perlu dicocokkan dengan data SIAK.',
    attachments: [
      {
        name: 'Kartu Keluarga Lama',
        format: 'Format PDF · Ukuran 512 KB',
        size: '512 KB',
        status: 'Terbaca jelas',
        isWarning: false,
        icon: 'badge',
      },
      {
        name: 'Buku Nikah / Akta Perkawinan',
        format: 'Format PDF · Ukuran 1.1 MB',
        size: '1.1 MB',
        status: 'Terbaca jelas',
        isWarning: false,
        icon: 'description',
      },
    ],
  },
  {
    id: 'DEMO-AK-019',
    officialNumber: 'DEMO-AK-019',
    service: 'Akta Kelahiran (contoh)',
    refId: 'SIM-2026-AK019',
    applicant: 'Citra D. (Tersamarkan)',
    channel: 'Loket Pelayanan Disdukcapil (contoh)',
    email: 'citra.dewi@email.simulasi',
    submittedAt: '25 Okt 2026, 11:30 WIB',
    statusBadge: 'Selesai Simulasi',
    statusBadgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    lastNote: 'Seluruh berkas terverifikasi lengkap dan TTE kepala dinas telah diterbitkan.',
    defaultStatus: 'SELESAI',
    defaultAction: 'Kutipan akta kelahiran siap diunduh atau diambil di loket pengambilan.',
    defaultNotes: 'Seluruh persyaratan fisik dan identitas SIAK telah sesuai standar. Berkas disahkan untuk penerbitan.',
    attachments: [
      {
        name: 'Surat Keterangan Lahir RSUD',
        format: 'Format PDF · Ukuran 920 KB',
        size: '920 KB',
        status: 'Terbaca jelas & TTE Sah',
        isWarning: false,
        icon: 'description',
      },
      {
        name: 'Kartu Keluarga Terbitan Baru',
        format: 'Format PDF · Ukuran 480 KB',
        size: '480 KB',
        status: 'Barcode Valid',
        isWarning: false,
        icon: 'badge',
      },
    ],
  },
];

export const OfficerPage: React.FC = () => {
  const navigate = useNavigate();
  const { applications, officerUpdateApplication, showToast } = useApp();

  const [selectedQueueId, setSelectedQueueId] = useState<string>('DEMO-AK-014');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'antrean' | 'riwayat' | 'profil'>('antrean');

  const currentItem = QUEUE_ITEMS.find((q) => q.id === selectedQueueId) || QUEUE_ITEMS[0];

  const [selectedStatus, setSelectedStatus] = useState<'DITERIMA' | 'VERIFIKASI' | 'PERLU_PERBAIKAN' | 'DIPROSES' | 'SELESAI'>(
    currentItem.defaultStatus
  );
  const [officerNotes, setOfficerNotes] = useState<string>(currentItem.defaultNotes);
  const [officerAction, setOfficerAction] = useState<string>(currentItem.defaultAction);
  const [additionalNote, setAdditionalNote] = useState<string>('');

  // Modal States
  const [previewDoc, setPreviewDoc] = useState<{ name: string; format: string; status: string; isWarning?: boolean } | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  const handleSelectQueueItem = (item: QueueItem) => {
    setSelectedQueueId(item.id);
    setSelectedStatus(item.defaultStatus);
    setOfficerNotes(item.defaultNotes);
    setOfficerAction(item.defaultAction);
    setAdditionalNote('');
    showToast(`Memuat berkas pengajuan: ${item.id}`, 'info');
  };

  const handleUpdate = () => {
    if (applications.length > 0) {
      officerUpdateApplication(applications[0].id, selectedStatus, `Verifikator Disdukcapil (Budi Santoso): ${officerNotes}`);
      showToast(`Status permohonan ${currentItem.id} berhasil diubah ke: ${selectedStatus}!`, 'success');
    } else {
      showToast(`Status simulasi ${currentItem.id} disimpan sebagai: ${selectedStatus}!`, 'success');
    }
    setShowReviewModal(false);
  };

  const filteredItems = QUEUE_ITEMS.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = item.id.toLowerCase().includes(q);
      const matchName = item.applicant.toLowerCase().includes(q);
      const matchService = item.service.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchService) return false;
    }
    if (statusFilter === 'action_needed' && item.defaultStatus !== 'PERLU_PERBAIKAN') return false;
    if (statusFilter === 'pending' && item.defaultStatus !== 'VERIFIKASI') return false;
    if (serviceFilter === 'akta' && !item.service.toLowerCase().includes('akta')) return false;
    if (serviceFilter === 'kk' && !item.service.toLowerCase().includes('kartu keluarga')) return false;
    return true;
  });

  return (
    <div className="bg-[#F5F7FB] text-[#172B45] antialiased min-h-screen flex flex-col font-sans selection:bg-[#1769D2] selection:text-white overflow-x-hidden">
      {/* Top Banner Ribbon */}
      <div className="bg-[#142C4B] text-white px-6 py-2 flex flex-wrap items-center justify-between text-xs border-b border-[#233F66] gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-400">🛡️ Meja Kerja Petugas Verifikator:</span>
          <span>Peran aktif: <strong>Budi Santoso (NIP: 198503142010011002)</strong> · Loket 3</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/pelacakan')}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded font-semibold text-white transition-colors"
            type="button"
          >
            ← Lihat Linimasa Warga
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded font-semibold text-white transition-colors"
            type="button"
          >
            Panel Kelola Aturan AI →
          </button>
        </div>
      </div>

      {/* Top Global Simulation Disclaimer Bar */}
      <aside aria-label="Pemberitahuan Sistem Simulasi" className="bg-[#193254] text-white px-4 lg:px-6 py-2 border-b border-[#233F66] flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-sky-400 text-[18px]">verified_user</span>
          <span className="font-medium text-sky-200">Pemberitahuan:</span>
          <span className="text-slate-200">Meja kerja petugas simulasi. Akses terbatas pada pengajuan yang dibagikan secara eksplisit oleh pemohon. Bukan portal resmi pemerintah.</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-sky-300">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#1769D2] text-white font-medium">Mode Simulasi Aktif</span>
          <span>Prototipe: 28 Oktober 2026</span>
        </div>
      </aside>

      {/* Shell Container: Sidebar + Workbench Area */}
      <div className="flex flex-1 min-h-screen">
        {/* Officer Navigation Sidebar */}
        <nav aria-label="Navigasi Petugas" className="hidden md:flex w-[240px] bg-[#142C4B] text-white flex-col justify-between shrink-0 z-20 shadow-sm border-r border-[#233F66]">
          <div className="flex flex-col">
            {/* Brand Header */}
            <div className="h-20 flex items-center px-5 border-b border-[#233F66]">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-[#1769D2] flex items-center justify-center text-white shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                </div>
                <div>
                  <span className="font-display font-black text-base tracking-tight text-white block leading-tight">DaftarIn</span>
                  <span className="text-[10px] text-sky-200 block uppercase font-semibold">JejakMasWowo · Portal Petugas</span>
                </div>
              </div>
            </div>

            {/* Role Badge Under Header */}
            <div className="px-5 py-4 border-b border-[#233F66] bg-[#193254]/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-[#A6BCD7] tracking-wider">Status Petugas</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Simulasi</span>
              </div>
              <p className="font-bold text-sm text-white">Loket 3 · Verifikator</p>
              <p className="text-xs text-[#A6BCD7]">Wilayah Kota Contoh</p>
            </div>

            {/* Navigation Links */}
            <div className="px-3 py-4 space-y-1">
              <button
                type="button"
                onClick={() => { setActiveSidebarTab('antrean'); showToast('Membuka antrean tugas masuk.', 'info'); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeSidebarTab === 'antrean' ? 'bg-[#1769D2] text-white shadow-sm' : 'text-[#C3D4EA] hover:bg-[#1E3E66]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-[20px]">task</span>
                  <span>Penugasan Saya</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#1769D2]">
                  {QUEUE_ITEMS.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveSidebarTab('riwayat'); showToast('Riwayat pembaruan: 14 pengajuan telah diproses hari ini.', 'info'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSidebarTab === 'riwayat' ? 'bg-[#1769D2] text-white' : 'text-[#C3D4EA] hover:bg-[#1E3E66]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">history</span>
                <span>Riwayat Pembaruan</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveSidebarTab('profil'); showToast('Profil Petugas: Budi Santoso (NIP: 198503142010011002).', 'info'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSidebarTab === 'profil' ? 'bg-[#1769D2] text-white' : 'text-[#C3D4EA] hover:bg-[#1E3E66]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">badge</span>
                <span>Profil Petugas</span>
              </button>
            </div>
          </div>

          {/* Footer in Sidebar */}
          <div className="p-4 border-t border-[#233F66] bg-[#0E1F35]">
            <div className="mb-3 px-2 py-2 rounded-lg bg-white/5 text-[11px] text-[#A6BCD7]">
              <div className="flex items-center space-x-1.5 text-amber-300 font-semibold mb-1">
                <span className="material-symbols-outlined text-[15px]">lock</span>
                <span>Kebijakan Privasi</span>
              </div>
              <span>Akses draf privat warga &amp; pencarian berkas tak terbatas dinonaktifkan demi integritas simulasi.</span>
            </div>
            <div className="flex items-center justify-between px-2 pt-1 text-xs">
              <div>
                <span className="text-[10px] uppercase text-[#A6BCD7] block font-semibold">Peran Operasional</span>
                <span className="text-white font-medium">Verifikator Simulasi</span>
              </div>
              <button onClick={() => navigate('/masuk')} className="text-sky-300 hover:text-white transition-colors p-1" title="Keluar Sesi Petugas" type="button">
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content Canvas */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F5F7FB]">
          {/* Officer Topbar / Sub-Header */}
          <header className="bg-white border-b border-[#DDE5EF] px-6 h-[72px] flex items-center justify-between sticky top-0 z-10 shadow-xs">
            <div className="flex items-center space-x-3">
              <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-[#52657A]">
                <span>Penugasan Petugas</span>
                <span className="material-symbols-outlined text-[14px] text-[#8DA0B6]">chevron_right</span>
                <span>Pengajuan Masuk</span>
                <span className="material-symbols-outlined text-[14px] text-[#8DA0B6]">chevron_right</span>
                <span className="font-bold text-[#142C4B]">{currentItem.id}</span>
              </nav>
              <span className="h-4 w-px bg-[#CBD7E6]"></span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBF1F8] text-[#1769D2] border border-[#CBD7E6]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1769D2] mr-1.5"></span>
                Kota Contoh · Simulasi
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <span className="text-[11px] text-[#52657A] block">Tanggal Prototipe Aktif</span>
                <span className="font-bold text-[#142C4B] text-xs">28 Oktober 2026</span>
              </div>
              <div className="flex items-center space-x-2.5 pl-4 border-l border-[#DDE5EF]">
                <div className="w-9 h-9 rounded-full bg-[#142C4B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  BS
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-[#142C4B] leading-tight">Budi Santoso</div>
                  <div className="text-[10px] text-[#52657A]">NIP: 19850314...</div>
                </div>
              </div>
            </div>
          </header>

          {/* Workbench Body */}
          <div className="p-4 sm:p-8 space-y-6">
            {/* Top Workspace Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#142C4B] font-display">Pengajuan yang ditugaskan</h1>
                <p className="text-xs text-[#52657A] mt-1">
                  Verifikasi kelengkapan berkas fisik &amp; draf formulir pemohon sebelum proses penerbitan SIAK.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast('Daftar antrean berhasil disinkronkan dengan basis data.', 'success')}
                  className="px-3.5 py-2 bg-white border border-[#CBD7E6] text-xs font-bold text-[#142C4B] rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#1769D2]">sync</span>
                  <span>Segarkan Antrean ({filteredItems.length})</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-[#DDE5EF] rounded-xl p-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-6 relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-[#8DA0B6]">search</span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-xs rounded-lg border border-[#CBD7E6] bg-white text-[#142C4B] placeholder-[#8DA0B6] focus:outline-none focus:border-[#1769D2] focus:ring-1 focus:ring-[#1769D2] transition-all"
                    placeholder="Cari nomor pengajuan (mis. DEMO-AK-014, Ayu Contoh)..."
                    type="text"
                  />
                </div>
                <div className="sm:col-span-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full py-2 px-3 text-xs rounded-lg border border-[#CBD7E6] bg-white text-[#142C4B] focus:outline-none focus:border-[#1769D2]"
                  >
                    <option value="all">Semua Status</option>
                    <option value="action_needed">Perlu Tindakan</option>
                    <option value="pending">Menunggu Verifikasi</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="w-full py-2 px-3 text-xs rounded-lg border border-[#CBD7E6] bg-white text-[#142C4B] focus:outline-none focus:border-[#1769D2]"
                  >
                    <option value="all">Semua Layanan</option>
                    <option value="akta">Akta Kelahiran (contoh)</option>
                    <option value="kk">Kartu Keluarga (contoh)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Two-Column Split Workbench */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Column 1: Assigned Application List (4 cols) */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="font-bold text-sm text-[#142C4B]">Daftar Antrean Tugas</h2>
                  <span className="text-[11px] text-[#52657A]">Menampilkan {filteredItems.length} Pengajuan</span>
                </div>

                {filteredItems.map((item) => {
                  const isSelected = item.id === selectedQueueId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectQueueItem(item)}
                      className={`rounded-xl p-4 shadow-xs relative transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-2 border-[#1769D2] shadow-sm'
                          : 'bg-white border border-[#DDE5EF] hover:border-[#94A3B8] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-[#142C4B]">{item.id}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.statusBadgeClass}`}>
                          {item.statusBadge}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#1769D2]">{item.service}</p>
                      <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] space-y-1 text-xs text-[#52657A]">
                        <div className="flex justify-between">
                          <span>Pemohon:</span>
                          <span className="font-semibold text-[#142C4B]">{item.applicant}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Diserahkan:</span>
                          <span className="font-medium text-[#142C4B]">{item.submittedAt}</span>
                        </div>
                      </div>
                      <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-[#1769D2] shrink-0 mt-0.5">info</span>
                        <span className="line-clamp-2">{item.lastNote}</span>
                      </div>
                    </div>
                  );
                })}

                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#1769D2]">info</span>
                  <span>Klik pada salah satu pengajuan untuk memuat detail verifikasi.</span>
                </div>
              </div>

              {/* Column 2: Selected Application Details & Action Form (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Application Identification Header Card */}
                <div className="bg-white border border-[#DDE5EF] rounded-xl p-6 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#DDE5EF]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-[#142C4B] text-white">
                        Nomor Pengajuan: {currentItem.id}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-[#EBF1F8] text-[#142C4B] font-semibold border border-[#CBD7E6]">
                        {currentItem.service}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        {currentItem.refId}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#52657A] font-mono">Diserahkan: {currentItem.submittedAt}</span>
                  </div>

                  {/* Synthetic Application Meta */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[#52657A] block font-medium">Pemohon Terdaftar</span>
                      <span className="font-bold text-[#142C4B] text-sm">{currentItem.applicant}</span>
                    </div>
                    <div>
                      <span className="text-[#52657A] block font-medium">Kanal Pengajuan</span>
                      <span className="font-semibold text-[#142C4B]">{currentItem.channel}</span>
                    </div>
                    <div>
                      <span className="text-[#52657A] block font-medium">Kontak Notifikasi</span>
                      <span className="font-semibold text-[#142C4B]">{currentItem.email}</span>
                    </div>
                  </div>
                </div>

                {/* Berkas Lampiran yang Diserahkan */}
                <div className="bg-white border border-[#DDE5EF] rounded-xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-[#142C4B] flex items-center gap-2 font-display">
                      <span className="material-symbols-outlined text-[#1769D2] text-[22px]">attach_file</span>
                      <span>Berkas Lampiran yang Diserahkan (Simulasi)</span>
                    </h2>
                    <span className="text-xs text-[#52657A] font-mono">{currentItem.attachments.length} Dokumen Divalidasi</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentItem.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className={`p-4 border rounded-xl flex items-start justify-between transition ${
                          att.isWarning ? 'border-amber-300 bg-amber-50/40' : 'border-[#DDE5EF] bg-white'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className={`material-symbols-outlined text-[24px] ${att.isWarning ? 'text-amber-700' : 'text-[#1769D2]'}`}>
                            {att.icon}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-[#142C4B]">{att.name}</p>
                            <p className="text-[11px] text-[#52657A]">{att.format}</p>
                            <span
                              className={`inline-flex items-center mt-2 px-2 py-0.5 rounded text-[10px] font-bold border ${
                                att.isWarning ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[13px] mr-1">
                                {att.isWarning ? 'warning' : 'check_circle'}
                              </span>
                              <span>{att.status}</span>
                            </span>
                          </div>
                        </div>
                        <button
                          className="px-2.5 py-1 rounded bg-[#EBF1F8] hover:bg-[#D5E6FF] text-[#1769D2] font-bold text-xs transition"
                          type="button"
                          onClick={() => setPreviewDoc(att)}
                        >
                          Periksa
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Putusan & Pembaruan Status Petugas */}
                <div className="bg-white border border-[#DDE5EF] rounded-xl p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DDE5EF]">
                    <div>
                      <h2 className="text-base font-bold text-[#142C4B] font-display">Tindak Lanjut &amp; Catatan Petugas Verifikator</h2>
                      <p className="text-xs text-[#52657A] mt-0.5">Catatan ini akan otomatis diselaraskan ke linimasa pelacakan warga pemohon.</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#1769D2] bg-[#EBF1F8] px-2.5 py-1 rounded-full">
                      LOKET MEJA 03
                    </span>
                  </div>

                  {/* Preset Cepat */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#52657A]">Preset Cepat:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setOfficerNotes('Cap fasilitas kesehatan pada lampiran surat kelahiran buram dan tepi dokumen terpotong saat pemindaian. Mohon lampirkan ulang pindai yang jelas.');
                        setOfficerAction('Unggah ulang halaman kedua Surat Keterangan Lahir agar seluruh tulisan dan stempel terbaca utuh.');
                        setSelectedStatus('PERLU_PERBAIKAN');
                        showToast('Preset Cap Buram diterapkan!', 'info');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition"
                    >
                      + Preset Cap Buram
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOfficerNotes('Ejaan nama pemohon di draf tidak sesuai persis dengan akta perkawinan. Mohon sesuaikan ejaan huruf.');
                        setOfficerAction('Perbaiki ejaan nama di Tahap 2 Formulir Data Pemohon.');
                        setSelectedStatus('PERLU_PERBAIKAN');
                        showToast('Preset Selisih Huruf diterapkan!', 'info');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition"
                    >
                      + Preset Selisih Huruf
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOfficerNotes('Seluruh persyaratan fisik dan identitas SIAK telah sesuai standar. Berkas disahkan untuk penerbitan.');
                        setOfficerAction('Menunggu proses antrean TTE kepala dinas kependudukan.');
                        setSelectedStatus('SELESAI');
                        showToast('Preset Lengkap & Sah diterapkan!', 'success');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition"
                    >
                      + Preset Lengkap &amp; Sah
                    </button>
                  </div>

                  {/* Status Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#142C4B]">Status Putusan Verifikator</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(['DITERIMA', 'VERIFIKASI', 'PERLU_PERBAIKAN', 'DIPROSES', 'SELESAI'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setSelectedStatus(st)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold border transition text-center ${
                            selectedStatus === st
                              ? 'bg-[#1769D2] text-white border-[#1769D2] shadow-xs'
                              : 'bg-white text-[#52657A] border-[#CBD7E6] hover:bg-slate-50'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Officer Notes Textarea */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#142C4B]">Catatan Resmi untuk Linimasa Warga</label>
                    <textarea
                      rows={3}
                      value={officerNotes}
                      onChange={(e) => setOfficerNotes(e.target.value)}
                      className="w-full p-3 text-xs rounded-lg border border-[#CBD7E6] bg-white text-[#142C4B] focus:outline-none focus:border-[#1769D2] leading-relaxed"
                    />
                  </div>

                  {/* Officer Action */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#142C4B]">Langkah Tindak Lanjut yang Harus Dilakukan Pemohon</label>
                    <input
                      type="text"
                      value={officerAction}
                      onChange={(e) => setOfficerAction(e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-lg border border-[#CBD7E6] bg-white text-[#142C4B] focus:outline-none focus:border-[#1769D2]"
                    />
                  </div>

                  {/* Additional Optional Note */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#52657A]">Petunjuk Tambahan Internal Loket (Opsional)</label>
                    <input
                      type="text"
                      value={additionalNote}
                      onChange={(e) => setAdditionalNote(e.target.value)}
                      placeholder="Mis. Berkas fisik telah diarsipkan di rak antrean B3"
                      className="w-full h-10 px-3 text-xs rounded-lg border border-[#CBD7E6] bg-white text-[#142C4B] focus:outline-none focus:border-[#1769D2]"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-[#DDE5EF] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(true)}
                      className="h-10 px-4 rounded-lg border border-[#CBD7E6] bg-white text-[#142C4B] text-xs font-bold hover:bg-slate-50 transition"
                    >
                      Tinjau Perubahan
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdate}
                      className="h-10 px-6 rounded-lg bg-[#1769D2] hover:bg-[#1257B0] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>Simpan Pembaruan</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-auto bg-[#142C4B] text-white border-t border-[#233F66] py-6 px-6 lg:px-12 text-xs">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="font-bold text-white">JejakMasWowo</span>
                <span>|</span>
                <span>© 2026 Portal Transparansi Publik Adminduk. Prototipe Rekayasa Perangkat Lunak.</span>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <button type="button" onClick={() => showToast('Kebijakan Privasi: Draf berkas dienkripsi dan tidak diserahkan ke pihak ketiga.', 'info')} className="hover:text-white transition">Kebijakan Privasi</button>
                <button type="button" onClick={() => showToast('Ketentuan Layanan: Prototipe pendamping pra-loket resmi.', 'info')} className="hover:text-white transition">Ketentuan Layanan</button>
                <button type="button" onClick={() => showToast('Keterbukaan Informasi: Sesuai UU No. 24/2013.', 'info')} className="hover:text-white transition">Keterbukaan Informasi</button>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Modal Preview Dokumen */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5EF]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1769D2] text-[22px]">description</span>
                <h3 className="font-bold text-[#142C4B] text-sm">{previewDoc.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 text-[#52657A] hover:text-[#142C4B] rounded-lg hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-[#52657A]">Format Dokumen:</span>
                <span className="font-bold text-[#142C4B]">{previewDoc.format}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#52657A]">Status Forensik OCR:</span>
                <span className={`font-bold ${previewDoc.isWarning ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {previewDoc.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#52657A]">Integritas Stempel Faskes:</span>
                <span className="font-bold text-[#142C4B]">{previewDoc.isWarning ? 'Perlu konfirmasi ulang' : 'Lengkap & Tajam'}</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
              <strong>Simulasi Verifikasi Petugas:</strong> Sistem OCR mendeteksi kontur teks terbaca dengan skor kepercayaan 88%. Dokumen memenuhi syarat pra-loket untuk dilanjutkan ke verifikasi SIAK.
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-[#1769D2] hover:bg-[#1257B0] text-white rounded-lg text-xs font-bold transition"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tinjau Perubahan */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5EF]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[22px]">checklist</span>
                <h3 className="font-bold text-[#142C4B] text-sm">Konfirmasi Perubahan Status</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-1 text-[#52657A] hover:text-[#142C4B] rounded-lg hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <div><strong>Nomor Pengajuan:</strong> {currentItem.id}</div>
                <div><strong>Status Baru:</strong> <span className="font-bold text-[#1769D2]">{selectedStatus}</span></div>
                <div className="mt-1 text-[11px] text-[#52657A]"><strong>Catatan Warga:</strong> {officerNotes}</div>
                <div className="text-[11px] text-[#52657A]"><strong>Tindak Lanjut:</strong> {officerAction}</div>
              </div>
              <p className="text-[11px] text-slate-500">
                Pembaruan ini akan langsung disiarkan ke akun warga Ayu Contoh di kanal pelacakan linimasa.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-lg border border-[#CBD7E6] text-xs font-bold text-[#142C4B] hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                className="px-5 py-2 bg-[#1769D2] hover:bg-[#1257B0] text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Konfirmasi &amp; Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};