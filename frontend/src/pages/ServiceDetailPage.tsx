import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const ServiceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { openChat } = useApp();

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed">

{/*  TOP ALERT BANNER  */}
{/*  SHARED COMPONENT: TopNavBar (Web Header)  */}
<header className="bg-surface-container-lowest dark:bg-primary border-b border-outline-variant dark:border-primary-container shadow-sm sticky top-0 z-40 transition-colors">
<div className="w-full px-6 mx-auto flex items-center justify-between h-[72px] max-w-[1152px]">
{/*  Brand Logo Wordmark  */}
<div className="flex items-center gap-8">
<a className="flex items-center gap-2.5 text-primary dark:text-inverse-primary group" href="#/panduan">
<div className="w-10 h-10 rounded-lg bg-primary-container text-surface-container-lowest flex items-center justify-center font-display text-headline-sm shadow-sm group-hover:bg-secondary transition-colors">
<span className="material-symbols-outlined text-secondary-fixed" data-icon="fact_check">fact_check</span>
</div>
<div className="flex flex-col">
<span className="text-headline-sm font-headline-sm font-bold text-primary dark:text-inverse-primary tracking-tight">JejakMasWowo</span>
<span className="text-caption font-caption text-on-surface-variant dark:text-on-primary-container tracking-wider uppercase">Panduan dan persiapan layanan warga</span>
</div>
</a>
{/*  Desktop Navigation Items  */}
<nav aria-label="Menu Utama" className="hidden md:flex items-center gap-6"><a className="text-secondary dark:text-secondary-fixed border-b-2 border-secondary font-semibold pb-1 flex items-center gap-1.5 font-label-md text-label-md" href="#/panduan"><span>Cari Layanan</span></a><a className="text-on-surface-variant dark:text-primary-fixed-dim hover:text-primary dark:hover:text-surface-container-lowest pb-1 font-medium transition-colors font-label-md text-label-md" href="#/panduan">Cara Kerja</a><a className="text-on-surface-variant dark:text-primary-fixed-dim hover:text-primary dark:hover:text-surface-container-lowest pb-1 font-medium transition-colors font-label-md text-label-md" href="#/panduan" onClick={() => openChat()}>Bantuan</a></nav>
</div>
{/*  Action Cluster  */}
<div className="flex items-center gap-3"><div className="hidden sm:flex items-center gap-1 text-on-surface-variant dark:text-primary-fixed-dim mr-2"><button aria-label="Pilih Bahasa" className="p-2 rounded-lg hover:bg-surface-container-low dark:hover:bg-primary-container transition-colors duration-150" type="button"><span className="material-symbols-outlined text-xl" data-icon="language">language</span></button><a className="inline-flex items-center gap-1.5 px-3 py-1.5 text-label-md font-label-md font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors" href="#/panduan"><span className="material-symbols-outlined text-lg" data-icon="help_outline">help_outline</span><span>Butuh bantuan?</span></a></div><button className="px-4 py-2 text-label-md font-label-md font-medium text-primary-container border border-outline-variant rounded-lg hover:bg-surface-container-low transition-all duration-200 active:scale-95" type="button" onClick={() => navigate("/masuk")}>Masuk</button><button className="px-4 py-2 text-label-md font-label-md font-medium text-on-secondary bg-secondary hover:bg-secondary/90 rounded-lg shadow-sm transition-all duration-200 active:scale-95" type="button">Daftar</button></div>
</div>
</header>
{/*  MAIN CANVAS  */}
<main className="flex-grow w-full max-w-[1152px] mx-auto px-6 py-8">
{/*  BREADCRUMB & HEADER SECTION  */}
<section aria-labelledby="page-title" className="mb-8">
{/*  Breadcrumb  */}
<nav aria-label="Breadcrumb" className="mb-4">
<ol className="flex items-center space-x-2 text-label-sm font-label-sm text-on-surface-variant">
<li>
<a className="hover:text-secondary transition-colors flex items-center gap-1" href="#/panduan">
<span className="material-symbols-outlined text-base" data-icon="home">home</span>
<span>Beranda</span>
</a>
</li>
<li className="flex items-center space-x-1">
<span className="material-symbols-outlined text-xs text-outline" data-icon="chevron_right">chevron_right</span>
<a className="hover:text-secondary transition-colors" href="#/panduan">Layanan</a>
</li>
<li aria-current="page" className="flex items-center space-x-1 text-primary font-semibold">
<span className="material-symbols-outlined text-xs text-outline" data-icon="chevron_right">chevron_right</span>
<span>Akta Kelahiran</span>
</li>
</ol>
</nav>
{/*  Badge / Pill  */}
<div className="flex flex-wrap items-center gap-3 mb-3">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-secondary text-label-sm font-label-sm border border-secondary-fixed">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          Contoh layanan · Kota Contoh · Simulasi
        </span>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant text-caption font-caption border border-outline-variant/60">
<span className="material-symbols-outlined text-xs text-outline" data-icon="verified_user">verified_user</span>
          Persiapan Pra-Permohonan
        </span>
</div>
{/*  Main Headline & Description  */}
<div className="max-w-4xl">
<h1 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight mb-3" id="page-title">
          Panduan Akta Kelahiran
        </h1>
<p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
          Panduan persiapan mandiri dokumen pelaporan kelahiran anak sebelum diajukan ke instansi terkait atau kanal kependudukan resmi. Membantu warga memeriksa kelengkapan draf agar proses pengajuan tidak tertolak akibat berkas tercecer.
        </p>
</div>
</section>
{/*  METADATA 4 CARDS GRID  */}
<section aria-label="Metadata Singkat Layanan" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
{/*  Card 1  */}
<div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/60 civic-card-shadow">
<div className="flex items-center gap-2 text-on-surface-variant text-caption font-caption mb-1">
<span className="material-symbols-outlined text-lg text-secondary" data-icon="account_balance">account_balance</span>
<span>Instansi Terkait</span>
</div>
<p className="font-title-md text-title-md font-semibold text-primary">Disdukcapil (contoh layanan)</p>
<span className="text-caption font-caption text-on-surface-variant block mt-1">Dinas Kependudukan &amp; Pencatatan Sipil</span>
</div>
{/*  Card 2  */}
<div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/60 civic-card-shadow">
<div className="flex items-center gap-2 text-on-surface-variant text-caption font-caption mb-1">
<span className="material-symbols-outlined text-lg text-secondary" data-icon="payments">payments</span>
<span>Biaya Resmi</span>
</div>
<p className="font-title-md text-title-md font-semibold text-primary">Belum diverifikasi — contoh simulasi</p>
<span className="text-caption font-caption text-on-surface-variant block mt-1">Pelayanan reguler umumnya gratis</span>
</div>
{/*  Card 3  */}
<div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/60 civic-card-shadow">
<div className="flex items-center gap-2 text-on-surface-variant text-caption font-caption mb-1">
<span className="material-symbols-outlined text-lg text-secondary" data-icon="schedule">schedule</span>
<span>Standar Waktu Resmi</span>
</div>
<p className="font-title-md text-title-md font-semibold text-primary">Belum diverifikasi — contoh simulasi</p>
<span className="text-caption font-caption text-on-surface-variant block mt-1">Bergantung pada antrean loket kota</span>
</div>
{/*  Card 4  */}
<div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/60 civic-card-shadow">
<div className="flex items-center gap-2 text-on-surface-variant text-caption font-caption mb-1">
<span className="material-symbols-outlined text-lg text-secondary" data-icon="language">language</span>
<span>Kanal Pengajuan</span>
</div>
<p className="font-title-md text-title-md font-semibold text-primary">Contoh kanal simulasi, perlu konfirmasi lokal</p>
<span className="text-caption font-caption text-on-surface-variant block mt-1">Aplikasi daerah / Loket Kecamatan</span>
</div>
</section>
{/*  MAIN TWO-COLUMN SPLIT (65% / 35%)  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
{/*  LEFT COLUMN (65% -> 8 of 12 cols)  */}
<div className="lg:col-span-8 space-y-8">
{/*  CONTENT NAVIGATION TABS  */}
<div className="border-b border-outline-variant/80 flex items-center space-x-6 overflow-x-auto pb-px" role="tablist">
<button aria-selected={true} className="pb-3 text-label-md font-label-md font-medium text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap" role="tab" type="button">
            Ringkasan
          </button>
<button aria-selected={true} className="pb-3 text-label-md font-label-md font-semibold text-secondary border-b-2 border-secondary whitespace-nowrap flex items-center gap-1.5" role="tab" type="button">
<span className="material-symbols-outlined text-base" data-icon="inventory">inventory</span>
<span>Persyaratan (Aktif/Terbuka)</span>
</button>
<button aria-selected={true} className="pb-3 text-label-md font-label-md font-medium text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap" role="tab" type="button">
            Prosedur
          </button>
<button aria-selected={true} className="pb-3 text-label-md font-label-md font-medium text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap" role="tab" type="button">
            Dasar &amp; Rujukan
          </button>
</div>
{/*  CONDITIONAL NOTIFICATION CALLOUT  */}
<div className="bg-surface-container-low border border-secondary-fixed p-5 rounded-xl flex items-start gap-4">
<div className="p-2 rounded-lg bg-surface-container text-secondary shrink-0 mt-0.5">
<span className="material-symbols-outlined text-xl" data-icon="info">info</span>
</div>
<div>
<h2 className="font-title-md text-title-md font-semibold text-primary mb-1">
              Persyaratan dapat berbeda sesuai kondisi pemohon
            </h2>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Kondisi spesifik seperti anak lahir dari perkawinan campuran (WNI-WNA), anak yang lahir di luar fasilitas pelayanan kesehatan resmi, atau data Kartu Keluarga (KK) orang tua yang belum sinkron memerlukan lampiran Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) tambahan.
            </p>
</div>
</div>
{/*  DETAILED DOCUMENT CHECKLIST SECTION  */}
<section aria-labelledby="dokumen-inti" className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-6 md:p-8 civic-card-shadow">
<div className="flex items-center justify-between pb-5 border-b border-outline-variant/40 mb-6">
<div>
<h2 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight" id="dokumen-inti">
                Daftar Persyaratan Dokumen Inti
              </h2>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Perhatikan format asli dan titik kritis yang sering menyebabkan berkas tertunda pada tahap verifikasi kependudukan.
              </p>
</div>
<span className="px-2.5 py-1 text-label-sm font-label-sm bg-surface-container text-secondary rounded-full font-semibold shrink-0">Contoh dokumen — persyaratan belum diverifikasi</span>
</div>
{/*  Document List Detail  */}
<div className="space-y-6">
{/*  Dokumen 1  */}
<article className="p-5 rounded-lg border border-outline-variant/60 bg-surface hover:border-secondary transition-all">
<div className="flex items-start justify-between gap-4 mb-2">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-label-sm shrink-0">
                    1
                  </div>
<h3 className="font-title-md text-title-md font-bold text-primary">
                    Surat Keterangan Lahir (Faskes)
                  </h3>
</div>
<span className="text-caption font-caption px-2 py-0.5 rounded bg-surface-container-high text-primary font-medium">Asli / Fisik</span>
</div>
<div className="pl-11 space-y-2">
<p className="font-body-md text-body-md text-on-surface-variant">
                  Dikeluarkan oleh Rumah Sakit, Puskesmas, Klinik Bersalin, atau Bidan Praktik Mandiri tempat persalinan berlangsung.
                </p>
<div className="bg-surface-container-lowest p-3.5 rounded-lg border border-outline-variant/40 text-body-sm font-body-sm space-y-1">
<div className="flex items-start gap-2 text-primary font-medium">
<span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5" data-icon="check_circle">check_circle</span>
<span>Format &amp; Keabsahan: Wajib mencantumkan stempel basah/legal faskes, tanda tangan penolong persalinan, dan waktu kelahiran (jam &amp; tanggal).</span>
</div>
<div className="flex items-start gap-2 text-error font-medium">
<span className="material-symbols-outlined text-error text-sm shrink-0 mt-0.5" data-icon="warning">warning</span>
<span>Hal Sering Salah: Perbedaan penulisan ejaan satu huruf antara nama ibu di surat lahir dengan KTP/KK dapat menghentikan validasi otomatis.</span>
</div>
</div>
</div>
</article>
{/*  Dokumen 2  */}
<article className="p-5 rounded-lg border border-outline-variant/60 bg-surface hover:border-secondary transition-all">
<div className="flex items-start justify-between gap-4 mb-2">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-label-sm shrink-0">
                    2
                  </div>
<h3 className="font-title-md text-title-md font-bold text-primary">
                    Buku Nikah / Kutipan Akta Perkawinan Orang Tua
                  </h3>
</div>
<span className="text-caption font-caption px-2 py-0.5 rounded bg-surface-container-high text-primary font-medium">Legalisasi Asli</span>
</div>
<div className="pl-11 space-y-2">
<p className="font-body-md text-body-md text-on-surface-variant">
                  Dokumen pembuktian hubungan hukum pernikahan kedua orang tua dari Kantor Urusan Agama (KUA) atau Dinas Dukcapil.
                </p>
<div className="bg-surface-container-lowest p-3.5 rounded-lg border border-outline-variant/40 text-body-sm font-body-sm space-y-1">
<div className="flex items-start gap-2 text-primary font-medium">
<span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5" data-icon="check_circle">check_circle</span>
<span>Format &amp; Keabsahan: Menampilkan nomor register akta perkawinan yang valid serta tanggal akad/pencatatan.</span>
</div>
<div className="flex items-start gap-2 text-error font-medium">
<span className="material-symbols-outlined text-error text-sm shrink-0 mt-0.5" data-icon="warning">warning</span>
<span>Hal Sering Salah: Status kawin di KTP/KK kedua orang tua belum tercatat 'Kawin Tercatat' saat melahirkan anak pertama.</span>
</div>
</div>
</div>
</article>
{/*  Dokumen 3  */}
<article className="p-5 rounded-lg border border-outline-variant/60 bg-surface hover:border-secondary transition-all">
<div className="flex items-start justify-between gap-4 mb-2">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-label-sm shrink-0">
                    3
                  </div>
<h3 className="font-title-md text-title-md font-bold text-primary">
                    Kartu Keluarga (KK) Orang Tua
                  </h3>
</div>
<span className="text-caption font-caption px-2 py-0.5 rounded bg-surface-container-high text-primary font-medium">Paling Mutakhir</span>
</div>
<div className="pl-11 space-y-2">
<p className="font-body-md text-body-md text-on-surface-variant">
                  Basis data induk tempat bayi akan didaftarkan sebagai anggota keluarga baru dan diterbitkan Nomor Induk Kependudukan (NIK).
                </p>
<div className="bg-surface-container-lowest p-3.5 rounded-lg border border-outline-variant/40 text-body-sm font-body-sm space-y-1">
<div className="flex items-start gap-2 text-primary font-medium">
<span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5" data-icon="check_circle">check_circle</span>
<span>Format &amp; Keabsahan: KK berbarcode TTE (Tanda Tangan Elektronik) aktif atau cetakan resmi dengan susunan alamat yang sinkron.</span>
</div>
<div className="flex items-start gap-2 text-error font-medium">
<span className="material-symbols-outlined text-error text-sm shrink-0 mt-0.5" data-icon="warning">warning</span>
<span>Hal Sering Salah: Pasangan suami-istri masih berada di dua KK terpisah (ikut KK orang tua lama), sehingga bayi belum bisa dimasukkan langsung.</span>
</div>
</div>
</div>
</article>
{/*  Dokumen 4  */}
<article className="p-5 rounded-lg border border-outline-variant/60 bg-surface hover:border-secondary transition-all">
<div className="flex items-start justify-between gap-4 mb-2">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-label-sm shrink-0">
                    4
                  </div>
<h3 className="font-title-md text-title-md font-bold text-primary">
                    KTP-el Kedua Orang Tua &amp; Dua Orang Saksi
                  </h3>
</div>
<span className="text-caption font-caption px-2 py-0.5 rounded bg-surface-container-high text-primary font-medium">Salinan Identitas</span>
</div>
<div className="pl-11 space-y-2">
<p className="font-body-md text-body-md text-on-surface-variant">
                  Kartu Tanda Penduduk elektronik ayah, ibu, dan dua orang saksi kelahiran (dapat keluarga/kerabat yang menyaksikan atau mengetahui peristiwa).
                </p>
<div className="bg-surface-container-lowest p-3.5 rounded-lg border border-outline-variant/40 text-body-sm font-body-sm space-y-1"><div className="flex items-start gap-2 text-primary font-medium"><span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5" data-icon="check_circle">check_circle</span><span>Format &amp; Keabsahan: File pemindaian jelas, dapat terbaca jelas pada saat pemeriksaan berkas.</span></div><div className="flex items-start gap-2 text-on-surface-variant font-medium"><span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5" data-icon="info">info</span><span>Catatan Draf: Pastikan nama dan data saksi terisi lengkap pada draf sebelum konfirmasi ke petugas resmi.</span></div></div>
</div>
</article>
</div>
</section>
{/*  ALUR PROSEDUR PENGAJUAN (STEP TRACKER)  */}
<section aria-labelledby="alur-prosedur" className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-6 md:p-8 civic-card-shadow">
<div className="mb-6">
<h2 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight" id="alur-prosedur">
              Alur &amp; Prosedur Pengajuan Ringkas
            </h2>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Empat tahapan terarah dari pengecekan mandiri hingga pengesahan resmi oleh dinas kependudukan.
            </p>
</div>
{/*  Linear Steps Container  */}
<div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/60">
{/*  Step 1  */}
<div className="relative flex items-start gap-4">
<div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-label-sm ring-4 ring-secondary-fixed">
                1
              </div>
<div className="bg-surface p-4 rounded-lg border border-outline-variant/50 w-full">
<div className="flex items-center justify-between mb-1">
<h3 className="font-title-md text-title-md font-semibold text-primary">Persiapan &amp; Validasi Draf Mandiri</h3>
<span className="text-caption font-caption px-2 py-0.5 rounded bg-surface-container-high text-secondary font-medium">Di JejakMasWowo</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">
                  Gunakan daftar periksa atau asisten pra-pemeriksaan di portal ini untuk menyamakan ejaan nama anak, NIK orang tua, dan dokumen saksi agar bebas dari salah tik.
                </p>
</div>
</div>
{/*  Step 2  */}
<div className="relative flex items-start gap-4">
<div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-surface-container-lowest border-2 border-outline-variant text-on-surface-variant flex items-center justify-center font-bold text-label-sm">
                2
              </div>
<div className="bg-surface p-4 rounded-lg border border-outline-variant/50 w-full">
<div className="flex items-center justify-between mb-1">
<h3 className="font-title-md text-title-md font-semibold text-primary">Pengisian Berkas di Kanal Resmi Kependudukan Daerah</h3>
<span className="text-caption font-caption px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-medium">Kanal Pemerintah</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">
                  Buka website resmi Disdukcapil kota/kabupaten Anda atau kunjungi loket layanan kelurahan/kecamatan setempat. Unggah berkas yang telah dipersiapkan.
                </p>
</div>
</div>
{/*  Step 3  */}
<div className="relative flex items-start gap-4">
<div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-surface-container-lowest border-2 border-outline-variant text-on-surface-variant flex items-center justify-center font-bold text-label-sm">
                3
              </div>
<div className="bg-surface p-4 rounded-lg border border-outline-variant/50 w-full">
<div className="flex items-center justify-between mb-1">
<h3 className="font-title-md text-title-md font-semibold text-primary">Verifikasi &amp; Pengesahan oleh Petugas Resmi Disdukcapil</h3>
<span className="text-caption font-caption px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-medium">Petugas Resmi</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">
                  Operator sipil memeriksa kesesuaian berkas secara yuridis. Jika ada ketidaksesuaian berkas, pemohon akan menerima notifikasi revisi berkas.
                </p>
</div>
</div>
{/*  Step 4  */}
<div className="relative flex items-start gap-4">
<div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-surface-container-lowest border-2 border-outline-variant text-on-surface-variant flex items-center justify-center font-bold text-label-sm">
                4
              </div>
<div className="bg-surface p-4 rounded-lg border border-outline-variant/50 w-full">
<div className="flex items-center justify-between mb-1">
<h3 className="font-title-md text-title-md font-semibold text-primary">Penerbitan Akta &amp; Pembaruan Kartu Keluarga</h3>
<span className="text-caption font-caption px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-medium">Penerbitan Dokumen</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">
                  Akta Kelahiran diterbitkan dalam format digital PDF ber-TTE resmi dan dikirimkan ke email atau dicetak, disertai Kartu Keluarga baru yang telah memuat NIK bayi.
                </p>
</div>
</div>
</div>
</section>
{/*  SEKSI CATATAN KEJUJURAN & BATASAN SISTEM  */}
<section aria-label="Catatan Etika Sistem" className="bg-surface-container-low/70 border border-outline-variant/80 rounded-xl p-6 flex items-start gap-4">
<span className="material-symbols-outlined text-secondary text-2xl shrink-0 mt-1" data-icon="policy">policy</span>
<div className="space-y-1">
<h3 className="font-title-md text-title-md font-bold text-primary">
              Batasan Sistem &amp; Catatan Integritas Portal
            </h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Platform JejakMasWowo murni berfungsi sebagai sarana literasi tata kelola berkas sipil independen dan alat persiapan data awal pemohon. 
              <strong>Instrumen ini tidak menggantikan fungsi loket legal pemerintah, tidak memungut biaya kuasa administratif, dan tidak menerbitkan dokumen kenegaraan.</strong> 
              Seluruh pengesahan hukum mutlak berada di bawah otoritas Dinas Kependudukan dan Pencatatan Sipil Republik Indonesia.
            </p>
</div>
</section>
</div>
{/*  RIGHT COLUMN (35% -> 4 of 12 cols - Sticky Card)  */}
<aside aria-label="Aksi &amp; Rujukan Berkas" className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
{/*  STICKY ACTION CARD  */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/80 p-6 civic-elevated-shadow space-y-5">
<div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
<span className="text-label-sm font-label-sm font-semibold uppercase tracking-wider text-secondary">
              Checklist Kesiapan
            </span>
<span className="flex items-center gap-1 text-caption font-caption text-on-surface-variant">
<span className="w-2 h-2 rounded-full bg-secondary"></span>
              Mode Publik
            </span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight mb-2">
              Siapkan Sebelum Mengajukan
            </h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">
              Pastikan Anda telah mengumpulkan seluruh 4 dokumen persiapan inti sebelum mengakses loket pelayanan daerah.
            </p>
</div>
{/*  Status Box  */}
<div className="bg-surface-container-low p-4 rounded-lg space-y-2 border border-secondary-fixed/50">
<div className="flex items-center justify-between text-body-sm font-body-sm">
<span className="text-on-surface-variant font-medium">Dokumen Teridentifikasi:</span>
<span className="font-bold text-primary">4 Dokumen Inti</span>
</div>
<div className="flex items-center justify-between text-body-sm font-body-sm">
<span className="text-on-surface-variant font-medium">Estimasi Pra-Pemeriksaan:</span>
<span className="font-bold text-secondary">Tidak tersedia</span>
</div>
<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-2">
<div className="bg-secondary h-full rounded-full w-1/4"></div>
</div>
<span className="text-caption font-caption text-on-surface-variant block text-right">Tahap 1 dari 4: Baca Panduan</span>
</div>
{/*  Buttons Action  */}
<div className="space-y-3 pt-2">
<button className="w-full py-3 px-4 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-sm transition-all duration-200 active:scale-98" type="button">
<span className="material-symbols-outlined text-lg" data-icon="description">description</span>
<span>Mulai Persiapan Berkas</span>
</button>
<button className="w-full py-2.5 px-4 rounded-lg bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-primary-container font-label-md text-label-md font-medium flex items-center justify-center gap-2 transition-all duration-200" type="button">
<span className="material-symbols-outlined text-lg text-on-surface-variant" data-icon="open_in_new">open_in_new</span>
<span>Lihat Petunjuk Kanal Resmi</span>
</button>
</div>
{/*  Micro Disclaimer note  */}
<div className="pt-2 text-caption font-caption text-on-surface-variant border-t border-outline-variant/40 flex items-start gap-2">
<span className="material-symbols-outlined text-sm text-outline shrink-0 mt-0.5" data-icon="lock_open">lock_open</span>
<p>Panduan dapat dibaca tanpa akun. Masuk diperlukan untuk menyimpan data pribadi, mengunggah dokumen, dan melihat riwayatmu.</p>
</div>
</div>
{/*  REGULATION & REFERENCE CARD  */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 civic-card-shadow space-y-3"><div className="flex items-center gap-2 text-primary font-semibold text-title-md font-title-md"><span className="material-symbols-outlined text-secondary text-lg" data-icon="menu_book">menu_book</span><h4>Catatan Regulasi</h4></div><div className="p-3 rounded-lg bg-surface-container border border-secondary-fixed text-body-sm font-body-sm text-primary font-medium flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-base shrink-0" data-icon="info">info</span><span>Sumber resmi belum ditautkan pada contoh simulasi</span></div><p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Rujukan hukum resmi dinas kependudukan setempat perlu dikonfirmasi langsung pada kanal atau loket daerah yang berwenang.</p><div className="pt-2 border-t border-outline-variant/40 space-y-1.5 text-caption font-caption text-on-surface-variant"><div className="flex justify-between items-center"><span className="text-outline">Ditinjau untuk demo:</span><span className="font-medium text-primary">28 Oktober 2026</span></div><div className="flex justify-between items-center"><span className="text-outline">Status Kurasi:</span><span className="text-secondary font-medium">Contoh Simulasi UI</span></div></div><div className="p-2.5 rounded bg-surface-container-low text-caption font-caption text-on-surface-variant">Data dan instruksi dirancang murni untuk literasi publik dan pengujian antarmuka portal warga.</div></div>
</aside>
</div>
</main>
{/*  FLOATING QUICK HELP TRIGGER  */}
{/*  SHARED COMPONENT: Footer (Web Footer)  */}
<footer className="bg-primary dark:bg-surface-container-lowest text-on-primary dark:text-primary mt-16 border-t border-primary-container dark:border-outline-variant">
<div className="w-full max-w-[1152px] mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
{/*  Brand & Copyright  */}
<div className="flex flex-col items-center md:items-start gap-2">
<span className="text-headline-sm font-headline-sm font-bold text-on-primary dark:text-primary">
          JejakMasWowo
        </span>
<p className="text-body-sm font-body-sm text-on-primary-container dark:text-on-surface-variant text-center md:text-left">© 2026 JejakMasWowo Civic Transparency Portal. Seluruh hak cipta dilindungi undang-undang.</p>
</div>
{/*  Navigation Links  */}
<nav aria-label="Tautan Hukum dan Bantuan" className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-label-sm font-label-sm">
<a className="text-on-primary-container dark:text-on-surface-variant hover:text-on-primary dark:hover:text-primary transition-colors" href="#/panduan">
          Kebijakan Privasi
        </a>
<a className="text-on-primary-container dark:text-on-surface-variant hover:text-on-primary dark:hover:text-primary transition-colors" href="#/panduan">
          Ketentuan Layanan
        </a>
<a className="text-on-primary-container dark:text-on-surface-variant hover:text-on-primary dark:hover:text-primary transition-colors" href="#/panduan">
          Keterbukaan Informasi Publik
        </a>
<a className="text-on-primary-container dark:text-on-surface-variant hover:text-on-primary dark:hover:text-primary transition-colors" href="#/panduan">
          Panduan Registrasi Warga
        </a>
<a className="text-on-primary-container dark:text-on-surface-variant hover:text-on-primary dark:hover:text-primary transition-colors" href="#/panduan">
          Pusat Pengaduan
        </a>
</nav>
</div>
{/*  MANDATORY INDEPENDENT DISCLAIMER FOOTER NOTE  */}
<div className="w-full border-t border-primary-container/80 dark:border-outline-variant/30 py-4 px-6 bg-primary dark:bg-surface-container-low text-center">
<p className="max-w-5xl mx-auto text-caption font-caption text-on-primary-container dark:text-on-surface-variant leading-relaxed">
        Pemberitahuan Resmi: Prototipe independen. Bukan portal resmi pemerintah. Data yang ditampilkan adalah contoh simulasi untuk pengujian antarmuka dan literasi tata kelola berkas warga.
      </p>
</div>
</footer>

    </div>
  );
};
