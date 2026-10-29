import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast: _showToast } = useApp();

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed-variant">
      <div className="bg-[#142C4B] text-white px-6 py-2 flex items-center justify-between text-xs border-b border-[#233F66]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-purple-400">⚙️ Panel Administrator & Regulasi Adminduk:</span>
          <span>Kelola parameter OCR, threshold keyakinan, dan rujukan undang-undang</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded font-semibold text-white transition-colors"
          >
            Dasbor Warga
          </button>
          <button
            onClick={() => navigate('/petugas')}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded font-semibold text-white transition-colors"
          >
            Meja Petugas
          </button>
        </div>
      </div>

{/*  Top Prototype Disclaimer Banner  */}
<div className="w-[1280px] h-[1000px] flex overflow-hidden">
{/*  Desktop Admin Sidebar (250px)  */}
<aside className="w-[240px] h-[1000px] shrink-0 bg-primary-container text-on-primary flex flex-col justify-between border-r border-primary shadow-sm select-none">
<div>
{/*  Sidebar Brand Header  */}
<div className="p-5 border-b border-outline-variant/20">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-white shadow-sm">
<span className="material-symbols-outlined font-bold">verified_user</span>
</div>
<div>
<div className="font-headline-sm text-headline-sm font-bold tracking-tight text-white leading-tight">JejakMasWowo</div>
<div className="font-caption text-caption text-primary-fixed-dim leading-none mt-0.5">Admin &amp; Kurasi Aturan</div>
</div>
</div>
<div className="mt-3">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-tertiary-container/80 text-tertiary-fixed border border-tertiary-fixed/20">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
              STATUS PERAN: Admin Sistem (Simulasi)
            </span>
</div>
</div>
{/*  Navigation Menu  */}
<nav className="p-3 space-y-1">
<a className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-secondary text-white font-medium text-sm transition-all shadow-sm" href="#/admin">
<span className="material-symbols-outlined text-white">domain_verification</span>
<span>Layanan &amp; Wilayah</span>
</a>
<a className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-primary-fixed-dim hover:text-white hover:bg-white/5 font-medium text-sm transition-colors" href="#/admin">
<span className="material-symbols-outlined">menu_book</span>
<span>Sumber Informasi</span>
</a>
<a className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-primary-fixed-dim hover:text-white hover:bg-white/5 font-medium text-sm transition-colors" href="#/admin">
<span className="material-symbols-outlined">psychology_alt</span>
<span>Aturan Pemeriksaan AI</span>
</a>
<a className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-primary-fixed-dim hover:text-white hover:bg-white/5 font-medium text-sm transition-colors" href="#/admin">
<span className="material-symbols-outlined">manage_accounts</span>
<span>Akun Petugas</span>
</a>
<a className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-primary-fixed-dim hover:text-white hover:bg-white/5 font-medium text-sm transition-colors" href="#/admin">
<span className="material-symbols-outlined">receipt_long</span>
<span>Audit Rekam Jejak</span>
</a>
</nav>
</div>
{/*  Sidebar Footer Reminder Card  */}
<div className="p-4 border-t border-outline-variant/20">
<div className="p-3 rounded-lg bg-white/5 border border-white/10 text-primary-fixed-dim">
<div className="flex items-start gap-2 mb-1.5">
<span className="material-symbols-outlined text-secondary-fixed text-base shrink-0 mt-0.5">policy</span>
<div className="font-label-sm text-[12px] font-semibold text-white">Batasan Kewenangan Admin</div>
</div>
<p className="font-body-sm text-[11px] leading-relaxed text-inverse-primary/90">Admin mengelola panduan dan aturan kurasi, tidak memiliki akses tak terbatas ke draf pribadi warga.</p>
</div>
<div className="mt-3 text-center">
<span className="text-[10px] text-primary-fixed-dim/70 font-caption tracking-wider">LITERASI TATA KELOLA v2.4</span>
</div>
</div>
</aside>
{/*  Main Workspace Container  */}
<div className="w-[1040px] h-[1000px] flex flex-col min-w-0 bg-surface overflow-hidden">
{/*  Topbar Header  */}
<header className="h-[72px] shrink-0 bg-surface-container-lowest border-b border-outline-variant/40 px-6 flex items-center justify-between z-20">
{/*  Breadcrumbs  */}
<div className="flex items-center gap-2 text-sm">
<span className="text-on-surface-variant font-body-sm">Administrasi Layanan</span>
<span className="text-outline-variant font-caption">/</span>
<span className="text-on-surface-variant font-body-sm">Wilayah: Kota Contoh · Simulasi</span>
<span className="text-outline-variant font-caption">/</span>
<span className="text-on-surface-variant font-body-sm">Panduan Layanan</span>
<span className="text-outline-variant font-caption">/</span>
<span className="font-semibold text-primary font-title-md text-[14px]">Akta Kelahiran (contoh)</span>
</div>
{/*  Right User & Date Metadata  */}
<div className="flex items-center gap-4">
<div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full text-on-surface-variant text-xs border border-outline-variant/50">
<span className="material-symbols-outlined text-sm text-secondary">event</span>
<span className="font-label-sm">Tanggal Uji Coba: 28 Oktober 2026</span>
</div>
<div className="h-5 w-px bg-outline-variant/60"></div>
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs ring-2 ring-secondary/20">
              AD
            </div>
<div className="text-left">
<div className="font-label-md text-xs font-semibold text-primary leading-tight">Admin Literasi (Simulasi)</div>
<div className="font-caption text-[11px] text-on-surface-variant leading-none">ID: ADM-2026-09</div>
</div>
</div>
</div>
</header>
{/*  Main Body Content  */}
<main className="flex-1 min-h-0 overflow-y-auto p-8 w-full space-y-6">
{/*  Top Title & Version Control Header Section  */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-outline-variant/30">
<div>
<div className="flex items-center gap-3">
<h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Kelola panduan layanan</h1>
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-container/10 text-primary-container border border-primary-container/20">
                Akta Kelahiran · Kota Contoh · Simulasi
              </span>
</div>
<div className="flex items-center gap-2 mt-1.5">
<span className="material-symbols-outlined text-secondary text-sm">tune</span>
<p className="font-body-md text-on-surface-variant text-sm">Mode Penyuntingan Panduan &amp; Aturan Ilustratif</p>
</div>
</div>
{/*  Version Selector Chips  */}
<div className="flex items-center gap-2 bg-surface-container p-1.5 rounded-lg border border-outline-variant/60">
<button className="px-3 py-1.5 rounded-md text-xs font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Versi terbit: v1 (Aktif)
            </button>
<button className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-secondary shadow-sm border border-outline-variant/40 flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              Draf: v2 (Sedang diedit)
            </button>
</div>
</div>
{/*  Secondary Tab Navigation  */}
<div className="border-b border-outline-variant/50 flex gap-8">
<button className="pb-3 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-sm">info</span>
            Informasi Dasar
          </button>
<button className="pb-3 text-sm font-semibold text-secondary border-b-2 border-secondary flex items-center gap-2">
<span className="material-symbols-outlined text-sm">folder_open</span>
            Persyaratan &amp; Dokumen (Aktif)
          </button>
<button className="pb-3 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-sm">gavel</span>
            Sumber Regulasi Rujukan
          </button>
<button className="pb-3 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-sm">smart_toy</span>
            Aturan Pemeriksaan AI
          </button>
</div>
{/*  2-Column Workspace  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
{/*  MAIN EDITOR PANEL (Left Column - 65%)  */}
<div className="lg:col-span-8 space-y-6">
{/*  Metadata & Source Linkage Card  */}
<div className="bg-surface-container-lowest rounded-xl border border-[#DDE5EF] p-5 civic-card-shadow">
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary">link</span>
<h3 className="font-title-md text-title-md text-primary">Tautan &amp; Validasi Rujukan Resmi</h3>
</div>
{/*  Status Sumber Pill  */}
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300"><span className="material-symbols-outlined text-xs">warning</span>
                  Sumber resmi belum ditautkan pada contoh simulasi</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<div className="md:col-span-2">
<label className="block font-label-md text-xs text-primary font-semibold mb-1.5">
                    Tautan Sumber Formulir Resmi (Wajib untuk v2)
                  </label>
<div className="relative">
<input className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-[#DDE5EF] rounded-lg text-primary placeholder-[#8A9BA8] focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all font-body-sm italic" placeholder="Belum ditautkan — contoh simulasi (URL sumber resmi daerah belum diverifikasi)" readOnly type="text" value=""/>
<button className="absolute right-2 top-2 px-2.5 py-1 text-[11px] font-semibold bg-white border border-[#CBD7E6] text-primary rounded hover:bg-slate-100 transition-colors">
                      Hubungkan
                    </button>
</div>
</div>
<div>
<label className="block font-label-md text-xs text-primary font-semibold mb-1.5">
                    Tanggal Tinjauan Kurasi
                  </label>
<input className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-[#DDE5EF] rounded-lg text-primary font-medium font-body-sm" readOnly type="text" value="28 Oktober 2026"/>
</div>
</div>
{/*  Info Banner  */}
<div className="mt-4 p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
<span className="material-symbols-outlined text-amber-600 text-lg shrink-0 mt-0.5">priority_high</span>
<p className="font-body-sm text-xs leading-relaxed text-amber-900">
<span className="font-bold">Peringatan Kelengkapan:</span> Terdapat 1 dokumen persyaratan dengan rujukan belum terhubung. Panduan dapat dibaca tanpa akun oleh publik, namun versi baru memerlukan verifikasi tautan resmi sebelum dipublikasikan.
                </p>
</div>
</div>
{/*  Requirement & Rule Table Card  */}
<div className="bg-surface-container-lowest rounded-xl border border-[#DDE5EF] overflow-hidden civic-card-shadow">
<div className="p-5 border-b border-[#DDE5EF] flex items-center justify-between">
<div>
<h3 className="font-title-md text-title-md text-primary">Tabel Persyaratan &amp; Dokumen Contoh Ilustratif</h3>
<p className="font-body-sm text-xs text-on-surface-variant mt-0.5">Daftar aturan pengecekan mandiri dan pemenuhan rujukan standar publikasi.</p>
</div>
<span className="text-xs text-on-surface-variant font-label-sm bg-surface-container px-2.5 py-1 rounded-md">
                  4 Dokumen Terkonfigurasi
                </span>
</div>
{/*  Responsive Table  */}
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-slate-50/80 border-b border-[#DDE5EF] text-[11px] font-semibold text-primary uppercase tracking-wider font-label-sm">
<th className="py-3 px-4">Jenis Dokumen (Contoh)</th>
<th className="py-3 px-4">Kondisi Berkas</th>
<th className="py-3 px-4">Aturan Pemeriksaan Mandiri</th>
<th className="py-3 px-4">Status Verifikasi Sumber</th>
<th className="py-3 px-4 text-center">Aksi</th>
</tr>
</thead>
<tbody className="divide-y divide-[#DDE5EF] text-xs font-body-sm">
{/*  Row 1  */}
<tr className="hover:bg-slate-50/50 transition-colors">
<td className="py-3.5 px-4 font-semibold text-primary">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-base">description</span>
                          Surat Keterangan Lahir (contoh)
                        </div>
</td>
<td className="py-3.5 px-4 text-on-surface-variant">Kelahiran faskes/klinik</td>
<td className="py-3.5 px-4 text-primary font-medium">Cek kesesuaian ejaan nama anak &amp; cap stempel faskes</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
<span className="material-symbols-outlined text-xs">check_circle</span>
                          Lengkap (Tersedia draf rujukan contoh)
                        </span>
</td>
<td className="py-3.5 px-4 text-center">
<button className="px-2.5 py-1 text-xs font-semibold text-secondary hover:bg-secondary-fixed/30 rounded border border-secondary/30 transition-colors">
                          Ubah
                        </button>
</td>
</tr>
{/*  Row 2  */}
<tr className="hover:bg-slate-50/50 transition-colors">
<td className="py-3.5 px-4 font-semibold text-primary">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-base">import_contacts</span>
                          Buku Nikah / Akta Perkawinan (contoh)
                        </div>
</td>
<td className="py-3.5 px-4 text-on-surface-variant">Pencatatan pertama orang tua</td>
<td className="py-3.5 px-4 text-primary font-medium">Validasi nomor registrasi kutipan nikah</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
<span className="material-symbols-outlined text-xs">check_circle</span>
                          Lengkap (Tersedia rujukan contoh)
                        </span>
</td>
<td className="py-3.5 px-4 text-center">
<button className="px-2.5 py-1 text-xs font-semibold text-secondary hover:bg-secondary-fixed/30 rounded border border-secondary/30 transition-colors">
                          Ubah
                        </button>
</td>
</tr>
{/*  Row 3  */}
<tr className="hover:bg-slate-50/50 transition-colors">
<td className="py-3.5 px-4 font-semibold text-primary">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-base">badge</span>
                          Kartu Keluarga (KK) (contoh)
                        </div>
</td>
<td className="py-3.5 px-4 text-on-surface-variant">Penambahan anggota keluarga baru</td>
<td className="py-3.5 px-4 text-primary font-medium">Pengecekan NIK orang tua &amp; alamat terdaftar</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
<span className="material-symbols-outlined text-xs">check_circle</span>
                          Lengkap (Tersedia rujukan contoh)
                        </span>
</td>
<td className="py-3.5 px-4 text-center">
<button className="px-2.5 py-1 text-xs font-semibold text-secondary hover:bg-secondary-fixed/30 rounded border border-secondary/30 transition-colors">
                          Ubah
                        </button>
</td>
</tr>
{/*  Row 4 (Warning State)  */}
<tr className="bg-amber-50/30 hover:bg-amber-50/50 transition-colors">
<td className="py-3.5 px-4 font-semibold text-primary">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-amber-600 text-base">assignment_late</span>
                          Surat Pengantar RT/RW (contoh)
                        </div>
</td>
<td className="py-3.5 px-4 text-on-surface-variant">Kondisi domisili luar faskes</td>
<td className="py-3.5 px-4 text-primary font-medium">Pemeriksaan tanda tangan basah &amp; kelengkapan kop surat</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
<span className="material-symbols-outlined text-xs">error</span>
                          Sumber Belum Ditautkan (Perlu Tinjauan)
                        </span>
</td>
<td className="py-3.5 px-4 text-center">
<button className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-100/60 hover:bg-amber-200/80 rounded border border-amber-300 transition-colors">
                          Tautkan Sumber
                        </button>
</td>
</tr>
</tbody>
</table>
</div>
{/*  Table Footer Button  */}
<div className="p-3.5 bg-slate-50 border-t border-[#DDE5EF] flex justify-between items-center">
<span className="text-xs text-on-surface-variant font-body-sm italic">
                  Menampilkan konfigurasi parameter per 28 Okt 2026.
                </span>
<button className="px-3.5 py-2 rounded-lg border border-[#DDE5EF] bg-white text-primary text-xs font-semibold hover:bg-slate-100 flex items-center gap-2 transition-all shadow-sm">
<span className="material-symbols-outlined text-sm font-bold text-secondary">add</span>
                  + Tambah Dokumen Persyaratan Ilustratif
                </button>
</div>
</div>
{/*  Historical Policy Rule Callout  */}
<div className="rounded-xl border border-secondary/30 bg-blue-50/60 p-4.5 flex items-start gap-3.5">
<div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center shrink-0 mt-0.5 text-secondary">
<span className="material-symbols-outlined text-lg">history_edu</span>
</div>
<div>
<h4 className="font-title-md text-xs font-bold text-primary">Integritas Riwayat Versi &amp; Proses Warga</h4>
<p className="font-body-sm text-xs leading-relaxed text-on-surface-variant mt-0.5">
                  Hasil lama tetap mengacu pada versi aturan sebelumnya. Pengajuan warga yang sedang berjalan (v1) tidak akan terdampak perubahan draf v2 sebelum versi ini diterbitkan secara resmi.
                </p>
</div>
</div>
{/*  Recent Audit Log Row  */}
<div className="p-4 rounded-xl bg-surface-container-lowest border border-[#DDE5EF] flex items-center justify-between gap-4 text-xs font-body-sm civic-card-shadow">
<div className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-outline text-lg">shield_with_heart</span>
<div>
<span className="font-bold text-primary">Audit Rekam Jejak Terakhir (Tanpa Data Pribadi Warga):</span>
<span className="text-on-surface-variant ml-1">Admin Literasi (Simulasi) memperbarui draf aturan pada 28 Oktober 2026, 11:20 WIB</span>
</div>
</div>
<span className="px-2.5 py-1 bg-surface-container rounded font-mono text-[11px] text-primary font-medium shrink-0 border border-outline-variant/40">
                ID Audit: ADM-JMW-20261028-041
              </span>
</div>
</div>
{/*  RIGHT WORKFLOW & PUBLISHING PANEL (Right Column - 35%)  */}
<div className="lg:col-span-4 space-y-6">
{/*  Workflow Stepper Card  */}
<div className="bg-surface-container-lowest rounded-xl border border-[#DDE5EF] p-5 civic-card-shadow">
<div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DDE5EF]">
<h3 className="font-title-md text-title-md text-primary">Alur Penerbitan Panduan</h3>
<span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-secondary"><span className="material-symbols-outlined text-xs">warning</span>
                  Sumber resmi belum ditautkan pada contoh simulasi</span>
</div>
{/*  Linear Stepper Stages  */}
<div className="space-y-4 relative pl-3">
{/*  Vertical Progress Line  */}
<div className="absolute left-6 top-3 bottom-3 w-0.5 bg-emerald-500/40 -z-0"></div>
{/*  Stage 1: Draf  */}
<div className="flex items-start gap-3 relative z-10">
<div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 ring-4 ring-white shadow-sm">
<span className="material-symbols-outlined text-sm font-bold">check</span>
</div>
<div>
<div className="font-label-md text-xs font-bold text-primary">1. Draf (Sedang Aktif)</div>
<div className="font-body-sm text-[11px] text-on-surface-variant">Struktur awal berhasil disunting.</div>
</div>
</div>
{/*  Stage 2: Uji Sintetis  */}
<div className="flex items-start gap-3 relative z-10">
<div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 ring-4 ring-white shadow-sm">
<span className="material-symbols-outlined text-sm font-bold">check</span>
</div>
<div>
<div className="font-label-md text-xs font-bold text-primary">2. Uji Contoh Sintetis</div>
<div className="font-body-sm text-[11px] text-on-surface-variant">Simulasi 12 sampel berkas berhasil lulus uji.</div>
</div>
</div>
{/*  Stage 3: Tinjau Kelengkapan Rujukan (In Progress)  */}
<div className="flex items-start gap-3 relative z-10">
<div className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center shrink-0 ring-4 ring-blue-100 shadow-sm animate-pulse">
<span className="material-symbols-outlined text-sm">hourglass_top</span>
</div>
<div>
<div className="font-label-md text-xs font-bold text-secondary">3. Tinjau Kelengkapan Rujukan</div>
<div className="font-body-sm text-[11px] text-amber-700 font-medium">1 rujukan dokumen belum tertaut.</div>
</div>
</div>
{/*  Stage 4: Publikasikan Versi (Locked)  */}
<div className="flex items-start gap-3 relative z-10">
<div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 ring-4 ring-white">
<span className="material-symbols-outlined text-sm">lock</span>
</div>
<div>
<div className="font-label-md text-xs font-semibold text-slate-400">4. Publikasikan Versi</div>
<div className="font-body-sm text-[11px] text-slate-400">Menunggu seluruh kriteria terpenuhi.</div>
</div>
</div>
</div>
{/*  Status Validasi Box  */}
<div className="mt-6 pt-4 border-t border-[#DDE5EF] space-y-2.5">
<div className="text-xs font-semibold text-primary font-label-md">Status Validasi Syarat Terbit:</div>
<div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
<span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
<span>Uji coba OCR pada data sintetis: <strong>Berhasil</strong></span>
</div>
<div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
<span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
<span>Skema penamaan konsisten dengan template formulir: <strong>Lolos</strong></span>
</div>
<div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
<span className="material-symbols-outlined text-amber-600 text-base shrink-0 mt-0.5">warning</span>
<span><strong>1 sumber rujukan belum terverifikasi</strong> / belum ditautkan ke portal resmi.</span>
</div>
</div>
{/*  Publishing Actions  */}
<div className="mt-6 pt-4 border-t border-[#DDE5EF] space-y-2.5">
<div className="grid grid-cols-2 gap-2">
<button className="w-full py-2 px-3 text-xs font-semibold text-primary bg-white hover:bg-slate-50 border border-[#CBD7E6] rounded-lg transition-colors shadow-sm">
                    Simpan Draf
                  </button>
<button className="w-full py-2 px-3 text-xs font-semibold text-primary bg-white hover:bg-slate-50 border border-[#CBD7E6] rounded-lg transition-colors shadow-sm">
                    Pratinjau Tampilan Warga
                  </button>
</div>
<div className="relative group">
<button className="w-full py-2.5 px-4 text-xs font-bold text-slate-400 bg-slate-200 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 border border-slate-300" disabled>
<span className="material-symbols-outlined text-base">lock</span>
                    Publikasikan Versi v2
                  </button>
<div className="mt-1.5 text-center text-[11px] text-amber-800 font-caption bg-amber-50/80 p-1.5 rounded border border-amber-200/60">
                    Tombol nonaktif hingga seluruh sumber rujukan yang diwajibkan diverifikasi.
                  </div>
</div>
</div>
</div>
{/*  Disclaimer & Integrity Card  */}
<div className="bg-surface-container-low rounded-xl border border-secondary-fixed-dim/60 p-4.5 civic-card-shadow">
<div className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-secondary text-lg mt-0.5">verified</span>
<div>
<h4 className="font-title-md text-xs font-bold text-primary">Catatan Integritas Independen</h4>
<p className="font-body-sm text-[12px] leading-relaxed text-on-surface-variant mt-1">
                    JejakMasWowo bukan portal resmi pemerintah. Data regulasi dan panduan dikurasi secara independen untuk keperluan pengujian antarmuka dan literasi tata kelola berkas warga.
                  </p>
</div>
</div>
</div>
</div>
</div>
</main>
{/*  Standard Prototype Footer  */}
</div>
</div>

    </div>
  );
};
