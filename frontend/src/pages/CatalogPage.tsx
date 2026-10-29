import React from 'react';
import { useApp } from '../context/AppContext';

export const CatalogPage: React.FC = () => {
  
  const { openChat } = useApp();

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md text-body-md antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed">

{/*  Micro-Banner Prototipe Independen  */}
{/*  TopNavBar (Web Header)  */}
<header className="bg-surface-container-lowest border-b border-outline-variant shadow-sm sticky top-0 z-40">
<div className="w-full max-w-6xl mx-auto px-6 flex items-center justify-between" style={{ height: '72px' }}>
<div className="flex items-center gap-8">
<a className="flex items-center gap-2.5 text-primary hover:opacity-90 transition-opacity" href="#/katalog">
<div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-surface-container-lowest shadow-sm">
<span className="material-symbols-outlined text-xl" data-icon="alt_route">alt_route</span>
</div>
<span className="font-headline-sm text-lg font-bold tracking-tight text-primary">JejakMasWowo</span>
</a>
<nav className="hidden md:flex items-center gap-6">
<a className="text-secondary font-semibold text-sm border-b-2 border-secondary pb-1 flex items-center gap-1 transition-colors" href="#/katalog">
<span>Cari Layanan</span>
</a>
<a className="text-on-surface-variant hover:text-primary text-sm font-medium pb-1 transition-colors flex items-center gap-1" href="#/katalog">
<span>Cara Kerja</span>
</a>
<a className="text-on-surface-variant hover:text-primary text-sm font-medium pb-1 transition-colors flex items-center gap-1" href="#/katalog">
<span onClick={() => openChat()}>Bantuan</span>
</a>
</nav>
</div>
<div className="flex items-center gap-3">
<button className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary font-label-md text-sm hover:bg-surface-container-low transition-colors duration-150" type="button">
        Masuk
      </button>
<button className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-label-md text-sm shadow-sm hover:bg-on-secondary-fixed-variant transition-colors duration-150" type="button">
        Daftar
      </button>
</div>
</div>
</header>
{/*  Main Canvas  */}
<main className="flex-grow max-w-6xl mx-auto w-full px-6 py-8">
{/*  Breadcrumb  */}
<nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
<a className="hover:text-primary transition-colors flex items-center gap-1" href="#/katalog">
<span className="material-symbols-outlined text-base" data-icon="home">home</span>
<span>Beranda</span>
</a>
<span className="material-symbols-outlined text-xs text-outline" data-icon="chevron_right">chevron_right</span>
<span className="text-primary font-medium">Cari Layanan</span>
</nav>
{/*  Page Heading Cluster  */}
<section className="mb-8">
<div className="flex flex-col gap-2">
<h1 className="font-headline-lg text-headline-lg text-primary-container font-extrabold tracking-tight">
        Mau mengurus apa hari ini?
      </h1>
<p className="text-on-surface-variant font-body-lg text-body-lg">
        Temukan panduan yang sesuai dengan kebutuhan dan wilayahmu.
      </p>
</div>
<div className="mt-4 p-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg flex items-center gap-3 shadow-sm">
<span className="material-symbols-outlined text-secondary text-xl flex-shrink-0" data-icon="info">info</span>
<div className="flex flex-wrap items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
<span>Kelola persiapan dan dokumenmu dari akun ini.</span>
<span className="text-outline-variant">•</span>
<span className="text-outline font-medium">Pembaruan: 28 Oktober 2026 — Contoh data simulasi independen.</span>
</div>
</div>
</section>
{/*  Prominent Search & Region Toolbar  */}
<section className="mb-10">
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 md:p-4 shadow-sm">
<form className="flex flex-col md:flex-row items-stretch gap-3">
<div className="relative md:w-72 flex-shrink-0">
<label className="sr-only" htmlFor="region-select">Pilih Wilayah</label>
<div className="h-12 w-full flex items-center justify-between px-3.5 bg-surface-container-low border border-outline-variant rounded-lg cursor-pointer hover:border-secondary transition-colors">
<div className="flex items-center gap-2 overflow-hidden">
<span className="material-symbols-outlined text-primary-container text-lg" data-icon="location_on">location_on</span>
<span className="font-label-md text-label-md text-primary font-semibold truncate">Kota Contoh</span>
</div>
<span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption tracking-wider font-bold uppercase">
              Simulasi
            </span>
</div>
</div>
<div className="relative flex-grow">
<span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined" data-icon="search">search</span>
<input className="w-full h-12 pl-11 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-primary placeholder-on-surface-variant/60 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 transition-all" placeholder="Cari layanan, formulir, atau kata kunci (contoh: akta lahir, pindah domisili, kartu keluarga)..." type="text"/>
</div>
<button className="h-12 px-7 bg-secondary hover:bg-on-secondary-fixed-variant text-on-secondary font-label-md text-label-md rounded-lg flex items-center justify-center gap-2 transition-colors duration-150 shadow-sm flex-shrink-0" type="button">
<span className="material-symbols-outlined text-lg" data-icon="search">search</span>
<span>Cari Layanan</span>
</button>
</form>
</div>
</section>
{/*  Catalogue Body: 2-Column Layout (Sidebar Filter + Main Cards)  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
{/*  Left Filter Column  */}
<aside className="lg:col-span-3 space-y-6">
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
<div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-5">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-xl" data-icon="tune">tune</span>
<h2 className="font-title-md text-title-md text-primary font-bold">Filter Layanan</h2>
</div>
<button className="text-secondary hover:underline font-label-sm text-label-sm font-semibold" type="button">
            Reset
          </button>
</div>
{/*  Group 1: Kategori Layanan  */}
<div className="mb-6">
<h3 className="font-label-md text-label-md text-primary font-bold mb-3 flex items-center justify-between">
<span>Kategori Layanan</span>
<span className="material-symbols-outlined text-outline text-base" data-icon="expand_less">expand_less</span>
</h3>
<div className="space-y-2.5 font-body-sm text-body-sm text-on-surface">
<label className="flex items-center gap-2.5 cursor-pointer">
<input defaultChecked className="w-4 h-4 text-secondary border-outline rounded-full focus:ring-secondary/20" name="kategori" type="radio"/>
<span className="font-medium text-secondary">Semua Kategori (aktif)</span>
</label>
<label className="flex items-center gap-2.5 cursor-pointer">
<input className="w-4 h-4 text-secondary border-outline rounded-full focus:ring-secondary/20" name="kategori" type="radio"/>
<span className="text-on-surface-variant">Kependudukan &amp; Catatan Sipil</span>
</label>
<label className="flex items-center gap-2.5 cursor-pointer">
<input className="w-4 h-4 text-secondary border-outline rounded-full focus:ring-secondary/20" name="kategori" type="radio"/>
<span className="text-on-surface-variant">Surat Keterangan Warga</span>
</label>
<label className="flex items-center gap-2.5 cursor-pointer">
<input className="w-4 h-4 text-secondary border-outline rounded-full focus:ring-secondary/20" name="kategori" type="radio"/>
<span className="text-on-surface-variant">Pencatatan Peristiwa</span>
</label>
</div>
</div>
{/*  Group 2: Instansi Terkait  */}
<div className="mb-6 pt-5 border-t border-outline-variant">
<h3 className="font-label-md text-label-md text-primary font-bold mb-3 flex items-center justify-between">
<span>Instansi Terkait</span>
<span className="material-symbols-outlined text-outline text-base" data-icon="expand_less">expand_less</span>
</h3>
<div className="space-y-2.5 font-body-sm text-body-sm text-on-surface-variant">
<label className="flex items-center gap-2.5 cursor-pointer">
<input defaultChecked className="w-4 h-4 text-secondary border-outline-variant rounded focus:ring-secondary/20" type="checkbox"/>
<span>Disdukcapil — contoh layanan</span>
</label>
<label className="flex items-center gap-2.5 cursor-pointer">
<input className="w-4 h-4 text-secondary border-outline-variant rounded focus:ring-secondary/20" type="checkbox"/>
<span>Kelurahan / Desa</span>
</label>
<label className="flex items-center gap-2.5 cursor-pointer">
<input className="w-4 h-4 text-secondary border-outline-variant rounded focus:ring-secondary/20" type="checkbox"/>
<span>Kecamatan</span>
</label>
</div>
</div>
{/*  Group 3: Jenis Pengurusan  */}
<div className="mb-5 pt-5 border-t border-outline-variant">
<h3 className="font-label-md text-label-md text-primary font-bold mb-3 flex items-center justify-between">
<span>Jenis Pengurusan</span>
<span className="material-symbols-outlined text-outline text-base" data-icon="expand_less">expand_less</span>
</h3>
<div className="space-y-2.5 font-body-sm text-body-sm text-on-surface-variant">
<label className="flex items-center gap-2.5 cursor-pointer">
<input defaultChecked className="w-4 h-4 text-secondary border-outline-variant rounded focus:ring-secondary/20" type="checkbox"/>
<span>Penerbitan Baru</span>
</label>
<label className="flex items-center gap-2.5 cursor-pointer">
<input defaultChecked className="w-4 h-4 text-secondary border-outline-variant rounded focus:ring-secondary/20" type="checkbox"/>
<span>Pembaruan / Perubahan Data</span>
</label>
<label className="flex items-center gap-2.5 cursor-pointer">
<input className="w-4 h-4 text-secondary border-outline-variant rounded focus:ring-secondary/20" type="checkbox"/>
<span>Pembetulan Data</span>
</label>
<label className="flex items-center gap-2.5 cursor-pointer">
<input className="w-4 h-4 text-secondary border-outline-variant rounded focus:ring-secondary/20" type="checkbox"/>
<span>Pindah Datang</span>
</label>
</div>
</div>
<div className="p-3 bg-surface-container-low rounded-lg border border-surface-dim flex items-start gap-2">
<span className="material-symbols-outlined text-secondary text-base mt-0.5 flex-shrink-0" data-icon="info_outline">info</span>
<p className="font-caption text-caption text-on-surface-variant leading-relaxed">
            Filter disesuaikan untuk prototipe Kota Contoh.
          </p>
</div>
</div>
</aside>
{/*  Main Service Grid Column  */}
<section className="lg:col-span-9 space-y-6">
<div className="flex items-center justify-between pb-2">
<div className="flex items-center gap-2">
<span className="font-title-md text-title-md text-primary font-bold">Daftar Layanan Tersedia</span>
<span className="px-2 py-0.5 bg-surface-container-high text-primary font-label-sm text-label-sm rounded-full font-bold">4 Modul</span>
</div>
<div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
<span>Urutan:</span>
<select className="bg-surface-container-lowest border border-outline-variant text-primary rounded-lg py-1 px-3 text-body-sm focus:ring-1 focus:ring-secondary focus:border-secondary">
<option>Paling Sering Diakses</option>
<option>Waktu Pengurusan Tercepat</option>
</select>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
{/*  Card 1: Akta Kelahiran  */}
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:border-secondary-container hover:shadow-md transition-all flex flex-col justify-between">
<div>
<div className="flex items-start justify-between gap-3 mb-4">
<div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-dim flex items-center justify-center text-secondary flex-shrink-0">
<span className="material-symbols-outlined text-2xl" data-icon="child_friendly">child_friendly</span>
</div>
<div className="flex flex-wrap items-center justify-end gap-1.5">
<span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-secondary-container font-label-sm text-label-sm font-semibold">
                  Contoh layanan
                </span>
<span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                  Disdukcapil (contoh)
                </span>
</div>
</div>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-2">
              Akta Kelahiran
            </h3>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-3 mb-5 leading-relaxed">
              Persiapan berkas pencatatan kelahiran anak, surat keterangan lahir dari faskes, dan integrasi penambahan anggota kartu keluarga.
            </p>
<div className="space-y-2 border-t border-surface-container-high pt-4 mb-5 font-caption text-caption text-on-surface-variant">
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline" data-icon="location_on">location_on</span><span>Wilayah: <strong className="text-primary">Kota Contoh (Simulasi)</strong></span></div>
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline" data-icon="description">description</span><span>Contoh dokumen — persyaratan belum diverifikasi</span></div>
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline" data-icon="schedule">schedule</span><span>Estimasi mandiri: Belum diverifikasi — contoh simulasi</span></div>
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline" data-icon="payments">payments</span><span>Biaya: Belum diverifikasi — contoh simulasi</span></div>
</div>
</div>
<div>
<div className="mb-3">
<span className="inline-flex items-center gap-1 font-caption text-caption text-outline">
<span className="material-symbols-outlined text-xs" data-icon="verified_user">verified_user</span>
                Bukan pengajuan resmi — persiapan draf
              </span>
</div>
<button className="w-full py-2.5 px-4 bg-surface-container-low hover:bg-secondary hover:text-on-secondary text-primary font-label-md text-label-md font-semibold rounded-lg border border-surface-dim hover:border-secondary flex items-center justify-center gap-2 transition-all" type="button">
<span>Lihat Panduan</span>
<span className="material-symbols-outlined text-lg" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</div>
{/*  Card 2: Kartu Keluarga (KK)  */}
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:border-secondary-container hover:shadow-md transition-all flex flex-col justify-between">
<div>
<div className="flex items-start justify-between gap-3 mb-4">
<div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-dim flex items-center justify-center text-secondary flex-shrink-0">
<span className="material-symbols-outlined text-2xl" data-icon="groups">groups</span>
</div>
<div className="flex flex-wrap items-center justify-end gap-1.5">
<span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-secondary-container font-label-sm text-label-sm font-semibold">
                  Contoh layanan
                </span>
<span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                  Disdukcapil (contoh)
                </span>
</div>
</div>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-2">
              Kartu Keluarga (KK)
            </h3>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-3 mb-5 leading-relaxed">
              Panduan pemecahan KK, penambahan anggota keluarga baru, penggantian kepala keluarga, atau perbaikan elemen data kependudukan.
            </p>
<div className="space-y-2 border-t border-surface-container-high pt-4 mb-5 font-caption text-caption text-on-surface-variant">
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline" data-icon="location_on">location_on</span><span>Wilayah: <strong className="text-primary">Kota Contoh (Simulasi)</strong></span></div>
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline" data-icon="description">description</span><span>Contoh dokumen — persyaratan belum diverifikasi</span></div>
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline" data-icon="schedule">schedule</span><span>Estimasi mandiri: Belum diverifikasi — contoh simulasi</span></div>
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline" data-icon="payments">payments</span><span>Biaya: Belum diverifikasi — contoh simulasi</span></div>
</div>
</div>
<div>
<div className="mb-3">
<span className="inline-flex items-center gap-1 font-caption text-caption text-outline">
<span className="material-symbols-outlined text-xs" data-icon="verified_user">verified_user</span>
                Bukan pengajuan resmi — persiapan draf
              </span>
</div>
<button className="w-full py-2.5 px-4 bg-surface-container-low hover:bg-secondary hover:text-on-secondary text-primary font-label-md text-label-md font-semibold rounded-lg border border-surface-dim hover:border-secondary flex items-center justify-center gap-2 transition-all" type="button">
<span>Lihat Panduan</span>
<span className="material-symbols-outlined text-lg" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</div>
{/*  Card 3: Perpindahan Penduduk (SKPWNI)  */}
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:border-secondary-container hover:shadow-md transition-all flex flex-col justify-between">
<div>
<div className="flex items-start justify-between gap-3 mb-4">
<div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-dim flex items-center justify-center text-secondary flex-shrink-0">
<span className="material-symbols-outlined text-2xl" data-icon="swap_horiz">swap_horiz</span>
</div>
<div className="flex flex-wrap items-center justify-end gap-1.5">
<span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-secondary-container font-label-sm text-label-sm font-semibold">
                  Contoh layanan
                </span>
<span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                  Disdukcapil (contoh)
                </span>
</div>
</div>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-2">
              Perpindahan Penduduk (SKPWNI)
            </h3>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-3 mb-5 leading-relaxed">
              Pencatatan pindah datang antar-kelurahan, kecamatan, maupun antarkota beserta syarat surat pengantar dan perbaruan data KTP-el.
            </p>
<div className="space-y-2 border-t border-surface-container-high pt-4 mb-5 font-caption text-caption text-on-surface-variant">
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline" data-icon="location_on">location_on</span><span>Wilayah: <strong className="text-primary">Kota Contoh (Simulasi)</strong></span></div>
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline" data-icon="description">description</span><span>Contoh dokumen — persyaratan belum diverifikasi</span></div>
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline" data-icon="schedule">schedule</span><span>Estimasi mandiri: Belum diverifikasi — contoh simulasi</span></div>
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline" data-icon="payments">payments</span><span>Biaya: Belum diverifikasi — contoh simulasi</span></div>
</div>
</div>
<div>
<div className="mb-3">
<span className="inline-flex items-center gap-1 font-caption text-caption text-outline">
<span className="material-symbols-outlined text-xs" data-icon="verified_user">verified_user</span>
                Bukan pengajuan resmi — persiapan draf
              </span>
</div>
<button className="w-full py-2.5 px-4 bg-surface-container-low hover:bg-secondary hover:text-on-secondary text-primary font-label-md text-label-md font-semibold rounded-lg border border-surface-dim hover:border-secondary flex items-center justify-center gap-2 transition-all" type="button">
<span>Lihat Panduan</span>
<span className="material-symbols-outlined text-lg" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</div>
{/*  Card 4: Surat Keterangan Kematian (contoh)  */}
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:border-secondary-container hover:shadow-md transition-all flex flex-col justify-between">
<div>
<div className="flex items-start justify-between gap-3 mb-4">
<div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-dim flex items-center justify-center text-secondary flex-shrink-0">
<span className="material-symbols-outlined text-2xl" data-icon="history_edu">history_edu</span>
</div>
<div className="flex flex-wrap items-center justify-end gap-1.5">
<span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-secondary-container font-label-sm text-label-sm font-semibold">
                  Contoh layanan
                </span>
<span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                  Kelurahan &amp; Disdukcapil (contoh)
                </span>
</div>
</div>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-2">
              Surat Keterangan Kematian (contoh)
            </h3>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-3 mb-5 leading-relaxed">
              Penerbitan akta kematian dan penyesuaian status pada kartu keluarga serta dokumen administrasi kependudukan ahli waris.
            </p>
<div className="space-y-2 border-t border-surface-container-high pt-4 mb-5 font-caption text-caption text-on-surface-variant">
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline" data-icon="location_on">location_on</span><span>Wilayah: <strong className="text-primary">Kota Contoh (Simulasi)</strong></span></div>
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline" data-icon="description">description</span><span>Contoh dokumen — persyaratan belum diverifikasi</span></div>
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline" data-icon="schedule">schedule</span><span>Estimasi mandiri: Belum diverifikasi — contoh simulasi</span></div>
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline" data-icon="payments">payments</span><span>Biaya: Belum diverifikasi — contoh simulasi</span></div>
</div>
</div>
<div>
<div className="mb-3">
<span className="inline-flex items-center gap-1 font-caption text-caption text-outline">
<span className="material-symbols-outlined text-xs" data-icon="verified_user">verified_user</span>
                Bukan pengajuan resmi — persiapan draf
              </span>
</div>
<button className="w-full py-2.5 px-4 bg-surface-container-low hover:bg-secondary hover:text-on-secondary text-primary font-label-md text-label-md font-semibold rounded-lg border border-surface-dim hover:border-secondary flex items-center justify-center gap-2 transition-all" type="button">
<span>Lihat Panduan</span>
<span className="material-symbols-outlined text-lg" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</div>
</div>
</section>
</div>
{/*  Compact Lower Panel  */}
<section className="mt-12 bg-surface-container-low border border-outline-variant rounded-xl p-6 lg:p-8">
<div className="flex flex-col md:flex-row items-center justify-between gap-6">
<div className="space-y-2 max-w-2xl">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-2xl" data-icon="help_center">help_center</span>
<h3 className="font-headline-sm text-headline-sm text-primary font-bold">
            Belum menemukan layanan yang kamu cari?
          </h3>
</div>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          Kamu dapat mengganti wilayah simulasi atau mengajukan saran layanan kependudukan lain untuk ditambahkan ke modul panduan independen ini.
        </p>
</div>
<div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
<button className="px-5 py-2.5 bg-surface-container-lowest border border-outline-variant text-primary font-label-md text-label-md font-medium rounded-lg hover:bg-surface-container transition-colors shadow-sm" type="button">
          Ganti Wilayah Simulasi
        </button>
<a className="px-4 py-2.5 text-secondary hover:text-on-secondary-fixed-variant font-label-md text-label-md font-semibold underline underline-offset-4 flex items-center gap-1 transition-colors" href="#/katalog">
<span>Kirim Masukan Layanan</span>
<span className="material-symbols-outlined text-base" data-icon="open_in_new">open_in_new</span>
</a>
</div>
</div>
</section>
</main>
{/*  Floating Help Button (Closed State)  */}
{/*  Footer (Web Footer from Shared Components JSON)  */}
<footer className="bg-primary text-on-primary border-t border-primary-container mt-16">
<div className="w-full max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
{/*  Brand & Copyright  */}
<div className="space-y-3">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-surface-container-lowest/10 flex items-center justify-center">
<span className="material-symbols-outlined text-secondary-fixed text-lg" data-icon="alt_route">alt_route</span>
</div>
<span className="font-headline-sm text-headline-sm font-bold text-on-primary">JejakMasWowo</span>
</div>
<p className="font-body-sm text-body-sm text-on-primary-container max-w-md">© 2026 JejakMasWowo Civic Transparency Portal. Seluruh hak cipta dilindungi undang-undang. Diperbarui 28 Oktober 2026.</p>
</div>
{/*  Links  */}
<div className="flex flex-wrap items-center gap-y-2 gap-x-6 font-label-sm text-label-sm">
<a className="text-on-primary-container hover:text-on-primary transition-colors" href="#/katalog">Kebijakan Privasi</a>
<a className="text-on-primary-container hover:text-on-primary transition-colors" href="#/katalog">Ketentuan Layanan</a>
<a className="text-on-primary-container hover:text-on-primary transition-colors" href="#/katalog">Keterbukaan Informasi Publik</a>
<a className="text-on-primary-container hover:text-on-primary transition-colors" href="#/katalog">Panduan Registrasi Warga</a>
<a className="text-on-primary-container hover:text-on-primary transition-colors" href="#/katalog">Pusat Pengaduan</a>
</div>
</div>
{/*  Institutional Disclaimer Strip  */}
<div className="border-t border-primary-container/80 py-4 px-6 bg-primary">
<div className="max-w-6xl mx-auto text-center font-caption text-caption text-on-primary-container leading-relaxed">
<strong>Pemberitahuan Resmi:</strong> Prototipe independen. Bukan portal resmi pemerintah. Data yang ditampilkan adalah contoh simulasi untuk pengujian antarmuka dan literasi tata kelola berkas warga.
    </div>
</div>
</footer>

    </div>
  );
};
