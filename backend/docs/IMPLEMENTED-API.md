# API aktif — 1 November 2026

Dokumen ini mencatat implementasi yang sudah ada. `API-Contract.md` juga memuat rancangan modul berikutnya; keberadaan endpoint di rancangan tidak berarti endpoint tersebut sudah aktif.

Base URL: `/api`. Respons sukses memakai `{ "data": ... }`, kecuali `204` tanpa isi. Error memakai `{ "error": { "code", "message", "request_id" } }`. Cookie autentikasi HttpOnly; tidak ada token yang harus disimpan frontend. Origin frontend harus diizinkan melalui `CORS_ORIGIN`.

| Metode | Endpoint | Akses dan perilaku |
|---|---|---|
| GET | `/health` | Publik; kesehatan aplikasi, bukan jaminan seluruh integrasi eksternal tersedia |
| POST | `/auth/register` | Publik, 201; membuat warga, tanpa login otomatis |
| POST | `/auth/login` | Publik; memasang cookie sesi |
| POST | `/auth/refresh` | Cookie refresh; rotasi refresh token |
| POST | `/auth/logout` | Mencabut refresh sesi dan menghapus cookie, termasuk saat access token kedaluwarsa |
| GET | `/auth/me` | Sesi aktif; identitas dan peran akun |
| GET | `/account` | Profil akun sendiri |
| PATCH | `/account/profile` | Nama/telepon akun sendiri; konflik versi 409 |
| POST | `/account/password` | Sandi lama dan baru; 204, mengakhiri semua sesi |
| GET | `/account/sessions` | Metadata sesi aktif akun sendiri, tanpa token |
| DELETE | `/account/sessions/:id` | 204; hanya sesi lain milik akun sendiri |
| GET/PATCH | `/account/preferences` | Ukuran teks, kontras, preferensi notifikasi akun sendiri |
| GET | `/admin/users` | Admin; pencarian/pagination akun, tanpa hash atau token |
| GET | `/admin/agencies` | Admin; instansi aktif dan wilayahnya, maksimum 500 opsi |
| PATCH | `/admin/users/:id/access` | Admin; 204, ubah akses warga/petugas dan cabut sesi target |
| GET | `/admin/audit` | Admin; riwayat perubahan server, tanpa isi formulir privat |

## Payload utama

Registrasi:

```json
{
  "display_name": "Nama Contoh",
  "email": "nama@example.test",
  "password": "kata-sandi-khusus-pengujian",
  "privacy_accepted": true,
  "privacy_notice_version": "2026-11-01"
}
```

Properti tambahan ditolak, termasuk `role`. Persetujuan dibuat dalam transaksi yang sama dengan akun dan peran warga. Respons `verification_required: false` berarti verifikasi email belum diimplementasikan; `user.email_verified` tetap false. Pendaftaran belum memproses NIK atau foto KTP. Sandi baru maksimal 72 byte UTF-8 karena bcrypt.

Profil: `{ "display_name", "phone", "expected_updated_at"? }`. Waktu versi diambil dari GET `/account`; kirim kembali ketika menyimpan untuk melindungi perubahan bersamaan. Email bukan bidang yang dapat diedit dari endpoint ini.

Sandi: `{ "current_password", "new_password" }`. Sandi lama yang salah menghasilkan 400, tanpa memutus sesi. Setelah berhasil, cookie dibersihkan dan semua refresh session akun dicabut. JWT sesi yang dicabut langsung ditolak pada permintaan berikutnya.

Preferensi: `{ "font_size": "normal" | "large", "high_contrast": boolean, "notify_in_app": boolean }`. Preferensi notifikasi baru menyimpan pilihan; sistem pengiriman notifikasi bisnis belum tersambung.

Pencarian admin: `?q=...&limit=20&cursor=<uuid>`, limit 1–50. Respons `{ "items": [], "next_cursor": "uuid" | null }`. Cursor diambil dari respons, bukan nomor halaman.

Akses akun:

```json
{
  "role": "officer",
  "status": "ACTIVE",
  "agency_id": "uuid-instansi-aktif",
  "expected_updated_at": "2026-11-01T00:00:00.000Z",
  "current_password": "kata-sandi-admin"
}
```

Peran hanya `citizen` atau `officer`; status `ACTIVE` atau `SUSPENDED`. Instansi wajib untuk petugas, dengan wilayah aktif. Waktu versi berasal dari daftar akun terbaru. Endpoint menolak akun sendiri, akun admin, status penghapusan, instansi tidak aktif, dan perubahan usang. Perubahan akun, penugasan peran, pencabutan sesi, serta audit dilakukan atomik. Penugasan instansi ini menjadi dasar pembatasan modul antrean berikutnya; modul antrean server sendiri belum diimplementasikan.

## Bootstrap admin dan migrasi

Operator database menjalankan `pnpm exec prisma migrate deploy`, lalu build backend. Migrasi tambahan preferensi: `202611010002_account_preferences`.

Untuk admin pertama, sediakan `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` pada environment sementara operator dan jalankan `pnpm run account:create-admin`. Sandi minimal 12 karakter dan maksimal 72 byte. Tidak ada kredensial admin bawaan. Skrip membuat akun baru dan audit; email yang sudah ada ditolak, bukan otomatis dinaikkan menjadi admin. Jangan menaruh sandi dalam repositori atau riwayat perintah. Hapus variabel provisioning setelah digunakan.

## Konfigurasi frontend/deployment

- `VITE_AUTH_MODE=api`; `VITE_API_URL=/api`.
- Vite development menyediakan proxy `/api` ke `127.0.0.1:3000`.
- Deployment frontend harus menyediakan reverse proxy `/api` ke NestJS. Hasil build Vite tidak membawa proxy development.
- Gunakan origin HTTPS, `COOKIE_SECURE=true`, secret JWT acak minimal 32 karakter, database runtime/migrasi yang sesuai, dan origin CORS eksplisit. `COOKIE_DOMAIN` boleh kosong untuk cookie host-only.
- Secret database, penyimpanan, dan LLM hanya berada di backend. `VITE_*` terlihat oleh browser.
- `.env.example` juga mencakup rencana provider yang belum aktif. Mengisi key saja belum mengaktifkan modul bisnis yang belum tersedia.

## Belum aktif

Katalog/publikasi panduan, persiapan warga, penyimpanan privat dokumen, pengiriman peninjauan, antrean petugas, pelacakan instansi, notifikasi bisnis, identitas NIK/KTP, penghapusan akun, verifikasi/reset email, OCR/LLM, R2, dan integrasi instansi. Skema Prisma sebagian sudah ada, tetapi skema bukan endpoint operasional. Frontend modul bisnis masih memakai penyimpanan browser.

Database pengujian lokal kompatibel PostgreSQL sudah dipakai untuk memeriksa API. Migrasi/kinerja/koneksi pada PostgreSQL tim tetap perlu diverifikasi oleh pemilik akses sebelum deployment publik.

## Relay chatbot — 1 November 2026

- `GET /api/chat/status`: publik; `{data:{configured:boolean}}`, hanya kelengkapan konfigurasi, bukan tes koneksi provider.
- `POST /api/chat/messages`: publik, 10 request/menit per IP/tracker proses; body ketat `{query, serviceId?, history?}`. Query maksimal 1.000 karakter, serviceId 1–6, history maksimal empat pesan user/bot, masing-masing maksimal 1.500 karakter. Properti file/formData/system role ditolak.
- Sukses `{data:{text, actionSteps, legalCitations, quickAction?, source:"ai", modelUsed}}`; 400 invalid, 429 rate limit, 503 provider tidak tersedia. Timeout provider 12 detik.
- Konfigurasi server: `CHAT_AI_PROVIDER=disabled|openai_compatible|gemini`, `CHAT_AI_API_KEY`, `CHAT_AI_MODEL`, `CHAT_AI_BASE_URL`. Key tidak berada di frontend.
- Tidak memiliki tools/account/file access. Nomor 16 digit disamarkan; sumber dan navigasi dari corpus aplikasi. Tidak menggantikan tinjauan manusia atau mengaktifkan OCR.
- Belum ada kredensial provider live pada lingkungan lokal. Enam unit test relay dan pengujian HTTP memakai provider mock; jangan menyatakan model nyata sudah diuji.
- Modul officer/admin panduan pada remote `feat/backend` a56a80e belum digabung penuh ke server lokal ini. Handoff terbaru: `frontend/docs/KEBUTUHAN-BACKEND-SETELAH-PERBAIKAN-PERSONA-2026-11-01.txt`.

## Pembaruan AI live — 1 November 2026

AtmoRouter telah diuji live dari UI. Konfigurasi tambahan CHAT_AI_FALLBACK_MODEL mencoba satu model kedua pada provider yang sama (timeout 10 detik/percobaan); 401/403 tidak diulang. Response menambahkan usedFallback. Opsi Gemini terpisah memakai CHAT_GEMINI_API_KEY/CHAT_GEMINI_MODEL bila provider dipilih gemini. Key hanya backend privat. 48 unit test backend lulus; lihat frontend/docs/LAPORAN-INTEGRASI-AI-LIVE-2026-11-01.txt. Klaim belum ada kredensial pada catatan sebelumnya sudah digantikan status ini.
