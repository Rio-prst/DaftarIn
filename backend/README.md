# DaftarIn Backend

Backend API untuk **DaftarIn**, aplikasi persiapan dan pemantauan pengajuan layanan publik. Backend ini menangani katalog layanan, persiapan warga, pemeriksaan dokumen, status pengajuan, notifikasi, dan audit.

Status saat ini: fondasi NestJS dan dependensi sudah disiapkan. Schema Prisma, konfigurasi environment, dan modul fitur belum diimplementasikan.

## Stack

| Komponen | Teknologi |
|---|---|
| Runtime | Node.js 22, TypeScript |
| Framework | NestJS 11 |
| Validasi | Zod 4 + `nestjs-zod` |
| Database | PostgreSQL Supabase + Prisma 7 |
| Auth | JWT access token + refresh session, cookie `httpOnly` |
| Storage | Supabase Storage (bucket privat) |
| Queue | Redis + BullMQ |
| Dokumentasi API | Swagger |

## Prasyarat

- Node.js 22
- pnpm
- Database PostgreSQL/Supabase
- Docker Desktop untuk Redis lokal, atau Redis yang sudah berjalan

## Setup

```bash
pnpm install
cp .env.example .env
```

Buka `.env` lalu sesuaikan kredensial. Daftar variabel lengkap ada di [`docs/architecture.md`](docs/architecture.md) bagian 13. Variabel utama:

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | Supabase Session Pooler port `5432`, `sslmode=require` |
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Hanya untuk server |
| `SUPABASE_STORAGE_BUCKET` | Bucket privat dokumen |
| `JWT_ACCESS_SECRET` | Secret minimal 32 byte acak |
| `CORS_ORIGIN` | Origin frontend yang diizinkan |
| `REDIS_URL` | Koneksi Redis untuk BullMQ |

Jangan commit file `.env` atau kredensial apa pun.

## Menjalankan Redis dan BullMQ

```bash
# jalankan Redis di background
docker compose up -d

# cek status container
docker compose ps
```

BullMQ adalah library yang berjalan di dalam proses NestJS. Container yang dijalankan hanya Redis sebagai backend queue, jadi tidak ada container BullMQ terpisah. Jalankan Redis sebelum backend agar worker dapat terhubung.

```bash
# lihat log Redis
docker compose logs -f redis

# hentikan Redis tanpa menghapus data
docker compose down

# hentikan Redis dan hapus volume data
docker compose down -v
```

Jika memakai Redis di luar Docker, sesuaikan `REDIS_URL` di `.env`.

## Menjalankan aplikasi

```bash
# development
pnpm start:dev

# build
pnpm build

# production
pnpm start:prod
```

Backend berjalan di `http://localhost:3000`. Base path API yang direncanakan adalah `/api`, dengan Swagger di `/api/docs`.

## Prisma

Schema Prisma dan migrasi belum dibuat. Setelah `prisma/schema.prisma` dan `prisma7.config.ts` tersedia:

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

Prisma 7 memakai generated client di `src/generated/prisma` dengan `moduleFormat = "cjs"`. Lihat [`docs/architecture.md`](docs/architecture.md) bagian 11 sebelum mengubah konfigurasi database.

## Test

```bash
# unit test
pnpm test

# e2e test
pnpm test:e2e

# coverage
pnpm test:cov
```

Test integrasi repository akan memakai database test terpisah melalui `DATABASE_URL_TEST` dan script `test:integration` setelah setup Prisma selesai.

## Struktur proyek

```text
backend/
├── src/                 # bootstrap Nest dan modul fitur
├── test/                # konfigurasi e2e
├── docs/                # PRD, ERD, aturan bisnis, arsitektur
├── docker-compose.yml   # Redis untuk BullMQ
├── .env.example
├── package.json
└── pnpm-lock.yaml
```

Rencana batas modul, pola repository, auth, queue, storage, dan strategi testing dijelaskan di [`docs/architecture.md`](docs/architecture.md).

## Dokumentasi

- [`docs/PRD.md`](docs/PRD.md) - kebutuhan produk dan kriteria penerimaan
- [`docs/API-Contract.md`](docs/API-Contract.md) - kontrak endpoint dan format response
- [`docs/ERD.md`](docs/ERD.md) - entitas, relasi, dan enum
- [`docs/Bussines-Rules.md`](docs/Bussines-Rules.md) - aturan bisnis
- [`docs/architecture.md`](docs/architecture.md) - arsitektur backend
- [`docs/domain-context.md`](docs/domain-context.md) - konteks dan batasan domain

## Catatan implementasi

- Validasi memakai Zod dan `nestjs-zod`; jangan menambahkan `class-validator` atau `class-transformer`.
- Auth memakai implementasi sendiri di NestJS, bukan Supabase Auth.
- Dokumen pribadi tidak boleh diakses lewat URL publik.
- Pemeriksaan dokumen berjalan asinkron melalui BullMQ; hasil AI bukan keputusan resmi.
- Status persiapan dan status pengajuan adalah dua hal yang terpisah.
