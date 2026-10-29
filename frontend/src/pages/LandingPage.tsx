import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { openChat } = useApp();

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed">

{/*  1. Top Utility Strip  */}
{/*  2. Header Navigation (Shared Component Integration)  */}
<header className="bg-surface-container-lowest border-b border-outline-variant/40 shadow-sm sticky top-0 z-40">
<div className="w-full px-6 max-w-6xl mx-auto flex items-center justify-between h-[72px]"><a className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-secondary rounded-lg p-1" href="#/katalog"><div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm group-hover:bg-primary transition-colors"><span className="material-symbols-outlined text-secondary-container" data-icon="task_alt">task_alt</span></div><div className="flex flex-col"><span className="text-headline-sm font-headline-sm font-bold text-primary tracking-tight leading-none">JejakMasWowo</span><span className="text-caption font-caption text-on-surface-variant leading-none mt-1">Panduan dan persiapan layanan warga</span></div></a><nav className="hidden md:flex items-center gap-8"><a className="text-secondary border-b-2 border-secondary font-semibold pb-1 text-label-md font-label-md" href="#/katalog">Cari Layanan</a><a className="text-on-surface-variant hover:text-primary pb-1 font-medium text-label-md font-label-md transition-colors" href="#cara-kerja">Cara Kerja</a><a className="text-on-surface-variant hover:text-primary pb-1 font-medium text-label-md font-label-md transition-colors" href="#faq" onClick={() => openChat()}>Bantuan</a></nav><div className="flex items-center gap-3"><button className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-primary text-label-md font-label-md hover:bg-surface-container-low transition-colors duration-150" type="button" onClick={() => navigate("/masuk")}>Masuk</button><button className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-secondary text-on-secondary text-label-md font-label-md font-medium hover:bg-secondary/90 shadow-sm transition-all duration-200 active:scale-95" type="button" onClick={() => navigate("/masuk")}>Daftar</button></div></div>
</header>
<main className="flex-1">
{/*  3. Hero Section (Pale blue surface #F0F4FA / surface-container-low)  */}
<section className="bg-surface-container-low/70 pt-12 pb-24 border-b border-outline-variant/30">
<div className="max-w-6xl mx-auto px-6"><div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"><div className="lg:col-span-7 space-y-6"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-secondary text-label-sm font-label-sm border border-secondary-fixed"><span className="material-symbols-outlined text-sm" data-icon="verified_user">verified_user</span> Inisiatif Edukasi Layanan Kependudukan</div><h1 className="text-display font-display text-primary tracking-tight">Urus layanan publik, <span className="text-secondary">lebih siap dan jelas.</span></h1><p className="text-body-lg font-body-lg text-on-surface-variant max-w-xl">Temukan panduan, periksa berkas dengan AI, dan ikuti proses pengajuan dalam satu tempat tanpa kebingungan birokrasi.</p><div className="flex flex-wrap items-center gap-4 pt-2"><a className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-secondary/90 shadow-sm transition-all duration-150 active:scale-95" href="#/katalog">Cari layanan<span className="material-symbols-outlined ml-2" data-icon="search">search</span></a><a className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-surface-container-lowest text-primary border border-outline-variant/70 font-label-md text-label-md font-semibold hover:bg-surface-container-low transition-colors duration-150" href="#cara-kerja">Lihat cara kerja<span className="material-symbols-outlined ml-2" data-icon="arrow_forward">arrow_forward</span></a></div><div className="pt-4 flex items-center gap-6 text-body-sm font-body-sm text-on-surface-variant/80 border-t border-outline-variant/20"><span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-tertiary-container text-base" data-icon="lock_open">lock_open</span>Panduan publik dapat dibaca tanpa akun</span><span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-secondary text-base" data-icon="shield">shield</span>Kelola persiapan dan dokumenmu dari akun ini</span></div></div><div className="lg:col-span-5"><div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm p-6 relative"><div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-5"><div><h2 className="text-title-md font-title-md text-primary">Simulasi Persiapan Berkas</h2><p className="text-caption font-caption text-on-surface-variant">Draf Pengajuan Akta Kelahiran</p></div><span className="inline-flex items-center px-2.5 py-1 rounded-full text-caption font-caption bg-surface-container text-secondary font-semibold border border-secondary-fixed">Sesi Latihan</span></div><div className="flex flex-wrap items-center gap-2 mb-5"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-caption font-caption bg-tertiary-fixed/30 text-on-tertiary-container font-semibold border border-tertiary-fixed">Berkas terbaca (2)</span><span className="inline-flex items-center px-2.5 py-1 rounded-full text-caption font-caption bg-error-container/40 text-on-error-container font-semibold border border-error-container">Perlu perbaikan (1)</span><span className="inline-flex items-center px-2.5 py-1 rounded-full text-caption font-caption bg-surface-container-high text-on-secondary-container font-semibold border border-secondary-fixed">Diproses di loket (0)</span></div><div className="space-y-3 mb-6"><div className="p-3.5 rounded-lg border border-outline-variant/30 bg-surface-container-lowest flex items-start justify-between"><div className="flex items-start gap-3"><span className="material-symbols-outlined text-tertiary-container mt-0.5" data-icon="description">description</span><div><p className="text-label-md font-label-md text-primary font-medium">Kartu Keluarga (contoh)</p><p className="text-caption font-caption text-on-surface-variant">Format PDF · Ukuran 420 KB</p></div></div><span className="inline-flex items-center gap-1 text-caption font-caption font-semibold text-on-tertiary-container bg-tertiary-fixed/30 px-2 py-0.5 rounded"><span className="material-symbols-outlined text-xs" data-icon="check_circle">check_circle</span>Format valid</span></div><div className="p-3.5 rounded-lg border border-error-container/60 bg-error-container/10 flex items-start justify-between"><div className="flex items-start gap-3"><span className="material-symbols-outlined text-error mt-0.5" data-icon="warning">warning</span><div><p className="text-label-md font-label-md text-primary font-medium">Surat Pengantar RT/RW (contoh)</p><p className="text-caption font-caption text-error">Foto sedikit miring &amp; nama terpotong</p></div></div><span className="inline-flex items-center gap-1 text-caption font-caption font-semibold text-error bg-error-container px-2 py-0.5 rounded">Periksa ulang</span></div></div><div className="bg-surface-container-low/60 rounded-lg p-3.5 border border-outline-variant/20"><div className="flex items-center justify-between text-caption font-caption text-on-surface-variant mb-2"><span>Status Kelengkapan Simulasi</span><span className="font-semibold text-secondary">2 dari 3 Berkas Siap</span></div><div className="w-full bg-outline-variant/30 h-2 rounded-full overflow-hidden"><div className="bg-secondary h-full rounded-full" style={{ width: '66%' }}></div></div><p className="text-caption font-caption text-on-surface-variant mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-xs" data-icon="info">info</span>1 berkas perlu perbaikan sebelum mendatangi kantor pelayanan.</p></div></div></div></div></div>
</section>
{/*  4. Overlapping Wide Service-Search Card  */}
<section className="relative -mt-10 z-20 px-6 max-w-6xl mx-auto">
<div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/50 shadow-md p-6 lg:p-8">
<label className="block text-headline-sm font-headline-sm text-primary mb-4" htmlFor="search-service">
          Apa yang ingin kamu urus?
        </label>
<form className="grid grid-cols-1 md:grid-cols-12 gap-3" onSubmit={(e) => e.preventDefault()}>
{/*  Region dropdown  */}
<div className="md:col-span-4 relative">
<label className="sr-only" htmlFor="region-select">Pilih Wilayah</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg" data-icon="location_on">location_on</span>
<select className="w-full h-12 pl-10 pr-8 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-body-md font-body-md text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20" id="region-select">
<option value="kota-contoh">Kota Contoh · Simulasi</option>
<option value="kabupaten-latihan">Kabupaten Latihan · Panduan Standar</option>
<option value="provinsi-rujukan">Provinsi Rujukan · Standar Nasional</option>
</select>
</div>
</div>
{/*  Search input  */}
<div className="md:col-span-6 relative">
<span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg" data-icon="search">search</span>
<input className="w-full h-12 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-body-md font-body-md text-primary placeholder:text-on-surface-variant/60 focus:border-secondary focus:ring-2 focus:ring-secondary/20" id="search-service" placeholder="Contoh: mengurus dokumen anak baru lahir" type="text"/>
</div>
{/*  Submit button  */}
<div className="md:col-span-2">
<button className="w-full h-12 bg-secondary text-on-secondary rounded-lg font-label-md text-label-md font-semibold hover:bg-secondary/90 transition-colors shadow-sm flex items-center justify-center gap-2" type="submit">
              Cari layanan
            </button>
</div>
</form>
{/*  Micro-copy  */}
<div className="mt-4 flex items-center gap-2 text-caption font-caption text-on-surface-variant">
<span className="material-symbols-outlined text-sm" data-icon="info">info</span>
<span>Cari dan baca panduan tanpa perlu akun. Semua syarat dapat diunduh bebas.</span>
</div>
</div>
</section>
{/*  5. Service Category Grid ('Mulai dari kebutuhanmu')  */}
<section className="py-20 px-6 max-w-6xl mx-auto" id="katalog-layanan">
<div className="mb-10 text-left">
<h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">Mulai dari kebutuhanmu</h2>
<p className="text-body-lg font-body-lg text-on-surface-variant mt-2 max-w-2xl">
          Pilih layanan kependudukan umum untuk melihat persyaratan dan panduan berkas simulasi.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{/*  Card 1: Akta Kelahiran  */}
<article className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 flex flex-col justify-between hover:border-secondary hover:shadow-md transition-all group">
<div>
<div className="flex items-center justify-between mb-4">
<span className="inline-flex items-center px-2 py-0.5 rounded text-caption font-caption bg-surface-container text-secondary font-semibold">
                Contoh layanan
              </span>
<div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
<span className="material-symbols-outlined" data-icon="child_friendly">child_friendly</span>
</div>
</div>
<h3 className="text-headline-sm font-headline-sm text-primary mb-2">Akta Kelahiran</h3>
<p className="text-body-md font-body-md text-on-surface-variant mb-6">
              Persiapan berkas pencatatan kelahiran anak, surat keterangan lahir, dan pembaruan data keluarga.
            </p>
</div>
<div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
<span className="text-caption font-caption text-on-surface-variant">4 dokumen wajib</span>
<a className="inline-flex items-center text-label-md font-label-md font-semibold text-secondary hover:underline group-hover:translate-x-0.5 transition-transform" href="#simulasi-ai">
              Lihat panduan →
            </a>
</div>
</article>
{/*  Card 2: Kartu Keluarga  */}
<article className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 flex flex-col justify-between hover:border-secondary hover:shadow-md transition-all group">
<div>
<div className="flex items-center justify-between mb-4">
<span className="inline-flex items-center px-2 py-0.5 rounded text-caption font-caption bg-surface-container text-secondary font-semibold">
                Contoh layanan
              </span>
<div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
<span className="material-symbols-outlined" data-icon="groups">groups</span>
</div>
</div>
<h3 className="text-headline-sm font-headline-sm text-primary mb-2">Kartu Keluarga</h3>
<p className="text-body-md font-body-md text-on-surface-variant mb-6">
              Penambahan anggota baru, pemisahan kartu keluarga, atau pembetulan elemen data berkas kependudukan.
            </p>
</div>
<div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
<span className="text-caption font-caption text-on-surface-variant">3 alur pengurusan</span>
<a className="inline-flex items-center text-label-md font-label-md font-semibold text-secondary hover:underline group-hover:translate-x-0.5 transition-transform" href="#simulasi-ai">
              Lihat panduan →
            </a>
</div>
</article>
{/*  Card 3: Perpindahan Penduduk  */}
<article className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 flex flex-col justify-between hover:border-secondary hover:shadow-md transition-all group">
<div>
<div className="flex items-center justify-between mb-4">
<span className="inline-flex items-center px-2 py-0.5 rounded text-caption font-caption bg-surface-container text-secondary font-semibold">
                Contoh layanan
              </span>
<div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
<span className="material-symbols-outlined" data-icon="explore">explore</span>
</div>
</div>
<h3 className="text-headline-sm font-headline-sm text-primary mb-2">Perpindahan Penduduk</h3>
<p className="text-body-md font-body-md text-on-surface-variant mb-6">
              Surat keterangan pindah datang dan pembaharuan dokumen domisili warga antarwilayah kelurahan atau kota.
            </p>
</div>
<div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
<span className="text-caption font-caption text-on-surface-variant">Surat SKPWNI contoh</span>
<a className="inline-flex items-center text-label-md font-label-md font-semibold text-secondary hover:underline group-hover:translate-x-0.5 transition-transform" href="#simulasi-ai">
              Lihat panduan →
            </a>
</div>
</article>
</div>
</section>
{/*  6. Restrained Navy Feature Band ('Dari bingung jadi tahu langkah berikutnya')  */}
<section className="bg-primary text-on-primary py-20 px-6" id="cara-kerja">
<div className="max-w-6xl mx-auto">
<div className="max-w-3xl mb-14">
<span className="text-secondary-fixed text-label-sm font-label-sm uppercase tracking-wider font-semibold">Alur Persiapan Mandiri</span>
<h2 className="text-headline-lg font-headline-lg text-on-primary mt-2">Dari bingung jadi tahu langkah berikutnya</h2>
<p className="text-body-lg font-body-lg text-primary-fixed-dim mt-2">
            Alur mandiri warga dari pengecekan awal hingga pengajuan ke instansi terkait.
          </p>
</div>
{/*  4-step horizontal process cards  */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
{/*  Step 1  */}
<div className="bg-primary-container p-6 rounded-xl border border-primary-fixed-dim/20 flex flex-col justify-between">
<div>
<div className="w-10 h-10 rounded-lg bg-surface-container-lowest/10 text-secondary-fixed flex items-center justify-center font-headline-sm font-headline-sm font-bold mb-4 border border-surface-container-lowest/15">
                1
              </div>
<h3 className="text-title-md font-title-md text-on-primary mb-2">Pahami layanan</h3>
<p className="text-body-sm font-body-sm text-primary-fixed-dim leading-relaxed">
                Pelajari syarat, alur, dan dokumen tanpa harus mendaftar akun terlebih dahulu.
              </p>
</div>
<div className="pt-4 mt-4 border-t border-primary-fixed-dim/15 text-caption font-caption text-primary-fixed-dim flex items-center gap-1.5">
<span className="material-symbols-outlined text-xs" data-icon="article">article</span>
              Panduan teks ringkas
            </div>
</div>
{/*  Step 2  */}
<div className="bg-primary-container p-6 rounded-xl border border-primary-fixed-dim/20 flex flex-col justify-between">
<div>
<div className="w-10 h-10 rounded-lg bg-surface-container-lowest/10 text-secondary-fixed flex items-center justify-center font-headline-sm font-headline-sm font-bold mb-4 border border-surface-container-lowest/15">
                2
              </div>
<h3 className="text-title-md font-title-md text-on-primary mb-2">Siapkan &amp; periksa</h3>
<p className="text-body-sm font-body-sm text-primary-fixed-dim leading-relaxed">
                Unggah draf berkas untuk dianalisis oleh AI; temukan ketidaksesuaian data lebih awal.
              </p>
</div>
<div className="pt-4 mt-4 border-t border-primary-fixed-dim/15 text-caption font-caption text-primary-fixed-dim flex items-center gap-1.5">
<span className="material-symbols-outlined text-xs" data-icon="auto_awesome">auto_awesome</span>
              Pemeriksaan OCR simulasi
            </div>
</div>
{/*  Step 3  */}
<div className="bg-primary-container p-6 rounded-xl border border-primary-fixed-dim/20 flex flex-col justify-between">
<div>
<div className="w-10 h-10 rounded-lg bg-surface-container-lowest/10 text-secondary-fixed flex items-center justify-center font-headline-sm font-headline-sm font-bold mb-4 border border-surface-container-lowest/15">
                3
              </div>
<h3 className="text-title-md font-title-md text-on-primary mb-2">Ajukan ke kanal resmi</h3>
<p className="text-body-sm font-body-sm text-primary-fixed-dim leading-relaxed">
                Kirimkan berkas mandiri melalui kanal resmi instansi atau loket Disdukcapil setempat.
              </p>
</div>
<div className="pt-4 mt-4 border-t border-primary-fixed-dim/15 text-caption font-caption text-primary-fixed-dim flex items-center gap-1.5">
<span className="material-symbols-outlined text-xs" data-icon="open_in_new">open_in_new</span>
              Kanal resmi pemerintah
            </div>
</div>
{/*  Step 4  */}
<div className="bg-primary-container p-6 rounded-xl border border-primary-fixed-dim/20 flex flex-col justify-between">
<div>
<div className="w-10 h-10 rounded-lg bg-surface-container-lowest/10 text-secondary-fixed flex items-center justify-center font-headline-sm font-headline-sm font-bold mb-4 border border-surface-container-lowest/15">
                4
              </div>
<h3 className="text-title-md font-title-md text-on-primary mb-2">Ikuti perkembangannya</h3>
<p className="text-body-sm font-body-sm text-primary-fixed-dim leading-relaxed">
                Catat nomor pengajuan dan pantau catatan berkas secara terstruktur di satu dasbor.
              </p>
</div>
<div className="pt-4 mt-4 border-t border-primary-fixed-dim/15 text-caption font-caption text-primary-fixed-dim flex items-center gap-1.5">
<span className="material-symbols-outlined text-xs" data-icon="timeline">timeline</span>
              Buku log mandiri
            </div>
</div>
</div>
{/*  Clarification Banner  */}
<div className="mt-10 p-4 rounded-xl bg-surface-container-lowest/10 border border-primary-fixed-dim/20 flex items-center gap-3">
<span className="material-symbols-outlined text-secondary-fixed" data-icon="shield">shield</span>
<p className="text-body-sm font-body-sm text-on-primary">
<strong className="text-secondary-fixed">Catatan Penting:</strong> JejakMasWowo adalah instrumen panduan mandiri. Pengajuan berkas resmi, penerbitan dokumen hukum, dan otentikasi data mutlak dilakukan oleh instansi pemerintah berwenang.
          </p>
</div>
</div>
</section>
{/*  7. Split Document Check Section ('Temukan kekurangan sebelum mengajukan')  */}
<section className="py-20 px-6 bg-surface-container-low/50 border-t border-outline-variant/30" id="simulasi-ai">
<div className="max-w-6xl mx-auto">
{/*  Left Side Copy (5 cols)  */}
<div className="lg:col-span-5 space-y-6">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-on-secondary-container text-label-sm font-label-sm font-semibold">
<span className="material-symbols-outlined text-sm" data-icon="psychology">psychology</span>
            Pemeriksaan Draf Cerdas
          </div>
<h2 className="text-headline-lg font-headline-lg text-primary tracking-tight">
            Temukan kekurangan sebelum mengajukan
          </h2>
<p className="text-body-lg font-body-lg text-on-surface-variant">
            Pemeriksaan awal AI membaca berkas draf, membandingkan kesesuaian penulisan nama dan nomor identitas simulasi, serta memberikan saran perbaikan sebelum kamu mendatangi kantor layanan.
          </p>
<div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-start gap-3">
<span className="material-symbols-outlined text-secondary mt-0.5" data-icon="verified">verified</span>
<div className="text-body-sm font-body-sm text-on-surface">
<strong>Prinsip Layanan:</strong> Pemeriksaan awal AI membantu persiapan. Keputusan resmi tetap pada instansi.
            </div>
</div>
<div className="flex items-center gap-3 pt-2">
<button className="px-5 py-2.5 rounded-lg bg-secondary text-on-secondary text-label-md font-label-md font-semibold hover:bg-secondary/90 transition-colors shadow-sm" type="button">
              Perbaiki data
            </button>
<button className="px-5 py-2.5 rounded-lg bg-surface-container-lowest text-primary border border-outline-variant/60 text-label-md font-label-md font-semibold hover:bg-surface-container-low transition-colors" type="button">
              Unggah berkas revisi
            </button>
</div>
</div>
{/*  Right Side AI OCR Simulated Inspection UI (7 cols)  */}
<div className="lg:col-span-7">
<div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm p-6 lg:p-8"><div className="flex flex-wrap items-center justify-between border-b border-outline-variant/30 pb-4 mb-5 gap-2"><div><h3 className="text-title-md font-title-md text-primary">Hasil Analisis Draf: Akta Kelahiran (contoh)</h3><p className="text-caption font-caption text-on-surface-variant">Simulasi: 28 Oktober 2026 · ID Berkas: DEMO-001</p></div><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-caption bg-secondary-fixed text-on-secondary-fixed font-semibold"><span className="material-symbols-outlined text-xs" data-icon="auto_awesome">auto_awesome</span>Pemeriksaan Draf Otomatis</span></div><div className="p-4 rounded-xl bg-error-container/20 border border-error-container text-on-surface mb-6 flex items-start gap-3"><span className="material-symbols-outlined text-error mt-0.5 text-xl" data-icon="report">report</span><div><p className="text-label-md font-label-md font-semibold text-error">Perbedaan penulisan nama terdeteksi</p><p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Terdapat perbedaan 1 karakter antara KTP dan Surat Lahir simulasi ('RADITYA ARYA' vs 'RADITYA ARIA').</p></div></div><div className="space-y-3 mb-6"><div className="p-3.5 rounded-lg border border-outline-variant/30 bg-surface-container-lowest flex items-center justify-between"><div><span className="text-caption font-caption text-on-surface-variant block">Nama Pemohon (Ibu)</span><span className="text-body-md font-body-md font-semibold text-primary">AYU PUSPITA</span></div><div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed/30 text-on-tertiary-container text-caption font-caption font-semibold"><span className="material-symbols-outlined text-xs" data-icon="check_circle">check_circle</span>Tidak ditemukan perbedaan pada bagian yang terbaca</div></div><div className="p-3.5 rounded-lg border border-outline-variant/30 bg-surface-container-lowest flex items-center justify-between"><div><span className="text-caption font-caption text-on-surface-variant block">NIK Pemohon (Sintetis)</span><span className="text-body-md font-body-md font-semibold text-primary font-mono">3201************</span></div><div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-secondary text-caption font-caption font-semibold"><span className="material-symbols-outlined text-xs" data-icon="check">check</span>16 digit terdeteksi</div></div><div className="p-3.5 rounded-lg border border-error-container/60 bg-error-container/10 flex items-center justify-between"><div><span className="text-caption font-caption text-error block">Nama Calon Bayi</span><span className="text-body-md font-body-md font-semibold text-primary">RADITYA ARYA</span></div><div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container text-caption font-caption font-semibold"><span className="material-symbols-outlined text-xs" data-icon="help_outline">help_outline</span>Perlu verifikasi ejaan</div></div></div><div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20"><button className="px-4 py-2 rounded-lg text-primary border border-outline-variant/60 text-label-md font-label-md font-medium hover:bg-surface-container-low transition-colors" type="button">Lihat catatan saran</button><button className="px-4 py-2 rounded-lg bg-secondary text-on-secondary text-label-md font-label-md font-medium hover:bg-secondary/90 transition-colors" type="button">Perbaiki data draf</button></div></div>
</div>
</div>
</section>
{/*  8. Transparency & Source-Labeled Tracking Section  */}
<section className="py-20 px-6 lg:px-12 bg-surface-container-low/50 border-t border-outline-variant/30">
<div className="max-w-7xl mx-auto">
<div className="mb-12">
<span className="text-secondary text-label-sm font-label-sm uppercase tracking-wider font-semibold">Integritas Informasi</span>
<h2 className="text-headline-lg font-headline-lg text-primary tracking-tight mt-1">Transparansi status dan sumber rujukan</h2>
<p className="text-body-lg font-body-lg text-on-surface-variant mt-2 max-w-2xl">
            JejakMasWowo melabeli dengan tegas asal setiap rincian status agar warga mengetahui perbedaan antara data catatan mandiri dan regulasi panduan.
          </p>
</div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
{/*  Left Column: Source-Labeled Tracking  */}
<div className="bg-surface-container-lowest p-6 lg:p-8 rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-6">
<h3 className="text-headline-sm font-headline-sm text-primary">Pelacakan Status Berlabel Sumber</h3>
<span className="material-symbols-outlined text-secondary" data-icon="policy">policy</span>
</div>
<p className="text-body-md font-body-md text-on-surface-variant mb-6">
                Setiap pembaruan status diberi penanda sumber yang jelas, menghindari ilusi sinkronisasi otomatis ke pangkalan data rahasia instansi.
              </p>
{/*  Timeline List  */}
<div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/40">
{/*  Timeline item 1  */}
<div className="relative pl-8">
<div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-secondary ring-4 ring-surface-container-lowest"></div>
<div className="p-3 rounded-lg bg-surface-container-low/60 border border-outline-variant/30">
<div className="flex items-center justify-between mb-1">
<span className="text-label-md font-label-md font-semibold text-primary">Draf Berkas Diunggah</span>
<span className="px-2 py-0.5 rounded text-caption font-caption bg-surface-container text-secondary font-semibold">
                        Sumber: catatan warga mandiri
                      </span>
</div>
<p className="text-body-sm font-body-sm text-on-surface-variant">
                      Warga mencatat dokumen awal telah disiapkan lengkap pada aplikasi internal.
                    </p>
<span className="text-caption font-caption text-on-surface-variant/70 mt-1 block">Hari ini, 09:15 WIB</span>
</div>
</div>
{/*  Timeline item 2  */}
<div className="relative pl-8">
<div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-tertiary-container ring-4 ring-surface-container-lowest"></div>
<div className="p-3 rounded-lg bg-surface-container-low/60 border border-outline-variant/30">
<div className="flex items-center justify-between mb-1">
<span className="text-label-md font-label-md font-semibold text-primary">Simulasi Loket Pelayanan</span>
<span className="px-2 py-0.5 rounded text-caption font-caption bg-tertiary-fixed/40 text-on-tertiary-container font-semibold">
                        Sumber: petugas simulasi
                      </span>
</div>
<p className="text-body-sm font-body-sm text-on-surface-variant">
                      Pemeriksaan kelengkapan berkas fisik pada simulator antrean warga.
                    </p>
<span className="text-caption font-caption text-on-surface-variant/70 mt-1 block">Hari ini, 10:30 WIB</span>
</div>
</div>
</div>
</div>
<div className="mt-6 pt-4 border-t border-outline-variant/20 text-caption font-caption text-on-surface-variant flex items-center gap-1.5">
<span className="material-symbols-outlined text-xs" data-icon="lock">lock</span>
              Bukan data dari server Disdukcapil asli. Hanya pelacakan log latihan.
            </div>
</div>
{/*  Right Column: Regulatory Guides & Source Citations  */}
<div className="bg-surface-container-lowest p-6 lg:p-8 rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-6">
<h3 className="text-headline-sm font-headline-sm text-primary">Dasar Aturan &amp; Rujukan</h3>
<span className="material-symbols-outlined text-tertiary-container" data-icon="menu_book">menu_book</span>
</div>
<p className="text-body-md font-body-md text-on-surface-variant mb-6">
                Panduan menyertakan sumber dan tanggal pembaruan agar warga dapat mengonfirmasi keabsahan syarat dengan regulasi daerah yang berlaku.
              </p>
{/*  Reference card items  */}
<div className="space-y-3"><div className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest"><div className="flex items-start justify-between"><div><span className="text-caption font-caption font-semibold text-secondary">Rujukan Panduan Standar</span><h4 className="text-label-md font-label-md font-bold text-primary mt-0.5">Panduan Tata Cara Pencatatan Sipil Mandiri</h4><p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Rujukan tata cara umum persiapan berkas pencatatan sipil warga.</p></div><span className="px-2 py-0.5 rounded text-caption font-caption bg-surface-container-low text-on-surface-variant border border-outline-variant/40">28 Okt 2026</span></div><div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-caption font-caption"><span className="text-error font-medium">Belum diverifikasi — contoh simulasi</span><a className="text-secondary font-semibold hover:underline inline-flex items-center gap-1" href="#/katalog"><span className="text-on-surface-variant">Durasi estimasi:</span> Tidak tersedia</a></div></div><div className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest"><div className="flex items-start justify-between"><div><span className="text-caption font-caption font-semibold text-secondary">Panduan Administrasi Warga</span><h4 className="text-label-md font-label-md font-bold text-primary mt-0.5">Alur Persiapan Dokumen Kependudukan Warga</h4><p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Ringkasan daftar periksa berkas sebelum menuju ke loket resmi.</p></div><span className="px-2 py-0.5 rounded text-caption font-caption bg-surface-container-low text-on-surface-variant border border-outline-variant/40">Simulasi</span></div><div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-caption font-caption"><span className="text-tertiary-container font-medium">Contoh materi rujukan terbuka</span><a className="text-secondary font-semibold hover:underline inline-flex items-center gap-1" href="#/katalog"><span className="text-on-surface-variant">Biaya:</span> Belum diverifikasi — contoh simulasi</a></div></div></div>
</div>
<div className="mt-6 pt-4 border-t border-outline-variant/20 text-caption font-caption text-on-surface-variant flex items-center gap-1.5">
<span className="material-symbols-outlined text-xs" data-icon="update">update</span>
              Diperbarui berkala oleh tim relawan independen dan kurasi komunitas.
            </div>
</div>
</div>
</div>
</section>
{/*  9. FAQ Accordion (4 rows)  */}
<section className="py-20 px-6 lg:px-12 max-w-4xl mx-auto" id="faq">
<div className="text-center mb-12">
<span className="text-secondary text-label-sm font-label-sm uppercase tracking-wider font-semibold">Tanya Jawab</span>
<h2 className="text-headline-lg font-headline-lg text-primary tracking-tight mt-1">Pertanyaan yang Sering Diajukan</h2>
<p className="text-body-lg font-body-lg text-on-surface-variant mt-2">
          Ketahui batasan, tujuan, serta cara memanfaatkan instrumen simulasi berkas kependudukan ini.
        </p>
</div>
<div className="space-y-4" id="faq-accordion">
{/*  Item 1 (Expanded by default)  */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden shadow-sm">
<button aria-expanded="true" className="faq-toggle w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none focus:bg-surface-container-low" type="button">
<span className="text-title-md font-title-md text-primary font-semibold">
              Apakah saya perlu membuat akun untuk mencari informasi?
            </span>
<span className="material-symbols-outlined text-on-surface-variant transition-transform duration-200 transform rotate-180 faq-icon" data-icon="expand_more">expand_more</span>
</button>
<div className="faq-content px-6 pb-5 pt-1 text-body-md font-body-md text-on-surface-variant border-t border-outline-variant/20 block">Tidak perlu akun untuk mencari layanan dan membaca panduan. Masuk diperlukan untuk menyimpan data pribadi, mengunggah dokumen, dan melihat riwayatmu.</div>
</div>
{/*  Item 2 (Collapsed)  */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden shadow-sm">
<button aria-expanded="false" className="faq-toggle w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none focus:bg-surface-container-low" type="button">
<span className="text-title-md font-title-md text-primary font-semibold">
              Apakah berkas saya langsung dikirim ke kantor pemerintah?
            </span>
<span className="material-symbols-outlined text-on-surface-variant transition-transform duration-200 faq-icon" data-icon="expand_more">expand_more</span>
</button>
<div className="faq-content px-6 pb-5 pt-1 text-body-md font-body-md text-on-surface-variant border-t border-outline-variant/20 hidden">
            Tidak. JejakMasWowo adalah alat bantu persiapan dan simulasi mandiri. Pengiriman resmi dilakukan oleh warga langsung melalui loket atau kanal resmi instansi terkait.
          </div>
</div>
{/*  Item 3 (Collapsed)  */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden shadow-sm">
<button aria-expanded="false" className="faq-toggle w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none focus:bg-surface-container-low" type="button">
<span className="text-title-md font-title-md text-primary font-semibold">
              Apakah pemeriksaan AI menjamin berkas pasti diterima?
            </span>
<span className="material-symbols-outlined text-on-surface-variant transition-transform duration-200 faq-icon" data-icon="expand_more">expand_more</span>
</button>
<div className="faq-content px-6 pb-5 pt-1 text-body-md font-body-md text-on-surface-variant border-t border-outline-variant/20 hidden">
            Tidak. AI hanya membantu mengidentifikasi potensi kesalahan penulisan atau kelengkapan draf. Keputusan sah penerimaan berkas sepenuhnya berada pada petugas instansi berwenang.
          </div>
</div>
{/*  Item 4 (Collapsed)  */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden shadow-sm">
<button aria-expanded="false" className="faq-toggle w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none focus:bg-surface-container-low" type="button">
<span className="text-title-md font-title-md text-primary font-semibold">
              Dari mana status proses pengajuan diperbarui?
            </span>
<span className="material-symbols-outlined text-on-surface-variant transition-transform duration-200 faq-icon" data-icon="expand_more">expand_more</span>
</button>
<div className="faq-content px-6 pb-5 pt-1 text-body-md font-body-md text-on-surface-variant border-t border-outline-variant/20 hidden">
            Status diperbarui berdasarkan catatan mandiri yang kamu masukkan atau data simulasi latihan. JejakMasWowo tidak terhubung langsung ke basis data rahasia instansi pemerintah.
          </div>
</div>
</div>
</section>
</main>
{/*  10. Footer (Deep Navy - Shared Component Integration)  */}
<footer className="bg-primary text-on-primary border-t border-primary-container">
<div className="w-full max-w-6xl mx-auto px-6 py-12">
{/*  Top Grid  */}
<div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
<div className="md:col-span-4 space-y-4">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-lg bg-surface-container-lowest/15 flex items-center justify-center text-secondary-fixed">
<span className="material-symbols-outlined" data-icon="task_alt">task_alt</span>
</div>
<span className="text-headline-sm font-headline-sm font-bold text-on-primary">JejakMasWowo</span>
</div>
<p className="text-body-sm font-body-sm text-primary-fixed-dim max-w-sm">
            Prototipe independen persiapan berkas dan panduan layanan kependudukan warga. Membantu mengurangi ketidakpastian lewat transparansi alur.
          </p>
</div>
<div className="md:col-span-2">
<h4 className="text-title-md font-title-md text-on-primary mb-3">Tentang</h4>
<ul className="space-y-2 text-body-sm font-body-sm text-on-primary-container">
<li><a className="hover:text-on-primary transition-colors" href="#/katalog">Tentang Proyek</a></li>
<li><a className="hover:text-on-primary transition-colors" href="#/katalog">Keterbukaan Kode</a></li>
<li><a className="hover:text-on-primary transition-colors" href="#/katalog">Metodologi Uji</a></li>
</ul>
</div>
<div className="md:col-span-2">
<h4 className="text-title-md font-title-md text-on-primary mb-3">Privasi &amp; Data</h4>
<ul className="space-y-2 text-body-sm font-body-sm text-on-primary-container">
<li><a className="hover:text-on-primary transition-colors" href="#/katalog">Kebijakan Privasi</a></li>
<li><a className="hover:text-on-primary transition-colors" href="#/katalog">Ketentuan Layanan</a></li>
<li><a className="hover:text-on-primary transition-colors" href="#/katalog">Penghapusan Berkas</a></li>
</ul>
</div>
<div className="md:col-span-2">
<h4 className="text-title-md font-title-md text-on-primary mb-3">Sumber Rujukan</h4>
<ul className="space-y-2 text-body-sm font-body-sm text-on-primary-container">
<li><a className="hover:text-on-primary transition-colors" href="#/katalog">Rujukan Regulasi</a></li>
<li><a className="hover:text-on-primary transition-colors" href="#/katalog">Standar Kependudukan</a></li>
<li><a className="hover:text-on-primary transition-colors" href="#/katalog">Pembaruan Manual</a></li>
</ul>
</div>
<div className="md:col-span-2">
<h4 className="text-title-md font-title-md text-on-primary mb-3">Bantuan</h4>
<ul className="space-y-2 text-body-sm font-body-sm text-on-primary-container">
<li><a className="hover:text-on-primary transition-colors" href="#/katalog">Panduan Warga</a></li>
<li><a className="hover:text-on-primary transition-colors" href="#/katalog">Pusat Pengaduan</a></li>
<li><a className="hover:text-on-primary transition-colors" href="#/katalog">Kontak Tim Uji</a></li>
</ul>
</div>
</div>
{/*  Disclaimer Strip  */}
<div className="py-4 border-t border-surface-container-lowest/15 mb-6 text-caption font-caption text-primary-fixed-dim leading-relaxed">
<strong>Pemberitahuan Resmi:</strong> Prototipe independen. Bukan portal resmi pemerintah. Data yang ditampilkan adalah contoh simulasi untuk pengujian antarmuka dan literasi tata kelola berkas warga.
      </div>
{/*  Bottom Copyright Strip  */}
<div className="flex flex-col md:flex-row items-center justify-between gap-4 text-caption font-caption text-primary-fixed-dim/80 pt-4 border-t border-surface-container-lowest/10"><div id="kebijakan-privasi">© 2026 JejakMasWowo. Seluruh hak cipta dilindungi undang-undang.</div><div className="flex items-center gap-6"><a className="hover:text-on-primary transition-colors" href="#/katalog">Kebijakan Privasi</a><a className="hover:text-on-primary transition-colors" href="#/katalog">Ketentuan Layanan</a><a className="hover:text-on-primary transition-colors" href="#/katalog">Bantuan Warga</a></div></div>
</div>
</footer>
{/*  11. Floating Fixed Control (Bottom-Right)  */}
{/*  Micro-Interactions JavaScript  */}


    </div>
  );
};
