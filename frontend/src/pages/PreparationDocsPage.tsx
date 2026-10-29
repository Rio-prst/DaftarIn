import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PreparationStepper } from '../components/PreparationStepper';

export const PreparationDocsPage: React.FC = () => {
  const navigate = useNavigate();
  const { formData, showToast, openChat } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  interface DocItem {
    id: string;
    name: string;
    icon: string;
    fileName: string;
    size: string;
    pages: string;
    uploaded: boolean;
    isRequired: boolean;
  }

  const [docs, setDocs] = useState<DocItem[]>([
    {
      id: 'skk',
      name: 'Surat Keterangan Lahir (faskes)',
      icon: 'description',
      fileName: 'surat-kelahiran-contoh.jpg',
      size: '680 KB',
      pages: '1 halaman',
      uploaded: true,
      isRequired: true,
    },
    {
      id: 'kk',
      name: 'Kartu Keluarga (KK)',
      icon: 'badge',
      fileName: 'kartu-keluarga-contoh.pdf',
      size: '420 KB',
      pages: '2 halaman',
      uploaded: true,
      isRequired: true,
    },
    {
      id: 'nikah',
      name: 'Buku Nikah / Dokumen Pendukung',
      icon: 'folder_open',
      fileName: '',
      size: '',
      pages: '',
      uploaded: false,
      isRequired: false,
    },
  ]);
  const [activeUploadId, setActiveUploadId] = useState<string>('nikah');
  const [consent, setConsent] = useState(true);

  const handleTriggerUpload = (id: string) => {
    setActiveUploadId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const sizeStr = f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`;
      setDocs((prev) =>
        prev.map((d) =>
          d.id === activeUploadId
            ? { ...d, fileName: f.name, size: sizeStr, pages: '1 halaman', uploaded: true }
            : d
        )
      );
      showToast(`Berkas "${f.name}" berhasil diunggah!`, 'success');
      e.target.value = '';
    }
  };

  const handleDeleteDoc = (id: string) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, fileName: '', size: '', pages: '', uploaded: false } : d
      )
    );
    showToast('Berkas dihapus dari draf persiapan.', 'info');
  };

  const uploadedCount = docs.filter((d) => d.uploaded).length;
  const totalCount = docs.length;
  const progressPercent = Math.round((uploadedCount / totalCount) * 100);

  return (
    <div className="bg-[#F5F7FB] text-on-surface flex min-h-screen font-sans">

      {/* Left Sidebar (Desktop: 240px, Mobile: hidden) */}
      <aside className="hidden md:flex w-[240px] bg-[#142C4B] text-white flex-col shrink-0 min-h-screen">
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
<button type="button" onClick={() => showToast('Tidak ada notifikasi berkas baru.', 'info')} className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition w-full text-left">
<span className="material-symbols-outlined text-[#C3D4EA]">notifications</span>
<span>Notifikasi</span>
</button>
<button type="button" onClick={() => showToast('Data profil dikelola dari akun terdaftar.', 'info')} className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition w-full text-left">
<span className="material-symbols-outlined text-[#C3D4EA]">manage_accounts</span>
<span>Profil &amp; Privasi</span>
</button>
</nav>
{/*  Sidebar Bottom: Keluar & Prototipe · Simulasi  */}
<div className="p-4 border-t border-[#233F66]">
<button type="button" onClick={() => navigate('/')} className="h-[44px] px-3 rounded-lg flex items-center gap-3 text-sm font-medium text-[#C3D4EA] hover:bg-[#1E3E66] transition w-full text-left">
<span className="material-symbols-outlined text-[#C3D4EA]">logout</span>
<span>Keluar</span>
</button>
<div className="px-3 pt-3 text-[12px] text-[#7E98B9]">Prototipe · Simulasi</div>
</div>
</aside>
{/*  Main Region (starts x240)  */}
<div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
{/*  Topbar (height 72px, white, border-bottom)  */}
<header className="h-[72px] bg-white border-b border-[#DDE5EF] px-4 sm:px-8 flex items-center justify-between flex-shrink-0 z-20 overflow-x-auto">
{/*  Breadcrumb  */}
<div className="flex items-center gap-2 text-sm text-[#52657A]">
<span>Persiapan</span>
<span className="material-symbols-outlined text-base text-[#8DA0B6]">chevron_right</span>
<span>Akta Kelahiran</span>
<span className="material-symbols-outlined text-base text-[#8DA0B6]">chevron_right</span>
<span className="font-medium text-[#172B45]">Dokumen</span>
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
<button onClick={() => showToast('Tidak ada notifikasi berkas baru.', 'info')} className="w-9 h-9 rounded-lg border border-[#DDE5EF] bg-white text-[#52657A] flex items-center justify-center hover:bg-[#F5F7FB] transition" type="button">
<span className="material-symbols-outlined text-[18px]">notifications</span>
</button>
<div className="flex items-center gap-2 pl-2 border-l border-[#DDE5EF]">
<div className="w-8 h-8 rounded-full bg-[#142C4B] text-white flex items-center justify-center font-semibold text-xs">
  {formData.nama_lengkap ? formData.nama_lengkap.slice(0, 2).toUpperCase() : 'AC'}
</div>
<span className="text-sm font-semibold text-[#172B45]">{formData.nama_lengkap || 'Ayu Contoh'}</span>
</div>
</div>
</header>
{/*  Page Content (inner margin 32px, bottom padding 96px for action bar)  */}
<input ref={fileInputRef} onChange={handleFileChange} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
<main className="flex-1 p-4 sm:p-8 w-full" style={{ flex: '1', minHeight: '0', overflowY: 'auto', boxSizing: 'border-box' }}>
{/*  Page-heading block  */}
<div>
<h1 className="text-[28px] leading-[36px] font-bold text-[#172B45]">Unggah dokumen</h1>
<p className="text-[16px] leading-[24px] text-[#52657A] mt-2">Akta Kelahiran (contoh) · Kota Contoh · Persiapan JMW-DEMO-001</p>
</div>
{/*  Preparation Stepper (Step 3 active)  */}
<PreparationStepper currentStep={3} />
{/*  Grid 2/3 Form + 1/3 Context Card (gap 24px)  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
{/*  2/3 Main Column (col-span-8)  */}
<div className="lg:col-span-8 space-y-6">
{/*  Document Upload List Card  */}
<div className="bg-white border border-[#DDE5EF] rounded-[12px] p-6 space-y-4">
  <div>
    <h2 className="font-heading text-[20px] leading-[28px] font-semibold text-[#172B45]">Daftar Berkas Persiapan</h2>
    <p className="text-[13px] leading-[20px] text-[#52657A] mt-1">Unggah salinan dokumen untuk diperiksa keterbacaan dan kesesuaian data draf secara mandiri.</p>
  </div>

  {docs.map((doc) => (
    doc.uploaded ? (
      <div key={doc.id} className="border border-[#DDE5EF] rounded-[12px] p-4 flex items-center justify-between bg-white hover:border-[#CBD8E9] transition">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#E7F0FF] border border-[#DDE5EF] flex items-center justify-center text-[#1769D2]">
            <span className="material-symbols-outlined text-[24px]">{doc.icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#172B45]">{doc.name}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#ECF8F3] text-[#087F68]">
                <span className="material-symbols-outlined text-[14px]">check</span>
                Terunggah
              </span>
            </div>
            <div className="text-xs text-[#52657A] mt-1">{doc.fileName} · {doc.size} · {doc.pages}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleTriggerUpload(doc.id)} className="h-8 px-3 rounded-lg border border-[#DDE5EF] text-xs font-semibold text-[#172B45] hover:bg-[#F5F7FB] transition" type="button">Ganti</button>
          <button onClick={() => handleDeleteDoc(doc.id)} className="h-8 px-2 rounded-lg text-xs font-semibold text-[#52657A] hover:text-[#B3261E] transition" type="button">Hapus</button>
        </div>
      </div>
    ) : (
      <div
        key={doc.id}
        onClick={() => handleTriggerUpload(doc.id)}
        className="border-2 border-dashed border-[#DDE5EF] hover:border-[#1769D2] rounded-[12px] p-5 text-center bg-[#F5F7FB]/50 transition cursor-pointer"
      >
        <div className="w-10 h-10 mx-auto rounded-full bg-white border border-[#DDE5EF] flex items-center justify-center text-[#1769D2] mb-2">
          <span className="material-symbols-outlined text-[20px]">upload_file</span>
        </div>
        <div className="text-sm font-semibold text-[#172B45]">{doc.name}</div>
        <p className="text-xs text-[#52657A] mt-1">
          {doc.isRequired ? 'Wajib: Format PDF, JPG, atau PNG (maks. 5 MB)' : 'Opsional: Format PDF, JPG, atau PNG (maks. 5 MB)'}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTriggerUpload(doc.id);
          }}
          className="mt-3 h-8 px-3 rounded-lg border border-[#DDE5EF] bg-white text-xs font-semibold text-[#1769D2] hover:bg-[#E7F0FF]/40 inline-flex items-center gap-1.5 transition"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Pilih Berkas
        </button>
      </div>
    )
  ))}
</div>
{/*  Consent & Distinction Box  */}
<div className="bg-white border border-[#DDE5EF] rounded-[12px] p-5">
<label className="flex items-start gap-3 cursor-pointer">
<input checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 rounded text-[#1769D2] focus:ring-0" type="checkbox"/>
<div className="text-xs leading-[18px] text-[#52657A]">
                Saya menyetujui pemrosesan draf berkas dengan model AI untuk analisis keterbacaan teks dan verifikasi mandiri sebelum pengajuan ke kanal resmi.
              </div>
</label>
</div>
</div>
{/*  1/3 Context Column (col-span-4)  */}
<div className="lg:col-span-4 space-y-5">
{/*  Status Pengecekan Card  */}
<div className="bg-white border border-[#DDE5EF] rounded-[12px] p-5">
<h3 className="font-heading text-base font-semibold text-[#172B45] pb-3 border-b border-[#DDE5EF]">Kesiapan Berkas</h3>
<div className="py-3 space-y-3">
<div className="flex items-center justify-between text-sm">
<span className="text-[#52657A]">Status Berkas:</span>
<span className="font-semibold text-[#172B45]">{uploadedCount} dari {totalCount} Berkas Siap</span>
</div>
<div className="w-full bg-[#E7F0FF] rounded-full h-2">
<div className="bg-[#1769D2] h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
</div>
<div className="text-xs text-[#52657A] leading-[18px]">
                Berkas yang telah diunggah ({progressPercent}%) akan dianalisis kesesuaian nama, NIK, dan keterbacaan cap resmi.
              </div>
</div>
<div className="pt-3 border-t border-[#DDE5EF] space-y-2 text-xs text-[#52657A]">
<div className="flex items-start gap-2">
<span className="material-symbols-outlined text-[#087F68] text-[16px] mt-0.5">verified_user</span>
<span>Pemeriksaan awal membantu mendeteksi ketidaklengkapan lebih dini.</span>
</div>
<div className="flex items-start gap-2">
<span className="material-symbols-outlined text-[#996000] text-[16px] mt-0.5">warning</span>
<span>Bukan pembuktian keaslian hukum dan tidak menjamin penerimaan di loket.</span>
</div>
</div>
</div>
{/*  Note Box  */}
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
<div className="h-[64px] bg-white border-t border-[#DDE5EF] px-8 flex items-center justify-between flex-shrink-0 z-20">
<button className="h-[44px] px-4 rounded-lg border border-[#DDE5EF] bg-white text-sm font-semibold text-[#172B45] hover:bg-[#F5F7FB] flex items-center gap-2 transition" type="button" onClick={() => navigate("/persiapan/data")}>
<span className="material-symbols-outlined text-[#52657A]">arrow_back</span>
<span>Kembali</span>
</button>
<div className="flex items-center gap-3">
<button onClick={() => showToast("Draf berkas berhasil disimpan!", "success")} className="h-[44px] px-4 rounded-lg border border-[#DDE5EF] bg-white text-sm font-semibold text-[#172B45] hover:bg-[#F5F7FB] transition" type="button">
          Simpan draf
        </button>
<button onClick={() => navigate("/persiapan/pemeriksaan")} className="h-[44px] px-4 rounded-lg bg-[#1769D2] text-white text-sm font-semibold hover:bg-[#1257B0] flex items-center gap-2 shadow-sm transition" type="button">
<span>Periksa berkas dengan AI</span>
<span className="material-symbols-outlined text-white">arrow_forward</span>
</button>
</div>
</div>
</div>

    </div>
  );
};
