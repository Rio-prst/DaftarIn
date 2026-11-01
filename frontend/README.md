# Frontend DaftarIn

Tanggal dokumentasi pengumpulan: **1 November 2026**.


React + TypeScript + Vite + Tailwind CSS untuk pendamping persiapan dokumen kependudukan. **Percobaan lokal sementara: mode demo tanpa API dan tanpa chatbot.** API aplikasi sudah terhubung menurut pembaruan pengembang; chatbot AI belum tersambung.

## Deployment dan status

Frontend: https://daftarin-dusky.vercel.app

Backend: https://daftar-api-eta.vercel.app/api

API aplikasi sudah terhubung menurut pembaruan pengembang. Chatbot AI sementara belum tersedia karena koneksi layanan chatbot belum tersambung. Untuk percobaan lokal penilai gunakan mode demo di bawah; tidak perlu key AI atau backend aktif. Status produksi tidak diuji ulang pada pembaruan dokumentasi ini.

## Prasyarat demo

Instal Node.js 22.x terbaru (minimal 22.12) atau LTS lebih baru dari https://nodejs.org/en/download dan Git dari https://git-scm.com/downloads. Setelah membuka terminal baru, jalankan `npm install -g pnpm`. Periksa `node --version`, `pnpm --version`, dan `git --version`.

Demo frontend tidak membutuhkan project Supabase/PostgreSQL, Redis, atau proses backend.

## Menjalankan demo tanpa backend

```sh
cd frontend
pnpm install
```

Buat `.env.local` di folder ini:

```env
VITE_AUTH_MODE=demo
VITE_API_URL=/api
VITE_DEMO_HELPERS=true
```

```sh
pnpm dev -- --host 127.0.0.1
```

Buka URL yang dicetak Vite, biasanya http://127.0.0.1:5173. Gunakan browser/profil dan alamat yang sama ketika berpindah peran.

## Akun dan bantuan contoh

Sandi awal ketiga akun: `DaftarIn2026!`.

- Warga: `warga@daftarin.test`
- Petugas: `petugas@daftarin.test`
- Admin: `admin@daftarin.test`

Jika pernah diubah, gunakan sandi terbaru. Tombol Coba akun contoh hanya mengisi kolom login. Tombol Isi data contoh mengisi formulir; persetujuan tetap diberikan pengguna. `VITE_DEMO_HELPERS=false` menyembunyikan helper akun/pengisian yang memakai pengaturan ini; tidak menonaktifkan semua fitur demo lain.

Mulai dari warga -> pilih layanan -> kebutuhan -> data -> dokumen contoh -> tinjau dan kirim. Petugas meminta koreksi -> warga memperbaiki dan mengirim ulang -> petugas menyelesaikan tinjauan. Warga kemudian dapat mencatat tindak lanjut fiktif ke instansi. Buka Panduan demo untuk langkah per peran.

Demo menyimpan akun/data bisnis di browser melalui localStorage dan IndexedDB. Refresh tidak dimaksudkan menghapus data, tetapi pembersihan perangkat/browser dapat menghapusnya. Jangan menggunakan dokumen pribadi asli. Chatbot membutuhkan backend/provider aktif dan terpisah dari formulir demo.

## Batas demo lokal

Percobaan ini tidak menggunakan API atau chatbot. Seluruh alur bisnis contoh berjalan di browser dengan akun fiktif. Tidak perlu menjalankan backend atau menyiapkan key provider AI. Chatbot AI sementara belum tersambung dan tidak termasuk fitur yang harus dicoba penilai.

## Mode API

```env
VITE_AUTH_MODE=api
VITE_API_URL=/api
VITE_DEMO_HELPERS=true
```

Backend lokal harus aktif di http://127.0.0.1:3000; Vite menyediakan proxy `/api`. Untuk backend online, gunakan URL HTTPS publik dengan akhiran `/api` tanpa garis miring terakhir. Restart Vite setelah perubahan env.

Login mode API memakai akun server, bukan akun browser lokal. Akun contoh harus disiapkan pada database server; menampilkan tombol contoh tidak membuat akun tersebut. Pembuatan akun cloud belum berhasil pada percobaan terakhir karena kendala sertifikat TLS.

**Sebagian alur FE masih perlu disambungkan/diverifikasi terhadap API. Jangan menganggap data mode demo tersimpan di server.**

## Vercel frontend

- Root Directory: `frontend`
- Framework: Vite
- Build Command: `pnpm build`
- Output Directory: `dist`
- Masukkan hanya env publik FE di atas. Gunakan `demo` bila ingin alur mandiri tanpa backend.
- URL `/api` di produksi membutuhkan reverse proxy; proxy Vite hanya aktif saat pengembangan. Jika tidak ada proxy produksi, isi URL backend publik.
- Perubahan env hosting memerlukan redeploy.

Tidak boleh ada key AI, service role Supabase, password database, atau JWT secret pada `VITE_*`. Konfigurasi AI milik backend.

## Status dan dokumentasi

Landing, katalog, formulir bertahap, ruang warga/petugas/admin, serta panduan demo telah dikerjakan. Integrasi API dan verifikasi deployment masih berlangsung. Tinjauan selesai bukan dokumen pemerintah sudah terbit; status instansi yang diisi warga tetap laporan warga.

Build: `pnpm build`. Tidak ada pengujian baru yang diklaim oleh pembaruan dokumentasi ini.
Lihat [README utama](../README.md) dan [keputusan produk](docs/PRODUCT-DECISIONS.md).
