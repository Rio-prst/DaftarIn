import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const OfficerPage: React.FC = () => {
  const navigate = useNavigate();
  const { applications, officerUpdateApplication, showToast } = useApp();
  const [selectedStatus, _setSelectedStatus] = useState<'DITERIMA' | 'VERIFIKASI' | 'PERLU_PERBAIKAN' | 'DIPROSES' | 'SELESAI'>('VERIFIKASI');

  const handleUpdate = () => {
    if (applications.length > 0) {
      officerUpdateApplication(applications[0].id, selectedStatus, 'Verifikator Disdukcapil (Budi Santoso)');
      showToast(`Status permohonan berhasil diubah ke: ${selectedStatus}!`, 'success');
    }
  };

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <div className="bg-[#142C4B] text-white px-6 py-2 flex items-center justify-between text-xs border-b border-[#233F66]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-400">🛡️ Meja Kerja Petugas Verifikator:</span>
          <span>Peran aktif: <strong>Budi Santoso (NIP: 198503142010011002)</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/pelacakan')}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded font-semibold text-white transition-colors"
          >
            ← Lihat Linimasa Warga
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded font-semibold text-white transition-colors"
          >
            Panel Kelola Aturan AI →
          </button>
        </div>
      </div>

{/*  Top Global Simulation Disclaimer Bar  */}
<aside aria-label="Pemberitahuan Sistem Simulasi" className="bg-primary text-on-primary px-4 lg:px-6 py-2 border-b border-primary-container flex flex-wrap items-center justify-between text-body-sm font-body-sm gap-2">
<div className="flex items-center space-x-2">
<span className="material-symbols-outlined text-secondary-fixed text-[18px]">verified_user</span>
<span className="font-medium text-surface-container-low">Pemberitahuan:</span>
<span className="text-on-primary-container">Meja kerja petugas simulasi. Akses terbatas pada pengajuan yang dibagikan secara eksplisit oleh pemohon. Bukan portal resmi pemerintah.</span>
</div>
<div className="flex items-center space-x-3 text-caption font-caption text-secondary-fixed">
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-medium">Mode Simulasi Aktif</span>
<span>Prototipe: 28 Oktober 2026</span>
</div>
</aside>
{/*  Shell Container: Sidebar + Workbench Area  */}
<div className="flex flex-1 overflow-hidden" style={{ height: 'calc(1000px - 37px)', maxHeight: 'calc(1000px - 37px)', overflow: 'hidden', display: 'flex' }}>
{/*  Officer Navigation Sidebar (Fixed 240px wide navy #142C4B background)  */}
<nav aria-label="Navigasi Petugas" className="w-60 bg-primary-container text-on-primary flex flex-col justify-between flex-shrink-0 z-20 shadow-sm" style={{ width: '240px', minWidth: '240px', maxWidth: '240px', height: '100%', flexShrink: '0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
<div className="flex flex-col">
{/*  Brand Header  */}
<div className="h-20 flex items-center px-5 border-b border-primary border-opacity-40">
<div className="flex items-center space-x-3">
<div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-on-secondary shadow-sm">
<span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
</div>
<div>
<span className="font-headline-sm text-headline-sm font-bold tracking-tight text-surface-container-lowest block leading-tight">JejakMasWowo</span>
<span className="font-caption text-caption text-secondary-fixed-dim block">Meja Kerja Petugas (Simulasi)</span>
</div>
</div>
</div>
{/*  Role Badge Under Header  */}
<div className="px-5 py-4 border-b border-primary/40 bg-primary/20">
<div className="flex items-center justify-between mb-1">
<span className="font-caption text-caption text-on-primary-container uppercase tracking-wider">Status Petugas</span>
<span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container-highest/20 text-tertiary-fixed text-caption font-caption">Simulasi</span>
</div>
<p className="font-title-md text-title-md text-surface-container-lowest font-semibold">Loket 3 · Verifikator</p>
<p className="font-body-sm text-body-sm text-on-primary-container">Wilayah Kota Contoh</p>
</div>
{/*  Navigation Links  */}
<div className="px-3 py-4 space-y-1">
{/*  Active Nav Item  */}
<a className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md transition-all" href="#">
<div className="flex items-center space-x-3">
<span className="material-symbols-outlined text-[20px]">task</span>
<span className="font-semibold">Penugasan Saya</span>
</div>
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-caption font-bold bg-surface-container-lowest text-secondary">
              3 Antrean
            </span>
</a>
{/*  Inactive Nav Item 1  */}
<a className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-primary-fixed-dim hover:text-surface-container-lowest hover:bg-primary/40 font-label-md text-label-md transition-colors" href="#">
<span className="material-symbols-outlined text-[20px]">history</span>
<span>Riwayat Pembaruan</span>
</a>
{/*  Inactive Nav Item 2  */}
<a className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-primary-fixed-dim hover:text-surface-container-lowest hover:bg-primary/40 font-label-md text-label-md transition-colors" href="#">
<span className="material-symbols-outlined text-[20px]">badge</span>
<span>Profil Petugas</span>
</a>
</div>
</div>
{/*  Footer in Sidebar  */}
<div className="p-4 border-t border-primary/40 bg-primary/30">
<div className="mb-3 px-2 py-2 rounded-lg bg-primary/50 text-caption font-caption text-primary-fixed-dim">
<div className="flex items-center space-x-1.5 text-tertiary-fixed font-semibold mb-1">
<span className="material-symbols-outlined text-[15px]">lock</span>
<span>Kebijakan Privasi</span>
</div>
<span>Akses draf privat warga &amp; pencarian berkas tak terbatas dinonaktifkan demi integritas simulasi.</span>
</div>
<div className="flex items-center justify-between px-2 pt-1 text-body-sm font-body-sm">
<div>
<span className="text-caption font-caption text-on-primary-container block">Peran Operasional</span>
<span className="text-surface-container-lowest font-medium text-body-sm">Verifikator Simulasi</span>
</div>
<button className="text-secondary-fixed hover:text-surface-container-lowest transition-colors p-1" title="Keluar Sesi Petugas" type="button">
<span className="material-symbols-outlined text-[20px]">logout</span>
</button>
</div>
</div>
</nav>
{/*  Main Content Canvas  */}
<main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background" style={{ width: '1040px', minWidth: '0', maxWidth: '1040px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
{/*  Officer Topbar / Sub-Header  */}
<header className="bg-surface-container-lowest border-b border-outline-variant/40 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 shadow-sm" style={{ height: '72px', minHeight: '72px', maxHeight: '72px', flexShrink: '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
{/*  Breadcrumbs & Scope  */}
<div className="flex items-center space-x-3">
<nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-body-sm font-body-sm text-on-surface-variant">
<span>Penugasan Petugas</span>
<span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
<span>Pengajuan Masuk</span>
<span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
<span className="font-semibold text-primary">DEMO-AK-014</span>
</nav>
<span className="h-4 w-px bg-outline-variant"></span>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-caption font-semibold bg-surface-container text-on-secondary-container border border-surface-container-high">
<span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span>
            Kota Contoh · Simulasi
          </span>
</div>
{/*  Date & Officer Avatar  */}
<div className="flex items-center space-x-5">
<div className="text-right hidden sm:block">
<span className="text-caption font-caption text-on-surface-variant block">Tanggal Prototipe Aktif</span>
<span className="font-semibold text-primary text-body-sm font-body-sm">28 Oktober 2026</span>
</div>
<div className="flex items-center space-x-3 pl-4 border-l border-outline-variant/40">
<div className="w-9 h-9 rounded-full bg-primary-container text-surface-container-lowest flex items-center justify-center font-bold text-label-md">
              BS
            </div>
<div className="text-left">
<span className="font-semibold text-primary text-label-md font-label-md block leading-tight">Bambang S.</span>
<span className="text-caption font-caption text-on-surface-variant">Petugas Loket Simulasi</span>
</div>
</div>
</div>
</header>
{/*  Main Workbench Area Interior  */}
<div className="p-6 max-w-7xl w-full mx-auto space-y-6" style={{ flex: '1 1 0%', minHeight: '0', overflowY: 'auto', padding: '32px', boxSizing: 'border-box', width: '100%', maxWidth: '1040px' }}>
{/*  Header & Filter Row  */}
<div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-5 shadow-sm space-y-4">
<div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
<div>
<h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">Pengajuan yang ditugaskan</h1>
<p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Tinjau kelengkapan berkas yang diserahkan dan kirimkan catatan verifikasi kepada pemohon dalam mode simulasi.</p>
</div>
<span className="self-start md:self-auto inline-flex items-center px-3 py-1 rounded-full text-caption font-caption font-semibold bg-surface-container-low text-secondary border border-secondary/20">
<span className="material-symbols-outlined text-[16px] mr-1">inventory_2</span>
              3 Pengajuan dalam antrean tugasmu
            </span>
</div>
{/*  Controls: Filters and Search  */}
<div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-outline-variant/30">
{/*  Search Input  */}
<div className="sm:col-span-6 relative">
<span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-outline">search</span>
<input className="w-full pl-10 pr-3 py-2 text-body-sm font-body-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-primary placeholder-outline focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" placeholder="Cari nomor pengajuan (mis. DEMO-AK-014)..." type="text" value="DEMO-AK-014"/>
</div>
{/*  Status Dropdown  */}
<div className="sm:col-span-3">
<select className="w-full py-2 px-3 text-body-sm font-body-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
<option value="all">Semua Status</option>
<option  value="action_needed">Perlu Tindakan</option>
<option value="pending">Menunggu Verifikasi</option>
</select>
</div>
{/*  Layanan Dropdown  */}
<div className="sm:col-span-3">
<select className="w-full py-2 px-3 text-body-sm font-body-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
<option value="all">Semua Layanan</option>
<option  value="akta">Akta Kelahiran (contoh)</option>
<option value="kk">Kartu Keluarga (contoh)</option>
</select>
</div>
</div>
</div>
{/*  Two-column split workbench  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
{/*  Column 1: Left Compact Assigned Application List (~360px)  */}
<div className="lg:col-span-4 space-y-3">
<div className="flex items-center justify-between px-1">
<h2 className="font-title-md text-title-md font-bold text-primary">Daftar Antrean Tugas</h2>
<span className="text-caption font-caption text-on-surface-variant font-medium">Urut: Tanggal Penyerahan</span>
</div>
{/*  Card 1: Active Selected  */}
<div className="bg-surface-container-lowest border-2 border-secondary rounded-xl p-4 shadow-sm relative transition-all cursor-pointer">
<div className="flex items-center justify-between mb-2">
<span className="font-title-md text-title-md font-bold text-primary">DEMO-AK-014</span>
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-caption font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  Perlu Tindakan Petugas
                </span>
</div>
<p className="font-label-md text-label-md text-secondary font-medium">Akta Kelahiran (contoh)</p>
<div className="mt-3 pt-2.5 border-t border-outline-variant/30 space-y-1.5 text-body-sm font-body-sm text-on-surface-variant">
<div className="flex justify-between">
<span className="text-outline">Pemohon:</span>
<span className="font-medium text-primary">Ayu Contoh (Tersamarkan)</span>
</div>
<div className="flex justify-between">
<span className="text-outline">Diserahkan:</span>
<span className="font-medium text-primary">26 Okt 2026, 09:15 WIB</span>
</div>
</div>
<div className="mt-3 p-2 bg-amber-50/70 border border-amber-200/70 rounded-lg text-caption font-caption text-amber-900 flex items-start space-x-1.5">
<span className="material-symbols-outlined text-[16px] text-amber-700 mt-0.5">report_problem</span>
<span>Catatan terakhir: Hasil pemeriksaan awal OCR ada catatan halaman kedua kurang terbaca.</span>
</div>
{/*  Active Marker Indicator  */}
<div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center">
<span className="material-symbols-outlined text-secondary text-[24px]">arrow_right</span>
</div>
</div>
{/*  Card 2: Queued Item  */}
<div className="bg-surface-container-lowest border border-outline-variant/60 hover:border-outline-variant rounded-xl p-4 shadow-sm transition-all cursor-pointer hover:bg-surface-bright">
<div className="flex items-center justify-between mb-2">
<span className="font-title-md text-title-md font-bold text-primary">DEMO-KK-008</span>
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-caption font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  Menunggu Verifikasi Awal
                </span>
</div>
<p className="font-label-md text-label-md text-primary-container font-medium">Kartu Keluarga (contoh)</p>
<div className="mt-3 pt-2.5 border-t border-outline-variant/30 space-y-1.5 text-body-sm font-body-sm text-on-surface-variant">
<div className="flex justify-between">
<span className="text-outline">Pemohon:</span>
<span className="font-medium text-primary">Budi S. (Tersamarkan)</span>
</div>
<div className="flex justify-between">
<span className="text-outline">Diserahkan:</span>
<span className="font-medium text-primary">27 Okt 2026, 14:00 WIB</span>
</div>
</div>
</div>
{/*  Card 3: Completed Item  */}
<div className="bg-surface-container-lowest border border-outline-variant/60 hover:border-outline-variant rounded-xl p-4 shadow-sm transition-all cursor-pointer hover:bg-surface-bright">
<div className="flex items-center justify-between mb-2">
<span className="font-title-md text-title-md font-bold text-primary">DEMO-AK-019</span>
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-caption font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Selesai Simulasi
                </span>
</div>
<p className="font-label-md text-label-md text-primary-container font-medium">Akta Kelahiran (contoh)</p>
<div className="mt-3 pt-2.5 border-t border-outline-variant/30 space-y-1.5 text-body-sm font-body-sm text-on-surface-variant">
<div className="flex justify-between">
<span className="text-outline">Pemohon:</span>
<span className="font-medium text-primary">Citra D. (Tersamarkan)</span>
</div>
<div className="flex justify-between">
<span className="text-outline">Diserahkan:</span>
<span className="font-medium text-primary">25 Okt 2026, 11:30 WIB</span>
</div>
</div>
</div>
{/*  Context Hint  */}
<div className="p-3 bg-surface-container-low border border-surface-container-high rounded-lg text-caption font-caption text-on-surface-variant flex items-center space-x-2">
<span className="material-symbols-outlined text-[18px] text-secondary">info</span>
<span>Daftar penugasan disegarkan otomatis setiap terdapat penyerahan baru dari kanal simulasi.</span>
</div>
</div>
{/*  Column 2: Right Selected Application Card & Update Form (Main workbench area)  */}
<div className="lg:col-span-8 space-y-6">
{/*  Application Identification Header Card  */}
<div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-6 shadow-sm">
<div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-outline-variant/30">
<div className="flex flex-wrap items-center gap-2">
<span className="inline-flex items-center px-3 py-1 rounded-md text-label-md font-label-md font-bold bg-primary-container text-surface-container-lowest">
                    Nomor Pengajuan: DEMO-AK-014
                  </span>
<span className="inline-flex items-center px-2.5 py-1 rounded-md text-body-sm font-body-sm bg-surface-container text-primary font-medium border border-surface-container-high">
                    Layanan: Akta Kelahiran (contoh)
                  </span>
<span className="inline-flex items-center px-2.5 py-1 rounded-md text-caption font-caption bg-surface-container-low text-secondary font-semibold">
                    Wilayah: Kota Contoh (Simulasi)
                  </span>
</div>
<span className="text-caption font-caption text-outline">Ref ID: SIM-2026-AK014</span>
</div>
{/*  Synthetic Application Meta  */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-body-sm font-body-sm">
<div>
<span className="text-caption font-caption text-outline block">Pemohon Terdaftar</span>
<span className="font-semibold text-primary">Ayu Contoh (Tersamarkan)</span>
</div>
<div>
<span className="text-caption font-caption text-outline block">Kanal Pengajuan</span>
<span className="font-medium text-primary">Loket Pelayanan Disdukcapil (contoh)</span>
</div>
<div>
<span className="text-caption font-caption text-outline block">Kontak Notifikasi</span>
<span className="font-medium text-primary">ayu.contoh@email.simulasi</span>
</div>
</div>
{/*  Scope Notice  */}
<div className="mt-4 p-3 bg-surface-container-low/60 border border-outline-variant/40 rounded-lg text-caption font-caption text-on-surface-variant flex items-center space-x-2">
<span className="material-symbols-outlined text-[18px] text-primary">privacy_tip</span>
<span>Hanya menampilkan berkas dan ringkasan yang diserahkan oleh pemohon untuk simulasi verifikasi.</span>
</div>
</div>
{/*  Berkas Lampiran yang Diserahkan (Minimal view, no raw personal documents, no AI authenticity verification claims)  */}
<div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-6 shadow-sm space-y-4">
<div className="flex items-center justify-between">
<h2 className="font-title-md text-title-md font-bold text-primary flex items-center space-x-2">
<span className="material-symbols-outlined text-secondary text-[22px]">attach_file</span>
<span>Berkas Lampiran yang Diserahkan (Simulasi)</span>
</h2>
<span className="text-caption font-caption text-outline">Format pratinjau metadata</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
{/*  Attachment 1  */}
<div className="p-3.5 border border-outline-variant/40 rounded-lg bg-surface-container-lowest flex items-start justify-between">
<div className="flex items-start space-x-3">
<span className="material-symbols-outlined text-secondary text-[24px]">description</span>
<div>
<p className="font-label-md text-label-md font-bold text-primary">Kartu Keluarga (contoh)</p>
<p className="text-caption font-caption text-outline">Format PDF · Ukuran 420 KB</p>
<span className="inline-flex items-center mt-2 px-2 py-0.5 rounded text-caption font-caption font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
<span className="material-symbols-outlined text-[14px] mr-1">check_circle</span>
                        Status: Terbaca jelas
                      </span>
</div>
</div>
<button className="text-secondary hover:text-primary transition-colors text-caption font-caption font-semibold flex items-center" type="button">
                    Periksa
                  </button>
</div>
{/*  Attachment 2 (Needs Attention)  */}
<div className="p-3.5 border border-amber-200 rounded-lg bg-amber-50/30 flex items-start justify-between">
<div className="flex items-start space-x-3">
<span className="material-symbols-outlined text-amber-700 text-[24px]">description</span>
<div>
<p className="font-label-md text-label-md font-bold text-primary">Surat Keterangan Lahir (contoh)</p>
<p className="text-caption font-caption text-outline">Format PDF · Ukuran 850 KB</p>
<span className="inline-flex items-center mt-2 px-2 py-0.5 rounded text-caption font-caption font-semibold bg-amber-100 text-amber-900 border border-amber-300">
<span className="material-symbols-outlined text-[14px] mr-1">warning</span>
                        Status: Catatan pemindaian halaman 2 terpotong / buram
                      </span>
</div>
</div>
<button className="text-secondary hover:text-primary transition-colors text-caption font-caption font-semibold flex items-center" type="button">
                    Periksa
                  </button>
</div>
</div>
</div>
{/*  Riwayat Status Berlabel Sumber (Source-labeled history)  */}
<div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-6 shadow-sm space-y-4">
<h2 className="font-title-md text-title-md font-bold text-primary flex items-center space-x-2">
<span className="material-symbols-outlined text-secondary text-[22px]">timeline</span>
<span>Riwayat Status Berlabel Sumber</span>
</h2>
<div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/40">
{/*  Step 1  */}
<div className="relative flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
<div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-surface-container-lowest"></div>
<div>
<p className="font-label-md text-label-md font-bold text-primary">Diterima di Kanal Layanan</p>
<span className="inline-block px-2 py-0.5 mt-0.5 rounded text-caption font-caption bg-surface-container text-on-surface-variant border border-surface-container-high font-medium">
                      Sumber: Petugas simulasi
                    </span>
</div>
<span className="text-caption font-caption text-outline">26 Okt 2026, 09:20 WIB</span>
</div>
{/*  Step 2  */}
<div className="relative flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
<div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-surface-container-lowest"></div>
<div>
<p className="font-label-md text-label-md font-bold text-primary">Verifikasi Berkas Awal</p>
<span className="inline-block px-2 py-0.5 mt-0.5 rounded text-caption font-caption bg-surface-container text-on-surface-variant border border-surface-container-high font-medium">
                      Sumber: Petugas simulasi
                    </span>
</div>
<span className="text-caption font-caption text-outline">27 Okt 2026, 14:35 WIB</span>
</div>
{/*  Step 3 (Terkini)  */}
<div className="relative flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
<div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-secondary border-2 border-surface-container-lowest ring-2 ring-secondary/20"></div>
<div>
<p className="font-label-md text-label-md font-bold text-secondary flex items-center gap-1.5">
                      Catatan Pemeriksaan
                      <span className="px-1.5 py-0.5 text-caption font-caption rounded bg-secondary/10 text-secondary font-semibold">Terkini</span>
</p>
<span className="inline-block px-2 py-0.5 mt-0.5 rounded text-caption font-caption bg-surface-container-high text-primary font-semibold">
                      Sumber: Petugas simulasi - Loket 3
                    </span>
</div>
<span className="text-caption font-caption text-primary font-medium">28 Okt 2026, 10:05 WIB</span>
</div>
</div>
</div>
{/*  Formulir Pembaruan Status Petugas (Update form)  */}
<div className="bg-surface-container-lowest border-2 border-secondary/40 rounded-xl p-6 shadow-sm space-y-5">
<div>
<h2 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center space-x-2">
<span className="material-symbols-outlined text-secondary text-[24px]">edit_note</span>
<span>Formulir Catatan Verifikasi Petugas</span>
</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">Gunakan formulir ini untuk memperbarui status verifikasi dan memberikan catatan instruksi kepada pemohon.</p>
</div>
{/*  Explicit Info Banner  */}
<div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-body-sm font-body-sm text-blue-900 flex items-start space-x-2.5">
<span className="material-symbols-outlined text-[20px] text-secondary mt-0.5">info</span>
<p>Perubahan ini adalah pembaruan petugas simulasi. Catatan akan tampil langsung di linimasa pelacakan pemohon.</p>
</div>
<form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
{/*  Status Dropdown Field  */}
<div>
<label className="block font-label-md text-label-md font-semibold text-primary mb-1.5" htmlFor="status-verifikasi">
                    Pembaruan Status Verifikasi <span className="text-error">*</span>
</label>
<select className="w-full h-10 px-3 text-body-md font-body-md rounded-lg border border-outline-variant bg-surface-container-lowest text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" id="status-verifikasi">
<option value="menunggu">Menunggu Verifikasi</option>
<option  value="perbaikan">Perlu perbaikan</option>
<option value="proses_ulang">Diproses Ulang Petugas</option>
<option value="selesai">Selesai Verifikasi Simulasi</option>
</select>
</div>
{/*  Alasan Perbaikan Field (Textarea)  */}
<div>
<div className="flex justify-between items-center mb-1.5">
<label className="font-label-md text-label-md font-semibold text-primary" htmlFor="alasan-perbaikan">
                      Alasan Perbaikan <span className="text-error">*</span>
</label>
<span className="text-caption font-caption text-outline">Wajib diisi</span>
</div>
<textarea className="w-full p-3 text-body-md font-body-md rounded-lg border border-outline-variant bg-surface-container-lowest text-primary placeholder-outline focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" id="alasan-perbaikan" rows={3}>Cap fasilitas kesehatan pada lampiran surat kelahiran buram dan tepi dokumen terpotong saat pemindaian. Mohon lampirkan ulang pindai yang jelas.</textarea>
</div>
{/*  Langkah yang Perlu Dilakukan Warga (Required text field)  */}
<div>
<div className="flex justify-between items-center mb-1.5">
<label className="font-label-md text-label-md font-semibold text-primary" htmlFor="langkah-warga">
                      Langkah yang perlu dilakukan warga <span className="text-error">*</span>
</label>
<span className="text-caption font-caption text-outline">Akan ditampilkan sebagai petunjuk tindak lanjut</span>
</div>
<input className="w-full h-10 px-3 text-body-md font-body-md rounded-lg border border-outline-variant bg-surface-container-lowest text-primary placeholder-outline focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" id="langkah-warga" type="text" value="Unggah ulang halaman kedua Surat Keterangan Lahir agar seluruh tulisan dan stempel terbaca utuh."/>
</div>
{/*  Petunjuk Tambahan Loket (Optional)  */}
<div>
<label className="block font-label-md text-label-md font-semibold text-primary mb-1.5" htmlFor="petunjuk-tambahan">
                    Petunjuk tambahan loket <span className="text-on-surface-variant font-normal">(opsional)</span>
</label>
<input className="w-full h-10 px-3 text-body-md font-body-md rounded-lg border border-outline-variant bg-surface-container-lowest text-primary placeholder-outline focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary" id="petunjuk-tambahan" placeholder="Tambahkan catatan pengajuan" type="text" value=""/>
</div>
{/*  Audit Inset Box  */}
<div className="bg-surface-container-low/70 border border-outline-variant/40 rounded-lg p-4 space-y-1.5 text-body-sm font-body-sm">
<div className="flex items-center space-x-1.5 text-secondary font-semibold mb-2">
<span className="material-symbols-outlined text-[18px]">fact_check</span>
<span>Audit Rekam Jejak Petugas</span>
</div>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-on-surface">
<div>
<span className="text-caption font-caption text-outline block">Pencatat:</span>
<span className="font-medium">Bambang S. (Petugas Simulasi - Loket 3)</span>
</div>
<div>
<span className="text-caption font-caption text-outline block">Waktu pencatatan:</span>
<span className="font-medium">28 Oktober 2026, 10:15 WIB</span>
</div>
<div>
<span className="text-caption font-caption text-outline block">ID Audit:</span>
<span className="font-mono text-caption font-caption font-bold text-primary">AUDIT-JMW-20261028-091</span>
</div>
</div>
</div>
{/*  Action Buttons  */}
<div className="pt-3 flex flex-wrap items-center justify-end gap-3 border-t border-outline-variant/30">
<button className="h-10 px-5 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary font-label-md text-label-md font-semibold hover:bg-surface-container-low transition-colors" type="button">
                    Tinjau perubahan
                  </button>
<button onClick={handleUpdate} className="h-10 px-6 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-blue-700 shadow-sm transition-colors flex items-center space-x-2" type="button">
<span className="material-symbols-outlined text-[18px]">send</span>
<span>Simpan pembaruan</span>
</button>
</div>
</form>
{/*  Integrity Notice at Bottom  */}
<div className="pt-3 border-t border-outline-variant/20 text-center">
<p className="text-caption font-caption text-outline flex items-center justify-center space-x-1">
<span className="material-symbols-outlined text-[14px]">shield</span>
<span>Instrumen ini adalah alat bantu simulasi kerja petugas. Tidak terhubung langsung ke basis data kependudukan nasional.</span>
</p>
</div>
</div>
</div>
</div>
</div>
{/*  Footer Anchor conforming to Shared Components JSON  */}
<footer className="mt-auto bg-primary text-on-primary border-t border-primary-container" style={{ flexShrink: '0', position: 'static' }}>
<div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
<div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
<span className="text-headline-sm font-headline-sm font-bold text-on-primary">JejakMasWowo</span>
<span className="text-body-sm font-body-sm text-on-primary-container hidden sm:inline">|</span>
<span className="text-body-sm font-body-sm text-on-primary-container text-center sm:text-left">© 2026 JejakMasWowo Civic Transparency Portal. Seluruh hak cipta dilindungi undang-undang.</span>
</div>
<nav aria-label="Tautan Bawah" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-label-sm font-label-sm text-on-primary-container">
<a className="hover:text-on-primary transition-colors" href="#">Kebijakan Privasi</a>
<a className="hover:text-on-primary transition-colors" href="#">Ketentuan Layanan</a>
<a className="hover:text-on-primary transition-colors" href="#">Keterbukaan Informasi Publik</a>
<a className="hover:text-on-primary transition-colors" href="#">Panduan Registrasi Warga</a>
<a className="hover:text-on-primary transition-colors" href="#">Pusat Pengaduan</a>
</nav>
</div>
</footer>
</main>
</div>

    </div>
  );
};
