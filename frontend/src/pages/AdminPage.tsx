import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [activeVersion, setActiveVersion] = useState<'v1' | 'v2'>('v2');
  const [activeTab, setActiveTab] = useState<'info' | 'persyaratan' | 'regulasi' | 'ai' | 'petugas' | 'audit'>('persyaratan');
  const [isSourceLinked, setIsSourceLinked] = useState<boolean>(false);
  const [sourceUrl, setSourceUrl] = useState<string>('');

  const handleLinkSource = () => {
    setIsSourceLinked(true);
    setSourceUrl('https://layanan.dukcapil.kemendagri.go.id/akta-kelahiran');
    showToast('Tautan rujukan resmi berhasil diverifikasi & terhubung ke Draf v2!', 'success');
  };

  const handleSaveDraft = () => {
    showToast('Konfigurasi draf panduan layanan berhasil disimpan ke basis data!', 'success');
  };

  const handlePublish = () => {
    if (!isSourceLinked) {
      showToast('Wajib menautkan sumber rujukan resmi sebelum publikasi!', 'error');
      return;
    }
    setActiveVersion('v1');
    showToast('Versi v2 berhasil dipublikasikan menjadi versi aktif!', 'success');
  };

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
<div className="w-full flex min-h-screen">
{/*  Desktop Admin Sidebar (240px, Mobile: hidden)  */}
<aside className="hidden md:flex w-[240px] shrink-0 bg-primary-container min-h-screen text-on-primary flex-col justify-between border-r border-primary shadow-sm select-none">
<div>
{/*  Sidebar Brand Header  */}
<div className="p-5 border-b border-outline-variant/20">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-white shadow-sm">
<span className="material-symbols-outlined font-bold">verified_user</span>
</div>
<div>
<div className="font-headline-sm text-headline-sm font-black tracking-tight text-white leading-tight">DaftarIn</div>
<div className="font-caption text-[10px] text-sky-200 uppercase font-semibold leading-none mt-0.5">JejakMasWowo · Admin Regulasi</div>
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
<button
  onClick={() => { setActiveTab('info'); showToast('Membuka Informasi Layanan & Wilayah.', 'info'); }}
  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all text-left ${activeTab === 'info' ? 'bg-secondary text-white shadow-sm' : 'text-primary-fixed-dim hover:text-white hover:bg-white/5'}`}
  type="button"
>
  <span className="material-symbols-outlined text-[20px]">domain_verification</span>
  <span>Layanan &amp; Wilayah</span>
</button>
<button
  onClick={() => { setActiveTab('persyaratan'); showToast('Membuka Persyaratan & Dokumen Layanan.', 'info'); }}
  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all text-left ${activeTab === 'persyaratan' ? 'bg-secondary text-white shadow-sm' : 'text-primary-fixed-dim hover:text-white hover:bg-white/5'}`}
  type="button"
>
  <span className="material-symbols-outlined text-[20px]">folder_open</span>
  <span>Persyaratan &amp; Dokumen</span>
</button>
<button
  onClick={() => { setActiveTab('regulasi'); showToast('Membuka Sumber Informasi & Regulasi.', 'info'); }}
  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all text-left ${activeTab === 'regulasi' ? 'bg-secondary text-white shadow-sm' : 'text-primary-fixed-dim hover:text-white hover:bg-white/5'}`}
  type="button"
>
  <span className="material-symbols-outlined text-[20px]">menu_book</span>
  <span>Sumber Informasi</span>
</button>
<button
  onClick={() => { setActiveTab('ai'); showToast('Membuka Aturan Pemeriksaan AI & Ambang Batas.', 'info'); }}
  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all text-left ${activeTab === 'ai' ? 'bg-secondary text-white shadow-sm' : 'text-primary-fixed-dim hover:text-white hover:bg-white/5'}`}
  type="button"
>
  <span className="material-symbols-outlined text-[20px]">psychology_alt</span>
  <span>Aturan Pemeriksaan AI</span>
</button>
<button
  onClick={() => { setActiveTab('petugas'); showToast('Membuka Manajemen Akun Petugas Loket.', 'info'); }}
  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all text-left ${activeTab === 'petugas' ? 'bg-secondary text-white shadow-sm' : 'text-primary-fixed-dim hover:text-white hover:bg-white/5'}`}
  type="button"
>
  <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
  <span>Akun Petugas</span>
</button>
<button
  onClick={() => { setActiveTab('audit'); showToast('Membuka Audit Rekam Jejak Sistem.', 'info'); }}
  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all text-left ${activeTab === 'audit' ? 'bg-secondary text-white shadow-sm' : 'text-primary-fixed-dim hover:text-white hover:bg-white/5'}`}
  type="button"
>
  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
  <span>Audit Rekam Jejak</span>
</button>
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
<div className="flex-1 flex flex-col min-w-0 min-h-screen bg-surface overflow-x-hidden">
{/*  Topbar Header  */}
<header className="h-[72px] shrink-0 bg-surface-container-lowest border-b border-outline-variant/40 px-4 sm:px-6 flex items-center justify-between z-20 overflow-x-auto">
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
<main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 w-full space-y-6">
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
<button onClick={() => { setActiveVersion('v1'); showToast('Beralih ke tampilan Versi Terbit (v1 Aktif).', 'info'); }} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${activeVersion === 'v1' ? 'bg-white text-primary shadow-sm border border-outline-variant/40' : 'text-on-surface-variant hover:text-primary'}`} type="button">
<span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Versi terbit: v1 (Aktif)
            </button>
<button onClick={() => { setActiveVersion('v2'); showToast('Beralih ke mode penyuntingan Draf (v2).', 'info'); }} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${activeVersion === 'v2' ? 'bg-white text-secondary shadow-sm border border-outline-variant/40' : 'text-on-surface-variant hover:text-primary'}`} type="button">
<span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              Draf: v2 (Sedang diedit)
            </button>
</div>
</div>
{/*  Secondary Tab Navigation  */}
<div className="border-b border-outline-variant/50 flex gap-4 sm:gap-8 overflow-x-auto pb-1">
<button onClick={() => setActiveTab('info')} className={`pb-3 text-sm flex items-center gap-2 transition-colors ${activeTab === 'info' ? 'font-semibold text-secondary border-b-2 border-secondary' : 'font-medium text-on-surface-variant hover:text-primary'}`} type="button">
<span className="material-symbols-outlined text-sm">info</span>
            Informasi Dasar
          </button>
<button onClick={() => setActiveTab('persyaratan')} className={`pb-3 text-sm flex items-center gap-2 transition-colors ${activeTab === 'persyaratan' ? 'font-semibold text-secondary border-b-2 border-secondary' : 'font-medium text-on-surface-variant hover:text-primary'}`} type="button">
<span className="material-symbols-outlined text-sm">folder_open</span>
            Persyaratan &amp; Dokumen
          </button>
<button onClick={() => setActiveTab('regulasi')} className={`pb-3 text-sm flex items-center gap-2 transition-colors ${activeTab === 'regulasi' ? 'font-semibold text-secondary border-b-2 border-secondary' : 'font-medium text-on-surface-variant hover:text-primary'}`} type="button">
<span className="material-symbols-outlined text-sm">gavel</span>
            Sumber Regulasi Rujukan
          </button>
<button onClick={() => setActiveTab('ai')} className={`pb-3 text-sm flex items-center gap-2 transition-colors ${activeTab === 'ai' ? 'font-semibold text-secondary border-b-2 border-secondary' : 'font-medium text-on-surface-variant hover:text-primary'}`} type="button">
<span className="material-symbols-outlined text-sm">smart_toy</span>
            Aturan Pemeriksaan AI
          </button>
<button onClick={() => setActiveTab('petugas')} className={`pb-3 text-sm flex items-center gap-2 transition-colors ${activeTab === 'petugas' ? 'font-semibold text-secondary border-b-2 border-secondary' : 'font-medium text-on-surface-variant hover:text-primary'}`} type="button">
<span className="material-symbols-outlined text-sm">manage_accounts</span>
            Akun Petugas
          </button>
<button onClick={() => setActiveTab('audit')} className={`pb-3 text-sm flex items-center gap-2 transition-colors ${activeTab === 'audit' ? 'font-semibold text-secondary border-b-2 border-secondary' : 'font-medium text-on-surface-variant hover:text-primary'}`} type="button">
<span className="material-symbols-outlined text-sm">receipt_long</span>
            Audit Rekam Jejak
          </button>
</div>
{/*  2-Column Workspace  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
{/*  MAIN EDITOR PANEL (Left Column - 65%)  */}
<div className="lg:col-span-8 space-y-6">

{/* TAB 1: INFORMASI DASAR */}
{activeTab === 'info' && (
  <div className="bg-surface-container-lowest rounded-xl border border-[#DDE5EF] p-6 civic-card-shadow space-y-5">
    <div className="flex items-center gap-2 pb-3 border-b border-[#DDE5EF]">
      <span className="material-symbols-outlined text-secondary text-2xl">info</span>
      <h3 className="font-title-md text-base font-bold text-primary">Informasi Layanan &amp; Kebijakan Pelayanan Warga</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
      <div>
        <label className="block font-bold text-primary mb-1">Nama Layanan Publik</label>
        <input type="text" readOnly value="Penerbitan Akta Kelahiran Baru" className="w-full h-10 px-3 bg-slate-50 border border-[#CBD7E6] rounded-lg font-semibold text-primary" />
      </div>
      <div>
        <label className="block font-bold text-primary mb-1">Kode Identifikasi Standar (SIAK)</label>
        <input type="text" readOnly value="SIAK-LAK-2026-001" className="w-full h-10 px-3 bg-slate-50 border border-[#CBD7E6] rounded-lg font-mono text-primary" />
      </div>
      <div>
        <label className="block font-bold text-primary mb-1">Instansi Pembina Teknis</label>
        <input type="text" readOnly value="Dinas Kependudukan dan Pencatatan Sipil" className="w-full h-10 px-3 bg-slate-50 border border-[#CBD7E6] rounded-lg text-primary" />
      </div>
      <div>
        <label className="block font-bold text-primary mb-1">Standar Waktu Penyelesaian (SLA)</label>
        <input type="text" readOnly value="1 - 3 Hari Kerja Sejak Berkas Diverifikasi" className="w-full h-10 px-3 bg-slate-50 border border-[#CBD7E6] rounded-lg text-primary" />
      </div>
      <div className="md:col-span-2">
        <label className="block font-bold text-primary mb-1">Tarif Retribusi / Biaya Resmi</label>
        <input type="text" readOnly value="Rp 0 (100% Gratis - UU No. 24/2013 Pasal 79A)" className="w-full h-10 px-3 bg-emerald-50 border border-emerald-200 font-bold text-emerald-800 rounded-lg" />
      </div>
      <div className="md:col-span-2">
        <label className="block font-bold text-primary mb-1">Deskripsi Ringkas Layanan untuk Warga</label>
        <textarea rows={3} readOnly value="Panduan persiapan mandiri dokumen pelaporan kelahiran anak sebelum diajukan ke dinas atau loket kecamatan. Membantu warga memeriksa kelengkapan draf agar proses pengajuan tidak tertolak akibat berkas tercecer atau salah ejaan nama." className="w-full p-3 bg-slate-50 border border-[#CBD7E6] rounded-lg text-primary leading-relaxed" />
      </div>
    </div>
  </div>
)}

{/* TAB 3: REGULASI RUJUKAN */}
{activeTab === 'regulasi' && (
  <div className="bg-surface-container-lowest rounded-xl border border-[#DDE5EF] p-6 civic-card-shadow space-y-5">
    <div className="flex items-center gap-2 pb-3 border-b border-[#DDE5EF]">
      <span className="material-symbols-outlined text-secondary text-2xl">gavel</span>
      <h3 className="font-title-md text-base font-bold text-primary">Dasar Hukum &amp; Payung Regulasi Resmi</h3>
    </div>
    <div className="space-y-3 font-sans text-xs">
      <div className="p-4 bg-slate-50 border border-[#CBD7E6] rounded-xl flex items-start gap-3">
        <span className="material-symbols-outlined text-secondary text-xl mt-0.5">menu_book</span>
        <div>
          <div className="font-bold text-sm text-[#142C4B]">Undang-Undang No. 24 Tahun 2013</div>
          <div className="text-slate-600 mt-1">Perubahan atas UU No. 23 Tahun 2006 tentang Administrasi Kependudukan. Menetapkan bahwa pengurusan dan penerbitan dokumen kependudukan tidak dipungut biaya (Rp 0 / Gratis).</div>
        </div>
      </div>
      <div className="p-4 bg-slate-50 border border-[#CBD7E6] rounded-xl flex items-start gap-3">
        <span className="material-symbols-outlined text-secondary text-xl mt-0.5">menu_book</span>
        <div>
          <div className="font-bold text-sm text-[#142C4B]">Peraturan Presiden No. 96 Tahun 2018</div>
          <div className="text-slate-600 mt-1">Persyaratan dan Tata Cara Pendaftaran Penduduk dan Pencatatan Sipil. Menyederhanakan berkas dengan penghapusan surat pengantar RT/RW untuk penerbitan akta kelahiran.</div>
        </div>
      </div>
      <div className="p-4 bg-slate-50 border border-[#CBD7E6] rounded-xl flex items-start gap-3">
        <span className="material-symbols-outlined text-secondary text-xl mt-0.5">menu_book</span>
        <div>
          <div className="font-bold text-sm text-[#142C4B]">Permendagri No. 108 &amp; 109 Tahun 2019</div>
          <div className="text-slate-600 mt-1">Standar formulir, format blangko kertas putih HVS 80gr ber-barcode TTE BSrE, dan mekanisme Surat Pernyataan Tanggung Jawab Mutlak (SPTJM).</div>
        </div>
      </div>
    </div>
  </div>
)}

{/* TAB 4: ATURAN PEMERIKSAAN AI */}
{activeTab === 'ai' && (
  <div className="bg-surface-container-lowest rounded-xl border border-[#DDE5EF] p-6 civic-card-shadow space-y-5">
    <div className="flex items-center gap-2 pb-3 border-b border-[#DDE5EF]">
      <span className="material-symbols-outlined text-secondary text-2xl">smart_toy</span>
      <h3 className="font-title-md text-base font-bold text-primary">Konfigurasi Mesin OCR &amp; Kebijakan Audit Otomatis</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
      <div className="p-4 bg-slate-50 border border-[#CBD7E6] rounded-xl space-y-2">
        <div className="font-bold text-primary flex items-center justify-between">
          <span>Threshold Keyakinan OCR (Confidence)</span>
          <span className="px-2 py-0.5 bg-blue-100 text-secondary rounded font-mono font-bold">85%</span>
        </div>
        <p className="text-slate-600">Batas toleransi kepastian teks. Jika keyakinan kata di bawah 85%, sistem menandai temuan sebagai "Perlu Perhatian Pemohon".</p>
      </div>
      <div className="p-4 bg-slate-50 border border-[#CBD7E6] rounded-xl space-y-2">
        <div className="font-bold text-primary flex items-center justify-between">
          <span>Validasi NIK 16 Digit &amp; Kode Wilayah</span>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold">Aktif</span>
        </div>
        <p className="text-slate-600">Pemeriksaan struktur NIK: 2 digit provinsi, 2 digit kab/kota, 2 digit kecamatan, 6 digit tanggal lahir, 4 digit nomor urut.</p>
      </div>
      <div className="p-4 bg-slate-50 border border-[#CBD7E6] rounded-xl space-y-2">
        <div className="font-bold text-primary flex items-center justify-between">
          <span>Penyelarasan Ejaan Nama (Levenshtein &le; 1)</span>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold">Aktif</span>
        </div>
        <p className="text-slate-600">Mendeteksi ketidaksesuaian typo (contoh: Ayu Conto vs Ayu Contoh) dan memberikan saran koreksi mandiri [citizen_corrected].</p>
      </div>
      <div className="p-4 bg-slate-50 border border-[#CBD7E6] rounded-xl space-y-2">
        <div className="font-bold text-primary flex items-center justify-between">
          <span>Deteksi Cap &amp; Barcode Fisik Dokumen</span>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-mono font-bold">Warning Only</span>
        </div>
        <p className="text-slate-600">Mendeteksi stempel faskes basah atau barcode TTE. Mengeluarkan peringatan jika gambar buram atau terpotong saat dipindai.</p>
      </div>
    </div>
  </div>
)}

{/* TAB 2: PERSYARATAN & DOKUMEN (DEFAULT) */}
{activeTab === 'persyaratan' && (
<>
{/*  Metadata & Source Linkage Card  */}
<div className="bg-surface-container-lowest rounded-xl border border-[#DDE5EF] p-5 civic-card-shadow">
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary">link</span>
<h3 className="font-title-md text-title-md text-primary">Tautan &amp; Validasi Rujukan Resmi</h3>
</div>
{/*  Status Sumber Pill  */}
<span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
  isSourceLinked
    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
    : 'bg-amber-50 text-amber-700 border-amber-300'
}`}>
  <span className="material-symbols-outlined text-xs">{isSourceLinked ? 'verified' : 'warning'}</span>
  {isSourceLinked ? 'Sumber resmi terhubung: Portal Kemendagri' : 'Sumber resmi belum ditautkan pada contoh simulasi'}
</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<div className="md:col-span-2">
<label className="block font-label-md text-xs text-primary font-semibold mb-1.5">
                    Tautan Sumber Formulir Resmi (Wajib untuk v2)
                  </label>
<div className="relative">
<input className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-[#DDE5EF] rounded-lg text-primary placeholder-[#8A9BA8] focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all font-body-sm italic" placeholder="Belum ditautkan — contoh simulasi (URL sumber resmi daerah belum diverifikasi)" readOnly type="text" value={isSourceLinked ? (sourceUrl || 'https://layanan.dukcapil.kemendagri.go.id/akta-kelahiran') : ''}/>
<button onClick={handleLinkSource} className={`absolute right-2 top-2 px-2.5 py-1 text-[11px] font-semibold border rounded transition-colors shadow-xs ${isSourceLinked ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white text-primary border-[#CBD7E6] hover:bg-slate-100'}`} type="button">
  {isSourceLinked ? '✓ Terhubung' : 'Hubungkan'}
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
<button
  type="button"
  onClick={() => showToast('Membuka editor parameter Surat Keterangan Lahir.', 'info')}
  className="px-2.5 py-1 text-xs font-semibold text-secondary hover:bg-secondary-fixed/30 rounded border border-secondary/30 transition-colors"
>
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
<button
  type="button"
  onClick={() => showToast('Membuka editor parameter Buku Nikah / Kutipan Perkawinan.', 'info')}
  className="px-2.5 py-1 text-xs font-semibold text-secondary hover:bg-secondary-fixed/30 rounded border border-secondary/30 transition-colors"
>
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
<button
  type="button"
  onClick={() => showToast('Membuka editor parameter Kartu Keluarga (KK).', 'info')}
  className="px-2.5 py-1 text-xs font-semibold text-secondary hover:bg-secondary-fixed/30 rounded border border-secondary/30 transition-colors"
>
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
<button onClick={handleLinkSource} className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-100/60 hover:bg-amber-200/80 rounded border border-amber-300 transition-colors" type="button">
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
<button onClick={() => showToast('Dokumen persyaratan ilustratif baru berhasil ditambahkan ke draf konfigurasi v2.', 'success')} className="px-3.5 py-2 rounded-lg border border-[#DDE5EF] bg-white text-primary text-xs font-semibold hover:bg-slate-100 flex items-center gap-2 transition-all shadow-sm" type="button">
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
</>
)}

{/* TAB 5: AKUN PETUGAS VERIFIKASI */}
{activeTab === 'petugas' && (
  <div className="space-y-6">
    <div className="bg-surface-container-lowest rounded-xl border border-[#DDE5EF] p-6 civic-card-shadow space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDE5EF]">
        <div>
          <h3 className="font-title-md text-base font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">manage_accounts</span>
            <span>Manajemen Akun Petugas Loket &amp; Verifikator SIAK</span>
          </h3>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Otorisasi meja kerja pelayanan kependudukan terpadu. Verifikator hanya dapat memproses pengajuan yang dibagikan secara sah oleh warga pemohon.
          </p>
        </div>
        <button
          onClick={() => showToast('Formulir penambahan akun petugas baru dibuka.', 'info')}
          className="px-3.5 py-2 bg-secondary hover:bg-[#1257B0] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs self-start"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          <span>+ Tambah Petugas</span>
        </button>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-50 border border-[#CBD7E6] rounded-xl">
          <span className="text-on-surface-variant block text-[11px]">Total Petugas</span>
          <span className="text-lg font-bold text-primary font-mono mt-0.5 block">3 Orang</span>
        </div>
        <div className="p-3 bg-slate-50 border border-[#CBD7E6] rounded-xl">
          <span className="text-on-surface-variant block text-[11px]">Loket Operasional</span>
          <span className="text-lg font-bold text-secondary font-mono mt-0.5 block">2 Loket Aktif</span>
        </div>
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
          <span className="text-emerald-800 block text-[11px] font-medium">Sertifikasi BSrE TTE</span>
          <span className="text-lg font-bold text-emerald-800 font-mono mt-0.5 block">100% Valid</span>
        </div>
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
          <span className="text-blue-900 block text-[11px] font-medium">Kepatuhan SOP</span>
          <span className="text-lg font-bold text-blue-900 font-mono mt-0.5 block">0 Pelanggaran</span>
        </div>
      </div>

      {/* Officers Table */}
      <div className="overflow-x-auto rounded-xl border border-[#DDE5EF]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-[#DDE5EF] text-[11px] font-bold text-primary uppercase tracking-wider">
              <th className="py-3 px-4">Nama Petugas &amp; NIP</th>
              <th className="py-3 px-4">Penugasan Loket</th>
              <th className="py-3 px-4">Peran Sistem</th>
              <th className="py-3 px-4">Status Akun</th>
              <th className="py-3 px-4">Beban Kerja</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDE5EF]">
            <tr className="hover:bg-slate-50/60 transition">
              <td className="py-3 px-4">
                <div className="font-bold text-primary">Budi Santoso, S.Kom</div>
                <div className="text-[11px] text-on-surface-variant font-mono">NIP: 198503142010011002</div>
              </td>
              <td className="py-3 px-4 font-semibold text-secondary">Loket 3 (Terpadu)</td>
              <td className="py-3 px-4 text-on-surface-variant">Verifikator Utama Adminduk</td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Aktif Bertugas
                </span>
              </td>
              <td className="py-3 px-4 font-mono font-medium text-primary">3 Berkas Aktif</td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => navigate('/petugas')}
                  className="px-2.5 py-1 text-xs font-semibold text-secondary hover:bg-blue-50 rounded border border-blue-200 transition"
                  type="button"
                >
                  Buka Meja
                </button>
              </td>
            </tr>
            <tr className="hover:bg-slate-50/60 transition">
              <td className="py-3 px-4">
                <div className="font-bold text-primary">Siti Rahmawati, S.STP</div>
                <div className="text-[11px] text-on-surface-variant font-mono">NIP: 199108222014022001</div>
              </td>
              <td className="py-3 px-4 font-semibold text-secondary">Loket 1 (Pendaftaran)</td>
              <td className="py-3 px-4 text-on-surface-variant">Verifikator Berkas Kelahiran</td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Aktif Bertugas
                </span>
              </td>
              <td className="py-3 px-4 font-mono font-medium text-primary">5 Selesai Hari Ini</td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => showToast('Detail akun Siti Rahmawati dibuka.', 'info')}
                  className="px-2.5 py-1 text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-slate-100 rounded border border-slate-200 transition"
                  type="button"
                >
                  Detail
                </button>
              </td>
            </tr>
            <tr className="hover:bg-slate-50/60 transition">
              <td className="py-3 px-4">
                <div className="font-bold text-primary">Ahmad Fauzi, S.AP</div>
                <div className="text-[11px] text-on-surface-variant font-mono">NIP: 198811052012011004</div>
              </td>
              <td className="py-3 px-4 font-semibold text-slate-600">Loket 2 (Mutasi SIAK)</td>
              <td className="py-3 px-4 text-on-surface-variant">Spesialis Validasi Dokumen SIAK</td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Mode Siaga
                </span>
              </td>
              <td className="py-3 px-4 font-mono font-medium text-primary">1 Antrean</td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => showToast('Detail akun Ahmad Fauzi dibuka.', 'info')}
                  className="px-2.5 py-1 text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-slate-100 rounded border border-slate-200 transition"
                  type="button"
                >
                  Detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

{/* TAB 6: AUDIT REKAM JEJAK SISTEM (ZERO-PII COMPLIANCE) */}
{activeTab === 'audit' && (
  <div className="space-y-6">
    <div className="bg-surface-container-lowest rounded-xl border border-[#DDE5EF] p-6 civic-card-shadow space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDE5EF]">
        <div>
          <h3 className="font-title-md text-base font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">receipt_long</span>
            <span>Rekam Jejak Audit Sistem Adminduk &amp; Integritas AI</span>
          </h3>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Log mutasi draf, pemeriksaan OCR, dan tindak lanjut petugas dicatat secara kriptografis tanpa mengekspos data pribadi warga (UU PDP No. 27/2022).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Log audit berhasil diekspor sebagai JSON.', 'success')}
            className="px-3 py-1.5 bg-white border border-[#CBD7E6] text-primary rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-slate-50 transition"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px] text-secondary">download</span>
            <span>Ekspor JSON</span>
          </button>
          <button
            onClick={() => showToast('Laporan kepatuhan audit dicetak (PDF).', 'success')}
            className="px-3 py-1.5 bg-secondary text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-[#1257B0] transition"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">print</span>
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto rounded-xl border border-[#DDE5EF]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-[#DDE5EF] text-[11px] font-bold text-primary uppercase tracking-wider">
              <th className="py-3 px-4">Waktu (WIB)</th>
              <th className="py-3 px-4">Entitas Operator</th>
              <th className="py-3 px-4">Kategori Aksi</th>
              <th className="py-3 px-4">Target Berkas</th>
              <th className="py-3 px-4">Keterangan Audit</th>
              <th className="py-3 px-4 font-mono">Hash Integritas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDE5EF]">
            <tr className="hover:bg-slate-50/60 transition">
              <td className="py-3 px-4 font-mono text-[11px]">28 Okt 2026, 11:50</td>
              <td className="py-3 px-4 font-semibold text-purple-700">ADMIN-REGULASI</td>
              <td className="py-3 px-4 font-medium text-primary">Pemutakhiran Parameter</td>
              <td className="py-3 px-4 font-mono text-secondary">RULES-v2-DRAFT</td>
              <td className="py-3 px-4 text-on-surface-variant">Penyesuaian threshold confidence OCR ke 85%</td>
              <td className="py-3 px-4 font-mono text-[10px] text-slate-500">41bc9a7...d901</td>
            </tr>
            <tr className="hover:bg-slate-50/60 transition">
              <td className="py-3 px-4 font-mono text-[11px]">28 Okt 2026, 11:46</td>
              <td className="py-3 px-4 font-semibold text-secondary">PETUGAS-LOKET-3</td>
              <td className="py-3 px-4 font-medium text-amber-700">Catatan Perbaikan</td>
              <td className="py-3 px-4 font-mono text-secondary">APP-2026-8812</td>
              <td className="py-3 px-4 text-on-surface-variant">Permintaan pindaian ulang stempel faskes buram</td>
              <td className="py-3 px-4 font-mono text-[10px] text-slate-500">90cd3e1...14e8</td>
            </tr>
            <tr className="hover:bg-slate-50/60 transition">
              <td className="py-3 px-4 font-mono text-[11px]">28 Okt 2026, 11:44</td>
              <td className="py-3 px-4 font-semibold text-emerald-700">PEMOHON-AYU</td>
              <td className="py-3 px-4 font-medium text-emerald-700">Penyelarasan Mandiri</td>
              <td className="py-3 px-4 font-mono text-secondary">FORM-PREP-001</td>
              <td className="py-3 px-4 text-on-surface-variant">Ejaan nama diselaraskan menjadi "Ayu Contoh" [citizen_corrected]</td>
              <td className="py-3 px-4 font-mono text-[10px] text-slate-500">a21b8c4...77f0</td>
            </tr>
            <tr className="hover:bg-slate-50/60 transition">
              <td className="py-3 px-4 font-mono text-[11px]">28 Okt 2026, 11:42</td>
              <td className="py-3 px-4 font-semibold text-blue-700">SISTEM-OCR-v2</td>
              <td className="py-3 px-4 font-medium text-primary">Audit Forensik OCR</td>
              <td className="py-3 px-4 font-mono text-secondary">SKK-2026-X-0884</td>
              <td className="py-3 px-4 text-on-surface-variant">Deteksi selisih ejaan huruf nama pada blangko SKK</td>
              <td className="py-3 px-4 font-mono text-[10px] text-slate-500">e8f921d...31b2</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Compliance Callout */}
      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
        <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">verified_user</span>
        <div>
          <span className="font-bold">Kepatuhan UU Pelindungan Data Pribadi (UU No. 27/2022):</span>
          <p className="mt-0.5 text-emerald-800 leading-relaxed">
            Data dokumen dan gambar berkas tersimpan pada penyimpanan terisolasi sisi pengguna (browser lokal). Server audit hanya mencatat hash verifikasi kriptografis, status penyelarasan, dan stempel waktu tanpa mentransmisikan biodata rahasia warga.
          </p>
        </div>
      </div>
    </div>
  </div>
)}
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
<button onClick={handleSaveDraft} className="w-full py-2 px-3 text-xs font-semibold text-primary bg-white hover:bg-slate-50 border border-[#CBD7E6] rounded-lg transition-colors shadow-sm cursor-pointer" type="button">
                    Simpan Draf
                  </button>
<button onClick={() => navigate('/panduan')} className="w-full py-2 px-3 text-xs font-semibold text-primary bg-white hover:bg-slate-50 border border-[#CBD7E6] rounded-lg transition-colors shadow-sm cursor-pointer" type="button">
                    Pratinjau Tampilan Warga
                  </button>
</div>
<div className="relative group">
<button onClick={handlePublish} className={`w-full py-2.5 px-4 text-xs font-bold rounded-lg flex items-center justify-center gap-2 border transition-all ${
  isSourceLinked
    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-md cursor-pointer'
    : 'text-slate-400 bg-slate-200 border-slate-300 cursor-not-allowed'
}`} disabled={!isSourceLinked} type="button">
<span className="material-symbols-outlined text-base">{isSourceLinked ? 'check_circle' : 'lock'}</span>
                    Publikasikan Versi v2
                  </button>
<div className="mt-1.5 text-center text-[11px] text-amber-800 font-caption bg-amber-50/80 p-1.5 rounded border border-amber-200/60">
                    {isSourceLinked
                      ? '✓ Seluruh kriteria rujukan resmi terpenuhi. Versi v2 siap dipublikasikan.'
                      : 'Tombol nonaktif hingga sumber rujukan resmi dihubungkan.'}
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
