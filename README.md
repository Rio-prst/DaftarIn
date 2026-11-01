# DaftarIn — Iseng Daftar

Tanggal dokumentasi pengumpulan: **1 November 2026**.


DaftarIn adalah website pendamping persiapan dokumen kependudukan: warga membaca persyaratan, melengkapi data dan berkas, serta menindaklanjuti catatan petugas sebelum memakai kanal resmi instansi. Chatbot membantu penjelasan dan navigasi; penerbitan dokumen tetap menjadi kewenangan instansi.

> **Status:** API aplikasi sudah terhubung menurut pembaruan pengembang; chatbot AI sementara belum tersambung. Untuk percobaan lokal penilai, gunakan **mode demo tanpa API dan tanpa chatbot**. Ini bukan klaim seluruh alur produksi telah diverifikasi.

## Tautan deployment untuk penilai

- **Frontend:** https://daftarin-dusky.vercel.app
- **Backend API:** https://daftar-api-eta.vercel.app/api

Tautan disertakan sebagai pelengkap informasi pengumpulan. API aplikasi sudah terhubung menurut pembaruan pengembang. **Chatbot AI sementara belum tersedia karena koneksi layanan chatbot belum tersambung.** Penilai tidak perlu menyiapkan atau menerima key AI. Status terbaru ini menggantikan catatan gangguan backend sebelumnya; deployment belum diuji ulang secara menyeluruh pada pembaruan dokumentasi ini.

**Percobaan lokal sementara menggunakan mode demo tanpa API dan tanpa chatbot.** Akun, formulir, berkas contoh, serta tinjauan demo berjalan di browser dan tidak mengirim pengajuan ke pemerintah.

## Instalasi alat untuk clone dan demo

1. Instal **Node.js 22.x terbaru (minimal 22.12)** atau versi LTS lebih baru dari https://nodejs.org/en/download. Node.js menyertakan npm.
2. Instal **Git** dari https://git-scm.com/downloads.
3. Buka terminal baru setelah instalasi, lalu periksa dan pasang pnpm:

```sh
node --version
npm --version
git --version
npm install -g pnpm
pnpm --version
```

Untuk **demo frontend**, cukup Node.js, pnpm, dan Git. **Project Supabase/PostgreSQL dan Redis tidak diperlukan.** Database/Supabase Storage baru diperlukan ketika mencoba backend/API. Redis dan worker BullMQ hanya diperlukan apabila fitur antrean benar-benar diaktifkan; keduanya bukan syarat demo formulir atau relay chatbot.

## Tech stack

| Bagian | Teknologi |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | NestJS, TypeScript, Zod |
| Database | PostgreSQL / Supabase, Prisma |
| Dokumen | Supabase Storage untuk jalur server; IndexedDB untuk demo lokal |
| Autentikasi API | JWT dan refresh session melalui cookie httpOnly |
| Chatbot | Relay backend ke provider AI; kredensial tidak ada di frontend |
| Antrean | Dependensi Redis/BullMQ tersedia; bukan prasyarat demo frontend atau chatbot |

## Coba demo lokal — untuk penilai

Demo ini dapat dijalankan tanpa database, Redis, atau backend. Gunakan data fiktif, bukan NIK/KTP asli.

Prasyarat: Git, Node.js 22+, dan pnpm. Jalankan:

```sh
git clone https://github.com/Rio-prst/DaftarIn.git
cd DaftarIn/frontend
pnpm install
```

Buat **frontend/.env.local** dengan isi berikut. Jangan menyalin env backend ke folder frontend.

```env
VITE_AUTH_MODE=demo
VITE_API_URL=/api
VITE_DEMO_HELPERS=true
```

Lalu jalankan:

```sh
pnpm dev -- --host 127.0.0.1
```

Buka alamat yang dicetak Vite, biasanya **http://127.0.0.1:5173**. Jika port terpakai, Vite dapat memilih port lain. Gunakan alamat dan profil browser yang sama sepanjang demo lintas peran.

### Akun contoh

| Peran | Email | Sandi awal |
| --- | --- | --- |
| Warga | warga@daftarin.test | DaftarIn2026! |
| Petugas | petugas@daftarin.test | DaftarIn2026! |
| Admin | admin@daftarin.test | DaftarIn2026! |

Akun ini disediakan pada mode demo lokal. Jika sandi pernah diganti, gunakan sandi terbaru. Pada mode API, akun harus dibuat terlebih dahulu di database server; tombol contoh tidak menciptakan akun atau melewati login.

### Urutan mencoba

1. Baca landing page, katalog, detail layanan, dan persyaratannya.
2. Daftar warga baru atau masuk sebagai warga contoh. Catat akun yang dipakai.
3. Pilih layanan dan kondisi -> isi data -> unggah/muat dokumen contoh -> tinjau dan kirim.
4. Keluar biasa, masuk sebagai petugas, lalu buka antrean kiriman warga. Jika diperlukan, admin memeriksa penugasan.
5. Petugas memberi catatan koreksi. Kembali ke warga yang sama, perbaiki dokumen dan **kirim ulang**; menyimpan draf belum mengirim revisi.
6. Petugas meninjau ulang dan menyelesaikan tinjauan pendamping.
7. Warga membaca arahan kanal resmi, mencatat tanda terima fiktif, lalu mencoba konfirmasi hasil diterima. Tidak perlu mengajukan dokumen sungguhan.
8. Coba ruang admin, bantuan, profil, keluarga, ukuran tulisan, dan kontras.

Buka **Panduan demo** di halaman publik atau top bar ruang kerja. Tombol pengisian contoh, bila tersedia, hanya mengisi data; persetujuan dan pengiriman tetap dilakukan sendiri. Chatbot memerlukan backend/provider aktif; alur formulir demo tidak bergantung pada layanan AI tersebut.

Data bisnis mode demo disimpan di localStorage/IndexedDB browser. Data tidak otomatis tersedia di perangkat lain. Jangan memilih **Keluar dan bersihkan perangkat** sebelum demo selesai karena tindakan itu dapat menghapus data lokal.

## Batas percobaan lokal sementara

- Gunakan `VITE_AUTH_MODE=demo`. Tidak perlu backend aktif, database, Redis, atau key AI.
- Chatbot tidak termasuk alur percobaan lokal ini. Respons AI sementara belum tersambung; jangan memakai jawaban panduan lokal sebagai bukti chatbot AI aktif.
- Data dan akun contoh tersimpan pada browser. Tidak tersinkron ke database cloud atau perangkat lain.
- Coba layanan -> persiapan -> kirim -> petugas meninjau -> warga memperbaiki -> tinjauan selesai menggunakan peran contoh pada browser yang sama.
- Pengaturan API/backend di bawah adalah referensi opsional untuk pengembang, bukan prasyarat penilaian demo lokal.

## Mode API — integrasi parsial

Untuk menghubungkan frontend lokal ke backend lokal, ganti **frontend/.env.local**:

```env
VITE_AUTH_MODE=api
VITE_API_URL=/api
VITE_DEMO_HELPERS=true
```

Jalankan backend di port 3000 secara terpisah. Vite meneruskan `/api` ke `http://127.0.0.1:3000`. Restart frontend setelah mengubah env.

Untuk backend publik, ganti `VITE_API_URL` dengan URL HTTPS backend berakhiran `/api`, tanpa garis miring terakhir. CORS dan cookie backend harus sesuai origin frontend.

Bagian ini hanya untuk pengembang yang ingin menghubungkan server. Penilai lokal tidak perlu mengaktifkannya. Tombol contoh tidak otomatis membuat akun server; akun dan schema harus disiapkan oleh pengelola. Verifikasi semua alur server tetap diperlukan sebelum menganggap integrasi produksi selesai.

## Pemisahan environment

| Lokasi | Variabel | Keterangan |
| --- | --- | --- |
| FE: frontend/.env.local atau hosting FE | VITE_AUTH_MODE | demo atau api |
| FE | VITE_API_URL | /api untuk proxy lokal, atau URL backend publik |
| FE | VITE_DEMO_HELPERS | true untuk menampilkan bantuan contoh; false untuk menyembunyikan |
| BE: backend/.env atau hosting BE | DATABASE_URL, DIRECT_URL | Koneksi database; jangan pakai target bersama untuk reset/test destruktif |
| BE | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET | Storage dokumen |
| BE | JWT_ACCESS_SECRET, JWT_ACCESS_TTL, REFRESH_TOKEN_TTL_DAYS | Autentikasi |
| BE | NODE_ENV, PORT, CORS_ORIGIN, COOKIE_SECURE, COOKIE_DOMAIN | Konfigurasi server dan origin |
| BE | CHAT_AI_PROVIDER, CHAT_AI_BASE_URL, CHAT_AI_API_KEY, CHAT_AI_MODEL, CHAT_AI_FALLBACK_MODEL | Chatbot |
| BE | CHAT_GEMINI_API_KEY, CHAT_GEMINI_MODEL | Opsional untuk provider Gemini langsung |

Seluruh `VITE_*` bersifat publik. Jangan menaruh password database, key AI, Supabase service key, atau JWT secret di frontend/GitHub. `AI_PROVIDER`/`OCR_PROVIDER` untuk pemeriksaan dokumen berbeda dari `CHAT_AI_*` untuk chatbot. Env lengkap bukan bukti fitur aktif. Detail BE ada di [backend/README.md](backend/README.md).

## Progres saat ini

Snapshot pengumpulan 1 November 2026, dengan klarifikasi status terbaru: API aplikasi sudah terhubung menurut pembaruan pengembang. **Chatbot AI sementara belum tersambung.** Jalur percobaan lokal penilai menggunakan demo browser tanpa API atau chatbot; verifikasi menyeluruh produksi belum dinyatakan selesai.

- Halaman landing, katalog, autentikasi, persiapan bertahap, serta ruang warga/petugas/admin telah dikerjakan.
- Demo alur warga -> tinjauan -> koreksi -> tindak lanjut tersedia dengan data contoh lokal.
- Backend memiliki modul auth/akun, katalog, persiapan/dokumen, kiriman/revisi, petugas, keluarga, bantuan, notifikasi, admin, dan audit; penyambungan frontend belum menyeluruh.
- Chatbot AI sementara belum tersedia karena koneksi layanan chatbot belum tersambung. Tidak diperlukan untuk demo lokal.
- Belum ada klaim integrasi langsung SIAK/Dukcapil, penerbitan dokumen pemerintah, atau pemeriksaan OCR/LLM yang selesai end-to-end.
- API aplikasi sudah terhubung menurut pembaruan pengembang; keberhasilan semua alur produksi belum diverifikasi pada pembaruan dokumentasi ini.

## Struktur dan dokumentasi

```text
frontend/       React, Vite, dan dokumentasi alur demo
backend/        NestJS, Prisma, migration, dan modul API
```

- [Petunjuk frontend](frontend/README.md)
- [Petunjuk backend](backend/README.md)
- [Keputusan produk](frontend/docs/PRODUCT-DECISIONS.md)
- [Panduan demo lengkap](frontend/docs/PANDUAN-DEMO-LENGKAP-2026-11-01.txt) — panduan historis; ketentuan mode pada README ini menjadi acuan menjalankan demo saat ini.

Build frontend: `cd frontend` lalu `pnpm build`. Build backend: `cd backend` lalu `pnpm build`. Build berhasil tidak sama dengan seluruh alur API sudah teruji.
