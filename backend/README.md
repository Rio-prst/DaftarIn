# Backend DaftarIn

Tanggal dokumentasi pengumpulan: **1 November 2026**.


NestJS + TypeScript + Prisma/PostgreSQL untuk auth/akun, katalog, persiapan/dokumen, kiriman/revisi, petugas, keluarga, bantuan, notifikasi, admin, dan audit. Storage server memakai Supabase Storage; chatbot memakai relay server. **Modul tersedia pada source, tetapi integrasi frontend ke seluruh API belum selesai dan belum dinyatakan siap produksi.**

Untuk mencoba alur UI tanpa konfigurasi database, gunakan [demo frontend](../frontend/README.md).

## Status deployment — snapshot 1 November 2026

Alamat API: https://daftar-api-eta.vercel.app/api

Frontend: https://daftarin-dusky.vercel.app

**Backend Vercel belum berhasil berjalan pada pemeriksaan terakhir**: health dan chat/status sama-sama menghasilkan 500 `FUNCTION_INVOCATION_FAILED`. Menunggu runtime logs pemilik project; belum ada penyebab startup yang terkonfirmasi. Build lokal yang berhasil bukan bukti deployment hidup. Untuk penilaian fitur tanpa backend gunakan mode demo frontend pada README utama.

## Instalasi dan menjalankan

Prasyarat: Node.js 22+, pnpm, database PostgreSQL dengan schema sesuai aplikasi. Supabase Storage diperlukan untuk alur dokumen server yang menggunakannya.

```sh
cd backend
pnpm install
```

Salin `.env.example` menjadi `.env`, lalu isi nilai privat sendiri. Jangan commit `.env`.

```sh
pnpm prisma:generate
pnpm start:dev
```

Generate hanya membuat Prisma Client, bukan menerapkan schema. Siapkan/tinjau migration sebelum menggunakan database baru. **Jangan menjalankan reset, seed, db push atau migration ke database bersama tanpa persetujuan pemilik.** `DATABASE_URL_TEST` harus database terpisah jika pengujian mengubah data.

Port lokal biasanya 3000. Sesuaikan `CORS_ORIGIN` dengan URL frontend yang benar-benar digunakan, misalnya `http://127.0.0.1:5173`. Jangan mencampur `localhost` dan `127.0.0.1` pada pengujian autentikasi.

## Environment backend

| Kelompok | Variabel |
| --- | --- |
| Server | NODE_ENV, PORT |
| Database | DATABASE_URL, DIRECT_URL; DATABASE_URL_TEST untuk pengujian terpisah |
| Storage | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET |
| Auth | JWT_ACCESS_SECRET, JWT_ACCESS_TTL, REFRESH_TOKEN_TTL_DAYS |
| Browser | CORS_ORIGIN, COOKIE_SECURE, COOKIE_DOMAIN |
| Dokumen | MAX_UPLOAD_BYTES, MAX_PDF_PAGES |
| Dokumentasi | SWAGGER_ENABLED |
| Chatbot | CHAT_AI_PROVIDER, CHAT_AI_BASE_URL, CHAT_AI_API_KEY, CHAT_AI_MODEL, CHAT_AI_FALLBACK_MODEL |
| Gemini langsung (opsional) | CHAT_GEMINI_API_KEY, CHAT_GEMINI_MODEL |
| Pemeriksaan dokumen (terpisah dari chat) | AI_PROVIDER, OCR_PROVIDER, AI_API_KEY |
| Antrean jika benar-benar diaktifkan | REDIS_URL, INSPECTION_QUEUE_CONCURRENCY |

Contoh konfigurasi chatbot tanpa secret:

```env
CHAT_AI_PROVIDER=openai_compatible
CHAT_AI_BASE_URL=https://atmorouter.dev/v1
CHAT_AI_API_KEY=ISI_KEY_PRIVAT
CHAT_AI_MODEL=ISI_MODEL_UTAMA
CHAT_AI_FALLBACK_MODEL=ISI_MODEL_CADANGAN
```

Nama `openai_compatible` merujuk format API, bukan memastikan modelnya GPT. Gemini langsung hanya dipilih jika provider sesuai; key Gemini tambahan tidak otomatis menjadi fallback AtmoRouter.

Redis/BullMQ bukan prasyarat demo frontend atau relay chatbot. `redis://localhost:6379` hanya benar jika Redis berjalan pada lingkungan backend yang sama. Memasang REDIS_URL tidak otomatis menyediakan Redis atau menjalankan worker. Jangan menyatakan pemeriksaan AI/OCR aktif hanya karena dependensi/env tersedia.

Untuk HTTPS publik, gunakan konfigurasi cookie/CORS yang sesuai domain deployment, jangan `COOKIE_DOMAIN=localhost`. Secret tidak boleh masuk frontend atau README. Verifikasi koneksi dan sertifikat TLS database; jangan menonaktifkan verifikasi TLS untuk menutupi error.

## Menyalakan chatbot untuk demo lokal

Ikuti [setup lokal lengkap pada README utama](../README.md#demo-lokal-lengkap-dengan-chatbot-ai). Jalankan backend port 3000, isi key/model pada `CHAT_AI_*` backend, lalu gunakan frontend `VITE_AUTH_MODE=demo` dan `VITE_API_URL=/api`. Relay chatbot tidak membutuhkan Redis/BullMQ dan terpisah dari provider pemeriksaan dokumen.

Status lokal terakhir: `/api/chat/status` HTTP 200 dan percobaan `/api/chat/messages` HTTP 201 dengan `source: ai`. Deployment Vercel terakhir masih gagal dengan HTTP 500; keberhasilan lokal tidak menjamin hosting sudah berhasil.

## Akun contoh server

Akun demo lokal browser dan akun database server adalah dua sumber terpisah. Akun contoh server tidak otomatis tersedia karena frontend menampilkan tombol login contoh.

Tersedia skrip eksplisit:

```sh
pnpm build
pnpm demo:bootstrap
```

**Periksa target database dan baca skrip sebelum menjalankan.** Skrip ini juga menyiapkan data katalog, bukan hanya akun. Jalankan hanya pada lingkungan demo yang diizinkan. Jangan jalankan sebagai startup otomatis produksi. Akun existing dan sandinya dimaksudkan tetap dipertahankan.

Akun yang dituju: `warga@daftarin.test`, `petugas@daftarin.test`, `admin@daftarin.test`; sandi awal `DaftarIn2026!` untuk akun baru. Jika sandi berubah, gunakan sandi terbaru. Percobaan pembuatan akun cloud terakhir belum berhasil karena `SELF_SIGNED_CERT_IN_CHAIN`; jangan mengklaim ketiga akun online telah dibuat.

## Status implementasi

- Source backend mencakup lifecycle tinjauan pendamping dan pengelolaan dokumen.
- Jalur frontend ke API masih perlu penyelesaian/verifikasi per fitur.
- Belum ada klaim alur lengkap cloud telah diuji atau pemeriksaan isi berkas OCR/LLM telah aktif.
- Selesai tinjauan pendamping berbeda dari dokumen resmi sudah terbit.
- Migration/schema database hosting dan seed akun harus dipastikan terpisah dari keberhasilan build.
- Tidak ada integrasi langsung ke SIAK atau sistem penerbitan pemerintah yang diklaim.

Build: `pnpm build`. Build bukan validasi seluruh alur runtime. Referensi kontrak dan laporan historis ada di `docs/` dan `../frontend/docs/`; jika klaim lama bertentangan, status terbatas pada README ini menjadi acuan handoff saat ini.
