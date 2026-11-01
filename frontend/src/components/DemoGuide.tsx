import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./demo-guide.css";

const OPEN_EVENT = "daftarin:open-demo-guide";
const CHECKLIST_KEY = "daftarin:judge-guide:v1";
type Journey = "mulai" | "warga" | "petugas" | "admin";
type Step = { title: string; detail: string; path: string };
const journeys: Record<Journey, Step[]> = {
  mulai: [
    { title: "Baca panduan layanan", detail: "Cari KK atau layanan lain, lalu baca kondisi dan persyaratannya. Bagian ini dapat dibuka tanpa akun.", path: "/katalog" },
    { title: "Daftar warga baru", detail: "Gunakan Isi data contoh dan foto contoh, catat email serta sandinya, lalu baca dan centang persetujuan sendiri. Jika sudah masuk, keluar lewat menu akun untuk mencoba pendaftaran.", path: "/daftar" },
    { title: "Ikuti satu urusan lintas peran", detail: "Warga mengirim → petugas meminta perbaikan → warga mengirim ulang → petugas menyelesaikan tinjauan. Kembali ke akun warga yang sama setiap kali memperbaiki kiriman.", path: "/masuk" },
  ],
  warga: [
    { title: "Pilih kebutuhan", detail: "Pilih layanan dari katalog, mulai persiapan, kemudian tentukan kondisi dan pengurusan diri sendiri atau keluarga.", path: "/katalog" },
    { title: "Isi data dan dokumen", detail: "Lanjutkan dari draf. Gunakan data contoh dan Muat dokumen contoh (1 berkas terpotong) untuk mencoba alur revisi. Pratinjau berkas sebelum mengirim.", path: "/persiapan" },
    { title: "Tinjau dan kirim", detail: "Baca rangkuman, berikan persetujuan sendiri, lalu kirim ke petugas. Catat referensi kiriman agar mudah ditemukan pada akun petugas.", path: "/persiapan" },
    { title: "Perbaiki sesuai catatan petugas", detail: "Setelah petugas meminta perbaikan, buka detail pengajuan, ganti berkas dengan contoh yang utuh, dan kirim ulang. Menyimpan draf saja belum mengirim revisi.", path: "/pelacakan" },
    { title: "Catat tindak lanjut", detail: "Setelah tinjauan selesai, baca arahan kanal resmi. Untuk demo, gunakan tanda terima fiktif saat mencatat pengajuan instansi dan konfirmasi hasil diterima. Tidak perlu mengajukan ke pemerintah sungguhan.", path: "/pelacakan" },
    { title: "Coba fitur pendamping", detail: "Kelola keluarga, profil, ukuran tulisan, kontras, dan notifikasi. Bantuan manusia dan chatbot dapat dicoba terpisah; chatbot tidak mengirim pengajuan.", path: "/akun" },
  ],
  petugas: [
    { title: "Temukan kiriman warga", detail: "Buka antrean dan cari referensi kiriman tadi. Jika kosong, warga harus mengirim dahulu; admin dapat memeriksa penugasannya.", path: "/petugas" },
    { title: "Mulai tinjauan dan minta koreksi", detail: "Buka detail, mulai tinjauan, nilai data serta berkas wajib. Tandai dokumen terpotong Perlu perbaikan, isi catatan spesifik, lalu kirim keputusan.", path: "/petugas" },
    { title: "Tinjau kiriman ulang", detail: "Tunggu warga mengirim revisi. Baca versi baru, nilai ulang bagian wajib, dan selesaikan tinjauan jika sesuai. Selesai tinjauan bukan dokumen pemerintah sudah terbit.", path: "/petugas" },
    { title: "Baca riwayat pekerjaan", detail: "Periksa hasil tinjauan sebelumnya. Untuk panduan yang membingungkan, gunakan permintaan klarifikasi admin dari detail kiriman bila tersedia.", path: "/petugas/riwayat" },
  ],
  admin: [
    { title: "Periksa akun dan penugasan", detail: "Temukan kiriman warga, periksa petugas aktif yang ditugaskan, dan coba pemindahan pada kasus tambahan agar urusan utama tidak terganggu.", path: "/admin/petugas" },
    { title: "Kelola panduan layanan", detail: "Coba perubahan draf, persyaratan, dan penerbitan sesuai kontrol yang tersedia. Lakukan setelah alur utama selesai agar syarat kasus demo tidak berubah di tengah jalan.", path: "/admin/layanan" },
    { title: "Periksa sumber dan versi", detail: "Baca sumber dan riwayat versi panduan. Periksa informasi sebelum menerbitkan perubahan.", path: "/admin/sumber" },
    { title: "Jawab bantuan", detail: "Buat permintaan dari akun warga atau petugas dahulu, lalu baca dan jawab di sini. Kembali ke akun pengirim untuk melihat tanggapan.", path: "/admin/bantuan" },
    { title: "Baca riwayat aktivitas", detail: "Cari perubahan panduan, penugasan, serta tindakan lain yang tercatat selama demo.", path: "/admin/aktivitas" },
  ],
};
const names: Record<Journey, string> = { mulai: "Mulai di sini", warga: "Warga", petugas: "Petugas", admin: "Admin" };

export function DemoGuideButton({ floating = false }: { floating?: boolean }) {
  return <button type="button" className={floating ? "demo-guide-launcher" : "demo-guide-topbar"} aria-label="Panduan demo untuk penilai" aria-haspopup="dialog" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 5C8 3 5 3 3 4v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-2-1-5-1-9 1Zm0 0v15" /></svg>
    <span>Panduan demo</span>
  </button>;
}

export function DemoGuide() {
  const { user, mode } = useAuth();
  const [open, setOpen] = useState(false);
  const [journey, setJourney] = useState<Journey>("mulai");
  const [checked, setChecked] = useState<string[]>(() => {
    try { const value: unknown = JSON.parse(sessionStorage.getItem(CHECKLIST_KEY) || "[]"); return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : []; } catch { return []; }
  });
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, show);
    return () => window.removeEventListener(OPEN_EVENT, show);
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem(CHECKLIST_KEY, JSON.stringify(checked)); } catch { /* Checklist remains usable without storage. */ }
  }, [checked]);
  useEffect(() => {
    if (!open || !dialog.current) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.current.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.current?.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);
  const canVisit = journey === "mulai" || user?.role === journey;
  return <>
    <DemoGuideButton floating />
    {open && <dialog ref={dialog} className="demo-guide-dialog" aria-labelledby="demo-guide-title" onCancel={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) { const box = event.currentTarget.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) setOpen(false); } }}>
      <div className="demo-guide-heading"><h2 id="demo-guide-title">Panduan demo untuk penilai</h2><button type="button" className="demo-guide-close" autoFocus onClick={() => setOpen(false)} aria-label="Tutup panduan demo">×</button></div>
      <p>Ini hanya panduan mencoba aplikasi. Gunakan akun dan dokumen contoh. Tindakanmu dapat mengubah data pada lingkungan demo.</p>
      <p className="demo-guide-mode">{mode === "api" ? "Mode API: fitur yang sudah terhubung menyimpan data melalui server. Jika ada kegagalan, baca pesan pada halaman; checklist ini bukan bukti proses berhasil." : "Mode demo lokal: data bisnis tersimpan di browser ini. Gunakan browser dan alamat yang sama untuk mencoba lintas peran."}</p>
      <details className="demo-guide-accounts"><summary>Akun contoh dan bantuan pengisian</summary><p>Warga: warga@daftarin.test<br />Petugas: petugas@daftarin.test<br />Admin: admin@daftarin.test<br />Sandi awal: <code>DaftarIn2026!</code></p><p>Jika sandi sudah diganti, gunakan sandi terbaru. Di mode API, akun contoh harus sudah disiapkan pada server. Tombol panduan ini tidak membuat akun atau mereset sandi.</p><p>Tombol Isi data contoh dan Muat dokumen contoh tetap dapat digunakan bila tersedia. Persetujuan dan pengiriman dilakukan sendiri. Jangan unggah NIK, KTP, atau dokumen pribadi asli.</p></details>
      <div className="demo-guide-roles" role="group" aria-label="Pilih alur demo">{(Object.keys(names) as Journey[]).map(key => <button key={key} type="button" aria-pressed={journey === key} onClick={() => setJourney(key)}>{names[key]}</button>)}</div>
      {!canVisit && <p className="demo-guide-mode">Bagian ini memerlukan akun {names[journey]}. Keluar melalui menu akun, lalu masuk dengan peran tersebut. Panduan tidak berpindah akun otomatis.</p>}
      <ol className="demo-guide-steps">{journeys[journey].map((step, index) => {
        const key = journey + ":" + index;
        return <li key={key}><label><input type="checkbox" checked={checked.includes(key)} onChange={event => setChecked(current => event.target.checked ? [...current, key] : current.filter(item => item !== key))} /><strong>{index + 1}. {step.title}</strong></label><p>{step.detail}</p>{canVisit && <Link to={step.path} onClick={() => setOpen(false)}>Buka halaman →</Link>}</li>;
      })}</ol>
      <p className="demo-guide-footnote">Centang setelah kamu mencoba sendiri. Centang ini hanya catatan pada tab ini, bukan status pengajuan.</p>
      <button type="button" className="demo-guide-reset" onClick={() => setChecked([])}>Ulangi checklist panduan</button>
    </dialog>}
  </>;
}
