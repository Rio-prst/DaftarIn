# DaftarIn — Iseng Daftar

Tanggal dokumentasi pengumpulan: **1 November 2026**.

DaftarIn adalah website pendamping persiapan dokumen kependudukan. Warga dapat membaca persyaratan, menyiapkan data dan berkas, serta menindaklanjuti tinjauan petugas sebelum menggunakan kanal resmi instansi.

## Website

**Buka aplikasi:** https://daftarin-dusky.vercel.app

API aplikasi sudah terhubung menurut pembaruan pengembang. **Chatbot AI sementara belum tersambung.** Untuk percobaan lokal, gunakan mode demo di bawah tanpa API atau chatbot.

## Tech stack

| Bagian | Teknologi |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | NestJS, TypeScript, Zod |
| Database | PostgreSQL / Supabase, Prisma |
| Penyimpanan dokumen | Supabase Storage; IndexedDB pada demo lokal |

## Menjalankan demo lokal

Demo ini tidak membutuhkan backend, project Supabase, Redis, atau key AI.

### 1. Siapkan alat

- Instal [Node.js](https://nodejs.org/en/download), minimal versi 22.12.
- Instal [Git](https://git-scm.com/downloads).
- Buka terminal baru, lalu instal pnpm:

```sh
npm install -g pnpm
```

### 2. Clone dan instal

```sh
git clone https://github.com/Rio-prst/DaftarIn.git
cd DaftarIn/frontend
pnpm install
```

### 3. Aktifkan demo

Buat file **frontend/.env.local**:

```env
VITE_AUTH_MODE=demo
VITE_DEMO_HELPERS=true
```

### 4. Jalankan

```sh
pnpm dev -- --host 127.0.0.1
```

Buka alamat yang dicetak terminal, biasanya **http://127.0.0.1:5173**. Jika port sudah dipakai, gunakan alamat pengganti yang ditampilkan.

## Akun contoh

| Peran | Email | Sandi awal |
| --- | --- | --- |
| Warga | warga@daftarin.test | DaftarIn2026! |
| Petugas | petugas@daftarin.test | DaftarIn2026! |
| Admin | admin@daftarin.test | DaftarIn2026! |

Akun di atas digunakan untuk **demo lokal**. Jika sandi sudah diubah pada browser tersebut, gunakan sandi terbaru. Bisa juga mencoba daftar akun warga baru menggunakan tombol **Isi data contoh**.

## Urutan mencoba

1. Buka beranda, katalog, dan detail persyaratan layanan.
2. Masuk sebagai warga atau daftar warga baru. Catat akun yang digunakan.
3. Pilih layanan dan kondisi -> isi data -> muat/unggah dokumen contoh -> tinjau dan kirim.
4. Keluar biasa, lalu masuk sebagai petugas. Buka kiriman warga dan berikan catatan perbaikan. Admin dapat memeriksa penugasan bila diperlukan.
5. Kembali ke akun warga yang sama. Baca catatan, perbaiki dokumen, lalu **kirim ulang**.
6. Petugas meninjau ulang dan menyelesaikan tinjauan pendamping.
7. Warga membaca langkah selanjutnya dan mencoba pencatatan tanda terima serta hasil menggunakan data fiktif.
8. Coba menu admin, bantuan, profil, keluarga, ukuran tulisan, dan kontras.

Tombol **Panduan demo** menyediakan petunjuk per peran. Tombol data/berkas contoh membantu pengisian; persetujuan dan pengiriman tetap dilakukan sendiri.

Gunakan browser/profil dan alamat lokal yang sama saat berpindah peran. Data demo tersimpan di browser dan tidak tersinkron ke perangkat lain. Jangan pilih **Keluar dan bersihkan perangkat** sebelum selesai mencoba.

## Progres saat ini

- Landing page, katalog, pendaftaran/login, persiapan bertahap, serta ruang warga/petugas/admin sudah dikerjakan.
- Alur demo persiapan -> tinjauan -> koreksi -> tindak lanjut dapat dicoba dengan data fiktif.
- API aplikasi sudah terhubung menurut pembaruan pengembang; verifikasi menyeluruh produksi belum dinyatakan selesai.
- **Chatbot AI sementara belum tersambung dan tidak termasuk percobaan lokal ini.**

DaftarIn mendampingi persiapan dan tinjauan, bukan menerbitkan dokumen pemerintah. Gunakan data contoh, bukan NIK/KTP asli.

## Struktur repo

```text
frontend/  Halaman dan alur aplikasi
backend/   Modul API dan database
```

Konfigurasi server untuk pengembang tersedia terpisah di [dokumentasi backend](backend/README.md). Penilai tidak perlu menjalankannya untuk mencoba demo lokal.
