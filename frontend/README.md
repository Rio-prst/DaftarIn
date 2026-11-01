# Frontend DaftarIn

Tanggal dokumentasi pengumpulan: **1 November 2026**.

Frontend berbasis React, TypeScript, Vite, dan Tailwind CSS. Website: https://daftarin-dusky.vercel.app

## Demo lokal untuk penilai

Gunakan **mode demo tanpa API dan tanpa chatbot**. Tidak diperlukan backend, Supabase, Redis, atau key AI. Chatbot AI sementara belum tersambung.

Prasyarat: [Node.js minimal 22.12](https://nodejs.org/en/download), [Git](https://git-scm.com/downloads), dan pnpm (`npm install -g pnpm`).

Dari root repo:

```sh
cd frontend
pnpm install
```

Buat **frontend/.env.local**:

```env
VITE_AUTH_MODE=demo
VITE_DEMO_HELPERS=true
```

Jalankan:

```sh
pnpm dev -- --host 127.0.0.1
```

Buka alamat yang dicetak terminal, biasanya http://127.0.0.1:5173.

## Akun contoh

| Peran | Email | Sandi awal |
| --- | --- | --- |
| Warga | warga@daftarin.test | DaftarIn2026! |
| Petugas | petugas@daftarin.test | DaftarIn2026! |
| Admin | admin@daftarin.test | DaftarIn2026! |

Jika sandi pernah diubah, gunakan sandi terbaru. Tombol **Isi data contoh** dapat dipakai untuk mencoba pendaftaran warga baru; persetujuan tetap dicentang sendiri.

## Alur demo

Warga memilih layanan -> kebutuhan -> data -> dokumen -> tinjau dan kirim. Petugas meminta koreksi -> warga memperbaiki dan mengirim ulang -> petugas menyelesaikan tinjauan -> warga mencatat tindak lanjut fiktif ke instansi.

Gunakan akun warga yang sama ketika kembali melakukan perbaikan. Semua peran demo harus memakai browser/profil dan alamat lokal yang sama. Gunakan **Panduan demo** di aplikasi untuk langkah lengkap.

Data contoh disimpan pada browser. Jangan gunakan dokumen asli atau membersihkan perangkat di tengah demo. Selesai tinjauan bukan berarti dokumen pemerintah sudah terbit.

Petunjuk clone, tech stack, dan progres tersedia pada [README utama](../README.md). Pengaturan server dipisahkan ke [dokumentasi backend](../backend/README.md) dan tidak diperlukan untuk percobaan ini.
