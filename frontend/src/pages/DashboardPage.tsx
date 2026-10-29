import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { openChat, showToast } = useApp();

  return (
    <div className="bg-background text-on-surface flex antialiased selection:bg-secondary-fixed selection:text-on-secondary-container min-h-screen overflow-x-hidden font-sans">

{/*  LEFT SIDEBAR (Deep navy #142C4B background, Desktop: 240px, Mobile: hidden)  */}
<aside className="hidden md:flex w-[240px] bg-primary-container min-h-screen text-on-primary shrink-0 flex-col justify-between shadow-md z-30">
{/*  Top Segment  */}
<div>
{/*  Brand Header  */}
<div className="px-6 py-6 border-b border-on-primary-container/20">
<div className="flex items-center gap-2.5">
<div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-on-primary shadow-sm">
<span className="material-symbols-outlined text-[20px] material-symbols-fill">task_alt</span>
</div>
<div>
<h1 className="font-headline-sm text-[17px] font-bold text-on-primary tracking-tight leading-none">JejakMasWowo</h1>
<p className="font-caption text-caption text-on-primary-container mt-1">Panduan dan persiapan layanan warga</p>
</div>
</div>
</div>
{/*  Navigation Menu  */}
<nav className="px-3 py-4 space-y-1">
{/*  Dashboard (Active)  */}
<a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary text-on-primary font-label-md text-label-md transition-all shadow-sm" href="#/dashboard">
<span className="material-symbols-outlined text-[20px] material-symbols-fill">dashboard</span>
<span>Dashboard</span>
</a>
{/*  Cari Layanan  */}
<a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-primary-container hover:text-on-primary hover:bg-primary/40 font-label-md text-label-md transition-all" href="#/katalog" onClick={(e) => { e.preventDefault(); navigate("/katalog"); }}>
<span className="material-symbols-outlined text-[20px]">search</span>
<span>Cari Layanan</span>
</a>
{/*  Persiapan Saya  */}
<a className="flex items-center justify-between px-3 py-2.5 rounded-lg text-on-primary-container hover:text-on-primary hover:bg-primary/40 font-label-md text-label-md transition-all" href="#/persiapan/data" onClick={(e) => { e.preventDefault(); navigate("/persiapan/data"); }}>
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-[20px]">inventory_2</span>
<span>Persiapan Saya</span>
</div>
<span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/30 text-secondary-fixed border border-secondary-container/40">2</span>
</a>
{/*  Pengajuan Saya  */}
<a className="flex items-center justify-between px-3 py-2.5 rounded-lg text-on-primary-container hover:text-on-primary hover:bg-primary/40 font-label-md text-label-md transition-all" href="#/pelacakan" onClick={(e) => { e.preventDefault(); navigate("/pelacakan"); }}>
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-[20px]">receipt_long</span>
<span>Pengajuan Saya</span>
</div>
<span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container-high/20 text-on-primary-container">1</span>
</a>
{/*  Notifikasi  */}
<button type="button" onClick={() => showToast('Semua notifikasi pengurusan berkas telah dibaca.', 'info')} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-on-primary-container hover:text-on-primary hover:bg-primary/40 font-label-md text-label-md transition-all text-left">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-[20px]">notifications</span>
<span>Notifikasi</span>
</div>
<span className="w-2 h-2 rounded-full bg-error ring-2 ring-primary-container"></span>
</button>
{/*  Profil & Privasi  */}
<button type="button" onClick={() => showToast('Profil akun aktif: Ayu Contoh (Warga Terverifikasi).', 'info')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-primary-container hover:text-on-primary hover:bg-primary/40 font-label-md text-label-md transition-all text-left">
<span className="material-symbols-outlined text-[20px]">manage_accounts</span>
<span>Profil &amp; Privasi</span>
</button>
</nav>
</div>
{/*  Bottom Sidebar  */}
<div className="px-4 py-5 border-t border-on-primary-container/20 space-y-4">
<div className="p-3 rounded-lg bg-primary/60 border border-on-primary-container/20"><div className="flex items-center gap-1.5 mb-1 text-secondary-fixed"><span className="material-symbols-outlined text-[15px]">account_circle</span><span className="font-label-sm text-[11px] font-semibold uppercase tracking-wider">Akun Warga</span></div><p className="font-caption text-caption text-on-primary-container leading-relaxed">Kelola persiapan dan dokumenmu dari akun ini.</p><a className="font-caption text-[11px] text-secondary-fixed hover:underline mt-1 inline-block" href="#/dashboard">Privasi &amp; Keamanan Data</a></div>
<button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-on-primary-container hover:text-error hover:bg-error/10 font-label-md text-label-md transition-all" type="button" onClick={() => navigate("/")}>
<span className="material-symbols-outlined text-[18px]">logout</span>
<span>Keluar</span>
</button>
</div>
</aside>
{/*  MAIN CANVAS  */}
<div className="flex-1 flex flex-col min-w-0 min-h-screen">
{/*  Top Notice / Disclaimer Ribbon  */}
{/*  Topbar on Main Canvas  */}
<header className="h-[72px] bg-surface-container-lowest border-b border-outline-variant/50 px-8 flex items-center justify-between flex-shrink-0 shadow-[0_1px_3px_rgba(20,44,75,0.03)] z-20"><nav className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant"><a className="hover:text-secondary transition-colors" href="#/dashboard">Beranda</a><span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span><span className="font-semibold text-primary">Dasbor Warga</span></nav><div className="flex items-center gap-4"><div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/60 text-on-surface-variant font-label-sm text-label-sm"><span className="material-symbols-outlined text-[15px] text-secondary">location_on</span><span>Kota Contoh · Simulasi</span></div><button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/60 text-on-surface-variant hover:text-primary hover:bg-surface-container font-label-sm text-label-sm font-medium transition-all" type="button" onClick={() => openChat()}><span className="material-symbols-outlined text-[16px]">support_agent</span><span>Bantuan</span></button><button onClick={() => showToast('Semua notifikasi pengurusan berkas telah dibaca.', 'info')} className="relative w-9 h-9 rounded-lg border border-outline-variant/60 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all" type="button"><span className="material-symbols-outlined text-[20px]">notifications</span><span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error"></span></button><span className="h-6 w-px bg-outline-variant/60"></span><div className="flex items-center gap-3 pl-1"><div className="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-container font-headline-sm text-sm font-bold flex items-center justify-center ring-2 ring-surface-container-high">A</div><div className="text-left"><div className="font-label-md text-label-md font-semibold text-primary leading-tight">Ayu Contoh</div><div className="font-caption text-caption text-on-surface-variant">Warga Terdaftar</div></div></div></div></header>
{/*  MAIN SCROLLABLE BODY  */}
<main className="flex-1 min-h-0 overflow-y-auto p-8 w-full space-y-6">
{/*  DASHBOARD HEADER  */}
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
<div>
<h2 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">Selamat datang kembali, Ayu</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">Lanjutkan langkah yang belum selesai untuk mempermudah proses di loket atau kanal resmi.</p>
</div>
<button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-on-primary hover:bg-[#1357B0] transition-all font-label-md text-label-md font-semibold shadow-sm active:scale-95" type="button" onClick={() => navigate("/persiapan/data")}>
<span className="material-symbols-outlined text-[18px]">add_circle</span>
<span>Mulai Pengurusan Baru</span>
</button>
</div>
{/*  TOP ACTION & STATUS HIGHLIGHT (Hero / Priority Section)  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
{/*  Prominent Next-Action Banner (8 cols)  */}
<div className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-[#FDE68A] p-6 shadow-[0px_1px_3px_rgba(20,44,75,0.04),0px_4px_8px_rgba(20,44,75,0.02)] relative overflow-hidden flex flex-col justify-between">
<div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#D97706]"></div>
<div>
<div className="flex items-center justify-between gap-3 mb-2.5">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[14px]">warning</span>
                Perlu Tindakan Anda · Simulasi
              </span>
<span className="font-caption text-caption text-on-surface-variant">Pemeriksaan terakhir: 28 Oktober 2026, 09:15 WIB</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-bold text-primary mb-2">Ada berkas yang perlu kamu perbaiki</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
<strong>Layanan: Akta Kelahiran (contoh)</strong> · Ditemukan 2 temuan pada Surat Keterangan Lahir &amp; Buku Nikah yang dapat memperlambat verifikasi di loket instansi resmi.
            </p>
</div>
<div className="flex flex-wrap items-center gap-3 pt-3 border-t border-outline-variant/30">
<button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-on-primary hover:bg-[#1357B0] transition-colors font-label-md text-label-md font-medium shadow-sm" type="button" onClick={() => navigate("/persiapan/pemeriksaan")}>
<span className="material-symbols-outlined text-[18px]">visibility</span>
<span>Lihat Hasil Pemeriksaan</span>
</button>
<button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-primary hover:bg-surface-container-low transition-colors font-label-md text-label-md font-medium" type="button" onClick={() => navigate("/persiapan/dokumen")}>
<span className="material-symbols-outlined text-[18px]">upload_file</span>
<span>Unggah Berkas Pengganti</span>
</button>
</div>
</div>
{/*  Restrained Compact Summary Widget (4 cols)  */}
<div className="lg:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-6 shadow-[0px_1px_3px_rgba(20,44,75,0.04)] flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-4">
<h4 className="font-title-md text-title-md font-bold text-primary">Ringkasan Pribadi</h4>
<span className="material-symbols-outlined text-outline text-[18px]">lock</span>
</div>
<div className="space-y-3.5"><div className="p-3 rounded-lg bg-surface-container-low/70 border border-outline-variant/40"><div className="font-label-md text-label-md font-semibold text-primary mb-1">Rujukan Peraturan</div><p className="font-caption text-caption text-on-surface-variant">Sumber resmi belum ditautkan pada contoh simulasi.</p></div><div className="p-3 rounded-lg bg-surface-container-low/70 border border-outline-variant/40"><div className="font-label-md text-label-md font-semibold text-primary">Biaya Pelayanan</div><div className="font-caption text-caption text-on-surface-variant mt-1">Belum diverifikasi — contoh simulasi.</div></div><div className="p-3 rounded-lg bg-surface-container-low/70 border border-outline-variant/40"><div className="font-label-md text-label-md font-semibold text-primary">Standar Waktu Layanan</div><div className="font-caption text-caption text-on-surface-variant mt-1">Belum diverifikasi — contoh simulasi.</div></div></div>
</div>
<div className="pt-4 mt-3 border-t border-outline-variant/30 flex items-center gap-2 text-on-surface-variant font-caption text-caption"><span className="material-symbols-outlined text-[16px] text-secondary">shield</span><span>Kelola persiapan dan dokumenmu dari akun ini · <a className="underline hover:text-primary" href="#/dashboard">Privasi</a></span></div>
</div>
</div>
{/*  MAIN CONTENT AREA (2-column layout: 8/12 and 4/12)  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
{/*  LEFT COLUMN (8 cols)  */}
<div className="lg:col-span-8 space-y-6">
{/*  Section 'Persiapan Saya'  */}
<section className="space-y-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2.5">
<h3 className="font-title-md text-title-md font-bold text-primary">Persiapan Saya</h3>
<span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/10 text-secondary border border-secondary/20">2 Draf Aktif</span>
</div>
<button
  type="button"
  onClick={() => navigate('/pelacakan')}
  className="font-label-md text-label-md text-secondary hover:underline font-medium inline-flex items-center gap-1"
>
  <span>Kelola Semua</span>
  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
{/*  Card 1: Akta Kelahiran (contoh)  */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 shadow-[0px_1px_3px_rgba(20,44,75,0.04)] hover:border-outline transition-all">
<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
<div>
<div className="flex items-center gap-2 mb-1">
<span className="font-caption text-caption text-[#087F8C] font-medium bg-[#087F8C]/10 px-2 py-0.5 rounded">Disdukcapil (contoh) · Kota Contoh</span>
<span className="font-caption text-caption text-on-surface-variant">Diperbarui: Hari ini, 09:15 WIB</span>
</div>
<h4 className="font-headline-sm text-[18px] font-bold text-primary">Akta Kelahiran (contoh)</h4>
</div>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] font-label-sm text-label-sm font-semibold whitespace-nowrap self-start">
<span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                  Perlu diperiksa ulang
                </span>
</div>
{/*  Progress bar  */}
<div className="space-y-1.5 mb-3.5">
<div className="flex items-center justify-between text-body-sm font-body-sm">
<span className="text-on-surface-variant">Kesiapan berkas 65% (3 dari 4 berkas siap)</span>
<span className="font-semibold text-primary">65%</span>
</div>
<div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
<div className="bg-secondary h-full rounded-full transition-all" style={{ width: '65%' }}></div>
</div>
</div>
{/*  Findings Box  */}
<div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 flex items-start gap-2.5 mb-4">
<span className="material-symbols-outlined text-[18px] text-[#D97706] flex-shrink-0 mt-0.5">report_problem</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">
<strong>Catatan temuan:</strong> 1 ketidaksesuaian ejaan nama pada Surat Keterangan Lahir, 1 foto Buku Nikah buram.
                </p>
</div>
{/*  Actions  */}
<div className="flex items-center justify-between gap-3 pt-3 border-t border-outline-variant/30">
<button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-on-primary hover:bg-[#1357B0] transition-colors font-label-md text-label-md font-medium shadow-sm" type="button" onClick={() => navigate("/persiapan/pemeriksaan")}>
<span className="material-symbols-outlined text-[17px]">edit_note</span>
<span>Lanjutkan Pemeriksaan</span>
</button>
<button className="px-3.5 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors font-label-md text-label-md font-medium" type="button" onClick={() => navigate("/persiapan/data")}>
                  Detail Draf
                </button>
</div>
</div>
{/*  Card 2: Kartu Keluarga (KK) (contoh)  */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 shadow-[0px_1px_3px_rgba(20,44,75,0.04)] hover:border-outline transition-all">
<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
<div>
<div className="flex items-center gap-2 mb-1">
<span className="font-caption text-caption text-[#087F8C] font-medium bg-[#087F8C]/10 px-2 py-0.5 rounded">Pembaruan Data Keluarga · Disdukcapil (contoh)</span>
<span className="font-caption text-caption text-on-surface-variant">Diperbarui: Kemarin, 14:20 WIB</span>
</div>
<h4 className="font-headline-sm text-[18px] font-bold text-primary">Kartu Keluarga (KK) (contoh)</h4>
</div>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low text-secondary border border-secondary-container/40 font-label-sm text-label-sm font-semibold whitespace-nowrap self-start">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  Draf Persiapan
                </span>
</div>
{/*  Progress bar  */}
<div className="space-y-1.5 mb-3.5">
<div className="flex items-center justify-between text-body-sm font-body-sm">
<span className="text-on-surface-variant">Kesiapan berkas 40% (2 dokumen terunggah)</span>
<span className="font-semibold text-primary">40%</span>
</div>
<div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
<div className="bg-[#087F8C] h-full rounded-full transition-all" style={{ width: '40%' }}></div>
</div>
</div>
{/*  Note  */}
<div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 flex items-start gap-2.5 mb-4">
<span className="material-symbols-outlined text-[18px] text-outline flex-shrink-0 mt-0.5">info</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">
                  Menunggu unggahan Surat Pengantar RT/RW atau SPTJM Kebenaran Data Keluarga.
                </p>
</div>
{/*  Actions  */}
<div className="flex items-center justify-between gap-3 pt-3 border-t border-outline-variant/30">
<button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-primary hover:bg-surface-container-low transition-colors font-label-md text-label-md font-medium" type="button" onClick={() => navigate("/persiapan/dokumen")}>
<span className="material-symbols-outlined text-[17px]">file_upload</span>
<span>Lanjutkan Draf</span>
</button>
<button className="px-3.5 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors font-label-md text-label-md font-medium" type="button" onClick={() => navigate("/persiapan/data")}>
                  Detail Draf
                </button>
</div>
</div>
</section>
{/*  Section 'Pengajuan Saya'  */}
<section className="space-y-4">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
<div>
<h3 className="font-title-md text-title-md font-bold text-primary">Pengajuan Saya</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">Catatan pribadi pelacakan berkas yang telah Anda ajukan ke instansi berwenang.</p>
</div>
</div>
{/*  Application Item Card  */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 shadow-[0px_1px_3px_rgba(20,44,75,0.04)]">
<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
<div>
<div className="flex items-center gap-2 mb-1">
<span className="font-caption text-caption text-secondary font-mono font-medium">ID Persiapan JejakMasWowo: JMW-DEMO-001</span>
</div>
<h4 className="font-title-md text-title-md font-bold text-primary">Pencatatan Peristiwa Kependudukan (Simulasi)</h4>
<div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
<strong>Nomor Registrasi Resmi:</strong> Belum dicatat (isi setelah menerima tanda terima loket)
                  </div>
</div>
<div className="text-right self-start">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/60 font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[13px]">person_pin</span>
                    Catatan warga — belum terkonfirmasi instansi
                  </span>
<div className="font-caption text-[11px] text-on-surface-variant/80 mt-1">Sumber: Catatan Mandiri Warga</div>
</div>
</div>
{/*  Timeline snippet  */}
<div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 flex items-center gap-3 mb-4"><span className="material-symbols-outlined text-secondary text-[20px]">history_toggle_off</span><p className="font-body-sm text-body-sm text-on-surface-variant"><strong>Status berkas:</strong> Berkas diserahkan ke loket kelurahan: 28 Okt 2026 · Menunggu verifikasi berkas fisik.</p></div>
{/*  Action buttons  */}
<div className="flex flex-wrap items-center gap-3 pt-3 border-t border-outline-variant/30">
<button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors font-label-md text-label-md font-medium shadow-sm" type="button" onClick={() => navigate("/pelacakan")}>
<span className="material-symbols-outlined text-[16px]">edit_calendar</span>
<span>Catat Nomor Resmi</span>
</button>
<button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-primary hover:bg-surface-container-low transition-colors font-label-md text-label-md font-medium" type="button" onClick={() => navigate("/pelacakan")}>
<span className="material-symbols-outlined text-[16px]">info</span>
<span>Lihat Detail Pengajuan</span>
</button>
</div>
</div>
</section>
</div>
{/*  RIGHT RAIL (Narrow column 4 cols)  */}
<div className="lg:col-span-4 space-y-6">
{/*  Notifikasi & Catatan Sistem  */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 shadow-[0px_1px_3px_rgba(20,44,75,0.04)]">
<div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/30">
<h4 className="font-title-md text-title-md font-bold text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-secondary">notifications_active</span>
                Notifikasi &amp; Catatan Sistem
              </h4>
<span className="font-caption text-caption text-secondary cursor-pointer hover:underline" onClick={() => showToast("Semua notifikasi ditandai dibaca.", "info")}>Tandai Baca</span>
</div>
<div className="space-y-4"><div className="flex items-start gap-3"><span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-1.5"></span><div className="space-y-0.5"><p className="font-body-sm text-body-sm text-primary font-medium"><strong>Pemeriksaan Berkas:</strong> Surat Keterangan Lahir terdeteksi ada perbedaan huruf nama ibu.</p><span className="font-caption text-caption text-on-surface-variant block">28 Okt 2026 · 09:15 WIB</span></div></div><div className="flex items-start gap-3"><span className="w-2 h-2 rounded-full bg-outline flex-shrink-0 mt-1.5"></span><div className="space-y-0.5"><p className="font-body-sm text-body-sm text-on-surface-variant"><strong>Pengingat:</strong> Pastikan membawa dokumen fisik asli saat verifikasi loket.</p><span className="font-caption text-caption text-on-surface-variant block">27 Okt 2026</span></div></div><div className="flex items-start gap-3"><span className="w-2 h-2 rounded-full bg-outline flex-shrink-0 mt-1.5"></span><div className="space-y-0.5"><p className="font-body-sm text-body-sm text-on-surface-variant"><strong>Format Dokumen:</strong> Foto KTP-el saksi harus jelas dan tidak terpotong sudutnya.</p><span className="font-caption text-caption text-on-surface-variant block">26 Okt 2026</span></div></div></div>
</div>
{/*  Panduan & Dasar Aturan (Kota Contoh · Simulasi)  */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 shadow-[0px_1px_3px_rgba(20,44,75,0.04)] space-y-3">
  <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
    <h4 className="font-title-md text-title-md font-bold text-primary flex items-center gap-2">
      <span className="material-symbols-outlined text-[18px] text-secondary">gavel</span>
      Dasar Regulasi &amp; Hak Warga
    </h4>
  </div>
  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
    Sesuai <strong>UU No. 24 Tahun 2013 Pasal 79A</strong>, seluruh pengurusan dan penerbitan dokumen kependudukan resmi tidak dipungut biaya (Rp 0).
  </p>
  <div className="pt-2 flex items-center justify-between text-caption text-caption border-t border-outline-variant/20">
    <span className="text-secondary font-medium">Permendagri No. 108/2019</span>
    <button
      type="button"
      onClick={() => navigate('/panduan')}
      className="text-secondary hover:text-primary font-semibold hover:underline inline-flex items-center gap-1"
    >
      <span>Lihat Rujukan</span>
      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
    </button>
  </div>
</div>
{/*  Quick Tip Card  */}
<div className="bg-primary-container text-on-primary rounded-xl p-5 shadow-sm space-y-2.5">
<div className="flex items-center gap-2 text-secondary-fixed">
<span className="material-symbols-outlined text-[20px]">lightbulb</span>
<span className="font-label-md text-label-md font-bold">Tips Pra-Loket</span>
</div>
<p className="font-body-sm text-body-sm text-on-primary-container leading-relaxed">
              Selalu gunakan format PDF atau JPG dengan resolusi minimal 300 DPI saat memindai berkas fisik agar lolos verifikasi berkas digital loket.
            </p>
</div>
</div>
</div>
{/*  COMPACT FOOTER WITHIN MAIN VIEW  */}
</main>
</div>
{/*  FLOATING HELP PILL (Bottom right, closed state)  */}

    </div>
  );
};
