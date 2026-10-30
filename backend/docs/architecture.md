# Arsitektur Backend DaftarIn

Versi: 1.0

Status: baseline implementasi MVP

Basis: `PRD.md`, `API-Contract.md`, `ERD.md`, `Bussines-Rules.md`, `domain-context.md`

Dokumen ini menjelaskan arsitektur teknis backend DaftarIn. PRD dan kontrak API tetap menjadi sumber kebenaran perilaku produk. Jika dokumen ini berbeda dengan kontrak, kontrak API yang berlaku sampai ada keputusan perubahan resmi.

---

## 1. Tujuan dan ruang lingkup

Backend DaftarIn bertugas:

1. Menyediakan katalog layanan publik, panduan, persyaratan, dan sumber resmi.
2. Mengelola persiapan warga, jawaban, dan versi dokumen.
3. Menjalankan pemeriksaan kesiapan dokumen secara asinkron dengan aturan yang dapat dilacak.
4. Memisahkan status persiapan dari status pengajuan resmi.
5. Menyimpan riwayat status pengajuan beserta sumber dan waktunya.
6. Menjaga isolasi data antarpengguna dan membatasi akses petugas berdasarkan penugasan.
7. Menyediakan audit, notifikasi, dan asisten opsional tanpa menjadikan AI sebagai pengambil keputusan resmi.

Baseline adalah **modular monolith** NestJS. Pemisahan proses worker dilakukan hanya jika beban pemeriksaan menuntut, tanpa mengubah batas modul.

---

## 2. Keputusan arsitektur utama

| Keputusan | Alasan | Konsekuensi |
|---|---|---|
| Modular monolith di `backend/` | Tim kecil, domain masih erat, deploy sederhana | Batas modul harus disiplin; jangan akses repository modul lain |
| REST JSON dengan prefix `/api` | Sesuai kontrak API dan mudah diuji | Tidak ada versioning lewat path; perubahan breaking harus ditangani secara kompatibel atau mekanisme lain |
| Zod + `nestjs-zod` | Satu sumber tipe dan validasi, tanpa `class-validator` | DTO dibuat dengan `createZodDto`; schema Zod menjadi kontrak runtime |
| Auth custom di NestJS | Kebutuhan cookie, rotasi refresh, dan audit lebih terkontrol | Tidak memakai Supabase Auth/JWT; sesi disimpan di tabel sendiri |
| Access JWT + refresh token opaque | Access singkat, refresh dapat dicabut dan dirotasi | Perlu tabel sesi, hash token, dan perlindungan CSRF |
| Prisma 7 + PostgreSQL Supabase | Query type-safe, migrasi terkelola, cocok dengan Postgres | Wajib driver adapter dan generated client khusus Prisma 7 |
| Supabase Storage privat | Dokumen pribadi tidak boleh dapat diakses lewat URL publik | Semua akses lewat backend dan signed URL berumur pendek |
| Redis + BullMQ | Pemeriksaan tidak boleh bergantung pada satu request HTTP | Worker, retry, idempotensi, dan status gagal harus eksplisit |
| Snapshot versi input | Hasil lama tidak boleh ditimpa dan harus dapat diaudit | Pemeriksaan menyimpan versi panduan, aturan, data, dan dokumen |
| Frontend terpisah | Next.js dan backend memiliki siklus deploy berbeda | CORS allowlist, cookie domain, dan kontrak API harus eksplisit |

---

## 3. Prinsip arsitektur

1. **Kontrak sebelum implementasi.** Perubahan perilaku dimulai dari PRD/kontrak, bukan dari kode.
2. **Modul memiliki datanya.** Hanya repository dalam modul pemilik yang mengakses tabel domain tersebut.
3. **Controller tipis.** Controller menangani transport, otorisasi awal, dan pemetaan HTTP. Business rule berada di service.
4. **Repository hanya akses data.** Tidak ada aturan bisnis, pemanggilan HTTP, atau queue di repository.
5. **Validasi di batas sistem.** Semua input divalidasi Zod sebelum mencapai service.
6. **Server menentukan identitas dan status.** Klien tidak boleh menetapkan `owner_id`, role, status pemeriksaan, atau status pengajuan resmi.
7. **Otorisasi berlapis.** Guard memeriksa autentikasi/role; service memeriksa kepemilikan dan penugasan.
8. **Semua keputusan dapat dilacak.** Hasil pemeriksaan menyimpan sumber, versi aturan, versi input, dan timestamp.
9. **AI bukan otoritas.** AI hanya membantu membaca/menjelaskan. Keputusan kelayakan mengikuti aturan dan sumber resmi.
10. **Gagal dengan aman.** Error tidak membocorkan data pribadi, token, atau isi dokumen.
11. **Asinkron untuk pekerjaan panjang.** OCR, AI, dan pemeriksaan berat tidak dijalankan di request handler.
12. **Uji perilaku, bukan implementasi.** Test difokuskan pada aturan bisnis, isolasi akses, dan transisi status.

---

## 4. Stack

| Lapisan | Teknologi | Catatan |
|---|---|---|
| Runtime | Node.js 22 LTS, TypeScript strict | Target CommonJS agar sesuai scaffold Nest |
| Framework | NestJS 11 | Bukan Nest 12 karena `nestjs-zod` belum mendukungnya |
| Validasi | Zod 4, `nestjs-zod` 5 | `createZodDto`, `ZodValidationPipe`, `ZodSerializerInterceptor` |
| ORM | Prisma 7 + `@prisma/adapter-pg` | Pin `prisma@^7.10.1`; jangan memakai tag `latest` |
| Database | PostgreSQL Supabase | Session Pooler port `5432`, `sslmode=require` |
| Auth | `@nestjs/jwt`, `bcrypt`, cookie parser | Access JWT + refresh token opaque |
| Storage | Supabase Storage | Bucket privat, service role key hanya di server |
| Queue | Redis + BullMQ | Pemeriksaan asinkron, retry, dan job idempotent |
| Dokumentasi | Swagger (`@nestjs/swagger`) | Diekspos di `/api/docs` |
| Test | Jest + Supertest | Unit, integration DB nyata, dan e2e |

---

## 5. Struktur direktori

```text
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/          # @Public, @Roles, @CurrentUser, @IdempotencyKey
│   │   ├── guards/              # JwtAuthGuard, RolesGuard
│   │   ├── filters/             # global exception filter, Prisma error mapping
│   │   ├── interceptors/        # request id, response envelope, logging
│   │   ├── errors/              # AppError, error codes
│   │   ├── types/               # AuthenticatedUser, pagination, request context
│   │   └── utils/               # hashing, cursor, date
│   ├── infra/
│   │   ├── prisma/              # PrismaModule, PrismaService
│   │   ├── storage/             # SupabaseStorageService, signed URL
│   │   ├── queue/               # BullMQ root config dan nama queue
│   │   ├── ai/                  # antarmuka OCR/LLM dan adapter provider
│   │   └── config/              # env schema Zod dan typed config
│   ├── auth/
│   ├── account/
│   ├── catalog/
│   ├── needs/
│   ├── preparations/
│   ├── documents/
│   ├── inspections/
│   ├── applications/
│   ├── officer/
│   ├── notifications/
│   ├── assistant/
│   ├── admin/
│   ├── audit/
│   ├── dashboard/
│   └── health/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── test/
│   └── e2e/
├── docs/
│   ├── PRD.md
│   ├── API-Contract.md
│   ├── ERD.md
│   ├── Bussines-Rules.md
│   ├── domain-context.md
│   └── architecture.md
├── prisma7.config.ts
├── .env.example
├── package.json
└── tsconfig.json
```

Catatan:

- `src/generated/prisma/` dihasilkan Prisma dan tidak diedit manual.
- Dokumentasi memakai nama file yang sudah ada, termasuk `Bussines-Rules.md`.
- Tidak ada workspace pnpm di root. Backend berdiri sendiri dengan `backend/node_modules` dan `backend/pnpm-lock.yaml`.

---

## 6. Pola module

Setiap modul fitur mengikuti struktur yang sama. Modul kecil boleh lebih sederhana, tetapi arah dependensinya tidak berubah.

```text
src/<module>/
├── dto/
│   ├── create-<entity>.dto.ts       # schema Zod + createZodDto
│   ├── update-<entity>.dto.ts
│   └── <entity>-response.dto.ts
├── interfaces/
│   ├── <entity>.repository.ts       # kontrak + Symbol token
│   └── <domain>.service.ts          # kontrak lintas modul
├── <entity>.repository.ts
├── <domain>.service.ts
├── <domain>.controller.ts
├── <domain>.routes.ts
├── <module>.module.ts
├── <domain>.service.spec.ts
├── <domain>.controller.spec.ts
└── <entity>.repository.integration-spec.ts
```

Aturan:

- Interface diberi prefix `I`, misalnya `IPreparationRepository`.
- Token DI memakai `Symbol`, bukan string: `export const PREPARATION_REPOSITORY = Symbol('PREPARATION_REPOSITORY')`.
- Implementasi memakai nama domain langsung, bukan suffix `Impl`.
- Satu controller per kelompok route; route admin boleh berada di modul pemilik domain dengan path `/admin/...`.
- Modul mengekspor service yang memang dibutuhkan modul lain. Repository tidak diekspor lintas modul.
- Dependensi antarmodul lewat interface service, bukan import repository atau query Prisma langsung.
- Hindari circular dependency. Jika muncul, pindahkan orkestrasi ke modul pemanggil atau gunakan event internal.

---

## 7. Tanggung jawab layer

| Layer | Boleh | Tidak boleh |
|---|---|---|
| Controller | Parsing request, guard/decorator, memanggil service, memetakan hasil ke response | Query Prisma, aturan bisnis, akses storage langsung |
| Service | Aturan bisnis, transaksi, otorisasi kepemilikan, orkestrasi repository/queue | Mengetahui `Request`/`Response` Express, menulis SQL mentah |
| Repository | Query Prisma, mapping record, filter kepemilikan, update bersyarat versi | Memanggil service lain, mengirim email, mengakses storage |
| Infra | Koneksi teknis dan adapter | Aturan domain |
| Guard | Autentikasi dan role | Kepemilikan resource yang butuh data DB |
| Filter/Interceptor | Format error, request id, envelope, logging aman | Perubahan status domain |

Service adalah tempat keputusan seperti:

- apakah pengguna memiliki persiapan ini;
- apakah versi data masih cocok;
- apakah hasil pemeriksaan sudah stale;
- apakah transisi status pengajuan valid;
- apakah petugas memiliki assignment aktif;
- apakah dokumen baru membatalkan hasil lama.

---

## 8. Modul dan batas domain

| Modul | Tanggung jawab | Entitas utama | Kelompok endpoint |
|---|---|---|---|
| `auth` | Registrasi, login, refresh, logout, sesi, reset password | `User`, `RefreshSession`, `UserRole` (baca) | `/auth/*` |
| `account` | Profil sendiri, consent, ekspor/penghapusan akun | `User`, `ConsentRecord` | `/account/*` |
| `catalog` | Wilayah, instansi, layanan, panduan, sumber, persyaratan, pertanyaan, versi aturan | `Region`, `Agency`, `Service`, `GuideVersion`, `GuideSection`, `OfficialSource`, `RequirementRuleVersion`, `Requirement`, `ServiceQuestion` | `/services/*`, `/admin/services/*`, `/admin/guide-versions/*`, `/admin/rule-versions/*` |
| `needs` | Evaluasi kebutuhan layanan; tidak menyimpan data pribadi | Tidak memiliki tabel wajib | `/needs/evaluate` |
| `preparations` | Persiapan warga, jawaban berversi, readiness | `Preparation`, `AnswerVersion` | `/preparations/*` |
| `documents` | Metadata versi dokumen, upload, koreksi, akses aman | `DocumentVersion` | `/preparations/*/documents*` |
| `inspections` | Pemeriksaan asinkron, temuan, koreksi, mesin aturan | `InspectionRun`, `Finding`, `UserCorrection` | `/preparations/*/inspections*` |
| `applications` | Catatan pengajuan, timeline status, catatan warga | `ApplicationRecord`, `StatusEvent` | `/applications/*` |
| `officer` | Tampilan dan aksi petugas berdasarkan assignment | `OfficerAssignment` | `/officer/*` |
| `notifications` | Notifikasi in-app dan penandaan dibaca | `Notification` | `/notifications/*` |
| `assistant` | Chatbot opsional berbasis konteks katalog | Tidak memiliki tabel keputusan | `/assistant/*` |
| `admin` | Administrasi pengguna, role, petugas, audit | `UserRole`, `User` | `/admin/users/*`, `/admin/officers/*`, `/admin/audit*` |
| `audit` | Pencatatan peristiwa produk/keamanan | `AuditEvent` | Tidak ada endpoint publik |
| `dashboard` | Agregasi baca untuk beranda | Tidak memiliki tabel | `/dashboard` |
| `health` | Liveness/readiness | Tidak memiliki tabel | `/health`, `/health/ready` |

Pemilik data:

- `catalog` satu-satunya penulis katalog, panduan, sumber, dan versi aturan.
- `preparations` satu-satunya penulis persiapan dan jawaban.
- `documents` satu-satunya penulis metadata dokumen.
- `inspections` satu-satunya penulis hasil pemeriksaan dan temuan.
- `applications` satu-satunya penulis status pengajuan.
- `officer` tidak menulis status langsung; ia memanggil `ApplicationsService` dengan aktor dan assignment yang tervalidasi.
- `audit` hanya menerima event; tidak membaca isi dokumen.

---

## 9. Alur lintas modul

### 9.1 Registrasi dan sesi

1. `POST /auth/register` memvalidasi email, password, dan consent.
2. Service membuat `User` dengan role `citizen`; role tidak diterima dari klien.
3. Password di-hash bcrypt (cost 12).
4. Login membuat access JWT berumur 15 menit dan refresh token acak 256-bit.
5. Refresh token disimpan sebagai hash SHA-256 di `RefreshSession`, berlaku 7 hari.
6. Access token dikirim sebagai cookie `httpOnly`; refresh token juga cookie `httpOnly`.
7. Refresh merotasi token: sesi lama dicabut, sesi baru dibuat. Reuse token lama ditolak.
8. Logout mencabut sesi refresh dan menghapus cookie.

JWT hanya memuat `sub`, `role`, `session_id`, dan waktu. Jangan menaruh email, nama, dokumen, atau data sensitif di JWT.

Catatan penyelarasan: contoh header `Authorization: Bearer` pada `API-Contract.md` adalah ilustrasi. Implementasi memakai cookie `httpOnly`. Kontrak frontend harus diperbarui sebelum integrasi.

### 9.2 Membuat persiapan dan memulai pemeriksaan

1. Klien membuat preparation dengan `service_id`; server menetapkan pemilik, referensi internal, versi panduan aktif, dan `data_version = 1`.
2. Klien mengisi jawaban dan mengunggah dokumen. Setiap perubahan relevan menaikkan `data_version`; dokumen baru menjadi versi baru.
3. `POST /preparations/{id}/inspections` membutuhkan `Idempotency-Key` dan `expected_data_version`.
4. Service memeriksa kepemilikan, kecocokan versi, kelengkapan input minimal, dan batas laju.
5. Service membuat `InspectionRun` berstatus `queued` dengan snapshot:
   - `data_version`;
   - `guide_version_id`;
   - `rule_version_id`;
   - daftar `document_version_id`;
   - `engine_version`.
6. Job BullMQ dikirim dengan `jobId = inspection:{runId}`.
7. Response `202` berisi `inspection_id`, status `queued`, dan `retryable`.
8. Worker menjalankan OCR/evaluasi aturan, menyimpan `Finding`, lalu mengubah status menjadi `completed` atau `failed`.
9. Penyelesaian pemeriksaan tidak mengubah status pengajuan. Hasil stale tidak menimpa hasil baru.

Jika input berubah saat pemeriksaan berjalan, hasil tetap disimpan sebagai historis dengan `is_current_for_active_input = false`. Pemeriksaan baru dibuat untuk versi terbaru.

### 9.3 Status pengajuan

1. Warga membuat `ApplicationRecord` dengan status `citizen_recorded_unconfirmed` dan sumber `citizen_report`.
2. Petugas menambahkan `StatusEvent` baru; event lama tidak diubah.
3. Setiap event menyimpan `source_type`, `source_label`, aktor, waktu kejadian, waktu pencatatan, dan alasan revisi bila ada.
4. Transisi divalidasi di service. Status tidak boleh “melompat” tanpa aturan yang jelas.
5. Jika data hanya simulasi, `source_mode` dan label simulasi wajib ikut pada response.
6. Perubahan status wajib menghasilkan audit event.

### 9.4 Penghapusan akun dan retensi

1. Permintaan penghapusan memerlukan autentikasi dan konfirmasi ulang.
2. Data yang wajib dipertahankan untuk audit dianonimkan, bukan dipalsukan.
3. Dokumen pribadi dihapus dari storage; metadata dapat disimpan tanpa isi jika diperlukan untuk audit.
4. Job pembersihan dijalankan asinkron dan idempotent.
5. Respons tidak boleh mengklaim penghapusan selesai sebelum job berhasil.

### 9.5 Asisten

1. Asisten hanya menerima pertanyaan dan konteks yang diizinkan.
2. Retrieval dibatasi pada layanan/panduan yang dipublikasikan.
3. Jawaban wajib menyertakan sumber dan tidak boleh mengarang biaya, waktu, atau persyaratan.
4. Asisten tidak dapat mengubah status, dokumen, atau data pengguna.
5. Provider AI berada di balik interface; kegagalan provider menjadi error terkontrol.

---

## 10. API, validasi, dan format response

### 10.1 Konvensi

- Base path: `/api`.
- Swagger: `/api/docs`.
- JSON memakai `snake_case`.
- ID berupa UUID.
- Waktu berupa ISO 8601 UTC.
- Enum mengikuti nilai ERD/kontrak, misalnya `citizen | officer | admin`, `queued | running | completed | failed | cancelled`.
- Response sukses:

```json
{
  "data": {},
  "meta": {
    "request_id": "uuid"
  }
}
```

- Response error:

```json
{
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "Data telah berubah.",
    "details": {},
    "request_id": "uuid"
  }
}
```

`request_id` dibuat di middleware/interceptor dan diteruskan ke log, audit, dan response.

### 10.2 Validasi

- Semua body, query, dan param divalidasi dengan Zod.
- DTO memakai `createZodDto(schema)` dari `nestjs-zod`.
- `ZodValidationPipe` dipasang global lewat `APP_PIPE`; jangan membuat pipe Zod custom yang duplikatif.
- `ZodSerializerInterceptor` dipakai untuk response DTO agar field yang tidak disengaja tidak ikut terkirim.
- Schema memakai `.strict()` untuk body agar field asing ditolak.
- Schema environment juga memakai Zod dan divalidasi saat bootstrap; aplikasi gagal start jika env wajib tidak ada.

Contoh pola:

```ts
const createPreparationSchema = z.object({
  service_id: z.string().uuid(),
  display_name: z.string().trim().min(1).max(120),
}).strict();

export class CreatePreparationDto extends createZodDto(createPreparationSchema) {}
```

### 10.3 Idempotensi

- `Idempotency-Key` wajib untuk `POST /preparations/{id}/inspections`.
- Key disimpan bersama `user_id`, endpoint, hash payload, status, dan response aman.
- Key sama dengan payload sama mengembalikan response awal.
- Key sama dengan payload berbeda mengembalikan `409 IDEMPOTENCY_CONFLICT`.
- Tabel `idempotency_records` perlu ditambahkan ke schema; ERD saat ini belum memuatnya.
- Queue juga memakai `jobId` deterministik untuk mencegah job ganda.

### 10.4 Optimistic concurrency

- Update persiapan memakai `expected_data_version`.
- Update pengajuan memakai `expected_version`.
- Implementasi memakai `updateMany` dengan filter `id`, `user_id`, dan versi, lalu memeriksa `count`.
- Jika `count = 0`, kembalikan `409 VERSION_CONFLICT` beserta versi terbaru yang aman ditampilkan.
- Jangan memakai pola baca-lalu-tulis tanpa penguncian versi.

### 10.5 Status enum

Nilai status mengikuti kontrak/ERD dan disimpan sebagai enum Prisma dengan nama yang sama:

- `UserRole`: `citizen`, `officer`, `admin`
- `PreparationStatus`: `draft`, `queued`, `inspecting`, `needs_completion`, `needs_confirmation`, `ready_initial_check`, `inspection_incomplete`, `recheck_required`, `archived`
- `InspectionStatus`: `queued`, `running`, `completed`, `failed`, `cancelled`
- `ApplicationStatus`: `citizen_recorded_unconfirmed`, `accepted`, `verification`, `needs_correction`, `processing`, `completed`, `result_received_by_citizen`
- `StatusSourceType`: `citizen_report`, `officer`, `integration`, `simulation`

Jangan menambahkan status baru di kode tanpa memperbarui ERD, kontrak API, dan aturan bisnis.

---

## 11. Data dan persistensi

### 11.1 Prisma 7

- Konfigurasi di `prisma7.config.ts`.
- Generator:

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  moduleFormat = "cjs"
}
```

- `moduleFormat = "cjs"` diperlukan karena backend memakai CommonJS.
- `PrismaService` membuat `PrismaClient` dengan `PrismaPg` dan `DATABASE_URL`.
- Jangan memakai `prisma-client-js` lama atau mengandalkan `node_modules/.prisma`.
- `prisma generate` dijalankan setelah schema tersedia. Jangan menaruh `postinstall` generate sebelum schema ada.

### 11.2 Koneksi Supabase

- Gunakan Supabase **Session Pooler** port `5432` dengan `sslmode=require`.
- Hindari transaction pooler port `6543` untuk baseline karena interaksi dengan migrasi dan transaksi perlu diuji lebih dulu.
- `DIRECT_URL` hanya dipakai jika migrasi memerlukannya; jangan menganggap sama dengan `DATABASE_URL`.
- Kredensial hanya di `.env`; `.env` tidak di-commit.

### 11.3 Aturan repository

- Repository adalah satu-satunya tempat pemanggilan Prisma.
- Query privat wajib menyertakan filter pemilik, misalnya `where: { id, user_id }`.
- Jangan mengambil data lalu memeriksa kepemilikan di controller.
- Gunakan transaksi untuk operasi yang menyentuh lebih dari satu tabel, misalnya membuat preparation + answer version, atau status event + audit.
- Jangan memakai `$queryRaw` kecuali untuk kebutuhan yang tidak bisa dinyatakan Prisma dan setelah ditinjau.
- Mapping record ke response dilakukan eksplisit; jangan mengembalikan objek Prisma mentah.

### 11.4 Versi dan snapshot

- `Preparation.data_version` naik saat jawaban/dokumen relevan berubah.
- `Preparation.version` dipakai untuk optimistic concurrency metadata.
- `InspectionRun` menyimpan `input_snapshot_json` dan semua versi yang dipakai.
- `Finding` merujuk requirement dan document version yang menjadi bukti.
- Hasil lama tidak dihapus saat input berubah; tandai tidak current.
- Panduan/aturan baru diterbitkan sebagai versi baru; jangan menimpa versi yang sudah dipublikasikan.

### 11.5 Indeks minimum

- `users.email` unik.
- `refresh_sessions.token_hash` unik dan `user_id`.
- `preparations(user_id, updated_at)`.
- `document_versions(preparation_id, document_type, version_number)`.
- `inspection_runs(preparation_id, queued_at)`.
- `status_events(application_id, occurred_at)`.
- `notifications(user_id, read_at, created_at)`.
- `audit_events(actor_user_id, created_at)`.

---

## 12. Keamanan dan privasi

### 12.1 Autentikasi

- Access token: JWT 15 menit di cookie `httpOnly`, `secure` di produksi, `sameSite=lax`.
- Refresh token: opaque 256-bit, hash SHA-256 di database, rotasi setiap refresh, umur 7 hari.
- Jangan menyimpan token di `localStorage`.
- Jangan menaruh PII di token.
- Logout mencabut sesi; ganti password mencabut semua sesi.
- Rate limit login, register, reset password, dan refresh.

### 12.2 CSRF dan CORS

- Karena memakai cookie, mutasi wajib memeriksa `Origin` terhadap allowlist.
- `sameSite=lax` bukan pengganti pengecekan origin.
- CORS hanya mengizinkan origin frontend yang dikonfigurasi; jangan memakai `*` bersama kredensial.
- Cookie domain/path harus konsisten antara lokal dan produksi.

### 12.3 Otorisasi

- `JwtAuthGuard` dipasang global; endpoint publik diberi `@Public()`.
- `RolesGuard` memeriksa role dari token dan data role aktif.
- Service memeriksa kepemilikan untuk setiap GET/PATCH/DELETE resource privat.
- Petugas hanya dapat membuka pengajuan dengan `OfficerAssignment` aktif.
- Admin tidak otomatis boleh membaca isi dokumen pribadi; akses admin ke konten harus eksplisit dan diaudit.
- ID yang sulit ditebak bukan kontrol keamanan.

### 12.4 Upload

- Validasi ukuran, jumlah halaman, dan tipe file sebenarnya menggunakan `file-type`, bukan hanya `Content-Type`.
- Nama file asli disanitasi; `storage_key` dibuat server.
- Bucket privat; tidak ada URL publik permanen.
- Signed URL berumur pendek dan hanya dibuat setelah otorisasi.
- File terkunci/rusak ditolak dengan pesan aman.
- Pemindaian malware disiapkan sebagai langkah queue; jika belum tersedia, jangan klaim file aman.
- Preview tidak boleh mengeksekusi konten aktif.

### 12.5 Log dan audit

- Jangan mencatat password, token, cookie, isi dokumen, teks OCR sensitif, atau nomor identitas lengkap.
- Log memuat `request_id`, route, status, durasi, dan aktor (ID, bukan PII).
- Audit mencatat aktor, tindakan, objek, waktu, hasil, dan `request_id`.
- Audit tidak menyimpan isi dokumen.
- Akses ke endpoint admin dan perubahan status wajib diaudit.

### 12.6 AI

- Dokumen diperlakukan sebagai data, bukan instruksi; prompt injection diabaikan.
- Kirim konteks minimum yang diperlukan.
- Jangan mengirim dokumen pribadi ke provider eksternal sebelum dasar pemrosesan disetujui.
- Output LLM divalidasi schema dan tidak boleh menciptakan requirement baru.
- Confidence bukan ukuran keaslian atau peluang diterima.
- Kegagalan provider menjadi status `failed` yang dapat di-retry, bukan hasil palsu.

---

## 13. Konfigurasi environment

Semua env divalidasi Zod saat bootstrap. Contoh nama variabel:

| Variabel | Wajib | Keterangan |
|---|---|---|
| `NODE_ENV` | Ya | `development`, `test`, `production` |
| `PORT` | Tidak | Default `3000` |
| `DATABASE_URL` | Ya | Supabase Session Pooler 5432, `sslmode=require` |
| `DATABASE_URL_TEST` | Untuk test | Database test terpisah |
| `SUPABASE_URL` | Ya | URL project |
| `SUPABASE_SERVICE_ROLE_KEY` | Ya | Hanya server, jangan pernah dikirim ke frontend |
| `SUPABASE_STORAGE_BUCKET` | Ya | Bucket privat dokumen |
| `JWT_ACCESS_SECRET` | Ya | Minimal 32 byte acak |
| `JWT_ACCESS_TTL` | Tidak | Default `15m` |
| `REFRESH_TOKEN_TTL_DAYS` | Tidak | Default `7` |
| `COOKIE_SECURE` | Produksi | `true` di HTTPS |
| `COOKIE_DOMAIN` | Produksi | Domain frontend/backend |
| `CORS_ORIGIN` | Ya | Daftar origin dipisah koma |
| `REDIS_URL` | Ya | Koneksi BullMQ |
| `INSPECTION_QUEUE_CONCURRENCY` | Tidak | Default aman, misalnya `2` |
| `AI_PROVIDER` | Tidak | `disabled` pada baseline |
| `OCR_PROVIDER` | Tidak | Adapter OCR |
| `AI_API_KEY` | Jika aktif | Jangan di-commit |
| `MAX_UPLOAD_BYTES` | Tidak | Batas upload |
| `MAX_PDF_PAGES` | Tidak | Batas halaman |
| `SWAGGER_ENABLED` | Tidak | Matikan di produksi jika perlu |

---

## 14. Queue dan background job

Queue utama:

- `inspection-processing`: menjalankan pemeriksaan dokumen.
- `document-cleanup`: menghapus file setelah akun dihapus.
- `notification-dispatch`: pengiriman notifikasi (dapat menyusul).

Konfigurasi:

- `attempts: 3`
- backoff eksponensial
- `removeOnComplete` dan `removeOnFail` dibatasi agar Redis tidak tumbuh tanpa batas
- `jobId` deterministik
- job yang macet dipindai dan ditandai `failed`
- worker hanya memproses data yang sudah lolos otorisasi saat job dibuat

Aturan:

1. Request tidak menunggu OCR/AI selesai.
2. Job harus idempotent; jika dijalankan ulang, hasil tidak boleh terduplikasi.
3. Job gagal tidak boleh meninggalkan status `running` selamanya.
4. Retry manual hanya jika `failure.retryable = true`.
5. Perubahan input membuat run baru; jangan memakai ulang run lama.
6. Worker memakai service domain, bukan repository modul lain.
7. Untuk MVP, worker berjalan di proses Nest yang sama. Jika beban meningkat, buat entrypoint worker terpisah dengan kode domain yang sama.

BullMQ membutuhkan Redis. Docker/Redis harus aktif untuk pengembangan dan test integrasi queue.

---

## 15. Storage

- Bucket privat, misalnya `documents`.
- Path: `users/{userId}/preparations/{preparationId}/documents/{documentId}/v{version}`.
- Metadata disimpan di `DocumentVersion`; jangan menyimpan signed URL.
- Signed URL hanya diberikan setelah service memeriksa kepemilikan/assignment.
- TTL signed URL pendek, misalnya 60 detik untuk download dan 5 menit untuk preview.
- Saat dokumen diganti, versi lama tetap ada sampai kebijakan retensi menghapusnya.
- Saat akun dihapus, file dihapus lewat job; kegagalan dicatat dan di-retry.
- Jangan mengandalkan nama file asli sebagai identifier.

---

## 16. Observability

- Structured logging JSON di produksi.
- Setiap request memiliki `request_id`.
- Health check:
  - `GET /health` untuk liveness;
  - `GET /health/ready` memeriksa database dan Redis.
- Metrik minimum yang disarankan: latency, error rate, jumlah inspection `queued/running/failed`, durasi job, dan queue depth.
- Jangan menambahkan tracing berisi PII.
- Audit event adalah catatan bisnis, bukan pengganti log teknis.

---

## 17. Strategi pengujian

### 17.1 Unit test

- Service diuji dengan repository dan queue mock.
- Fokus: aturan bisnis, transisi status, kepemilikan, versi, dan perhitungan readiness.
- Controller diuji untuk mapping request/response dan guard.
- Mesin aturan pemeriksaan diuji dengan fixture requirement dan dokumen sintetis.

### 17.2 Integration test repository

- Menggunakan PostgreSQL nyata melalui `DATABASE_URL_TEST`.
- Tidak memakai mock Prisma.
- Setiap test memakai data unik dan dibersihkan setelah selesai.
- Fokus: query kepemilikan, constraint unik, optimistic concurrency, idempotensi, dan cascade/retensi.
- Migrasi dijalankan sebelum suite integration.

### 17.3 E2E

- Supertest terhadap aplikasi Nest.
- Menguji alur: register → login → buat preparation → upload → inspection → hasil → application → status.
- Memakai cookie jar, bukan bearer token.
- Queue dapat memakai Redis test atau processor sinkron khusus test; jangan menguji worker nyata di e2e dasar.

### 17.4 Matriks uji kritis

| Invarian | Test yang wajib ada |
|---|---|
| Warga tidak bisa membuka persiapan orang lain | repository + e2e |
| Petugas hanya melihat assignment aktif | service + e2e |
| Admin tidak otomatis melihat isi dokumen | e2e |
| `expected_data_version` salah menghasilkan 409 | service + integration |
| Idempotency key sama tidak membuat dua run | integration |
| Input berubah membuat hasil lama stale | service + integration |
| Status pengajuan tidak berubah karena AI selesai | service + e2e |
| Status event menyimpan sumber dan tidak ditimpa | integration |
| Dokumen tidak dapat diakses tanpa otorisasi | e2e |
| File dengan signature salah ditolak | service + e2e |
| Hasil AI tidak boleh menambah requirement | unit rules + service |
| Retry job tidak menduplikasi finding | integration queue/service |
| Akun dihapus menghapus file dan data terkait | integration + job |

Perintah yang ditargetkan:

```bash
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
```

Script `test:integration` perlu ditambahkan ke `package.json` saat setup Prisma/test selesai.

---

## 18. Deployment

- Backend berdiri sendiri; frontend tidak berada dalam workspace yang sama.
- Build: `pnpm build`; jalankan `node dist/main.js`.
- Migrasi produksi: `pnpm prisma:migrate:deploy` sebelum aplikasi baru menerima traffic.
- `prisma generate` dijalankan saat build setelah schema tersedia.
- Worker dapat berjalan di proses yang sama untuk MVP.
- Redis dan database harus sehat sebelum readiness lulus.
- Secret hanya lewat environment platform; jangan menaruh kredensial di repository.
- Swagger dapat dinonaktifkan di produksi.
- Backup dan retensi database mengikuti kebijakan Supabase; dokumen tetap di bucket privat.

---

## 19. Definition of Done per modul

Sebuah modul dianggap selesai jika:

- [ ] Kontrak endpoint dan error selaras dengan `API-Contract.md`.
- [ ] DTO Zod dan response schema tersedia; tidak ada `class-validator`.
- [ ] Repository adalah satu-satunya akses Prisma untuk tabel modul.
- [ ] Semua query privat memfilter pemilik/assignment.
- [ ] Guard role dan pengecekan kepemilikan diuji.
- [ ] Transisi status/versi memakai aturan yang eksplisit dan atomic.
- [ ] Audit dipanggil untuk aksi sensitif.
- [ ] Tidak ada PII/token/isi dokumen di log.
- [ ] Unit test service dan controller lulus.
- [ ] Integration test repository lulus terhadap database nyata.
- [ ] E2E alur utama modul lulus.
- [ ] Swagger menggambarkan request, response, dan error utama.
- [ ] `pnpm build` dan lint/typecheck lulus.
- [ ] Dokumentasi environment dan contoh `.env` diperbarui jika menambah variabel.
- [ ] Tidak ada dependency baru yang belum disetujui atau tidak dipakai.

---

## 20. Cakupan bertahap dan keputusan terbuka

### Baseline MVP yang perlu jalan lebih dulu

1. `auth` dengan cookie + refresh rotation.
2. `catalog` baca dan seed data layanan.
3. `preparations` + `documents`.
4. `inspections` dengan queue dan aturan dasar.
5. `applications` + timeline status.
6. `notifications` in-app.
7. `health` dan audit dasar.

### Ditunda sampai keputusan produk/teknis

- Provider OCR/LLM final dan syarat pemrosesan data.
- Pengiriman email reset password.
- Integrasi portal instansi.
- Pemindaian malware.
- Realtime SSE/WebSocket; baseline memakai polling.
- Penulisan katalog lengkap oleh admin; MVP dapat memakai seed.
- Kebijakan retensi dan penghapusan akun yang final.
- Batas ukuran/halaman upload yang disepakati.
- Skema `idempotency_records` perlu ditambahkan ke ERD.

### Ketidakselarasan dokumen yang harus ditutup

- `API-Contract.md` masih memakai ilustrasi bearer; implementasi memakai cookie.
- PRD masih memuat nama lama produk di sebagian teks; nama teknis yang dipakai adalah DaftarIn.
- ERD belum memuat tabel idempotensi dan `RefreshSession`.
- Nama file `Bussines-Rules.md` dipertahankan agar tautan dokumen tidak rusak.

---

## 21. Referensi

- `PRD.md`: tujuan produk, aktor, fitur, alur, dan kriteria penerimaan.
- `API-Contract.md`: endpoint, payload, error, dan aturan lintas modul.
- `ERD.md`: entitas, relasi, dan enum.
- `Bussines-Rules.md`: aturan bisnis dan keputusan produk.
- `domain-context.md`: batasan domain dan larangan perilaku AI.
