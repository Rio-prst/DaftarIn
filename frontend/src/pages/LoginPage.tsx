import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUserRole, showToast, openChat } = useApp();
  const [email, setEmail] = useState('ayu.contoh@email.com');
  const [password, setPassword] = useState('********');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (role: 'warga' | 'petugas' | 'admin' = 'warga') => {
    setUserRole(role);
    showToast(`Masuk berhasil sebagai ${role.toUpperCase()}!`, 'success');
    if (role === 'petugas') navigate('/petugas');
    else if (role === 'admin') navigate('/admin');
    else navigate('/dashboard');
  };

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen selection:bg-secondary-container selection:text-on-secondary-container font-body-md text-body-md relative">
      <div className="bg-[#142C4B] border-b border-[#233F66] px-4 py-2 flex items-center justify-between text-xs text-white z-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">⚡ Mode Evaluasi / Demo:</span>
          <span>Klik salah satu peran untuk simulasi instan:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleLogin('warga')}
            className="px-2.5 py-1 bg-[#1769D2] hover:bg-[#1256AE] rounded font-semibold text-white transition-colors"
          >
            1. Warga (Ayu Contoh)
          </button>
          <button
            type="button"
            onClick={() => handleLogin('petugas')}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 rounded font-semibold text-white transition-colors"
          >
            2. Petugas Verifikasi
          </button>
          <button
            type="button"
            onClick={() => handleLogin('admin')}
            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 rounded font-semibold text-white transition-colors"
          >
            3. Admin Regulasi
          </button>
        </div>
      </div>

{/*  Desktop Split Screen Canvas (45% / 55%)  */}
<main className="min-h-screen flex flex-col lg:flex-row w-full">
{/*  LEFT COLUMN (45% width, Deep Navy #142C4B background)  */}
<section className="w-full lg:w-[45%] bg-primary-container text-on-primary flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative overflow-hidden shrink-0 border-r border-outline-variant/20">
{/*  Ambient Visual Background Gradients  */}
{/*  Top Segment: Disclaimer Pill & Brand Identifier  */}
<div className="relative z-10 space-y-6">
{/*  Disclaimer Pill  */}
<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest/10 border border-surface-container-lowest/20 backdrop-blur-md">
<span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse"></span>
<span className="font-label-sm text-caption text-surface-container-low tracking-wide uppercase">
            PROTOTIPE INDEPENDEN · Bukan portal resmi pemerintah
          </span>
</div>
{/*  Brand Wordmark  */}
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-secondary-container/20 border border-secondary-container/40 flex items-center justify-center text-secondary-container shadow-inner">
<span className="material-symbols-outlined text-[24px]">task_alt</span>
</div>
<div className="flex flex-col">
<span className="font-headline-md text-headline-md font-black tracking-tight text-on-primary leading-tight">
              DaftarIn
            </span>
<span className="font-caption text-[10px] text-sky-200 tracking-wider uppercase font-semibold">JejakMasWowo · Layanan Warga</span>
</div>
</div>
{/*  Main Narrative & Value Proposition  */}
<div className="pt-4 space-y-3 max-w-xl">
<h2 className="font-headline-lg text-headline-lg text-on-primary font-bold leading-tight">
            Persiapanmu tersimpan, langkahmu tetap jelas.
          </h2>
<p className="font-body-md text-body-md text-primary-fixed-dim leading-relaxed">
            Simpan draf persiapan dokumen kependudukan, riwayat pemeriksaan mandiri, dan catatan progres pengajuan Anda secara privat dan terstruktur.
          </p>
</div>
</div>
{/*  Center Segment: Structured Citizen Infographic Architecture  */}
<div className="relative z-10 my-8 space-y-4 max-w-xl"><div className="text-caption font-semibold tracking-wider uppercase text-primary-fixed-dim pb-1">
  Contoh Alur Pengurusan
</div>
{/*  Step 1 Card  */}
<div className="p-4 rounded-xl bg-surface-container-lowest/5 border border-surface-container-lowest/10 backdrop-blur-sm flex items-start gap-3.5">
<div className="w-8 h-8 rounded-full bg-secondary-container/20 text-secondary-container flex items-center justify-center shrink-0 mt-0.5 border border-secondary-container/30">
<span className="font-label-md font-bold">1</span>
</div>
<div className="flex-1 min-w-0">
<span className="font-label-md text-label-md font-semibold text-on-primary block">Pahami Layanan</span>
<p className="font-caption text-caption text-primary-fixed-dim mt-0.5">
      Pelajari persyaratan, dasar hukum, dan tahapan resmi yang dibutuhkan.
    </p>
</div>
</div>
{/*  Step 2 Card  */}
<div className="p-4 rounded-xl bg-secondary-container/15 border border-secondary-container/40 flex items-start gap-3.5 shadow-md">
<div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 mt-0.5">
<span className="font-label-md font-bold">2</span>
</div>
<div className="flex-1 min-w-0">
<span className="font-label-md text-label-md font-semibold text-on-primary block">Siapkan Berkas</span>
<p className="font-caption text-caption text-primary-fixed leading-normal mt-0.5">
      Lengkapi dan periksa mandiri kelayakan dokumen sebelum diajukan.
    </p>
</div>
</div>
{/*  Step 3 Card  */}
<div className="p-4 rounded-xl bg-surface-container-lowest/5 border border-surface-container-lowest/10 backdrop-blur-sm flex items-start gap-3.5 opacity-80">
<div className="w-8 h-8 rounded-full bg-surface-container-lowest/20 text-on-primary flex items-center justify-center shrink-0 mt-0.5">
<span className="font-label-md font-bold">3</span>
</div>
<div className="flex-1 min-w-0">
<span className="font-label-md text-label-md font-semibold text-primary-fixed-dim block">Ajukan Melalui Kanal Resmi</span>
<p className="font-caption text-caption text-on-primary-container mt-0.5">
      Serahkan berkas melalui loket atau kanal instansi kependudukan resmi.
    </p>
</div>
</div>
{/*  Privacy Notice Card  */}
<div className="p-4 rounded-xl bg-surface-container-lowest/5 border border-surface-container-lowest/10 flex items-start gap-3 mt-4">
<span className="material-symbols-outlined text-secondary-container shrink-0 text-[20px] mt-0.5">shield</span>
<p className="font-caption text-caption text-primary-fixed-dim leading-relaxed">
    Kelola persiapan dan dokumenmu dari akun ini. Informasi selengkapnya dapat dilihat di <a className="text-secondary-container hover:underline font-semibold" href="#privasi">Kebijakan Privasi</a>.
  </p>
</div></div>
{/*  Bottom Segment: Legal Authority Metadata  */}
<div className="relative z-10 pt-4 border-t border-surface-container-lowest/15 flex items-center justify-between"><p className="font-caption text-caption text-on-primary-container">
  © 2026 JejakMasWowo · Panduan &amp; Tata Kelola Berkas Warga
</p></div>
</section>
{/*  RIGHT COLUMN (55% width, Light Clean Background #F5F7FB)  */}
<section className="w-full lg:w-[55%] bg-surface flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative">
{/*  Top Navigation & Action Bar  */}
<header className="w-full flex items-center justify-between pb-6 border-b border-outline-variant/30">
<a className="inline-flex items-center gap-2 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-150 group" href="#/panduan" onClick={(e) => { e.preventDefault(); navigate('/panduan'); }}>
<span className="material-symbols-outlined text-[20px] transition-transform duration-150 group-hover:-translate-x-1">arrow_back</span>
<span>Kembali ke panduan</span>
</a>
<div className="flex items-center gap-3"><a className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/50 hover:bg-surface-container-low font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-150" onClick={() => openChat()}>
<span className="material-symbols-outlined text-secondary text-[18px]">help_outline</span>
<span>Butuh bantuan?</span>
</a></div>
</header>
{/*  Center Container: Context Card + Focused Form Panel  */}
<div className="w-full max-w-md mx-auto my-auto py-8 space-y-6">
{/*  Flow Preservation Context Card  */}
<div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center gap-3 shadow-sm">
<div className="w-9 h-9 rounded-lg bg-surface-container-lowest border border-outline-variant/50 flex items-center justify-center text-secondary shadow-xs">
<span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
</div>
<div className="flex-1 min-w-0">
<span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant block font-semibold">
              Konteks Sesi Berjalan
            </span>
<span className="font-label-md text-label-md text-on-surface font-semibold truncate block">
              Melanjutkan persiapan: Akta Kelahiran · Kota Contoh · Simulasi
            </span>
</div>
</div>
{/*  Form Heading & Subtitle  */}
<div className="space-y-1.5">
<h1 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">
            Masuk untuk melanjutkan
          </h1>
<p className="font-body-md text-body-md text-on-surface-variant">
            Akun digunakan untuk menyimpan data, dokumen, dan hasil pemeriksaanmu.
          </p>
</div>
{/*  Citizen Authentication Form  */}
<form className="space-y-4" noValidate onSubmit={(e) => e.preventDefault()}>
{/*  Email Input Group  */}
<div className="space-y-1.5">
<label className="block font-label-md text-label-md font-medium text-primary" htmlFor="email">
              Alamat Email
            </label>
<div className="relative">
<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
<span className="material-symbols-outlined text-[20px]">mail</span>
</div>
<input className="w-full h-11 pl-11 pr-4 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface placeholder:text-outline focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-body-md font-body-md shadow-xs" id="email" name="email" placeholder="nama@email.com" required type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
</div>
</div>
{/*  Password Input Group  */}
<div className="space-y-1.5">
<label className="block font-label-md text-label-md font-medium text-primary" htmlFor="password">
              Kata Sandi
            </label>
<div className="relative">
<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
<span className="material-symbols-outlined text-[20px]">lock</span>
</div>
<input className="w-full h-11 pl-11 pr-11 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface placeholder:text-outline focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-body-md font-body-md shadow-xs" id="password" name="password" placeholder="Masukkan kata sandi" required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}/>
{/*  Interactive Eye Toggle Button  */}
<button aria-label="Tampilkan atau sembunyikan kata sandi" className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-on-surface transition-colors cursor-pointer" id="togglePassword" onClick={() => setShowPassword(!showPassword)} type="button">
<span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
</button>
</div>
</div>
{/*  Helper Row: Remember Me & Forgot Password  */}
<div className="flex items-center justify-between pt-1">
<label className="inline-flex items-center gap-2 cursor-pointer select-none">
<input className="w-4 h-4 rounded text-secondary border-outline-variant focus:ring-secondary/30 focus:ring-offset-0 cursor-pointer" id="remember" name="remember" type="checkbox"/>
<span className="font-body-sm text-body-sm text-on-surface">Ingat saya di perangkat ini</span>
</label>
<a className="font-label-md text-label-md font-semibold text-secondary hover:underline transition-all" href="#lupa-sandi" onClick={(e) => { e.preventDefault(); showToast('Petunjuk pemulihan kata sandi simulasi dikirimkan ke email Anda.', 'info'); }}>
              Lupa kata sandi?
            </a>
</div>
{/*  Primary Submit CTA  */}
<div className="pt-2">
<button className="w-full h-11 rounded-lg bg-secondary hover:bg-secondary/90 active:scale-[0.99] text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 transition-all shadow-md focus:outline-none focus:ring-3 focus:ring-secondary/30" type="button" onClick={() => handleLogin()}>
<span>Masuk Akun</span>
<span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
</div>
</form>
{/*  Explanatory Trust Notice  */}
{/*  Registration Link  */}
<div className="text-center pt-2">
<p className="font-body-md text-body-md text-on-surface-variant">
            Belum punya akun? 
            <button
              type="button"
              onClick={() => {
                handleLogin('warga');
                showToast('Membuat sesi draf persiapan warga baru...', 'success');
              }}
              className="text-secondary font-semibold hover:underline transition-all ml-1 cursor-pointer"
            >
              Daftar warga baru (simulasi instan)
            </button>
</p>
</div>
</div>
{/*  Bottom Legal Links Footer  */}
<footer className="w-full pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4 font-caption text-caption text-on-surface-variant">
<div className="flex items-center gap-4 flex-wrap">
<button type="button" onClick={() => showToast('Privasi warga: Berkas diproses privat di peramban lokal untuk simulasi mandiri.', 'info')} className="hover:text-primary transition-colors">Kebijakan Privasi</button>
<span>·</span>
<button type="button" onClick={() => showToast('Ketentuan Layanan: Platform ini adalah pendamping pra-loket mandiri tanpa calo.', 'info')} className="hover:text-primary transition-colors">Ketentuan Layanan</button>
<span>·</span>
<button type="button" onClick={() => showToast('Keterbukaan Informasi: Sesuai UU No. 24/2013 dan Permendagri No. 108/2019.', 'info')} className="hover:text-primary transition-colors">Keterbukaan Informasi</button>
</div>
<div>
<span>ID-CIVIC · v0.9.4 Prototype</span>
</div>
</footer>
</section>
</main>
{/*  Floating Help Trigger (Bottom Right Corner)  */}

    </div>
  );
};
