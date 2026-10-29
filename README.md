# DaftarIn

DaftarIn adalah website pendamping pengurusan layanan pemerintah yang membantu warga memahami persyaratan, menyiapkan berkas, memeriksa dokumen dengan bantuan AI, serta mencatat dan memantau pengajuan sesuai sumber pembaruan yang tersedia. Pengalaman utama berbentuk halaman interaktif, dengan chatbot sebagai bantuan opsional.

> **Tahu syaratnya, jelas langkahnya, terpantau prosesnya.**

## Tech Stack

| Komponen | Teknologi | Tanggung jawab |
| --- | --- | --- |
| Frontend | Next.js + Tailwind CSS | UI dan halaman aplikasi |
| Backend | NestJS | API dan business logic |
| Database | Supabase (PostgreSQL) + Prisma | User, role, layanan, pengajuan, audit log |
| Authentication | Custom auth di NestJS | Registrasi, login, logout, session/token |
| File storage | Supabase Storage | Menyimpan dokumen warga secara privat |
| Background jobs | Redis + BullMQ | OCR dan pemeriksaan AI di background |

Catatan: database tetap dikelola di **Supabase** (PostgreSQL), sedangkan **Prisma** digunakan sebagai ORM untuk mengaksesnya.

## Struktur Repo

```
DaftarIn/
├─ frontend/         # Next.js + Tailwind CSS
├─ backend/          # NestJS API
│  └─ docs/PRD.md    # Source of truth produk
└─ README.md
```

## Cara Menjalankan

> Perintah di bawah masih berupa placeholder karena `package.json` dan konfigurasi workspace **belum tersedia**. Sesuaikan setelah scaffold frontend/backend dibuat.

### Prasyarat

- Node.js 20+
- pnpm
- Git
- Project Supabase (PostgreSQL)
- Redis (untuk BullMQ)

### 1. Clone

```bash
git clone <url-repo>
cd DaftarIn
```

### 2. Install

```bash
pnpm install
```

### 3. Konfigurasi environment

Salin `.env.example` menjadi `.env` pada `backend/` dan `frontend/`, lalu isi kredensial Supabase, Redis, dan variabel lain yang dibutuhkan.

### 4. Siapkan database

```bash
pnpm --filter backend prisma generate
pnpm --filter backend prisma migrate dev
```

### 5. Jalankan

```bash
# Terminal 1 — backend
pnpm --filter backend start:dev

# Terminal 2 — frontend
pnpm --filter frontend dev
```

## Progress Saat Ini

Status mengacu pada prioritas implementasi di PRD (bagian 21). Implementasi kode belum dimulai; repo saat ini baru berisi PRD.

- [x] **Spesifikasi produk** — PRD v1.0 selesai (`backend/docs/PRD.md`)
- [ ] **P0 — Inti** — landing page, katalog/panduan bersumber, pertanyaan kebutuhan, autentikasi, dashboard, persiapan, unggah dokumen, pemeriksaan AI, hasil/revisi, kanal resmi, pencatatan pengajuan
- [ ] **P0 — Kejujuran pelacakan** — linimasa bersumber, pemisahan nomor persiapan dan nomor resmi, mode simulasi berlabel
- [ ] **P0 — Pengelolaan** — panduan/aturan berversi, pembatasan akses, akun petugas simulasi
- [ ] **P1 — Pendamping** — chatbot kontekstual, notifikasi dalam aplikasi, pengingat pilihan warga
- [ ] **P2 — Pengembangan** — email/push, integrasi resmi, perluasan wilayah/layanan, analitik agregat
