# DaftarIn

DaftarIn adalah website pendamping pengurusan layanan pemerintah yang membantu warga memahami persyaratan, menyiapkan berkas, memeriksa dokumen dengan bantuan AI, serta mencatat dan memantau pengajuan sesuai sumber pembaruan yang tersedia. Pengalaman utama berbentuk halaman interaktif, dengan chatbot sebagai bantuan opsional.

> **Tahu syaratnya, jelas langkahnya, terpantau prosesnya.**

## Tech Stack

| Komponen | Teknologi | Tanggung jawab |
| --- | --- | --- |
| Frontend | React + Vite + Tailwind CSS | UI dan halaman aplikasi |
| Backend | NestJS | API dan business logic |
| Database | Supabase (PostgreSQL) + Prisma | User, role, layanan, pengajuan, audit log |
| Authentication | Custom auth di NestJS | Registrasi, login, logout, session/token |
| File storage | Supabase Storage | Menyimpan dokumen warga secara privat |
| Background jobs | Redis + BullMQ | OCR dan pemeriksaan AI di background |

Catatan: database tetap dikelola di **Supabase** (PostgreSQL), sedangkan **Prisma** digunakan sebagai ORM untuk mengaksesnya.

## Struktur Repo

```
DaftarIn/
├─ frontend/            # React + Vite + Tailwind CSS
├─ backend/             # NestJS API (standalone)
│  ├─ docs/PRD.md       # Source of truth produk
│  ├─ src/              # Kode aplikasi
│  └─ package.json
├─ .gitignore
├─ .nvmrc
└─ README.md
```

`frontend/` dan `backend/` dikelola sebagai project terpisah: masing-masing memiliki `node_modules`, lockfile, environment, dan proses deploy sendiri.

## Cara Menjalankan

### Prasyarat

- Node.js 22+
- pnpm
- Git
- Project Supabase (PostgreSQL)
- Redis (untuk BullMQ)

### 1. Clone

```bash
git clone <url-repo>
cd DaftarIn
```

### 2. Install backend

```bash
cd backend
pnpm install
```

### 3. Konfigurasi environment

Salin `backend/.env.example` menjadi `backend/.env` (file contoh dibuat pada tahap konfigurasi backend), lalu isi kredensial Supabase, Redis, dan variabel lain yang dibutuhkan.

### 4. Siapkan database

Perintah ini tersedia setelah konfigurasi Prisma dibuat.

```bash
cd backend
pnpm prisma:generate
pnpm prisma:migrate
```

### 5. Jalankan backend

```bash
cd backend
pnpm start:dev
```

Backend berjalan di `http://localhost:3000`.

### 6. Jalankan frontend

```bash
cd frontend
pnpm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`. Panduan dan batas demo tersedia di [frontend/README.md](frontend/README.md).

## Progress Saat Ini

Status mengacu pada prioritas implementasi di PRD (bagian 21). Backend sudah di-scaffold dan dependensinya sudah dideklarasikan; fitur produk belum diimplementasikan.

- [x] **Spesifikasi produk** — PRD v1.0 selesai (`backend/docs/PRD.md`)
- [x] **Fondasi backend** — scaffold NestJS 11 + daftar dependensi (`backend/package.json`)
- [ ] **P0 — Inti** — landing page, katalog/panduan bersumber, pertanyaan kebutuhan, autentikasi, dashboard, persiapan, unggah dokumen, pemeriksaan AI, hasil/revisi, kanal resmi, pencatatan pengajuan
- [ ] **P0 — Kejujuran pelacakan** — linimasa bersumber, pemisahan nomor persiapan dan nomor resmi, mode simulasi berlabel
- [ ] **P0 — Pengelolaan** — panduan/aturan berversi, pembatasan akses, akun petugas simulasi
- [ ] **P1 — Pendamping** — chatbot kontekstual, notifikasi dalam aplikasi, pengingat pilihan warga
- [ ] **P2 — Pengembangan** — email/push, integrasi resmi, perluasan wilayah/layanan, analitik agregat
