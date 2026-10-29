import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, type ApplicationRecord } from '../context/AppContext';

export const PreparationSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedService, formData, addApplication, showToast, openChat } = useApp();

  const handleSimulateSubmission = () => {
    const newApp: ApplicationRecord = {
      id: `JMW-REG-${Date.now().toString().slice(-6)}`,
      official_number: `DISDUKCAPIL-BKS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      service_id: selectedService.id,
      service_name: selectedService.name,
      channel: 'Loket Disdukcapil Kota',
      applicant_name: formData.nama_lengkap || 'Ayu Contoh',
      applicant_nik: formData.nik || '3275012345670001',
      current_status: 'DITERIMA',
      created_at: '28 Oktober 2026, Baru saja',
      events: [
        {
          id: 1,
          status: 'DITERIMA',
          title: 'Permohonan Diterima di Loket Pelayanan',
          time: '28 Oktober 2026, Baru saja',
          source: 'Petugas Loket Disdukcapil (Meja 3)',
          notes: 'Berkas permohonan fisik dan formulir pendaftaran diterima lengkap. Nomor bukti diterbitkan.',
          completed: true,
          current: true,
        },
        {
          id: 2,
          status: 'VERIFIKASI',
          title: 'Pemeriksaan Kesesuaian Biodata SIAK Terpusat',
          time: 'Estimasi: 1 - 2 Jam ke depan',
          source: 'Petugas Verifikator (Budi Santoso)',
          notes: 'Verifikasi keselarasan NIK pemohon dan data pernikahan di database nasional SIAK.',
          completed: false,
        }
      ]
    };
    addApplication(newApp);
    showToast('Permohonan dicatatkan ke Linimasa Pelacakan!', 'success');
    navigate('/pelacakan');
  };

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
<div className="w-[1040px] h-[1000px] flex flex-col min-w-0">
{/*  Topbar (height 72px, white, border-bottom)  */}
<header className="h-[72px] shrink-0 bg-white border-b border-[#DDE5EF] px-8 flex items-center justify-between z-20">
{/*  Breadcrumb  */}
<div className="flex items-center gap-2 text-sm text-[#52657A]">
<span>Persiapan</span>
<span className="material-symbols-outlined text-base text-[#8DA0B6]">chevron_right</span>
<span>Akta Kelahiran</span>
<span className="material-symbols-outlined text-base text-[#8DA0B6]">chevron_right</span>
<span className="font-medium text-[#172B45]">Ringkasan</span>
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
<main className="w-full" style={{ flex: '1', minHeight: '0', overflowY: 'auto', padding: '32px', boxSizing: 'border-box' }}>
{/*  Page-heading block  */}
<div><h1 className="text-[28px] leading-[36px] font-bold text-[#172B45]">Tinjau kesiapan berkas</h1>
<p className="text-[16px] leading-[24px] text-[#52657A] mt-2">Akta Kelahiran (contoh) · Kota Contoh · Persiapan JMW-DEMO-001</p></div>
{/*  Preparation Stepper (Step 5 active)  */}
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
{/*  4. Pemeriksaan (completed)  */}
<div className="jmw-step is-complete">
<div className="jmw-step-dot">
<span className="material-symbols-outlined text-white text-[18px]">check</span>
</div>
<div className="jmw-step-label">Pemeriksaan</div>
</div>
{/*  5. Ringkasan (current)  */}
<div className="jmw-step is-current">
<div className="jmw-step-dot">5</div>
<div className="jmw-step-label">Ringkasan</div>
</div>
</div><div className="mb-6 flex items-center gap-3">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECF8F3] text-[#087F68] border border-[#C5E8D8]">
<span className="material-symbols-outlined text-[16px]">check_circle</span>
    Berkasmu siap untuk langkah berikutnya
  </span>
<span className="text-xs text-[#52657A]">Belum diajukan ke instansi</span>
</div>
{/*  Grid: Left Grouped Data/Docs (col-span-7) + Right Next Official Channel Step (col-span-5)  */}
<div className="grid grid-cols-12 gap-6 items-start">
{/*  Left: Compact Grouped Data & Documents (col-span-7)  */}
<div className="col-span-7 space-y-6">
{/*  Card: Data Persiapan Terangkum  */}
<div className="bg-white border border-[#DDE5EF] rounded-[12px] p-6 space-y-4">
<div className="flex items-center justify-between pb-3 border-b border-[#DDE5EF]">
<h2 className="font-heading text-base font-semibold text-[#172B45]">Ringkasan Data Persiapan Mandiri</h2>
<span className="text-xs font-mono font-semibold text-[#1769D2] bg-[#E7F0FF] px-2 py-0.5 rounded">ID: JMW-DEMO-001</span>
</div>
<div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
<div>
<span className="text-[#52657A] block">Layanan Pilihan:</span>
<span className="font-semibold text-sm text-[#172B45]">Akta Kelahiran (contoh)</span>
</div>
<div>
<span className="text-[#52657A] block">Nama Pemohon:</span>
<span className="font-semibold text-sm text-[#172B45]">Ayu Contoh</span>
</div>
<div>
<span className="text-[#52657A] block">Subjek Pengurusan:</span>
<span className="font-medium text-[#172B45]">Anak / Anggota Keluarga</span>
</div>
<div>
<span className="text-[#52657A] block">Wilayah Loket:</span>
<span className="font-medium text-[#172B45]">Kota Contoh (Simulasi)</span>
</div>
</div>
</div>
{/*  Card: Dokumen yang Telah Diperiksa  */}
<div className="bg-white border border-[#DDE5EF] rounded-[12px] p-6 space-y-4">
<h2 className="font-heading text-base font-semibold text-[#172B45]">Dokumen Siap Ajukan (3 Berkas)</h2>
<div className="space-y-3">
<div className="p-3.5 border border-[#DDE5EF] rounded-lg flex items-center justify-between bg-white">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-[#087F68] text-[22px]">task</span>
<div>
<div className="text-sm font-semibold text-[#172B45]">Surat Keterangan Lahir (Faskes)</div>
<div className="text-xs text-[#52657A]">surat-kelahiran-contoh.jpg · Ejaan nama telah disesuaikan</div>
</div>
</div>
<span className="text-xs font-medium text-[#087F68] bg-[#ECF8F3] px-2 py-1 rounded">Siap</span>
</div>
<div className="p-3.5 border border-[#DDE5EF] rounded-lg flex items-center justify-between bg-white">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-[#087F68] text-[22px]">task</span>
<div>
<div className="text-sm font-semibold text-[#172B45]">Kartu Keluarga (KK) Orang Tua</div>
<div className="text-xs text-[#52657A]">kartu-keluarga-contoh.pdf · Terbaca jelas 4 sudut</div>
</div>
</div>
<span className="text-xs font-medium text-[#087F68] bg-[#ECF8F3] px-2 py-1 rounded">Siap</span>
</div>
<div className="p-3.5 border border-[#DDE5EF] rounded-lg flex items-center justify-between bg-white">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-[#087F68] text-[22px]">task</span>
<div>
<div className="text-sm font-semibold text-[#172B45]">Buku Nikah / Dokumen Pendukung</div>
<div className="text-xs text-[#52657A]">buku-nikah-contoh.pdf · Salinan legalisir lampiran</div>
</div>
</div>
<span className="text-xs font-medium text-[#087F68] bg-[#ECF8F3] px-2 py-1 rounded">Siap</span>
</div>
</div>
</div>
</div>
{/*  Right: Official Channel Next Step (col-span-5)  */}
<div className="col-span-5 space-y-5">
{/*  Next Step Official Instruction Card  */}
<div className="bg-white border border-[#DDE5EF] rounded-[12px] p-6 space-y-4">
<h3 className="font-heading text-base font-semibold text-[#172B45] pb-2 border-b border-[#DDE5EF]">
              Langkah Selanjutnya: Ajukan ke Kanal Resmi
            </h3>
<p className="text-xs text-[#52657A] leading-[18px]">
              Draf berkas mandirimu telah rapi. Silakan serahkan atau unggah ke kanal resmi instansi terkait sesuai arahan berikut:
            </p>
<ol className="space-y-3 text-xs text-[#172B45]">
<li className="flex items-start gap-2.5">
<span className="w-5 h-5 rounded-full bg-[#1769D2] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
<span><strong>Buka kanal resmi atau kunjungi loket:</strong> Akses situs Disdukcapil Kota Contoh atau datang langsung ke kantor pelayanan setempat.</span>
</li>
<li className="flex items-start gap-2.5">
<span className="w-5 h-5 rounded-full bg-[#1769D2] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
<span><strong>Serahkan berkas fisik atau unggah:</strong> Gunakan susunan berkas yang telah diperiksa agar terhindar dari bolak-balik karena salah eja.</span>
</li>
<li className="flex items-start gap-2.5">
<span className="w-5 h-5 rounded-full bg-[#1769D2] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
<span><strong>Catat nomor tanda terima resmi:</strong> Simpan nomor registrasi pengajuan resmi untuk dipantau di JejakMasWowo.</span>
</li>
</ol>
<div className="pt-2">
<button className="w-full h-[44px] px-4 rounded-lg bg-[#1769D2] text-white text-sm font-semibold hover:bg-[#1257B0] flex items-center justify-center gap-2 shadow-sm transition" type="button" onClick={() => handleSimulateSubmission()}>
<span>Buka petunjuk kanal resmi</span>
<span className="material-symbols-outlined text-white text-[18px]">open_in_new</span>
</button>
</div>
</div>
{/*  Pencatatan Mandiri Pengajuan Warga Card  */}
<div className="bg-white border border-[#DDE5EF] rounded-[12px] p-6 space-y-4">
<h3 className="font-heading text-sm font-semibold text-[#172B45]">Pencatatan Mandiri Pengajuan</h3>
<p className="text-xs text-[#52657A] leading-[18px]">
              Setelah menerima bukti tanda terima dari loket atau situs resmi, catat nomor registrasi di sini untuk memantau progres secara teratur:
            </p>
<div className="space-y-3">
<div>
<label className="block text-xs font-semibold text-[#172B45] mb-1">Nomor Pengajuan Resmi Instansi</label>
<input className="w-full h-10 px-3 bg-white border border-[#DDE5EF] rounded-lg text-xs text-[#172B45] focus:outline-none focus:border-[#1769D2]" placeholder="misal: REG-2026-DISDUK-0921" type="text"/>
</div>
<button className="w-full h-10 px-4 rounded-lg border border-[#DDE5EF] bg-white text-xs font-semibold text-[#172B45] hover:bg-[#F5F7FB] flex items-center justify-center gap-1.5 transition" type="button" onClick={() => handleSimulateSubmission()}>
<span className="material-symbols-outlined text-[#52657A] text-[18px]">bookmark_add</span>
<span>Simpan Catatan Pengajuan</span>
</button>
</div>
<div className="pt-2 border-t border-[#DDE5EF] text-[11px] text-[#52657A] flex items-center gap-1.5">
<span className="material-symbols-outlined text-[#1769D2] text-[16px]">shield</span>
<span>Catatan warga — belum terkonfirmasi instansi</span>
</div>
</div>
</div>
</div>
</main>
{/*  Bottom Action Bar (height 64px, white, border-top, fixed bottom aligned to x240+)  */}
<div className="h-[64px] shrink-0 bg-white border-t border-[#DDE5EF] px-8 flex items-center justify-between z-20">
<button className="h-[44px] px-4 rounded-lg border border-[#DDE5EF] bg-white text-sm font-semibold text-[#172B45] hover:bg-[#F5F7FB] flex items-center gap-2 transition" type="button" onClick={() => navigate("/persiapan/pemeriksaan")}>
<span className="material-symbols-outlined text-[#52657A]">arrow_back</span>
<span>Kembali ke Pemeriksaan</span>
</button>
<div className="flex items-center gap-3">
<button className="h-[44px] px-4 rounded-lg border border-[#DDE5EF] bg-white text-sm font-semibold text-[#172B45] hover:bg-[#F5F7FB] transition" type="button">
          Simpan draf
        </button>
<button className="h-[44px] px-4 rounded-lg bg-[#1769D2] text-white text-sm font-semibold hover:bg-[#1257B0] flex items-center gap-2 shadow-sm transition" type="button" onClick={() => handleSimulateSubmission()}>
<span>Buka petunjuk kanal resmi</span>
<span className="material-symbols-outlined text-white">open_in_new</span>
</button>
</div>
</div>
</div>

    </div>
  );
};
