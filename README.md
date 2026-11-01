# DaftarIn — Iseng Daftar

Tanggal dokumentasi pengumpulan: **1 November 2026**.


DaftarIn adalah website pendamping persiapan dokumen kependudukan: warga membaca persyaratan, melengkapi data dan berkas, serta menindaklanjuti catatan petugas sebelum memakai kanal resmi instansi. Chatbot membantu penjelasan dan navigasi; penerbitan dokumen tetap menjadi kewenangan instansi.

> **Status: prototipe demo; integrasi API belum penuh.** Ketersediaan endpoint backend tidak berarti semua tombol frontend sudah memakai server. Untuk penilaian alur secara mandiri, gunakan mode demo lokal di bawah.

## Tautan deployment untuk penilai

- **Frontend:** https://daftarin-dusky.vercel.app
- **Backend API:** https://daftar-api-eta.vercel.app/api

Tautan disertakan di sini sebagai pelengkap informasi pengumpulan. **Backend deployment Vercel belum berhasil berjalan pada pemeriksaan terakhir**: endpoint health dan chatbot mengembalikan HTTP 500 `FUNCTION_INVOCATION_FAILED`. Penyebab startup belum dapat dipastikan karena runtime logs hosting belum tersedia. Fitur online yang memerlukan backend, termasuk login API dan chatbot, belum dapat dijamin bekerja. Tidak ada klaim integrasi API penuh atau deployment end-to-end berhasil.

**Untuk mencoba alur tanpa bergantung pada kendala hosting, gunakan demo lokal di bawah.** Akun dan data demo berada di browser; mode ini tidak mengirim pengajuan ke pemerintah.

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

## Demo lokal lengkap dengan chatbot AI

Mode formulir tetap **demo**, sedangkan chatbot memanggil backend lokal. Kegagalan deployment Vercel tidak menghalangi chatbot lokal jika server dan provider lokal dikonfigurasi.

### 1. Terminal backend

Dari root repo:

```sh
cd backend
pnpm install
```

Salin `backend/.env.example` ke **backend/.env** dan isi konfigurasi privat yang valid. Gunakan koneksi database milik lingkungan pengembangan; jangan menyalin placeholder sebagai nilai asli dan jangan menonaktifkan verifikasi TLS jika koneksi ditolak.

Konfigurasi chatbot yang dibaca relay lokal:

```env
NODE_ENV=development
PORT=3000
COOKIE_SECURE=false
CORS_ORIGIN=http://127.0.0.1:5173,http://127.0.0.1:5174

CHAT_AI_PROVIDER=openai_compatible
CHAT_AI_BASE_URL=https://atmorouter.dev/v1
CHAT_AI_API_KEY=ISI_KEY_PRIVAT_ATMOROUTER
CHAT_AI_MODEL=ISI_MODEL_YANG_TERSEDIA_DI_PROVIDER
CHAT_AI_FALLBACK_MODEL=ISI_MODEL_CADANGAN_YANG_TERSEDIA
```

Lengkapi juga variabel backend pada `.env.example` seperti `DATABASE_URL`, `DIRECT_URL`, `JWT_ACCESS_SECRET` dan konfigurasi Supabase Storage yang diperlukan lingkunganmu. Nilai tersebut tidak boleh dimasukkan ke env frontend. Untuk lokal, biarkan `COOKIE_DOMAIN` tidak dipasang agar tidak mencampur domain `localhost` dan `127.0.0.1`.

```sh
pnpm prisma:generate
pnpm start:dev
```

`prisma:generate` hanya membuat client, bukan membuat tabel/akun. Bila memakai database baru, minta pengelola menyiapkan schema yang sesuai. Jangan reset/migrate/seed database bersama sembarangan. Redis/BullMQ tidak diperlukan untuk relay chatbot ini; `AI_PROVIDER=disabled` dan `OCR_PROVIDER=disabled` tidak mematikan chatbot karena konfigurasi chat menggunakan `CHAT_AI_*`.

### 2. Terminal frontend

Buat **frontend/.env.local**:

```env
VITE_AUTH_MODE=demo
VITE_API_URL=/api
VITE_DEMO_HELPERS=true
```

Kemudian dari root repo pada terminal kedua:

```sh
cd frontend
pnpm install
pnpm dev -- --host 127.0.0.1 --port 5173
```

Buka **http://127.0.0.1:5173**. Vite meneruskan `/api` ke backend **http://127.0.0.1:3000**. Jangan memakai URL backend Vercel pada env demo lokal ini. Jika port frontend berubah, pastikan origin aktual diizinkan oleh backend. Restart proses yang bersangkutan setelah mengubah env.

### 3. Periksa chatbot dan coba demo

- Buka **http://127.0.0.1:3000/api/chat/status**. `configured: true` berarti konfigurasi provider terbaca, belum membuktikan key/model berhasil dipanggil.
- Buka tombol **Tanya asisten** di frontend, kirim pertanyaan umum tanpa data pribadi, dan periksa label sumber jawaban.
- Jawaban berlabel **AI** berasal dari provider. **Panduan lokal** berarti layanan AI tidak berhasil dihubungi; jangan menganggap fallback sebagai keberhasilan integrasi AI.
- Pada pemeriksaan tambahan terhadap server lokal yang sedang aktif, status mendapat HTTP 200 dan satu pertanyaan contoh mendapat HTTP 201 dengan `source: ai`. Ini bukti pada lingkungan tersebut, bukan jaminan konfigurasi clone baru atau deployment online sama.
- Lanjutkan urutan demo warga -> petugas -> admin di atas memakai akun contoh lokal. Formulir dan data bisnis demo tetap tersimpan di browser; hanya pertanyaan chatbot yang dikirim ke backend/provider.
- Chatbot muncul untuk pengunjung/warga, bukan petugas/admin. Gunakan akun warga atau keluar biasa untuk mencobanya.

Jika chatbot belum bekerja: pastikan kedua terminal masih hidup, `VITE_API_URL=/api`, origin sesuai, key/model provider tersedia, lalu lihat log backend tanpa membagikan isi env. Tanpa backend aktif, formulir demo masih dapat dicoba tetapi respons AI tidak tersedia.

## Mode API — integrasi parsial

Untuk menghubungkan frontend lokal ke backend lokal, ganti **frontend/.env.local**:

```env
VITE_AUTH_MODE=api
VITE_API_URL=/api
VITE_DEMO_HELPERS=true
```

Jalankan backend di port 3000 secara terpisah. Vite meneruskan `/api` ke `http://127.0.0.1:3000`. Restart frontend setelah mengubah env.

Untuk backend publik, ganti `VITE_API_URL` dengan URL HTTPS backend berakhiran `/api`, tanpa garis miring terakhir. CORS dan cookie backend harus sesuai origin frontend.

**Mode API tidak boleh dianggap membuktikan seluruh alur sudah server-backed.** Auth/akun memiliki jalur API; integrasi persiapan, dokumen, tinjauan, serta menu lain masih perlu verifikasi per fitur. Tampilan berhasil pada demo lokal bukan bukti data masuk database cloud. Akun contoh cloud belum berhasil disiapkan pada percobaan terakhir karena kendala verifikasi sertifikat TLS.

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

Snapshot pengumpulan 1 November 2026: **backend pada deployment Vercel belum berhasil menyala**. Ini berbeda dari keberhasilan kompilasi kode lokal. Integrasi API belum lengkap dan penyebab error hosting masih menunggu runtime logs. Gunakan mode demo lokal untuk mencoba alur secara mandiri.

- Halaman landing, katalog, autentikasi, persiapan bertahap, serta ruang warga/petugas/admin telah dikerjakan.
- Demo alur warga -> tinjauan -> koreksi -> tindak lanjut tersedia dengan data contoh lokal.
- Backend memiliki modul auth/akun, katalog, persiapan/dokumen, kiriman/revisi, petugas, keluarga, bantuan, notifikasi, admin, dan audit; penyambungan frontend belum menyeluruh.
- Chatbot memiliki relay backend; respons AI bergantung pada konfigurasi dan ketersediaan provider.
- Belum ada klaim integrasi langsung SIAK/Dukcapil, penerbitan dokumen pemerintah, atau pemeriksaan OCR/LLM yang selesai end-to-end.
- Deployment publik, akun cloud, dan alur API menyeluruh masih memerlukan verifikasi. Project belum dinyatakan siap produksi.

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
