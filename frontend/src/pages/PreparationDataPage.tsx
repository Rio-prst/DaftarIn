import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const PreparationDataPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast: _showToast, openChat } = useApp();

  return (
    <div className="bg-[#F5F7FB] text-on-surface flex min-h-screen font-sans">

{/*  Left Sidebar (fixed width 240px)  */}
<aside className="w-[240px] h-[1000px] shrink-0 bg-[#142C4B] text-white flex flex-col z-30">
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
<div className="w-[1040px] h-[1000px] flex flex-col min-w-0 shrink-0 overflow-hidden">
{/*  Topbar (height 72px, white, border-bottom)  */}
<header className="h-[72px] shrink-0 bg-white border-b border-[#DDE5EF] px-8 flex items-center justify-between z-20">
{/*  Breadcrumb  */}
<div className="flex items-center gap-2 text-sm text-[#52657A]">
<span>Persiapan</span>
<span className="material-symbols-outlined text-base text-[#8DA0B6]">chevron_right</span>
<span>Akta Kelahiran</span>
<span className="material-symbols-outlined text-base text-[#8DA0B6]">chevron_right</span>
<span className="font-medium text-[#172B45]">Data</span>
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
<main className="flex-1 min-h-0 overflow-y-auto p-8 w-full box-border">
{/*  Page-heading block  */}
<div>
<h1 className="text-[28px] leading-[36px] font-bold text-[#172B45]">Lengkapi data pengurusan</h1>
<p className="text-[16px] leading-[24px] text-[#52657A] mt-2">Akta Kelahiran (contoh) · Kota Contoh · Persiapan JMW-DEMO-001</p>
</div>
{/*  Preparation Stepper (Immutable labels & canonical CSS)  */}
<div className="jmw-progress">
{/*  1. Kebutuhan (completed)  */}
<div className="jmw-step is-complete">
<div className="jmw-step-dot">
<span className="material-symbols-outlined text-white text-[18px]">check</span>
</div>
<div className="jmw-step-label">Kebutuhan</div>
</div>
{/*  2. Data (current)  */}
<div className="jmw-step is-current">
<div className="jmw-step-dot">2</div>
<div className="jmw-step-label">Data</div>
</div>
{/*  3. Dokumen  */}
<div className="jmw-step">
<div className="jmw-step-dot">3</div>
<div className="jmw-step-label">Dokumen</div>
</div>
{/*  4. Pemeriksaan  */}
<div className="jmw-step">
<div className="jmw-step-dot">4</div>
<div className="jmw-step-label">Pemeriksaan</div>
</div>
{/*  5. Ringkasan  */}
<div className="jmw-step">
<div className="jmw-step-dot">5</div>
<div className="jmw-step-label">Ringkasan</div>
</div>
</div>
{/*  Grid 2/3 Form + 1/3 Context Card (gap 24px)  */}
<div className="grid grid-cols-12 gap-6 items-start">
{/*  2/3 Form Column (col-span-8)  */}
<div className="col-span-8 space-y-6">
{/*  Card 1: Skenario Pengurusan  */}
<div className="bg-white border border-[#DDE5EF] rounded-[12px] p-6">
<h2 className="font-heading text-[20px] leading-[28px] font-semibold text-[#172B45]">Kondisi Pengurusan</h2>
<p className="text-[13px] leading-[20px] text-[#52657A] mt-1">Pilih kondisi yang sesuai agar daftar dokumen persyaratan dapat disesuaikan.</p>
<div className="mt-5 space-y-4">
<div>
<label className="block text-[14px] leading-[20px] font-semibold text-[#172B45] mb-2">Pengajuan untuk siapa?</label>
<div className="grid grid-cols-2 gap-3">
<label className="border-2 border-[#1769D2] bg-[#E7F0FF]/30 rounded-lg p-3 flex items-start gap-3 cursor-pointer">
<input defaultChecked className="mt-1 text-[#1769D2] focus:ring-0" name="target" type="radio"/>
<div>
<div className="text-sm font-semibold text-[#172B45]">Anak / Anggota Keluarga</div>
<div className="text-xs text-[#52657A] mt-0.5">Mewakili anak kandung atau anggota keluarga dalam satu KK.</div>
</div>
</label>
<label className="border border-[#DDE5EF] hover:border-[#8DA0B6] rounded-lg p-3 flex items-start gap-3 cursor-pointer">
<input className="mt-1 text-[#1769D2] focus:ring-0" name="target" type="radio"/>
<div>
<div className="text-sm font-semibold text-[#172B45]">Diri Sendiri</div>
<div className="text-xs text-[#52657A] mt-0.5">Mengurus dokumen atas nama pribadi yang bersangkutan.</div>
</div>
</label>
</div>
</div>
<div>
<label className="block text-[14px] leading-[20px] font-semibold text-[#172B45] mb-2">Jenis pengurusan</label>
<div className="grid grid-cols-2 gap-3">
<label className="border-2 border-[#1769D2] bg-[#E7F0FF]/30 rounded-lg p-3 flex items-start gap-3 cursor-pointer">
<input defaultChecked className="mt-1 text-[#1769D2] focus:ring-0" name="jenis" type="radio"/>
<div>
<div className="text-sm font-semibold text-[#172B45]">Baru (Penerbitan Pertama)</div>
<div className="text-xs text-[#52657A] mt-0.5">Pencatatan kelahiran baru yang belum pernah memiliki akta.</div>
</div>
</label>
<label className="border border-[#DDE5EF] hover:border-[#8DA0B6] rounded-lg p-3 flex items-start gap-3 cursor-pointer">
<input className="mt-1 text-[#1769D2] focus:ring-0" name="jenis" type="radio"/>
<div>
<div className="text-sm font-semibold text-[#172B45]">Perubahan / Pembetulan</div>
<div className="text-xs text-[#52657A] mt-0.5">Perbaikan kekeliruan penulisan nama atau data orang tua.</div>
</div>
</label>
</div>
</div>
<div>
<label className="block text-[14px] leading-[20px] font-semibold text-[#172B45] mb-2">Tempat kelahiran</label>
<div className="space-y-2">
<label className="border-2 border-[#1769D2] bg-[#E7F0FF]/30 rounded-lg p-3 flex items-center gap-3 cursor-pointer">
<input defaultChecked className="text-[#1769D2] focus:ring-0" name="faskes" type="radio"/>
<span className="text-sm font-medium text-[#172B45]">Kelahiran di faskes (RS, Puskesmas, atau Bidan bersertifikat)</span>
</label>
<label className="border border-[#DDE5EF] hover:border-[#8DA0B6] rounded-lg p-3 flex items-center gap-3 cursor-pointer">
<input className="text-[#1769D2] focus:ring-0" name="faskes" type="radio"/>
<span className="text-sm font-medium text-[#172B45]">Kelahiran di rumah / tanpa faskes (memerlukan SPTJM Kebenaran Kelahiran)</span>
</label>
</div>
</div>
</div>
</div>
{/*  Card 2: Data Identitas Draf  */}
<div className="bg-white border border-[#DDE5EF] rounded-[12px] p-6">
<h2 className="font-heading text-[20px] leading-[28px] font-semibold text-[#172B45]">Data untuk Persiapan Mandiri</h2>
<p className="text-[13px] leading-[20px] text-[#52657A] mt-1">Data digunakan untuk mencocokkan ejaan formulir dengan teks pada berkas fisik.</p>
<div className="mt-5 space-y-4">
<div className="grid grid-cols-2 gap-4">
<div>
<label className="block text-[14px] leading-[20px] font-semibold text-[#172B45] mb-1">Nama lengkap pemohon</label>
<input className="w-full h-11 px-3 bg-white border border-[#DDE5EF] rounded-lg text-sm text-[#172B45] focus:outline-none focus:border-[#1769D2]" type="text" value="Ayu Contoh"/>
<span className="text-[13px] leading-[20px] text-[#52657A] mt-1 block">Penanggung jawab draf persiapan.</span>
</div>
<div>
<label className="block text-[14px] leading-[20px] font-semibold text-[#172B45] mb-1">Email kontak</label>
<input className="w-full h-11 px-3 bg-white border border-[#DDE5EF] rounded-lg text-sm text-[#172B45] focus:outline-none focus:border-[#1769D2]" type="email" value="ayu.contoh@email.simulasi"/>
<span className="text-[13px] leading-[20px] text-[#52657A] mt-1 block">Untuk catatan dan notifikasi simulasi.</span>
</div>
</div>
<div className="grid grid-cols-2 gap-4">
<div>
<label className="block text-[14px] leading-[20px] font-semibold text-[#172B45] mb-1">Nama calon bayi / anak</label>
<input className="w-full h-11 px-3 bg-white border border-[#DDE5EF] rounded-lg text-sm text-[#172B45] focus:outline-none focus:border-[#1769D2]" type="text" value="Ayu Contoh"/>
<span className="text-[13px] leading-[20px] text-[#52657A] mt-1 block">Nama yang akan dicocokkan dengan surat lahir.</span>
</div>
<div>
<label className="block text-[14px] leading-[20px] font-semibold text-[#172B45] mb-1">Wilayah pengurusan</label>
<select className="w-full h-11 px-3 bg-white border border-[#DDE5EF] rounded-lg text-sm text-[#172B45] focus:outline-none focus:border-[#1769D2]">
<option >Kota Contoh (Simulasi)</option>
</select>
<span className="text-[13px] leading-[20px] text-[#52657A] mt-1 block">Menentukan cakupan panduan loket setempat.</span>
</div>
</div>
</div>
</div>
</div>
{/*  1/3 Context Card Column (col-span-4)  */}
<div className="col-span-4 space-y-5">
{/*  Summary card  */}
<div className="bg-white border border-[#DDE5EF] rounded-[12px] p-5">
<h3 className="font-heading text-base font-semibold text-[#172B45] pb-3 border-b border-[#DDE5EF]">Ringkasan Penyesuaian</h3>
<div className="py-3 text-sm space-y-2 border-b border-[#DDE5EF]">
<div className="flex justify-between">
<span className="text-[#52657A]">Layanan:</span>
<span className="font-medium text-[#172B45]">Akta Kelahiran</span>
</div>
<div className="flex justify-between">
<span className="text-[#52657A]">Wilayah:</span>
<span className="font-medium text-[#172B45]">Kota Contoh</span>
</div>
<div className="flex justify-between">
<span className="text-[#52657A]">ID Draf:</span>
<span className="font-mono text-xs font-semibold text-[#1769D2]">JMW-DEMO-001</span>
</div>
</div>
<div className="pt-4">
<div className="text-xs font-semibold uppercase text-[#52657A] tracking-wider mb-2">Dokumen yang diperlukan:</div>
<ul className="text-sm space-y-2 text-[#172B45]">
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-[#087F68] text-[18px]">check_circle</span>
<span>Surat Keterangan Lahir (Faskes)</span>
</li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-[#087F68] text-[18px]">check_circle</span>
<span>Buku Nikah / Kutipan Akta</span>
</li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-[#087F68] text-[18px]">check_circle</span>
<span>Kartu Keluarga (KK) Orang Tua</span>
</li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-[#087F68] text-[18px]">check_circle</span>
<span>KTP-el Saksi &amp; Orang Tua</span>
</li>
</ul>
</div>
</div>
{/*  Note card  */}
<div className="bg-white border border-[#DDE5EF] rounded-[12px] p-5">
<div className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-[#1769D2] text-[20px] mt-0.5">info</span>
<div className="text-xs leading-[18px] text-[#52657A]">
                Kelola persiapan dan dokumenmu dari akun ini. Informasi disimpan untuk mempermudah pengecekan mandiri sebelum kamu membawa berkas ke instansi.
              </div>
</div>
</div>
</div>
</div>
</main>
{/*  Bottom Action Bar (height 64px, white, border-top, fixed bottom aligned to x240+)  */}
<div className="h-[64px] shrink-0 bg-white border-t border-[#DDE5EF] px-8 flex items-center justify-between z-20">
<button className="h-[44px] px-4 rounded-lg border border-[#DDE5EF] bg-white text-sm font-semibold text-[#172B45] hover:bg-[#F5F7FB] flex items-center gap-2 transition" type="button" onClick={() => navigate("/panduan")}>
<span className="material-symbols-outlined text-[#52657A]">arrow_back</span>
<span>Kembali</span>
</button>
<div className="flex items-center gap-3">
<button className="h-[44px] px-4 rounded-lg border border-[#DDE5EF] bg-white text-sm font-semibold text-[#172B45] hover:bg-[#F5F7FB] transition" type="button">
          Simpan draf
        </button>
<button className="h-[44px] px-4 rounded-lg bg-[#1769D2] text-white text-sm font-semibold hover:bg-[#1257B0] flex items-center gap-2 shadow-sm transition" type="button" onClick={() => navigate("/persiapan/dokumen")}>
<span>Lanjut ke Dokumen</span>
<span className="material-symbols-outlined text-white">arrow_forward</span>
</button>
</div>
</div>
</div>

    </div>
  );
};
