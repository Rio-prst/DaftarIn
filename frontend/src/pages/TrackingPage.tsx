import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const TrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { applications, advanceApplicationStatus, showToast, openChat } = useApp();
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  const handleAdvanceStatus = () => {
    if (applications.length > 0) {
      const app = applications[0];
      advanceApplicationStatus(app.id);
      showToast('Status pengajuan dimajukan ke tahap berikutnya!', 'info');
    }
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    showToast('Catatan warga berhasil ditambahkan ke linimasa!', 'success');
    setNoteText('');
    setShowAddNote(false);
  };

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <div className="bg-[#142C4B] text-white px-6 py-2 flex items-center justify-between text-xs border-b border-[#233F66]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">⚡ Kontrol Simulasi Siklus Pelacakan:</span>
          <span>Klik tombol untuk memajukan status alur permohonan ke tahap berikutnya:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAdvanceStatus}
            className="px-3 py-1 bg-[#1769D2] hover:bg-[#1256AE] rounded font-semibold text-white transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[14px]">fast_forward</span>
            <span>Simulasi Maju Tahap Status</span>
          </button>
          <button
            onClick={() => navigate('/petugas')}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded font-semibold text-white transition-colors"
          >
            Meja Petugas Verifikasi →
          </button>
        </div>
      </div>


{/*  TOP PROTOYPE DISCLAIMER BANNER  */}
<header className="w-full bg-[#001b1e] text-on-tertiary px-4 py-2 flex items-center justify-between text-body-sm font-body-sm z-50 shrink-0">
<div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-tertiary-fixed text-base" data-icon="info">info</span>
<span>
<strong>Pemberitahuan:</strong> Prototipe independen. Data persiapan dan pelacakan disimpan untuk simulasi mandiri warga. Bukan portal resmi pemerintah.
        </span>
</div>
<div className="flex items-center gap-2">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-caption bg-tertiary-fixed text-on-tertiary-fixed font-semibold tracking-wide">
          Mode Simulasi Mandiri
        </span>
</div>
</div>
</header>
{/*  MAIN APP CONTAINER (SIDEBAR + MAIN CANVAS)  */}
<div className="flex-1 flex w-full" style={{ width: '1280px', height: 'calc(1000px - 37px)', overflow: 'hidden', display: 'flex' }}>
{/*  LEFT NAVY DESKTOP SIDEBAR  */}
<aside className="w-64 bg-primary-container text-on-primary flex flex-col justify-between shrink-0 min-h-screen" style={{ width: '240px', minWidth: '240px', maxWidth: '240px', height: '100%', flexShrink: '0' }}>
{/*  Top Brand & Navigation  */}
<div className="flex flex-col">
{/*  Brand Header  */}
<div className="px-6 py-6 border-b border-primary">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-white shadow-sm shrink-0">
<span className="material-symbols-outlined text-2xl" data-icon="verified">verified</span>
</div>
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm font-bold text-white tracking-tight leading-tight">JejakMasWowo</span>
<span className="font-caption text-caption text-on-primary-container">Panduan dan persiapan layanan warga</span>
</div>
</div>
</div>
{/*  Navigation Links  */}
<nav aria-label="Navigasi Utama" className="px-3 py-4 space-y-1">
{/*  Item 1: Dashboard  */}
<a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-primary-container hover:bg-primary hover:text-white transition-colors" href="#">
<span className="material-symbols-outlined text-xl" data-icon="dashboard">dashboard</span>
<span className="font-label-md text-label-md">Dashboard</span>
</a>
{/*  Item 2: Cari Layanan  */}
<a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-primary-container hover:bg-primary hover:text-white transition-colors" href="#">
<span className="material-symbols-outlined text-xl" data-icon="travel_explore">travel_explore</span>
<span className="font-label-md text-label-md">Cari Layanan</span>
</a>
{/*  Item 3: Persiapan Saya  */}
<a className="flex items-center justify-between px-3 py-2.5 rounded-lg text-on-primary-container hover:bg-primary hover:text-white transition-colors" href="#">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-xl" data-icon="folder_managed">folder_managed</span>
<span className="font-label-md text-label-md">Persiapan Saya</span>
</div>
<span className="px-2 py-0.5 rounded-full text-caption font-caption bg-surface-container-high text-primary font-bold">2</span>
</a>
{/*  Item 4: Pengajuan Saya (ACTIVE)  */}
<a className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary text-white font-semibold shadow-sm transition-all" href="#">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-xl" data-icon="assignment_turned_in" style={{ fontVariationSettings: '\'FILL\' 1' }}>assignment_turned_in</span>
<span className="font-label-md text-label-md">Pengajuan Saya</span>
</div>
<span className="w-1.5 h-1.5 rounded-full bg-white"></span>
</a>
{/*  Item 5: Notifikasi  */}
<a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-primary-container hover:bg-primary hover:text-white transition-colors" href="#">
<span className="material-symbols-outlined text-xl" data-icon="notifications">notifications</span>
<span className="font-label-md text-label-md">Notifikasi</span>
</a>
{/*  Item 6: Profil & Privasi  */}
<a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-primary-container hover:bg-primary hover:text-white transition-colors" href="#">
<span className="material-symbols-outlined text-xl" data-icon="account_circle">account_circle</span>
<span className="font-label-md text-label-md">Profil &amp; Privasi</span>
</a>
</nav>
</div>
{/*  Bottom Sidebar Footer Notice  */}
<div className="p-4 border-t border-primary flex flex-col gap-3">
<div className="bg-primary/50 p-3 rounded-lg border border-primary text-caption font-caption text-on-primary-container leading-relaxed">
<strong className="text-white block font-semibold mb-0.5">PROTOTIPE INDEPENDEN</strong>
          Data simulasi untuk pengujian antarmuka warga. Tidak terhubung server Disdukcapil resmi.
        </div>
<button className="flex items-center gap-2 text-on-primary-container hover:text-white text-label-md font-label-md px-2 py-1.5 transition-colors" onClick={() => navigate("/")}>
<span className="material-symbols-outlined text-lg" data-icon="logout">logout</span>
<span>Keluar</span>
</button>
</div>
</aside>
{/*  RIGHT MAIN CANVAS WRAPPER  */}
<div className="flex-1 flex flex-col min-w-0 bg-[#F5F7FB]" style={{ width: '1040px', minWidth: '0', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
{/*  TOPBAR HEADER  */}
<header className="bg-surface-container-lowest border-b border-[#DDE5EF] px-8 flex items-center justify-between z-40" style={{ height: '72px', flexShrink: '0' }}><div className="flex items-center gap-3"><nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-body-sm font-body-sm text-on-surface-variant"><span className="text-on-surface-variant hover:text-primary transition-colors">Pengajuan Saya</span><span className="material-symbols-outlined text-sm text-outline" data-icon="chevron_right">chevron_right</span><span className="text-on-surface-variant hover:text-primary transition-colors">Akta Kelahiran (contoh)</span><span className="material-symbols-outlined text-sm text-outline" data-icon="chevron_right">chevron_right</span><span className="text-primary font-semibold">Detail Pelacakan</span></nav></div><div className="flex items-center gap-3"><span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-caption bg-surface-container-low text-primary border border-surface-dim font-medium"><span className="material-symbols-outlined text-xs" data-icon="location_on">location_on</span>Kota Contoh · Simulasi</span><button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container-high transition-colors font-label-md text-label-md font-medium border border-surface-dim" onClick={() => openChat()}><span className="material-symbols-outlined text-base text-secondary" data-icon="help">help</span><span>Bantuan</span></button><button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors relative" title="Notifikasi"><span className="material-symbols-outlined" data-icon="notifications">notifications</span><span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error"></span></button><div className="h-6 w-px bg-[#DDE5EF] mx-1"></div><div className="flex items-center gap-2.5 pl-1"><div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold font-title-md text-title-md">A</div><div className="flex flex-col"><span className="font-label-md text-label-md font-semibold text-primary leading-tight">Ayu Contoh</span><span className="font-caption text-caption text-on-surface-variant">Warga Terdaftar</span></div></div></div></header>
{/*  MAIN PAGE CONTENT (SCROLLABLE)  */}
<main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6" style={{ flex: '1 1 0%', minHeight: '0', overflowY: 'auto', padding: '32px', boxSizing: 'border-box' }}>
{/*  PROMINENT HEADER SECTION & IDENTIFIERS  */}
<div className="bg-surface-container-lowest border border-[#DDE5EF] rounded-xl p-6 civic-card-shadow">
<div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
<div className="space-y-1">
<div className="flex flex-wrap items-center gap-2 mb-2">
<span className="px-2.5 py-0.5 rounded-full text-caption font-caption font-semibold bg-surface-container-highest text-primary border border-surface-dim">
                  Mode Simulasi
                </span>
<span className="px-2.5 py-0.5 rounded-full text-caption font-caption font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
<span className="material-symbols-outlined text-xs" data-icon="warning">warning</span>
                  Simulasi petugas — bukan status pemerintah nyata
                </span>
</div>
<h1 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">
                Perkembangan pengajuanmu
              </h1>
<p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Pantau status pengurusan berkas berdasarkan catatan petugas simulasi dan riwayat mandiri warga.
              </p>
</div>
{/*  COMPACT IDENTIFIERS CHIPS  */}
<div className="flex flex-col sm:flex-row gap-3 shrink-0 self-start">
<div className="bg-surface-container-low border border-surface-dim rounded-lg p-3 min-w-[210px]">
<div className="text-caption font-caption text-on-surface-variant uppercase tracking-wider font-semibold">Nomor Persiapan Mandiri</div>
<div className="font-title-md text-title-md font-bold text-primary tracking-tight font-mono">JMW-DEMO-001</div>
<div className="text-caption font-caption text-outline mt-0.5">Konteks internal draf mandiri</div>
</div>
<div className="bg-surface-container-low border border-surface-dim rounded-lg p-3 min-w-[210px]">
<div className="text-caption font-caption text-on-surface-variant uppercase tracking-wider font-semibold">Nomor Pengajuan Simulasi</div>
<div className="font-title-md text-title-md font-bold text-secondary tracking-tight font-mono">DEMO-AK-014</div>
<div className="text-caption font-caption text-outline mt-0.5">Tanda terima simulasi kanal layanan</div>
</div>
</div>
</div>
</div>
{/*  2-COLUMN MAIN GRID  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
{/*  LEFT COLUMN (8 COLS): ACTION REQUIRED, TIMELINE & NOTES  */}
<div className="lg:col-span-8 space-y-6">
{/*  1. ACTIVE ACTION / REVISION ALERT CARD  */}
<section aria-labelledby="action-alert-heading" className="bg-amber-50/80 border-2 border-amber-300 rounded-xl p-6 civic-card-shadow relative overflow-hidden">
<div className="flex items-start gap-4">
<div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
<span className="material-symbols-outlined text-2xl" data-icon="error" style={{ fontVariationSettings: '\'FILL\' 1' }}>error</span>
</div>
<div className="flex-1 space-y-3">
<div className="flex flex-wrap items-center gap-2 justify-between">
<span className="px-2.5 py-0.5 rounded-full text-caption font-caption font-bold uppercase tracking-wider bg-amber-200/70 text-amber-900 border border-amber-300">
                      Tindakan Diperlukan Pemohon
                    </span>
</div>
<div>
<h2 className="font-headline-sm text-headline-sm font-bold text-amber-950" id="action-alert-heading">
                      Perlu perbaikan berkas
                    </h2>
<p className="font-body-md text-body-md font-semibold text-amber-900 mt-1">
                      Unggah ulang halaman kedua agar seluruh tulisan terbaca
                    </p>
</div>
{/*  Officer Simulated Note Box  */}
<div className="bg-white/80 border border-amber-200 rounded-lg p-3.5 text-body-sm font-body-sm text-amber-950 flex flex-col gap-1">
<div className="flex items-center gap-1.5 font-semibold text-amber-900 text-caption font-caption">
<span className="material-symbols-outlined text-sm" data-icon="support_agent">support_agent</span>
                      Catatan Petugas Simulasi (Loket 3):
                    </div>
<p className="leading-relaxed">
                      "Cap fasilitas kesehatan pada lampiran surat kelahiran buram dan tepi dokumen terpotong saat pemindaian. Mohon lampirkan ulang pindaian yang jelas."
                    </p>
</div>
{/*  Actions  */}
<div className="flex flex-wrap items-center gap-3 pt-1">
<button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-white font-label-md text-label-md font-medium hover:bg-[#1357B0] transition-colors shadow-sm">
<span className="material-symbols-outlined text-lg" data-icon="edit_document">edit_document</span>
                      Buka persiapan dan perbaiki
                    </button>
<button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-[#CBD7E6] text-primary font-label-md text-label-md font-medium hover:bg-surface-container-low transition-colors">
<span className="material-symbols-outlined text-lg" data-icon="help_center">help_center</span>
                      Lihat panduan pemindaian yang benar
                    </button>
</div>
</div>
</div>
</section>
{/*  2. MAIN VERTICAL TIMELINE CARD  */}
<section aria-labelledby="timeline-heading" className="bg-surface-container-lowest border border-[#DDE5EF] rounded-xl p-6 civic-card-shadow">
<div className="border-b border-[#DDE5EF] pb-4 mb-6">
<div className="flex flex-wrap items-center justify-between gap-2">
<h2 className="font-headline-sm text-headline-sm font-bold text-primary" id="timeline-heading">
                    Riwayat Tahapan Pengajuan (Simulasi)
                  </h2>
<span className="text-caption font-caption text-on-surface-variant bg-surface-container-low px-2 py-1 rounded">
                    Total 5 Tahapan
                  </span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Setiap peristiwa mencantumkan sumber pencatat untuk membedakan catatan petugas dan mandiri.
                </p>
</div>
{/*  Stepper Timeline List  */}
<div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#DDE5EF]">
{/*  STEP 1: COMPLETED  */}
<div className="relative group">
{/*  Node Icon  */}
<div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[#059669] text-white flex items-center justify-center ring-4 ring-white z-10">
<span className="material-symbols-outlined text-sm font-bold" data-icon="check">check</span>
</div>
<div className="space-y-1.5 pl-2">
<div className="flex flex-wrap items-center gap-2 justify-between">
<h3 className="font-title-md text-title-md font-bold text-primary">
                        Diterima di Kanal Layanan
                      </h3>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-caption bg-surface-container text-primary font-medium border border-surface-dim">
<span className="material-symbols-outlined text-xs" data-icon="person">person</span>
                        Sumber: Petugas simulasi
                      </span>
</div>
<div className="flex flex-wrap items-center gap-x-4 text-caption font-caption text-on-surface-variant">
<span className="flex items-center gap-1 font-medium text-primary">
<span className="material-symbols-outlined text-xs" data-icon="calendar_today">calendar_today</span>
                        26 Oktober 2026, 09:15 WIB
                      </span>
<span>Dicatat sistem simulasi: 26 Okt 2026, 09:20 WIB</span>
</div>
<p className="text-body-sm font-body-sm text-on-surface-variant pt-1 leading-relaxed">
                      Berkas permohonan dan kelengkapan lampiran diterima di loket pelayanan Disdukcapil (contoh).
                    </p>
</div>
</div>
{/*  STEP 2: COMPLETED  */}
<div className="relative group">
{/*  Node Icon  */}
<div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[#059669] text-white flex items-center justify-center ring-4 ring-white z-10">
<span className="material-symbols-outlined text-sm font-bold" data-icon="check">check</span>
</div>
<div className="space-y-1.5 pl-2">
<div className="flex flex-wrap items-center gap-2 justify-between">
<h3 className="font-title-md text-title-md font-bold text-primary">
                        Verifikasi Berkas Awal
                      </h3>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-caption bg-surface-container text-primary font-medium border border-surface-dim">
<span className="material-symbols-outlined text-xs" data-icon="person">person</span>
                        Sumber: Petugas simulasi
                      </span>
</div>
<div className="flex flex-wrap items-center gap-x-4 text-caption font-caption text-on-surface-variant">
<span className="flex items-center gap-1 font-medium text-primary">
<span className="material-symbols-outlined text-xs" data-icon="calendar_today">calendar_today</span>
                        27 Oktober 2026, 14:30 WIB
                      </span>
<span>Dicatat sistem simulasi: 27 Okt 2026, 14:35 WIB</span>
</div>
<p className="text-body-sm font-body-sm text-on-surface-variant pt-1 leading-relaxed">
                      Pengecekan kesesuaian identitas pemohon dan dokumen Kartu Keluarga terverifikasi.
                    </p>
</div>
</div>
{/*  STEP 3: ACTIVE (AMBER STATE)  */}
<div className="relative group">
{/*  Node Icon with Glow Ring  */}
<div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center ring-4 ring-amber-100 z-10">
<span className="material-symbols-outlined text-sm font-bold" data-icon="priority_high">priority_high</span>
</div>
<div className="space-y-2 pl-2 bg-amber-50/50 p-3.5 rounded-lg border border-amber-200">
<div className="flex flex-wrap items-center gap-2 justify-between">
<h3 className="font-title-md text-title-md font-bold text-amber-950 flex items-center gap-2">
                        Perlu Perbaikan Berkas
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
</h3>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-caption bg-amber-100 text-amber-900 font-semibold border border-amber-300">
<span className="material-symbols-outlined text-xs" data-icon="person">person</span>
                        Sumber: Petugas simulasi
                      </span>
</div>
<div className="flex flex-wrap items-center gap-x-4 text-caption font-caption text-amber-900">
<span className="flex items-center gap-1 font-medium">
<span className="material-symbols-outlined text-xs" data-icon="calendar_today">calendar_today</span>
                        28 Oktober 2026, 10:00 WIB
                      </span>
<span>Dicatat sistem simulasi: 28 Okt 2026, 10:05 WIB</span>
</div>
<p className="text-body-sm font-body-sm text-amber-950 leading-relaxed font-medium">
                      Petugas menandai dokumen Surat Keterangan Lahir halaman 2 perlu diunggah ulang karena tulisan tidak terbaca.
                    </p>
</div>
</div>
{/*  STEP 4: INACTIVE / PENDING  */}
<div className="relative opacity-60">
{/*  Node Icon  */}
<div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-surface-container border-2 border-[#CBD7E6] text-outline flex items-center justify-center ring-4 ring-white z-10">
<span className="material-symbols-outlined text-xs" data-icon="hourglass_empty">hourglass_empty</span>
</div>
<div className="space-y-1 pl-2">
<div className="flex items-center gap-2">
<h3 className="font-title-md text-title-md font-semibold text-on-surface-variant">
                        Diproses Ulang Petugas
                      </h3>
</div>
<p className="text-body-sm font-body-sm text-on-surface-variant">
                      Menunggu pengunggahan perbaikan dari warga
                    </p>
</div>
</div>
{/*  STEP 5: INACTIVE / PENDING  */}
<div className="relative opacity-60">
{/*  Node Icon  */}
<div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-surface-container border-2 border-[#CBD7E6] text-outline flex items-center justify-center ring-4 ring-white z-10">
<span className="material-symbols-outlined text-xs" data-icon="lock">lock</span>
</div>
<div className="space-y-1 pl-2">
<div className="flex items-center gap-2">
<h3 className="font-title-md text-title-md font-semibold text-on-surface-variant">
                        Selesai &amp; Penerbitan Dokumen
                      </h3>
</div>
<p className="text-body-sm font-body-sm text-on-surface-variant">
                      Tahap akhir setelah verifikasi disetujui
                    </p>
</div>
</div>
</div>
</section>
{/*  3. CITIZEN NOTES SECTION (SEPARATE CONTAINER)  */}
<section aria-labelledby="citizen-notes-heading" className="bg-surface-container-low border border-surface-dim rounded-xl p-6 civic-card-shadow">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
<div className="space-y-1">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary" data-icon="sticky_note_2">sticky_note_2</span>
<h2 className="font-title-md text-title-md font-bold text-primary" id="citizen-notes-heading">
                      Catatan Mandiri Warga
                    </h2>
</div>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-caption bg-surface-container-highest text-primary font-semibold border border-surface-dim">Catatan warga — belum terkonfirmasi instansi</span>
</div>
<button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-[#CBD7E6] text-primary text-label-md font-label-md font-semibold hover:bg-surface-container-high transition-colors shadow-xs">
<span className="material-symbols-outlined text-base" data-icon="add">add</span>
                  Tambah Catatan Warga
                </button>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-4 bg-white/60 p-3 rounded-lg border border-surface-dim">
                Catatan ini dibuat oleh pemohon untuk pengingat pribadi dan tidak diverifikasi oleh petugas instansi.
              </p>
{/*  Entry List  */}
<div className="space-y-3">
<div className="bg-white p-4 rounded-lg border border-[#DDE5EF] flex items-start gap-3">
<div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0 mt-0.5">
<span className="material-symbols-outlined text-base" data-icon="edit_note">edit_note</span>
</div>
<div className="flex-1 space-y-1">
<div className="flex items-center justify-between text-caption font-caption text-on-surface-variant">
<span className="font-semibold text-primary">Ayu Puspita (Anda)</span>
<span>26 Okt 2026, 11:00 WIB</span>
</div>
<p className="text-body-sm font-body-sm text-primary leading-relaxed">
                      Menyerahkan berkas fisik ke petugas loket 3, diminta cek berkala lewat kanal simulasi.
                    </p>
</div>
</div>
</div>
</section>
</div>
{/*  RIGHT RAIL (4 COLS): BENCHMARK, NEXT ACTIONS, & FALLBACK  */}
<div className="lg:col-span-4 space-y-6">
{/*  1. SERVICE BENCHMARK & TIMING BLOCK  */}
<div className="bg-surface-container-lowest border border-[#DDE5EF] rounded-xl p-5 civic-card-shadow space-y-4">
<h2 className="font-title-md text-title-md font-bold text-primary flex items-center gap-2 border-b border-[#DDE5EF] pb-3">
<span className="material-symbols-outlined text-secondary" data-icon="timer">timer</span>
                Tolok Ukur &amp; Durasi
              </h2>
{/*  Metric 1: Standar Waktu Resmi  */}
<div className="p-3 bg-surface-container-low rounded-lg border border-surface-dim space-y-1">
<span className="text-caption font-caption text-on-surface-variant font-medium block">
                  Standar Waktu Resmi
                </span>
<span className="font-title-md text-title-md font-bold text-primary block">Belum diverifikasi — contoh simulasi</span>
<p className="text-caption font-caption text-outline">
                  Bukan patokan resmi pemerintah daerah.
                </p>
</div>
{/*  Metric 2: Waktu Berjalan  */}
<div className="p-3 bg-surface-container-low rounded-lg border border-surface-dim space-y-1">
<span className="text-caption font-caption text-on-surface-variant font-medium block">
                  Waktu Berjalan
                </span>
<span className="font-headline-sm text-headline-sm font-bold text-secondary block">
                  2 Hari Kalender
                </span>
<p className="text-caption font-caption text-outline">
                  Dihitung sejak tanggal pengajuan yang dicatat (26 Okt 2026).
                </p>
</div>
{/*  Metric 3: Estimasi Penyelesaian  */}
<div className="p-3 bg-surface-container-low rounded-lg border border-surface-dim space-y-1">
<span className="text-caption font-caption text-on-surface-variant font-medium block">
                  Estimasi Penyelesaian
                </span>
<span className="font-title-md text-title-md font-bold text-on-surface-variant block">
                  Tidak tersedia
                </span>
<p className="text-caption font-caption text-outline">
                  Tergantung penyelesaian perbaikan berkas oleh pemohon.
                </p>
</div>
</div>
{/*  2. NEXT ACTIONS & SUPPORT BLOCK  */}
<div className="bg-surface-container-lowest border border-[#DDE5EF] rounded-xl p-5 civic-card-shadow space-y-3">
<h2 className="font-title-md text-title-md font-bold text-primary mb-2">
                Aksi &amp; Bantuan
              </h2>
<button className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-[#DDE5EF] hover:bg-surface-container-low text-primary font-label-md text-label-md font-medium transition-colors text-left group">
<div className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-lg text-secondary" data-icon="open_in_new">open_in_new</span>
<span>Lihat kanal bantuan resmi</span>
</div>
<span className="material-symbols-outlined text-sm text-outline group-hover:translate-x-0.5 transition-transform" data-icon="arrow_forward">arrow_forward</span>
</button>
<button className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-[#DDE5EF] hover:bg-surface-container-low text-primary font-label-md text-label-md font-medium transition-colors text-left group">
<div className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-lg text-secondary" data-icon="notification_add">notification_add</span>
<span>Atur pengingat berkas</span>
</div>
<span className="material-symbols-outlined text-sm text-outline group-hover:translate-x-0.5 transition-transform" data-icon="arrow_forward">arrow_forward</span>
</button>
<button className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-[#DDE5EF] hover:bg-surface-container-low text-primary font-label-md text-label-md font-medium transition-colors text-left group">
<div className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-lg text-secondary" data-icon="picture_as_pdf">picture_as_pdf</span>
<span>Simpan ringkasan PDF pelacakan</span>
</div>
<span className="material-symbols-outlined text-sm text-outline group-hover:translate-y-0.5 transition-transform" data-icon="download">download</span>
</button>
</div>
{/*  3. FALLBACK / ALTERNATIVE TRACKING PANEL  */}
<div className="bg-surface-container-lowest border border-[#DDE5EF] rounded-xl p-5 civic-card-shadow space-y-3">
<div className="flex items-center gap-2 text-primary font-bold font-title-md text-title-md">
<span className="material-symbols-outlined text-lg text-secondary" data-icon="sync_alt">sync_alt</span>
                Informasi Sinkronisasi
              </div>
<p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
                Jika belum ada pembaruan dari petugas simulasi, gunakan catatan warga dan tautan pelacakan resmi instansi pelaksana.
              </p>
<a className="inline-flex items-center gap-1.5 text-secondary font-label-md text-label-md font-semibold hover:underline" href="#">
<span>Buka portal pelacakan resmi Disdukcapil (eksternal)</span>
<span className="material-symbols-outlined text-sm" data-icon="north_east">north_east</span>
</a>
<div className="p-3 bg-surface-container-low rounded-lg text-caption font-caption text-outline leading-tight border border-surface-dim">
<strong>Catatan penting:</strong> JejakMasWowo tidak terintegrasi langsung dengan database resmi kependudukan.
              </div>
</div>
</div>
</div>
</main>
{/*  SUBTLE FOOTER NOTE  */}
<footer className="mt-auto border-t border-[#DDE5EF] bg-surface-container-lowest px-8 py-4" style={{ flexShrink: '0', position: 'static' }}>
<div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-body-sm font-body-sm text-on-surface-variant gap-2">
<div>
            © 2026 JejakMasWowo · Prototipe Literasi &amp; Pelacakan Mandiri Warga · Tanggal pengujian: 28 Oktober 2026.
          </div>
<div className="text-caption font-caption text-outline">
            Bukan portal resmi pemerintah.
          </div>
</div>
</footer>
</div>
</div>
{/*  FLOATING HELP PILL (NON-INTRUSIVE)  */}


      {showAddNote && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#DDE5EF] space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-[#DDE5EF] pb-3">
              <h3 className="font-bold text-[16px] text-[#142C4B] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1769D2]">note_add</span>
                <span>Tambah Catatan Warga</span>
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
