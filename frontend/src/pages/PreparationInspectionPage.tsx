import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const PreparationInspectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast: _showToast, openChat } = useApp();
  const [zoom, setZoom] = useState(100);

  return (
    <div className="bg-[#F5F7FB] text-on-surface flex min-h-screen font-sans">

{/*  Left Sidebar (fixed width 240px)  */}
<aside className="w-[240px] bg-[#142C4B] text-white flex flex-col" style={{ width: '240px', height: '1000px', flexShrink: '0' }}>
{/*  Brand Block height 72px  */}
<div className="h-[72px] px-5 flex items-center gap-3 border-b border-[#233F66]">
<div className="w-8 h-8 rounded bg-[#1769D2] flex items-center justify-center text-white">
<span className="material-symbols-outlined text-white">fact_check</span>
</div>
<div>
<div className="font-heading font-bold text-base tracking-tight leading-none text-white">JejakMasWowo</div>
<div className="text-[12px] text-[#A6BCD7] mt-1 leading-none">Layanan warga</div>
</div>
</div>
{/*  Navigation Rows (height 44px, 8px gap, 16px horizontal margin)  */}
<nav className="flex-1 py-4 px-4 space-y-2">
<a className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition" href="#/dashboard" onClick={(e) => { e.preventDefault(); navigate("/dashboard"); }}>
<span className="material-symbols-outlined text-[#C3D4EA]">dashboard</span>
<span>Dashboard</span>
</a>
<a className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition" href="#/katalog" onClick={(e) => { e.preventDefault(); navigate("/katalog"); }}>
<span className="material-symbols-outlined text-[#C3D4EA]">search</span>
<span>Cari Layanan</span>
</a>
<a className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-semibold bg-[#1769D2] text-white shadow-sm" href="#/persiapan/data" onClick={(e) => { e.preventDefault(); navigate("/persiapan/data"); }}>
<span className="material-symbols-outlined text-white">assignment</span>
<span>Persiapan Saya</span>
</a>
<a className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition" href="#/pelacakan" onClick={(e) => { e.preventDefault(); navigate("/pelacakan"); }}>
<span className="material-symbols-outlined text-[#C3D4EA]">send</span>
<span>Pengajuan Saya</span>
</a>
<a className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition" href="#">
<span className="material-symbols-outlined text-[#C3D4EA]">notifications</span>
<span>Notifikasi</span>
</a>
<a className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition" href="#">
<span className="material-symbols-outlined text-[#C3D4EA]">manage_accounts</span>
<span>Profil &amp; Privasi</span>
</a>
</nav>
{/*  Sidebar Bottom: Keluar & Prototipe · Simulasi  */}
<div className="p-4 border-t border-[#233F66]">
<a className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition" href="#">
<span className="material-symbols-outlined text-[#C3D4EA]">logout</span>
<span>Keluar</span>
</a>
<div className="px-3 pt-3 text-[12px] text-[#7E98B9]">Prototipe · Simulasi</div>
</div>
</aside>
{/*  Main Region (starts x240)  */}
<div className="flex flex-col" style={{ width: '1040px', height: '1000px', display: 'flex', flexDirection: 'column', minWidth: '0', overflow: 'hidden' }}>
{/*  Topbar (height 72px, white, border-bottom)  */}
<header className="h-[72px] bg-white border-b border-[#DDE5EF] px-8 flex items-center justify-between flex-shrink-0">
{/*  Breadcrumb  */}
<div className="flex items-center gap-2 text-sm text-[#52657A]">
<span>Persiapan</span>
<span className="material-symbols-outlined text-base text-[#8DA0B6]">chevron_right</span>
<span>Akta Kelahiran</span>
<span className="material-symbols-outlined text-base text-[#8DA0B6]">chevron_right</span>
<span className="font-medium text-[#172B45]">Pemeriksaan</span>
</div>
{/*  Right Controls: Location, Bantuan inline, Bell, Avatar  */}
<div className="flex items-center gap-3">
<div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F7FB] border border-[#DDE5EF] rounded-full text-xs font-medium text-[#52657A]">
<span className="material-symbols-outlined text-[#52657A] text-[16px]">location_on</span>
<span>Kota Contoh · Simulasi</span>
</div>
<button className="h-9 px-3 rounded-lg border border-[#DDE5EF] bg-white text-xs font-semibold text-[#172B45] hover:bg-[#F5F7FB] flex items-center gap-1.5 transition" type="button" onClick={() => openChat()}>
<span className="material-symbols-outlined text-[#52657A] text-[18px]">help_outline</span>
<span>Bantuan</span>
</button>
<button className="w-9 h-9 rounded-lg border border-[#DDE5EF] bg-white text-[#52657A] flex items-center justify-center hover:bg-[#F5F7FB] transition" type="button">
<span className="material-symbols-outlined text-[18px]">notifications</span>
</button>
<div className="flex items-center gap-2 pl-2 border-l border-[#DDE5EF]">
<div className="w-8 h-8 rounded-full bg-[#142C4B] text-white flex items-center justify-center font-semibold text-xs">AC</div>
<span className="text-sm font-semibold text-[#172B45]">Ayu Contoh</span>
</div>
</div>
</header>
{/*  Page Content (inner margin 32px, bottom padding 96px for action bar)  */}
<main className="p-8 w-full" style={{ flex: '1 1 0%', minHeight: '0', overflowY: 'auto', boxSizing: 'border-box' }}>
{/*  Page-heading block  */}
<div>
<h1 className="text-[28px] leading-[36px] font-bold text-[#172B45]">Hasil pemeriksaan awal</h1>
<p className="text-[16px] leading-[24px] text-[#52657A] mt-2">Akta Kelahiran (contoh) · Kota Contoh · Persiapan JMW-DEMO-001</p>
</div>
{/*  Preparation Stepper (Step 4 active)  */}
<div className="jmw-progress">
{/*  1. Kebutuhan (completed)  */}
<div className="jmw-step is-complete">
<div className="jmw-step-dot">
<span className="material-symbols-outlined text-white text-[18px]">check</span>
</div>
<div className="jmw-step-label">Kebutuhan</div>
</div>
{/*  2. Data (completed)  */}
<div className="jmw-step is-complete">
<div className="jmw-step-dot">
<span className="material-symbols-outlined text-white text-[18px]">check</span>
</div>
<div className="jmw-step-label">Data</div>
</div>
{/*  3. Dokumen (completed)  */}
<div className="jmw-step is-complete">
<div className="jmw-step-dot">
<span className="material-symbols-outlined text-white text-[18px]">check</span>
</div>
<div className="jmw-step-label">Dokumen</div>
</div>
{/*  4. Pemeriksaan (current)  */}
<div className="jmw-step is-current">
<div className="jmw-step-dot">4</div>
<div className="jmw-step-label">Pemeriksaan</div>
</div>
{/*  5. Ringkasan  */}
<div className="jmw-step">
<div className="jmw-step-dot">5</div>
<div className="jmw-step-label">Ringkasan</div>
</div>
</div>
{/*  Compact Single Callout (No wall of banners)  */}
<div className="mb-6 p-4 rounded-[12px] bg-[#FFF8E8] border border-[#F1E0B6] flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-[#996000] text-[22px]">warning</span>
<div>
<span className="text-sm font-bold text-[#996000]">2 temuan perlu perhatian pada draf</span>
<span className="text-xs text-[#52657A] ml-2">Pemeriksaan AI bersifat pendampingan mandiri, bukan keputusan resmi loket instansi.</span>
</div>
</div>
<div className="text-xs font-semibold px-2.5 py-1 bg-white border border-[#F1E0B6] text-[#996000] rounded-full">Prioritas Perbaikan</div>
</div>
{/*  Balanced 2-Column Layout (Document Viewer + Actionable Findings)  */}
<div className="grid grid-cols-12 gap-6 items-start">
{/*  Left: Document Viewer (col-span-6)  */}
<div className="col-span-6 bg-white border border-[#DDE5EF] rounded-[12px] overflow-hidden">
{/*  Viewer Top Controls  */}
<div className="h-12 px-4 border-b border-[#DDE5EF] flex items-center justify-between bg-[#F8FAFD]">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[#1769D2] text-[18px]">description</span>
<span className="text-xs font-semibold text-[#172B45]">Pratinjau: Surat Keterangan Lahir</span>
</div>
{/*  Zoom controls (viewer control only)  */}
<div className="flex items-center gap-2 text-xs text-[#52657A]">
<button className="w-7 h-7 rounded border border-[#DDE5EF] bg-white flex items-center justify-center hover:bg-gray-50 text-base leading-none" type="button" onClick={() => setZoom(z => Math.max(75, z - 25))}>−</button>
<span className="font-medium text-[#172B45] px-1">{zoom}%</span>
<button className="w-7 h-7 rounded border border-[#DDE5EF] bg-white flex items-center justify-center hover:bg-gray-50 text-base leading-none" type="button" onClick={() => setZoom(z => Math.min(150, z + 25))}>+</button>
</div>
</div>
{/*  Document Render Frame  */}
<div className="p-6 bg-[#F5F7FB] min-h-[440px] flex items-center justify-center overflow-hidden">
<div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }} className="w-full bg-white border border-[#DDE5EF] rounded-lg shadow-xs p-6 font-mono text-xs text-[#172B45] space-y-4 transition-transform duration-150">
<div className="text-center pb-3 border-b border-[#DDE5EF]">
<div className="font-bold text-sm tracking-tight text-[#172B45]">RS / KLINIK CONTOH SEHAT KOTA</div>
<div className="text-[11px] text-[#52657A]">SURAT KETERANGAN KELAHIRAN</div>
<div className="text-[10px] text-[#8DA0B6]">No. SKK/2026/X/0884-CONTOH</div>
</div>
<div className="space-y-2 text-[11px]">
<div className="flex justify-between">
<span className="text-[#52657A]">Hari, Tanggal:</span>
<span className="font-medium">Sabtu, 24 Oktober 2026</span>
</div>
<div className="flex justify-between">
<span className="text-[#52657A]">Nama Ibu:</span>
<span className="font-medium">Ayu Puspita (contoh)</span>
</div>
<div className="flex justify-between">
<span className="text-[#52657A]">Nama Ayah:</span>
<span className="font-medium">Budi Santoso (contoh)</span>
</div>
{/*  Highlighted Finding 1  */}
<div className="p-2.5 rounded bg-[#FFF8E8] border border-[#F1E0B6]">
<div className="flex items-center justify-between text-[10px] font-semibold text-[#996000] mb-1">
<span>Anotasi #1: Ketidaksesuaian Ejaan</span>
<span className="bg-[#FFF1D0] px-1.5 py-0.5 rounded">Perlu Koreksi</span>
</div>
<div className="flex justify-between font-bold text-xs text-[#172B45]">
<span>Nama Bayi:</span>
<span className="text-[#996000] underline">Ayu Cntoh</span>
</div>
</div>
<div className="pt-2 text-[10px] text-[#8DA0B6] italic text-center">
                  * Halaman 1 dari 2 · Tanda tangan basah tertera di hlm. 2
                </div>
</div>
</div>
</div>
</div>
{/*  Right: Actionable Findings (col-span-6)  */}
<div className="col-span-6 space-y-4">
<div className="flex items-center justify-between">
<h2 className="font-heading text-[20px] leading-[28px] font-semibold text-[#172B45]">Rincian Temuan Pemeriksaan</h2>
<span className="text-xs font-semibold px-2 py-1 bg-[#F5F7FB] border border-[#DDE5EF] rounded-full text-[#52657A]">2 Catatan Perlu Aksi</span>
</div>
{/*  Finding Card 1: Penulisan Nama Berbeda  */}
<div className="bg-white border-l-4 border-l-[#996000] border border-[#DDE5EF] rounded-[12px] p-5 space-y-3">
<div className="flex items-center justify-between">
<span className="text-xs font-bold uppercase tracking-wider text-[#996000]">Perhatian Ejaan · Halaman 1</span>
<span className="material-symbols-outlined text-[#996000] text-[20px]">spellcheck</span>
</div>
<h3 className="font-heading text-base font-bold text-[#172B45]">Penulisan nama berbeda</h3>
<div className="grid grid-cols-2 gap-2 bg-[#F5F7FB] p-3 rounded-lg text-xs">
<div>
<span className="text-[#52657A] block text-[11px]">Form isian Anda:</span>
<span className="font-semibold text-[#172B45]">Ayu Contoh</span>
</div>
<div>
<span className="text-[#52657A] block text-[11px]">Teks terbaca OCR:</span>
<span className="font-semibold text-[#996000]">Ayu Cntoh ⚠</span>
</div>
</div>
<p className="text-[13px] leading-[20px] text-[#52657A]">
              Pembacaan otomatis mendeteksi kemungkinan salah satu huruf terlewat saat pemindaian berkas fisik atau ketikan asli rumah sakit.
            </p>
<div className="flex items-center gap-2 pt-1">
<button className="h-9 px-3 rounded-lg border border-[#DDE5EF] bg-white text-xs font-semibold text-[#172B45] hover:bg-[#F5F7FB] transition" type="button">
                Perbaiki Isian Data
              </button>
<button className="h-9 px-3 rounded-lg bg-[#E7F0FF] text-xs font-semibold text-[#1769D2] hover:bg-[#D5E6FF] transition" type="button">
                Koreksi Pembacaan OCR
              </button>
</div>
</div>
{/*  Finding Card 2: Bagian Dokumen Kurang Terbaca  */}
<div className="bg-white border-l-4 border-l-[#996000] border border-[#DDE5EF] rounded-[12px] p-5 space-y-3">
<div className="flex items-center justify-between">
<span className="text-xs font-bold uppercase tracking-wider text-[#996000]">Kualitas Berkas · Halaman 2</span>
<span className="material-symbols-outlined text-[#996000] text-[20px]">document_scanner</span>
</div>
<h3 className="font-heading text-base font-bold text-[#172B45]">Bagian dokumen kurang terbaca</h3>
<p className="text-[13px] leading-[20px] text-[#52657A]">
              Cap fasilitas kesehatan atau tanda tangan tampak buram pada salinan pemindaian. Hal ini berisiko memperlambat verifikasi di loket.
            </p>
<div className="p-3 rounded-lg bg-[#ECF8F3] border border-[#C5E8D8] text-xs text-[#087F68] flex items-start gap-2">
<span className="material-symbols-outlined text-[18px] mt-0.5">lightbulb</span>
<span><strong>Saran Praktis:</strong> Ambil foto ulang dengan pencahayaan merata pada permukaan datar tegak lurus.</span>
</div>
<div className="pt-1">
<button className="h-9 px-3 rounded-lg border border-[#DDE5EF] bg-white text-xs font-semibold text-[#172B45] hover:bg-[#F5F7FB] inline-flex items-center gap-1.5 transition" type="button">
<span className="material-symbols-outlined text-[16px]">upload</span>
<span>Unggah Ulang Dokumen</span>
</button>
</div>
</div>
</div>
</div>
</main>
{/*  Bottom Action Bar (height 64px, white, border-top, fixed bottom aligned to x240+)  */}
<div className="h-[64px] bg-white border-t border-[#DDE5EF] px-8 flex items-center justify-between flex-shrink-0">
<button className="h-[44px] px-4 rounded-lg border border-[#DDE5EF] bg-white text-sm font-semibold text-[#172B45] hover:bg-[#F5F7FB] flex items-center gap-2 transition" type="button" onClick={() => navigate("/persiapan/dokumen")}>
<span className="material-symbols-outlined text-[#52657A]">arrow_back</span>
<span>Kembali ke Dokumen</span>
</button>
<div className="flex items-center gap-3">
<button className="h-[44px] px-4 rounded-lg border border-[#DDE5EF] bg-white text-sm font-semibold text-[#172B45] hover:bg-[#F5F7FB] transition" type="button">
          Simpan draf
        </button>
<button className="h-[44px] px-4 rounded-lg bg-[#1769D2] text-white text-sm font-semibold hover:bg-[#1257B0] flex items-center gap-2 shadow-sm transition" type="button">
<span className="material-symbols-outlined text-white">refresh</span>
<span>Periksa ulang</span>
</button>
</div>
</div>
</div>

    </div>
  );
};
