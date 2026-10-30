# API Contract — JejakMasWowo

> **Dokumen kontrak BE ↔ FE**  
> Versi dokumen: 1.0.0  
> Basis kebutuhan: PRD JejakMasWowo v1.0, 26 Oktober 2026  
> Status: **Draft teknis untuk disepakati bersama**  
> Format: REST API, JSON, UTF-8  
>
> Dokumen ini menerjemahkan kebutuhan PRD menjadi usulan kontrak API yang dapat digunakan FE dan BE. PRD tidak menetapkan stack, URL deployment, metode autentikasi final, batas unggahan, penyedia OCR/LLM, atau integrasi pemerintah. Nilai dan keputusan yang belum ada di PRD ditandai **perlu disepakati**. Endpoint di bawah adalah rancangan kontrak, bukan klaim bahwa API sudah tersedia.

---

## 1. Tujuan dan prinsip

API mendukung alur utama:

1. Pengunjung mencari layanan, membaca panduan dan sumber, serta menjawab pertanyaan kondisi nonidentitas tanpa login.
2. Warga login untuk membuat persiapan pribadi, menyimpan jawaban, mengunggah dokumen, dan menjalankan pemeriksaan AI.
3. Warga menindaklanjuti temuan, melihat ringkasan kesiapan, lalu membuka kanal resmi secara terpisah.
4. Warga mencatat pengajuan yang sudah dilakukan di kanal resmi dan melihat linimasa dengan sumber yang jelas.
5. Petugas (jika diaktifkan) memperbarui pengajuan yang ditugaskan kepadanya.
6. Admin mengelola layanan, panduan, sumber, aturan berversi, dan akun petugas.
7. Chatbot bersifat opsional dan tidak dapat melakukan mutasi data/status atas nama pengguna.

### Prinsip wajib

- Informasi layanan publik dapat diakses tanpa autentikasi.
- Semua data pribadi, dokumen, hasil AI, persiapan, pengajuan, dan notifikasi pribadi harus melalui autentikasi dan otorisasi server.
- `preparation_id` adalah ID internal; bukan nomor pengajuan resmi.
- Nomor pengajuan yang dimasukkan warga diberi sumber `citizen_reported`, bukan dianggap terverifikasi.
- Status, temuan, dan peristiwa wajib mencantumkan sumber yang benar-benar tersedia.
- Tidak ada integrasi pemerintah dalam baseline. API tidak boleh mengklaim mengirim permohonan atau menyinkronkan status secara otomatis.
- Hasil AI bukan keputusan instansi, bukan bukti keaslian dokumen, dan bukan jaminan permohonan diterima.
- Perubahan jawaban, dokumen, kondisi, atau aturan yang relevan membuat hasil pemeriksaan sebelumnya tidak berlaku untuk versi input terbaru.
- Hasil pemeriksaan lama tetap menyimpan versi dokumen, data, panduan, aturan, dan konfigurasi pemeriksaan yang digunakan.
- Dokumen diperlakukan sebagai data tidak tepercaya, bukan instruksi untuk AI atau sistem.
- Petugas hanya dapat mengakses pengajuan yang ditugaskan dan data yang secara eksplisit boleh dibagikan.
- Peran `officer` dan `admin` tidak dapat dipilih sendiri pada endpoint pendaftaran publik.
- Mode simulasi harus diberi label di data pengajuan, peristiwa, respons, dan UI.
- Nilai sensitif seperti isi dokumen, OCR mentah, token, dan nomor identitas lengkap tidak boleh masuk log umum.

---

## 2. Konvensi API

### 2.1 Base URL

Base URL untuk lingkungan deployment ditentukan saat implementasi:

```text
https://{api-host}/api
```

Semua path dalam dokumen ini relatif terhadap `/api`.

### 2.2 Format

- Request dan response JSON memakai `Content-Type: application/json; charset=utf-8`, kecuali endpoint unggah file.
- Waktu dikirim sebagai ISO 8601 UTC, misalnya `2026-10-29T08:15:30Z`.
- FE menampilkan waktu dalam zona waktu pengguna. Zona waktu operasional default **perlu disepakati**.
- ID objek memakai UUID string (usulan). FE memperlakukan ID sebagai opaque string, tidak menurunkan informasi dari ID.
- Field waktu menggunakan suffix `_at`.
- Field nullable dapat bernilai `null`; jika properti opsional tidak dikirim, maknanya mengikuti definisi endpoint.
- Enum bersifat case-sensitive dan menggunakan `snake_case`.
- Boolean harus dikirim sebagai `true`/`false`, bukan string.
- Uang, jika tersedia, dikirim sebagai objek dengan `amount` dan `currency`; jangan mengirim angka yang telah diformat lokal.

### 2.3 Header umum

| Header | Kapan | Keterangan |
|---|---|---|
| `Authorization: Bearer <access_token>` | Endpoint privat | Jika autentikasi bearer dipilih. Jika memakai cookie session, kontrak header ini diganti secara konsisten sebelum implementasi. |
| `Content-Type` | Request body | `application/json` atau tipe multipart sesuai endpoint. |
| `Accept: application/json` | Semua request API | Response JSON. |
| `Idempotency-Key: <unique-key>` | Operasi yang dapat memicu duplikasi/biaya | Wajib untuk membuat pemeriksaan dan disarankan untuk operasi mutasi yang dicoba ulang. |
| `If-Match: "<etag-or-version>"` | Update objek yang mendukung optimistic concurrency | Mencegah perubahan saling menimpa. Bentuk final perlu disepakati. |
| `X-Request-Id` | Opsional dari FE | Correlation ID. BE boleh membuatnya jika tidak ada. |
| `X-Client-Timezone` | Opsional | Contoh `Asia/Jakarta`; tidak menjadi sumber kebenaran waktu server. |

Jangan mengirim token API penyedia OCR/LLM dari browser. FE tidak boleh mengakses storage privat secara langsung tanpa URL akses sementara yang diterbitkan BE setelah otorisasi.

### 2.4 Pagination, sorting, dan filter

Endpoint list menggunakan query parameter berikut jika relevan:

| Parameter | Tipe | Default usulan | Keterangan |
|---|---|---|---|
| `page` | integer ≥ 1 | `1` | Halaman. |
| `page_size` | integer 1–100 | `20` | Ukuran halaman; batas final perlu disepakati. |
| `sort` | string | sesuai endpoint | Field yang diizinkan server. |
| `order` | `asc` / `desc` | `desc` | Arah urutan. |
| `q` | string | — | Kata kunci pencarian. |
| `cursor` | string | — | Hanya jika endpoint memilih cursor pagination; jangan gabungkan dengan `page`. |

Respons list standar:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total_items": 0,
    "total_pages": 0
  }
}
```

Jika memakai cursor pagination, bentuk `meta` menjadi `{ "next_cursor": "opaque-or-null", "has_more": false }`. Pilih satu pendekatan per endpoint sebelum implementasi.

---

## 3. Bentuk response standar

### 3.1 Response sukses

Objek tunggal:

```json
{
  "data": {
    "id": "uuid",
    "example": "value"
  },
  "meta": {
    "request_id": "req_123"
  }
}
```

Operasi async yang diterima:

```json
{
  "data": {
    "id": "uuid",
    "status": "queued"
  },
  "meta": {
    "request_id": "req_123"
  }
}
```

FE tidak boleh menganggap status `queued` berarti proses selesai.

### 3.2 Response error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Terdapat data yang perlu diperbaiki.",
    "details": [
      {
        "field": "service_id",
        "issue": "required",
        "message": "Layanan wajib dipilih."
      }
    ],
    "request_id": "req_123"
  }
}
```

Ketentuan:

- `error.code` adalah kode stabil untuk logika FE.
- `error.message` adalah pesan aman untuk ditampilkan atau diterjemahkan.
- `details` opsional; struktur detail dapat berbeda untuk validasi, konflik, atau batas file.
- Jangan mengirim stack trace, query database, prompt internal, kredensial, atau isi dokumen pada error.
- Untuk objek privat yang tidak boleh diketahui keberadaannya, BE dapat mengembalikan `404 NOT_FOUND` alih-alih mengungkap bahwa objek milik akun lain ada.

### 3.3 HTTP status code

| HTTP | Penggunaan |
|---|---|
| `200 OK` | GET atau mutasi berhasil dengan response body. |
| `201 Created` | Resource baru berhasil dibuat. |
| `202 Accepted` | Pekerjaan async diterima, misalnya pemeriksaan AI. |
| `204 No Content` | Mutasi berhasil tanpa body, misalnya penghapusan. |
| `400 Bad Request` | Request tidak dapat diparse atau parameter tidak valid. |
| `401 Unauthorized` | Belum login, token/session tidak valid atau kedaluwarsa. |
| `403 Forbidden` | Login valid tetapi tidak memiliki izin. |
| `404 Not Found` | Resource tidak ditemukan atau sengaja disamarkan demi privasi. |
| `409 Conflict` | Konflik status, versi, atau idempotensi. |
| `413 Content Too Large` | File/body melampaui batas. |
| `415 Unsupported Media Type` | Tipe media tidak didukung. |
| `422 Unprocessable Entity` | Validasi bisnis gagal. |
| `429 Too Many Requests` | Rate limit/kuota tercapai. |
| `500 Internal Server Error` | Kesalahan internal. |
| `502 Bad Gateway` / `503 Service Unavailable` | Dependensi eksternal/AI tidak tersedia. |
| `504 Gateway Timeout` | Dependensi melebihi waktu tunggu. |

### 3.4 Kode error yang disarankan

| Kode | Makna |
|---|---|
| `VALIDATION_ERROR` | Field request tidak valid. |
| `AUTH_REQUIRED` | Autentikasi dibutuhkan. |
| `TOKEN_EXPIRED` | Sesi/token kedaluwarsa. |
| `FORBIDDEN` | Akses tidak diizinkan. |
| `NOT_FOUND` | Resource tidak ditemukan/akses disamarkan. |
| `CONFLICT` | Konflik status atau versi. |
| `VERSION_CONFLICT` | Objek berubah sejak FE membacanya. |
| `IDEMPOTENCY_CONFLICT` | Key yang sama dipakai dengan payload berbeda. |
| `FILE_TOO_LARGE` | File terlalu besar. |
| `FILE_TYPE_NOT_ALLOWED` | Format tidak didukung. |
| `FILE_INVALID` | File rusak, terkunci, atau tidak dapat diproses. |
| `UPLOAD_INCOMPLETE` | Upload belum selesai. |
| `INSPECTION_INPUT_CHANGED` | Input berubah dan hasil tidak berlaku untuk versi terbaru. |
| `INSPECTION_NOT_RETRYABLE` | Pekerjaan tidak dapat dicoba ulang dengan cara yang sama. |
| `AI_PROVIDER_UNAVAILABLE` | Penyedia AI tidak tersedia. |
| `QUOTA_EXCEEDED` | Kuota/limit tercapai. |
| `INVALID_STATUS_TRANSITION` | Transisi status tidak diizinkan. |
| `SOURCE_UNAVAILABLE` | Sumber informasi tidak dapat diakses. |
| `SIMULATION_ONLY` | Aksi hanya tersedia dalam mode simulasi. |

---

## 4. Model data bersama

Model berikut merupakan kontrak API usulan. Field spesifik layanan dan metode login masih dapat disesuaikan setelah keputusan operasional PRD ditetapkan.

### 4.1 User

```json
{
  "id": "uuid",
  "display_name": "Pengguna Contoh",
  "email": "warga@example.com",
  "email_verified": false,
  "roles": ["citizen"],
  "status": "active",
  "created_at": "2026-10-29T08:15:30Z"
}
```

`roles` hanya berisi role yang telah diberikan server. Role usulan: `citizen`, `officer`, `admin`. User publik tidak dapat mengatur role istimewa sendiri.

### 4.2 Region, agency, service

```json
{
  "id": "uuid",
  "name": "Kota Contoh",
  "type": "city",
  "parent_id": "uuid-or-null"
}
```

```json
{
  "id": "uuid",
  "name": "Instansi Contoh",
  "region_id": "uuid",
  "description": "Deskripsi instansi",
  "channels": [
    {
      "id": "uuid",
      "type": "website",
      "label": "Portal layanan",
      "url": "https://example.go.id",
      "instructions": "Ikuti petunjuk pada portal resmi."
    }
  ]
}
```

```json
{
  "id": "uuid",
  "slug": "layanan-contoh",
  "name": "Nama layanan",
  "category": {
    "id": "uuid",
    "name": "Administrasi kependudukan"
  },
  "summary": "Ringkasan layanan.",
  "agency": {
    "id": "uuid",
    "name": "Instansi Contoh"
  },
  "region": {
    "id": "uuid",
    "name": "Kota Contoh"
  },
  "publication_status": "published",
  "current_guide_version": 3,
  "source_health": "available",
  "reviewed_at": "2026-10-20T00:00:00Z"
}
```

### 4.3 Sumber resmi dan panduan

```json
{
  "id": "uuid",
  "title": "Persyaratan layanan",
  "publisher": "Instansi penerbit",
  "url": "https://example.go.id/persyaratan",
  "published_at": null,
  "accessed_at": "2026-10-20T00:00:00Z",
  "source_status": "available"
}
```

`source_status`: `available`, `unavailable`, `conflicting`, `needs_review`, `unknown`.

```json
{
  "service_id": "uuid",
  "version": 3,
  "published_at": "2026-10-20T00:00:00Z",
  "reviewed_at": "2026-10-20T00:00:00Z",
  "summary": "Ringkasan panduan.",
  "requirements": [
    {
      "id": "uuid",
      "name": "Dokumen contoh",
      "description": "Penjelasan persyaratan.",
      "required": true,
      "condition": null,
      "sources": [
        {
          "id": "uuid",
          "title": "Sumber resmi",
          "url": "https://example.go.id/persyaratan"
        }
      ]
    }
  ],
  "procedure_steps": [
    {
      "step": 1,
      "title": "Siapkan dokumen",
      "description": "Keterangan langkah."
    }
  ],
  "official_fee": {
    "status": "unknown",
    "amount": null,
    "currency": "IDR",
    "display_text": "Belum tersedia pada sumber yang dicatat",
    "sources": []
  },
  "official_processing_time": {
    "status": "unknown",
    "value": null,
    "unit": null,
    "basis": null,
    "display_text": "Belum tersedia pada sumber yang dicatat",
    "sources": []
  },
  "channels": [],
  "source_health": "available",
  "change_notice": null
}
```

Status biaya/waktu: `known`, `unknown`, `conflicting`, `needs_review`. Jangan mengartikan `unknown` sebagai gratis atau membuat estimasi waktu sendiri.

### 4.4 Pertanyaan kondisi

```json
{
  "id": "uuid",
  "key": "applicant_condition",
  "label": "Pilih kondisi yang sesuai",
  "help_text": "Pertanyaan nonidentitas untuk menentukan kebutuhan layanan.",
  "type": "single_select",
  "required": true,
  "options": [
    { "value": "option_a", "label": "Pilihan A" },
    { "value": "option_b", "label": "Pilihan B" }
  ],
  "visible_if": null,
  "requirements_effect": ["requirement-id"],
  "validation": {
    "min_length": null,
    "max_length": null,
    "pattern": null
  }
}
```

Tipe pertanyaan yang dapat disepakati: `single_select`, `multi_select`, `boolean`, `text`, `date`, `number`. Jangan mengirim pertanyaan identitas pribadi pada flow publik jika belum login.

### 4.5 Preparation

```json
{
  "id": "uuid",
  "internal_reference": "PREP-2026-000001",
  "owner_id": "uuid",
  "service_id": "uuid",
  "region_id": "uuid",
  "guide_version": 3,
  "status": "draft",
  "data_version": 2,
  "active_inspection_id": null,
  "latest_inspection_id": null,
  "readiness": "not_assessed",
  "is_archived": false,
  "created_at": "2026-10-29T08:15:30Z",
  "updated_at": "2026-10-29T08:15:30Z"
}
```

Status persiapan: `draft`, `queued`, `inspecting`, `needs_completion`, `needs_review`, `ready_initial_check`, `inspection_incomplete`, `needs_new_inspection`, `archived`.

`readiness` dapat berupa `not_assessed`, `needs_completion`, `needs_review`, `ready_initial_check`, `inspection_incomplete`, `stale`. Status dan readiness harus konsisten; BE menjadi sumber kebenaran.

### 4.6 Document dan DocumentVersion

```json
{
  "id": "uuid",
  "preparation_id": "uuid",
  "requirement_id": "uuid-or-null",
  "document_type": "supporting_document",
  "display_name": "dokumen.pdf",
  "active_version": 2,
  "status": "uploaded",
  "created_at": "2026-10-29T08:15:30Z",
  "updated_at": "2026-10-29T08:15:30Z"
}
```

```json
{
  "id": "uuid",
  "document_id": "uuid",
  "version": 2,
  "original_filename": "dokumen.pdf",
  "mime_type": "application/pdf",
  "size_bytes": 120000,
  "page_count": 2,
  "checksum": "sha256:...",
  "processing_status": "available",
  "uploaded_at": "2026-10-29T08:15:30Z",
  "deleted_at": null
}
```

Status versi dokumen: `uploading`, `available`, `processing`, `failed`, `deletion_pending`, `deleted`. URL file mentah tidak dipublikasikan. Jika preview diperlukan, BE mengembalikan URL akses terbatas dengan expiry atau menyediakan endpoint streaming yang terotorisasi.

### 4.7 InspectionRun

```json
{
  "id": "uuid",
  "preparation_id": "uuid",
  "status": "queued",
  "result": null,
  "input_snapshot": {
    "data_version": 2,
    "document_versions": [
      { "document_id": "uuid", "version": 2 }
    ],
    "guide_version": 3,
    "rule_version": 5
  },
  "progress": {
    "stage": "queued",
    "percent": 0,
    "message": "Pemeriksaan menunggu diproses."
  },
  "started_at": null,
  "completed_at": null,
  "failure": null,
  "created_at": "2026-10-29T08:15:30Z"
}
```

Status pemeriksaan: `queued`, `running`, `completed`, `failed`, `cancelled`. Status hasil `result`: `needs_completion`, `needs_review`, `ready_initial_check`, `incomplete`. Jika `status` bukan `completed`, FE tidak boleh mengasumsikan kelengkapan sudah dinilai.

### 4.8 Finding

```json
{
  "id": "uuid",
  "inspection_id": "uuid",
  "category": "readability",
  "action_level": "needs_confirmation",
  "status": "open",
  "title": "Bagian dokumen belum terbaca jelas",
  "explanation": "Teks pada bagian ini belum dapat dibaca dengan cukup yakin.",
  "document_id": "uuid",
  "document_version": 2,
  "evidence": {
    "page": 1,
    "field": null,
    "bounding_box": null,
    "quoted_text": null
  },
  "rule_reference": {
    "rule_id": "uuid",
    "rule_version": 5,
    "requirement_id": "uuid",
    "sources": [
      { "id": "uuid", "title": "Persyaratan layanan", "url": "https://example.go.id" }
    ]
  },
  "suggested_action": {
    "type": "replace_document",
    "label": "Unggah ulang dokumen yang lebih jelas",
    "target": {
      "document_id": "uuid"
    }
  },
  "confidence": {
    "value": 0.61,
    "meaning": "reading_confidence",
    "threshold_policy": "internal-policy-version"
  },
  "value_origin": "machine_read",
  "resolved_by": null,
  "resolved_at": null,
  "created_at": "2026-10-29T08:15:30Z"
}
```

Kategori temuan: `completeness`, `document_type`, `readability`, `required_data`, `data_mismatch`, `uncertainty`, `technical`.  
Tingkat tindakan: `must_fix`, `needs_confirmation`, `information`.  
Status temuan: `open`, `resolved_in_new_version`, `needs_confirmation`, `not_applicable`.  
Asal nilai: `machine_read`, `citizen_entered`, `citizen_corrected`.

Jika confidence ditampilkan, harus diberi arti spesifik seperti `reading_confidence`; bukan peluang diterima, keaslian, atau validitas hukum.

### 4.9 ApplicationRecord dan StatusEvent

```json
{
  "id": "uuid",
  "internal_reference": "APP-2026-000001",
  "owner_id": "uuid",
  "service_id": "uuid",
  "preparation_id": "uuid-or-null",
  "official_application_number": null,
  "official_number_source": "not_provided",
  "submitted_at": "2026-10-28T00:00:00Z",
  "channel": {
    "type": "in_person",
    "label": "Loket layanan",
    "url": null
  },
  "source_mode": "citizen_recorded",
  "current_status": "citizen_recorded_unconfirmed",
  "simulation": false,
  "created_at": "2026-10-29T08:15:30Z",
  "updated_at": "2026-10-29T08:15:30Z"
}
```

`source_mode`: `citizen_recorded`, `officer_recorded`, `official_integration`, `simulation`.  
`official_number_source`: `not_provided`, `citizen_reported`, `officer_verified`, `official_integration`.

```json
{
  "id": "uuid",
  "application_id": "uuid",
  "event_type": "status_changed",
  "status": "verification",
  "source_type": "officer",
  "source_label": "Petugas yang ditugaskan",
  "occurred_at": "2026-10-29T08:00:00Z",
  "recorded_at": "2026-10-29T08:15:30Z",
  "actor": {
    "id": "uuid-or-null",
    "role": "officer"
  },
  "note": "Pengajuan sedang diverifikasi.",
  "revision_request": null,
  "simulation": false,
  "correction_of_event_id": null
}
```

Status pengajuan yang didukung baseline: `citizen_recorded_unconfirmed`, `accepted`, `verification`, `needs_correction`, `processing`, `completed`, `result_received_by_citizen`. Status lain seperti ditolak/dibatalkan tidak digunakan sebelum prosedur layanan memetakannya.

`source_type`: `citizen`, `officer`, `official_integration`, `simulation`, `system_reminder`. `system_reminder` tidak boleh diperlakukan sebagai bukti perubahan status.

### 4.10 Notification

```json
{
  "id": "uuid",
  "type": "inspection_completed",
  "title": "Pemeriksaan selesai",
  "body": "Hasil pemeriksaan berkas Anda sudah tersedia.",
  "related_resource": {
    "type": "inspection",
    "id": "uuid"
  },
  "is_read": false,
  "created_at": "2026-10-29T08:15:30Z"
}
```

Jangan menyertakan dokumen, nomor identitas lengkap, atau rincian sensitif pada judul/body notifikasi.

---

## 5. Matriks endpoint

Prefix semua endpoint: `/api`.

| Modul | Method | Endpoint | Akses | Tujuan |
|---|---|---|---|---|
| Auth | POST | `/auth/register` | Publik | Daftar akun warga |
| Auth | POST | `/auth/login` | Publik | Masuk |
| Auth | POST | `/auth/logout` | Login | Keluar |
| Auth | GET | `/auth/me` | Login | Profil sesi aktif |
| Auth | POST | `/auth/refresh` | Sesuai metode auth | Perbarui sesi/token |
| Auth | POST | `/auth/forgot-password` | Publik | Memulai pemulihan |
| Auth | POST | `/auth/reset-password` | Token reset | Mengganti kata sandi |
| Public data | GET | `/regions` | Publik | Daftar wilayah |
| Public data | GET | `/services` | Publik | Cari/katalog layanan |
| Public data | GET | `/services/{serviceId}` | Publik | Detail layanan |
| Public data | GET | `/services/{serviceId}/guide` | Publik | Panduan aktif |
| Public data | GET | `/services/{serviceId}/questions` | Publik | Pertanyaan kondisi |
| Public data | POST | `/service-needs/evaluate` | Publik | Evaluasi kondisi nonidentitas |
| Public data | GET | `/services/{serviceId}/sources` | Publik | Sumber panduan |
| Citizen | GET | `/dashboard` | Warga | Ringkasan dashboard |
| Citizen | GET | `/preparations` | Warga | Daftar persiapan |
| Citizen | POST | `/preparations` | Warga | Buat persiapan |
| Citizen | GET | `/preparations/{preparationId}` | Pemilik | Detail persiapan |
| Citizen | PATCH | `/preparations/{preparationId}` | Pemilik | Update data dasar/jawaban |
| Citizen | POST | `/preparations/{preparationId}/archive` | Pemilik | Arsipkan persiapan |
| Citizen | GET | `/preparations/{preparationId}/requirements` | Pemilik | Kebutuhan berkas hasil kondisi |
| Documents | POST | `/preparations/{preparationId}/documents` | Pemilik | Unggah file |
| Documents | GET | `/preparations/{preparationId}/documents` | Pemilik | Daftar dokumen |
| Documents | GET | `/preparations/{preparationId}/documents/{documentId}` | Pemilik | Metadata dokumen |
| Documents | POST | `/preparations/{preparationId}/documents/{documentId}/versions` | Pemilik | Ganti/unggah versi baru |
| Documents | GET | `/preparations/{preparationId}/documents/{documentId}/content` | Pemilik | Preview/unduh terotorisasi |
| Documents | DELETE | `/preparations/{preparationId}/documents/{documentId}` | Pemilik | Hapus dokumen |
| Inspection | POST | `/preparations/{preparationId}/inspections` | Pemilik | Jalankan pemeriksaan |
| Inspection | GET | `/preparations/{preparationId}/inspections` | Pemilik | Riwayat pemeriksaan |
| Inspection | GET | `/preparations/{preparationId}/inspections/{inspectionId}` | Pemilik | Status/detail hasil |
| Inspection | POST | `/preparations/{preparationId}/inspections/{inspectionId}/retry` | Pemilik | Coba ulang bila diizinkan |
| Inspection | GET | `/preparations/{preparationId}/inspections/{inspectionId}/findings` | Pemilik | Daftar temuan |
| Inspection | POST | `/preparations/{preparationId}/findings/{findingId}/corrections` | Pemilik | Catat koreksi OCR |
| Citizen application | GET | `/applications` | Pemilik | Daftar pengajuan |
| Citizen application | POST | `/applications` | Warga | Catat pengajuan |
| Citizen application | GET | `/applications/{applicationId}` | Pemilik/ditugaskan | Detail pengajuan |
| Citizen application | GET | `/applications/{applicationId}/timeline` | Pemilik/ditugaskan | Linimasa |
| Citizen application | POST | `/applications/{applicationId}/citizen-notes` | Pemilik | Tambah catatan warga |
| Citizen application | POST | `/applications/{applicationId}/confirm-result-received` | Pemilik | Konfirmasi hasil diterima |
| Citizen application | POST | `/applications/{applicationId}/link-preparation` | Pemilik | Kaitkan persiapan baru |
| Notifications | GET | `/notifications` | Login | Daftar notifikasi |
| Notifications | POST | `/notifications/{notificationId}/read` | Pemilik | Tandai dibaca |
| Notifications | POST | `/notifications/read-all` | Login | Tandai semua dibaca |
| Chatbot | POST | `/assistant/messages` | Publik/login | Tanya panduan umum atau konteks yang diizinkan |
| Chatbot | GET | `/assistant/sessions/{sessionId}/messages` | Pemilik sesi | Riwayat chat jika penyimpanan diaktifkan |
| Officer | GET | `/officer/assignments` | Petugas | Daftar penugasan |
| Officer | GET | `/officer/applications/{applicationId}` | Petugas ditugaskan | Detail sesuai izin |
| Officer | POST | `/officer/applications/{applicationId}/events` | Petugas ditugaskan | Catat status/peristiwa |
| Admin | GET/POST | `/admin/services` | Admin | Daftar/buat layanan |
| Admin | PATCH | `/admin/services/{serviceId}` | Admin | Update metadata layanan |
| Admin | POST | `/admin/services/{serviceId}/guide-versions` | Admin | Buat draft versi panduan |
| Admin | POST | `/admin/guide-versions/{guideVersionId}/publish` | Admin | Publikasikan versi |
| Admin | POST | `/admin/rule-versions` | Admin | Buat versi aturan pemeriksaan |
| Admin | POST | `/admin/rule-versions/{ruleVersionId}/publish` | Admin | Publikasikan aturan |
| Admin | GET | `/admin/officers` | Admin | Daftar petugas |
| Admin | PATCH | `/admin/users/{userId}/role-assignments` | Admin | Kelola penugasan role |
| Admin | GET | `/admin/audit-events` | Admin dengan izin | Audit administratif |
| Privacy | DELETE | `/me/documents` | Warga | Ajukan penghapusan seluruh dokumen milik sendiri |
| Privacy | DELETE | `/me/account` | Warga | Ajukan penghapusan akun/data sesuai kebijakan |

Endpoint admin, petugas, chatbot, email/reset, dan penghapusan merupakan bagian kontrak usulan. Implementasi dapat diprioritaskan bertahap, tetapi pembatasan akses dan perilaku privasi tetap wajib.

---

## 6. Detail endpoint — autentikasi

> Metode autentikasi final belum ditetapkan PRD. Contoh berikut memakai access token bearer sebagai ilustrasi. Jika implementasi memakai cookie session, BE dan FE harus mengganti kontrak ini bersama-sama, termasuk perlindungan CSRF dan perilaku refresh.

### 6.1 `POST /auth/register`

Membuat akun warga. Role awal selalu `citizen`.

Request:

```json
{
  "display_name": "Pengguna Contoh",
  "email": "warga@example.com",
  "password": "StrongPasswordHere"
}
```

Response `201`:

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "display_name": "Pengguna Contoh",
      "email": "warga@example.com",
      "email_verified": false,
      "roles": ["citizen"],
      "status": "active"
    },
    "verification_required": true
  }
}
```

Validasi: email valid, password memenuhi kebijakan keamanan, email unik. Password tidak pernah dikembalikan. Jangan menerima `role`, `is_admin`, atau `is_officer` dari request.

### 6.2 `POST /auth/login`

Request:

```json
{
  "email": "warga@example.com",
  "password": "StrongPasswordHere"
}
```

Response `200` (format token hanya jika bearer dipilih):

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "display_name": "Pengguna Contoh",
      "email": "warga@example.com",
      "roles": ["citizen"]
    },
    "access_token": "opaque-or-jwt",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

Jika autentikasi gagal, gunakan pesan generik yang tidak membocorkan apakah email terdaftar. Rate limit dan proteksi brute-force wajib.

### 6.3 `POST /auth/logout`

Auth: login.

Response `204`. BE mencabut sesi/refresh token sesuai desain auth.

### 6.4 `GET /auth/me`

Response `200`:

```json
{
  "data": {
    "id": "uuid",
    "display_name": "Pengguna Contoh",
    "email": "warga@example.com",
    "email_verified": true,
    "roles": ["citizen"],
    "status": "active"
  }
}
```

### 6.5 `POST /auth/refresh`

Request/response mengikuti metode autentikasi yang dipilih. Jangan gunakan refresh token yang disimpan di localStorage tanpa peninjauan risiko keamanan. Jika endpoint tidak diperlukan pada metode auth final, hapus dari kontrak sebelum implementasi.

### 6.6 `POST /auth/forgot-password`

Request:

```json
{ "email": "warga@example.com" }
```

Response `202` dengan pesan generik:

```json
{
  "data": {
    "message": "Jika akun sesuai tersedia, instruksi pemulihan akan dikirim."
  }
}
```

### 6.7 `POST /auth/reset-password`

Request:

```json
{
  "reset_token": "single-use-token",
  "new_password": "NewStrongPasswordHere"
}
```

Response `204`. Token harus sekali pakai dan kedaluwarsa. Durasi berlaku perlu disepakati.

---

## 7. Detail endpoint — katalog dan panduan publik

### 7.1 `GET /regions`

Query opsional: `q`, `parent_id`, `type`, `page`, `page_size`.

Response `200`:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Kota Contoh",
      "type": "city",
      "parent_id": null
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total_items": 1, "total_pages": 1 }
}
```

### 7.2 `GET /services`

Query:

- `q`: kata kunci nama/kebutuhan/sinonim.
- `region_id`: filter cakupan wilayah.
- `category_id`: filter kategori.
- `page`, `page_size`, `sort`, `order`.

Response `200`:

```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "layanan-contoh",
      "name": "Nama layanan",
      "summary": "Ringkasan.",
      "agency": { "id": "uuid", "name": "Instansi Contoh" },
      "region": { "id": "uuid", "name": "Kota Contoh" },
      "category": { "id": "uuid", "name": "Kategori" },
      "publication_status": "published",
      "source_health": "available",
      "reviewed_at": "2026-10-20T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total_items": 1, "total_pages": 1 }
}
```

Jangan mengembalikan layanan dari wilayah lain seolah berlaku di wilayah yang dipilih. Jika hasil kosong, kembalikan array kosong dengan metadata valid, bukan error.

### 7.3 `GET /services/{serviceId}`

Response `200`: objek service beserta instansi, wilayah, kanal, versi panduan aktif, dan status sumber. `404` jika tidak ditemukan atau tidak dipublikasikan.

### 7.4 `GET /services/{serviceId}/guide`

Response `200`: objek panduan dengan `version`, `requirements`, `procedure_steps`, `official_fee`, `official_processing_time`, `channels`, `sources`, `reviewed_at`, `source_health`, dan `change_notice`.

Contoh saat biaya tidak diketahui:

```json
{
  "data": {
    "service_id": "uuid",
    "version": 3,
    "official_fee": {
      "status": "unknown",
      "amount": null,
      "currency": "IDR",
      "display_text": "Belum tersedia pada sumber yang dicatat",
      "sources": []
    },
    "official_processing_time": {
      "status": "unknown",
      "value": null,
      "unit": null,
      "basis": null,
      "display_text": "Belum tersedia pada sumber yang dicatat",
      "sources": []
    },
    "sources": [],
    "source_health": "needs_review",
    "reviewed_at": "2026-10-20T00:00:00Z",
    "change_notice": "Informasi perlu ditinjau."
  }
}
```

### 7.5 `GET /services/{serviceId}/questions`

Response `200`:

```json
{
  "data": {
    "service_id": "uuid",
    "questionnaire_version": 2,
    "questions": [
      {
        "id": "uuid",
        "key": "applicant_condition",
        "label": "Pilih kondisi yang sesuai",
        "help_text": "Digunakan untuk menentukan kebutuhan berkas.",
        "type": "single_select",
        "required": true,
        "options": [
          { "value": "option_a", "label": "Pilihan A" },
          { "value": "option_b", "label": "Pilihan B" }
        ],
        "visible_if": null
      }
    ]
  }
}
```

### 7.6 `POST /service-needs/evaluate`

Publik; hanya untuk kondisi nonidentitas, tidak menyimpan persiapan pribadi.

Request:

```json
{
  "service_id": "uuid",
  "region_id": "uuid",
  "questionnaire_version": 2,
  "answers": [
    { "question_id": "uuid", "value": "option_a" }
  ]
}
```

Response `200`:

```json
{
  "data": {
    "service_id": "uuid",
    "region_id": "uuid",
    "questionnaire_version": 2,
    "required_documents": [
      {
        "requirement_id": "uuid",
        "name": "Dokumen contoh",
        "required": true,
        "reason": "Berdasarkan jawaban kondisi yang dipilih.",
        "sources": []
      }
    ],
    "changed_requirements": [],
    "next_action": {
      "type": "start_preparation",
      "requires_authentication": true
    }
  }
}
```

Perubahan jawaban harus menghasilkan kebutuhan terbaru dan menunjukkan perubahan. Jangan meminta NIK atau data identitas pada endpoint ini.

### 7.7 `GET /services/{serviceId}/sources`

Response `200`: daftar sumber beserta `title`, `publisher`, `url`, `published_at`, `accessed_at`, `source_status`, dan informasi bagian panduan yang didukungnya.

---

## 8. Detail endpoint — dashboard dan persiapan warga

Semua endpoint bagian ini memerlukan autentikasi `citizen` dan pemeriksaan kepemilikan di server.

### 8.1 `GET /dashboard`

Response `200`:

```json
{
  "data": {
    "preparations": {
      "draft": 2,
      "needs_completion": 1,
      "needs_review": 1,
      "ready_initial_check": 1
    },
    "applications": {
      "active": 2,
      "needs_correction": 1
    },
    "open_findings_count": 3,
    "unread_notifications_count": 2,
    "recent_items": [
      {
        "type": "preparation",
        "id": "uuid",
        "title": "Persiapan layanan",
        "status": "draft",
        "updated_at": "2026-10-29T08:15:30Z",
        "primary_action": {
          "label": "Lanjutkan persiapan",
          "href": "/preparations/uuid"
        }
      }
    ]
  }
}
```

`href` adalah route frontend internal, bukan URL untuk akses tanpa autentikasi. FE tetap harus mengotorisasi halaman melalui API.

### 8.2 `GET /preparations`

Query: `status`, `service_id`, `page`, `page_size`, `sort`, `order`.

Response `200`: list preparation milik user aktif saja. Sertakan status, layanan, wilayah, `updated_at`, `latest_inspection_id`, dan `readiness`.

### 8.3 `POST /preparations`

Membuat draf persiapan. Request:

```json
{
  "service_id": "uuid",
  "region_id": "uuid",
  "guide_version": 3,
  "questionnaire_version": 2,
  "answers": [
    { "question_id": "uuid", "value": "option_a" }
  ],
  "display_name": "Persiapan layanan saya"
}
```

Response `201`:

```json
{
  "data": {
    "id": "uuid",
    "internal_reference": "PREP-2026-000001",
    "service_id": "uuid",
    "region_id": "uuid",
    "guide_version": 3,
    "status": "draft",
    "data_version": 1,
    "readiness": "not_assessed",
    "created_at": "2026-10-29T08:15:30Z",
    "updated_at": "2026-10-29T08:15:30Z"
  }
}
```

BE menentukan `owner_id`, `internal_reference`, status, versi, dan timestamps. FE tidak mengirim atau menetapkan pemilik/status.

### 8.4 `GET /preparations/{preparationId}`

Response `200` memuat persiapan milik user, jawaban aktif, referensi versi, ringkasan dokumen (metadata saja), status pemeriksaan terakhir, dan peringatan jika hasil sudah stale. Jangan mengembalikan konten dokumen mentah pada endpoint ini.

### 8.5 `PATCH /preparations/{preparationId}`

Update field yang diizinkan, misalnya `display_name`, `answers`, `form_data`. Request:

```json
{
  "display_name": "Persiapan yang diperbarui",
  "answers": [
    { "question_id": "uuid", "value": "option_b" }
  ],
  "expected_data_version": 2
}
```

Response `200`:

```json
{
  "data": {
    "id": "uuid",
    "status": "needs_new_inspection",
    "data_version": 3,
    "readiness": "stale",
    "latest_inspection_id": "uuid",
    "updated_at": "2026-10-29T08:20:00Z"
  }
}
```

Aturan:
- Increment `data_version` saat data relevan berubah.
- Tandai hasil lama tidak berlaku bagi versi terbaru; jangan menghapus hasil historis.
- Perubahan yang tidak mengubah isi (mis. nama tampilan) tidak harus membatalkan pemeriksaan, jika BE dapat membuktikannya tidak relevan.
- Jika `expected_data_version` tidak cocok, kembalikan `409 VERSION_CONFLICT` dan data versi terbaru yang aman ditampilkan.

### 8.6 `POST /preparations/{preparationId}/archive`

Request opsional:

```json
{ "reason": "Tidak dilanjutkan" }
```

Response `200`: persiapan menjadi `archived`. Pengarsipan bukan penghapusan data. Kebijakan retensi perlu ditetapkan.

### 8.7 `GET /preparations/{preparationId}/requirements`

Response `200`: kebutuhan dokumen berdasarkan jawaban dan versi panduan/pertanyaan yang berlaku, beserta status pemenuhan dari dokumen yang diunggah. Jika aturan berubah, sertakan `change_notice` dan jangan mengubah snapshot pemeriksaan lama secara diam-diam.

---

## 9. Detail endpoint — unggah dan pengelolaan dokumen

### 9.1 Kebijakan upload

PRD mengusulkan PDF/JPG/PNG, tetapi ukuran maksimum, jumlah halaman, jumlah file, dan format final **belum ditetapkan**. BE wajib menetapkan batas sebelum implementasi dan FE harus mengambil/menampilkan batas itu sebelum pemilihan file.

- Validasi ekstensi **dan** MIME/file signature aktual di server.
- Tolak file rusak, terkunci/tidak bisa dibaca, atau format tidak didukung.
- Simpan file di lokasi privat; tidak boleh ada URL publik permanen.
- Hindari eksekusi konten aktif saat preview.
- Penggantian dokumen membuat versi baru.
- Hasil pemeriksaan yang mengacu versi lama tetap tersimpan tetapi tidak berlaku bagi versi aktif.
- Endpoint mengembalikan metadata, bukan bytes, kecuali endpoint konten yang terotorisasi.
- Pertimbangkan malware scanning, checksum, batas halaman, dan batas pemrosesan.

### 9.2 `POST /preparations/{preparationId}/documents`

`Content-Type: multipart/form-data`

Form fields:

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `file` | binary | Ya | File dokumen. |
| `requirement_id` | string UUID | Tidak | Persyaratan yang dituju. |
| `document_type` | string | Ya | Jenis dokumen yang dipilih. |
| `display_name` | string | Tidak | Nama tampilan. |

Response `201`:

```json
{
  "data": {
    "id": "uuid",
    "preparation_id": "uuid",
    "requirement_id": "uuid-or-null",
    "document_type": "supporting_document",
    "display_name": "dokumen.pdf",
    "active_version": 1,
    "status": "uploaded",
    "version": {
      "id": "uuid",
      "version": 1,
      "mime_type": "application/pdf",
      "size_bytes": 120000,
      "page_count": 2,
      "processing_status": "available",
      "uploaded_at": "2026-10-29T08:15:30Z"
    }
  }
}
```

Error yang mungkin: `413 FILE_TOO_LARGE`, `415 FILE_TYPE_NOT_ALLOWED`, `422 FILE_INVALID`, `401`, `403/404`.

### 9.3 `GET /preparations/{preparationId}/documents`

Response `200`: array dokumen dengan metadata versi aktif. Jangan menyertakan URL storage permanen.

### 9.4 `GET /preparations/{preparationId}/documents/{documentId}`

Response `200`: detail metadata dan daftar versi yang boleh dilihat pemilik. Periksa kepemilikan pada preparation dan document, bukan hanya salah satu ID.

### 9.5 `POST /preparations/{preparationId}/documents/{documentId}/versions`

`multipart/form-data` dengan field `file`, opsional `display_name`.

Response `201`: metadata versi baru dan `active_version` terbaru. BE menandai hasil inspeksi terdahulu stale untuk versi aktif.

### 9.6 `GET /preparations/{preparationId}/documents/{documentId}/content`

Response `200`: konten dokumen dengan MIME yang aman, atau redirect ke URL bertanda tangan berumur pendek. URL akses harus terbatas pada dokumen yang dimiliki pengguna dan kedaluwarsa sesuai kebijakan. Jangan menaruh token/ID sensitif dalam query URL permanen.

### 9.7 `DELETE /preparations/{preparationId}/documents/{documentId}`

Response `202` jika penghapusan bertahap:

```json
{
  "data": {
    "document_id": "uuid",
    "deletion_status": "pending",
    "message": "Penghapusan dokumen sedang diproses."
  }
}
```

BE harus mengikuti kebijakan penghapusan untuk file mentah, preview, OCR/ekstraksi, hasil turunan, dan backup. Status penghapusan harus dapat ditelusuri tanpa mengekspos isi dokumen. Perilaku penghapusan final/retensi harus disepakati sebelum menerima dokumen pribadi sungguhan.

---

## 10. Detail endpoint — pemeriksaan AI

### 10.1 `POST /preparations/{preparationId}/inspections`

Memulai pemeriksaan async. FE sebaiknya mengirim `Idempotency-Key` unik untuk satu aksi pemeriksaan.

Request:

```json
{
  "expected_data_version": 3,
  "document_versions": [
    { "document_id": "uuid", "version": 2 }
  ],
  "consent": {
    "accepted": true,
    "notice_version": "privacy-notice-1.0",
    "purpose": "document_inspection"
  }
}
```

Response `202`:

```json
{
  "data": {
    "id": "uuid",
    "preparation_id": "uuid",
    "status": "queued",
    "progress": {
      "stage": "queued",
      "percent": 0,
      "message": "Pemeriksaan masuk antrean."
    },
    "input_snapshot": {
      "data_version": 3,
      "document_versions": [
        { "document_id": "uuid", "version": 2 }
      ],
      "guide_version": 3,
      "rule_version": 5
    },
    "created_at": "2026-10-29T08:15:30Z"
  }
}
```

Validasi:
- User pemilik persiapan.
- Persiapan tidak diarsipkan.
- Semua dokumen terpilih milik persiapan dan versi yang diminta tersedia.
- Persetujuan/pemberitahuan pemrosesan sesuai kebijakan sudah tercatat.
- Versi data/dokumen cocok dengan input aktif atau server menolak dengan `409 INSPECTION_INPUT_CHANGED`.
- Aturan aktif tersedia dan dapat ditelusuri.
- Idempotency mencegah pekerjaan identik berulang tanpa kendali.
- Hasil AI tidak boleh mengubah status pengajuan resmi.

### 10.2 `GET /preparations/{preparationId}/inspections`

Mengembalikan riwayat pemeriksaan milik warga, terbaru dahulu. Respons ringkas dapat menyertakan `id`, `status`, `result`, `created_at`, `completed_at`, `input_snapshot`, dan `is_current_for_active_input`.

### 10.3 `GET /preparations/{preparationId}/inspections/{inspectionId}`

Response `200` saat proses berjalan:

```json
{
  "data": {
    "id": "uuid",
    "preparation_id": "uuid",
    "status": "running",
    "result": null,
    "progress": {
      "stage": "document_reading",
      "percent": 35,
      "message": "Dokumen sedang dibaca."
    },
    "input_snapshot": {
      "data_version": 3,
      "document_versions": [
        { "document_id": "uuid", "version": 2 }
      ],
      "guide_version": 3,
      "rule_version": 5
    },
    "started_at": "2026-10-29T08:16:00Z",
    "completed_at": null,
    "failure": null
  }
}
```

Response `200` saat selesai:

```json
{
  "data": {
    "id": "uuid",
    "preparation_id": "uuid",
    "status": "completed",
    "result": "needs_review",
    "summary": {
      "title": "Perlu diperiksa ulang",
      "description": "Ada bagian yang belum dapat dipastikan.",
      "open_findings_count": 1,
      "must_fix_count": 0,
      "needs_confirmation_count": 1,
      "informational_count": 0
    },
    "limitations": [
      "Pemeriksaan ini adalah bantuan awal, bukan keputusan instansi.",
      "Pemeriksaan ini tidak memverifikasi keaslian atau validitas hukum dokumen."
    ],
    "input_snapshot": {
      "data_version": 3,
      "document_versions": [
        { "document_id": "uuid", "version": 2 }
      ],
      "guide_version": 3,
      "rule_version": 5
    },
    "is_current_for_active_input": true,
    "started_at": "2026-10-29T08:16:00Z",
    "completed_at": "2026-10-29T08:16:42Z",
    "failure": null
  }
}
```

Response `200` saat gagal teknis:

```json
{
  "data": {
    "id": "uuid",
    "status": "failed",
    "result": "incomplete",
    "progress": {
      "stage": "failed",
      "percent": 35,
      "message": "Pemeriksaan belum selesai."
    },
    "failure": {
      "code": "AI_PROVIDER_UNAVAILABLE",
      "message": "Layanan pemeriksaan sementara tidak tersedia.",
      "retryable": true
    },
    "completed_at": "2026-10-29T08:16:42Z"
  }
}
```

Jika gagal teknis, jangan mengembalikan hasil `ready_initial_check`. `percent` bersifat perkiraan progres teknis, bukan skor kelengkapan/kelayakan.

### 10.4 `POST /preparations/{preparationId}/inspections/{inspectionId}/retry`

Request:

```json
{
  "reason": "provider_temporarily_unavailable"
}
```

Response `202`: pekerjaan baru atau retry terhubung dengan pekerjaan sebelumnya. BE menentukan retry yang aman dan mencegah duplikasi. Jika input telah berubah, FE harus membuat pemeriksaan baru untuk versi terbaru, bukan memaksa retry snapshot lama.

### 10.5 `GET /preparations/{preparationId}/inspections/{inspectionId}/findings`

Query opsional: `status`, `category`, `action_level`, `page`, `page_size`.

Response `200`:

```json
{
  "data": [
    {
      "id": "uuid",
      "category": "data_mismatch",
      "action_level": "needs_confirmation",
      "status": "open",
      "title": "Data pada dua dokumen berbeda",
      "explanation": "Nilai yang terbaca pada bagian terkait tidak sama. Perbedaan ini perlu dikonfirmasi dan tidak berarti dokumen tidak sah.",
      "document_id": "uuid",
      "document_version": 2,
      "evidence": {
        "page": 1,
        "field": "nama",
        "bounding_box": null,
        "quoted_text": null
      },
      "rule_reference": {
        "rule_id": "uuid",
        "rule_version": 5,
        "requirement_id": "uuid",
        "sources": []
      },
      "suggested_action": {
        "type": "correct_form_or_confirm",
        "label": "Periksa data dan konfirmasi jika diperlukan",
        "target": {
          "form_field": "applicant_name"
        }
      },
      "confidence": {
        "value": 0.74,
        "meaning": "extraction_confidence"
      },
      "value_origin": "machine_read",
      "resolved_by": null,
      "resolved_at": null
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total_items": 1, "total_pages": 1 }
}
```

Nilai `quoted_text` bersifat opsional dan harus dipertimbangkan dari sisi privasi. FE harus menampilkan dasar aturan/sumber dan tindakan yang sesuai.

### 10.6 `POST /preparations/{preparationId}/findings/{findingId}/corrections`

Mencatat koreksi warga atas pembacaan AI. Tidak mengubah teks OCR asli tanpa jejak.

Request:

```json
{
  "field_key": "applicant_name",
  "machine_read_value": "Contoh Salah",
  "corrected_value": "Contoh Benar",
  "reason": "Saya mengoreksi pembacaan teks.",
  "source_document_id": "uuid",
  "source_document_version": 2
}
```

Response `201`:

```json
{
  "data": {
    "id": "uuid",
    "finding_id": "uuid",
    "field_key": "applicant_name",
    "machine_read_value": "Contoh Salah",
    "corrected_value": "Contoh Benar",
    "value_origin": "citizen_corrected",
    "created_at": "2026-10-29T08:20:00Z"
  }
}
```

Koreksi tidak membuktikan kebenaran resmi. Jika koreksi memengaruhi hasil, pemeriksaan baru harus mengacu ke input terbaru dan menyimpan versi koreksi.

---

## 11. Detail endpoint — pencatatan dan pelacakan pengajuan

### 11.1 `GET /applications`

Auth: warga. Query: `status`, `service_id`, `source_mode`, `page`, `page_size`, `sort`, `order`.

Hanya mengembalikan pengajuan milik warga aktif. Jangan gunakan nomor pengajuan sebagai pengganti otorisasi.

### 11.2 `POST /applications`

Warga dapat mencatat pengajuan tanpa menjalankan pemeriksaan AI sebelumnya.

Request:

```json
{
  "service_id": "uuid",
  "preparation_id": "uuid-or-null",
  "submitted_at": "2026-10-28T00:00:00Z",
  "channel": {
    "type": "online",
    "label": "Portal layanan resmi",
    "url": "https://example.go.id"
  },
  "official_application_number": "NOMOR-JIKA-ADA",
  "note": "Pengajuan dicatat oleh warga."
}
```

Response `201`:

```json
{
  "data": {
    "id": "uuid",
    "internal_reference": "APP-2026-000001",
    "service_id": "uuid",
    "preparation_id": "uuid-or-null",
    "official_application_number": "NOMOR-JIKA-ADA",
    "official_number_source": "citizen_reported",
    "submitted_at": "2026-10-28T00:00:00Z",
    "channel": {
      "type": "online",
      "label": "Portal layanan resmi",
      "url": "https://example.go.id"
    },
    "source_mode": "citizen_recorded",
    "current_status": "citizen_recorded_unconfirmed",
    "simulation": false,
    "created_at": "2026-10-29T08:15:30Z"
  }
}
```

BE harus membuat status event awal dengan `source_type: citizen`. Nomor internal dan nomor resmi harus selalu dipisahkan. Nomor resmi yang diketik warga tidak boleh dianggap diverifikasi. Tidak ada dokumen yang dikirim ke kanal resmi oleh endpoint ini.

### 11.3 `GET /applications/{applicationId}`

Response `200`: metadata pengajuan, status saat ini, sumber status, label verifikasi nomor, link kanal resmi, standar waktu jika tersedia, ringkasan linimasa, dan penanda simulasi. Akses untuk warga pemilik atau petugas yang ditugaskan sesuai izin.

### 11.4 `GET /applications/{applicationId}/timeline`

Response `200`:

```json
{
  "data": {
    "application_id": "uuid",
    "source_mode": "citizen_recorded",
    "official_updates_available": false,
    "message": "Belum ada pembaruan dari instansi yang tercatat.",
    "events": [
      {
        "id": "uuid",
        "event_type": "application_recorded",
        "status": "citizen_recorded_unconfirmed",
        "source_type": "citizen",
        "source_label": "Dicatat warga — belum terkonfirmasi instansi",
        "occurred_at": "2026-10-28T00:00:00Z",
        "recorded_at": "2026-10-29T08:15:30Z",
        "note": "Warga mencatat bahwa pengajuan telah dilakukan.",
        "simulation": false,
        "correction_of_event_id": null
      }
    ]
  }
}
```

Linimasa merupakan daftar peristiwa append-only secara logis. Koreksi harus membuat peristiwa koreksi/audit, bukan menghilangkan jejak tanpa catatan. Jika hanya ada catatan warga, `official_updates_available` bernilai `false`.

### 11.5 `POST /applications/{applicationId}/citizen-notes`

Request:

```json
{
  "note": "Saya mendapat informasi untuk datang kembali minggu depan.",
  "reported_status": "processing",
  "occurred_at": "2026-10-29T00:00:00Z"
}
```

Response `201`: event dengan `source_type: citizen`, label “Catatan warga”, dan `simulation` sesuai pengajuan. `reported_status` tidak menjadi status instansi terverifikasi.

### 11.6 `POST /applications/{applicationId}/confirm-result-received`

Request:

```json
{
  "received_at": "2026-10-29T00:00:00Z",
  "note": null
}
```

Response `201`: membuat event `result_received_by_citizen` dengan `source_type: citizen`. Ini berarti warga mengonfirmasi penerimaan, bukan verifikasi pihak instansi.

### 11.7 `POST /applications/{applicationId}/link-preparation`

Menghubungkan persiapan baru ke pengajuan yang sudah ada tanpa menghapus riwayat lama.

Request:

```json
{
  "preparation_id": "uuid"
}
```

Response `200`: pengajuan dengan `preparation_id` yang diperbarui. BE memverifikasi kepemilikan kedua objek dan menyimpan audit.

---

## 12. Detail endpoint — petugas dan transisi status

Endpoint petugas hanya tersedia jika modul petugas diaktifkan dan akun telah diberikan role serta cakupan penugasan oleh admin. Role petugas tidak dapat didaftarkan sendiri.

### 12.1 `GET /officer/assignments`

Query: `status`, `page`, `page_size`.

Response `200`: daftar pengajuan yang ditugaskan kepada petugas aktif, hanya data yang diizinkan untuk tugas tersebut.

### 12.2 `GET /officer/applications/{applicationId}`

Response `200`: detail terbatas, riwayat peristiwa, dan tindakan yang diizinkan. `404`/`403` jika bukan penugasan yang sah. Jangan membuka draf pribadi warga secara default.

### 12.3 `POST /officer/applications/{applicationId}/events`

Request contoh perubahan status:

```json
{
  "event_type": "status_changed",
  "status": "verification",
  "occurred_at": "2026-10-29T08:00:00Z",
  "note": "Pengajuan sedang diverifikasi.",
  "revision_request": null
}
```

Request contoh permintaan revisi:

```json
{
  "event_type": "revision_requested",
  "status": "needs_correction",
  "occurred_at": "2026-10-29T08:00:00Z",
  "note": "Mohon lengkapi dokumen yang disebutkan.",
  "revision_request": {
    "reason": "Dokumen pendukung belum lengkap.",
    "actions": [
      {
        "type": "upload_document",
        "label": "Unggah dokumen pendukung"
      }
    ],
    "due_at": null
  }
}
```

Request contoh penyelesaian:

```json
{
  "event_type": "status_changed",
  "status": "completed",
  "occurred_at": "2026-10-29T08:00:00Z",
  "note": "Sumber petugas mencatat proses selesai.",
  "completion_info": {
    "instructions": "Ikuti petunjuk pengambilan dari kanal resmi.",
    "result_url": null
  }
}
```

Response `201`:

```json
{
  "data": {
    "id": "uuid",
    "application_id": "uuid",
    "event_type": "revision_requested",
    "status": "needs_correction",
    "source_type": "officer",
    "source_label": "Petugas yang ditugaskan",
    "occurred_at": "2026-10-29T08:00:00Z",
    "recorded_at": "2026-10-29T08:15:30Z",
    "revision_request": {
      "reason": "Dokumen pendukung belum lengkap.",
      "actions": [
        { "type": "upload_document", "label": "Unggah dokumen pendukung" }
      ],
      "due_at": null
    },
    "simulation": false
  }
}
```

Aturan:
- `revision_request.reason` dan minimal satu tindakan wajib saat status `needs_correction`.
- BE memvalidasi transisi status terhadap konfigurasi layanan.
- Setiap mutasi membuat audit event.
- Jangan mengizinkan petugas mengubah catatan warga menjadi status instansi tanpa tindakan petugas eksplisit yang berwenang.
- Jika demo, `simulation: true` dan label simulasi harus melekat pada pengajuan dan seluruh event turunannya.
- Pengaitan warga dengan pengajuan yang dikelola petugas memerlukan proses verifikasi/persetujuan yang ditetapkan; nomor yang diketik warga saja tidak cukup.

---

## 13. Detail endpoint — notifikasi

### 13.1 `GET /notifications`

Query: `is_read`, `type`, `page`, `page_size`.

Response `200`: notifikasi milik user aktif dengan `id`, `type`, `title`, `body`, `related_resource`, `is_read`, `created_at`. Tidak memuat data dokumen sensitif.

### 13.2 `POST /notifications/{notificationId}/read`

Response `204`. Harus memastikan notifikasi milik user aktif.

### 13.3 `POST /notifications/read-all`

Response `204`. Hanya menandai notifikasi milik user aktif sebagai dibaca.

Jenis notifikasi yang disarankan:
- `inspection_completed`
- `inspection_failed`
- `revision_recorded`
- `application_status_updated`
- `reminder_to_check_application`

`reminder_to_check_application` adalah pengingat, bukan bukti perkembangan baru. Hindari notifikasi duplikat untuk event yang sama.

---

## 14. Detail endpoint — chatbot pendamping

Chatbot opsional. Seluruh proses inti harus tetap berfungsi saat chatbot tidak tersedia.

### 14.1 `POST /assistant/messages`

Request publik:

```json
{
  "session_id": null,
  "message": "Apa saja syarat layanan ini?",
  "context": {
    "service_id": "uuid",
    "page": "service_detail"
  }
}
```

Request warga login untuk penjelasan temuan milik sendiri:

```json
{
  "session_id": "uuid-or-null",
  "message": "Tolong jelaskan temuan ini.",
  "context": {
    "service_id": "uuid",
    "preparation_id": "uuid",
    "finding_id": "uuid"
  }
}
```

Response `200`:

```json
{
  "data": {
    "session_id": "uuid",
    "message_id": "uuid",
    "answer": "Berdasarkan sumber yang tersedia, ...",
    "sources": [
      {
        "id": "uuid",
        "title": "Persyaratan layanan",
        "url": "https://example.go.id/persyaratan"
      }
    ],
    "limitations": [
      "Informasi ini merupakan bantuan penjelasan, bukan keputusan instansi."
    ],
    "suggested_navigation": {
      "label": "Buka panduan layanan",
      "href": "/services/layanan-contoh"
    }
  }
}
```

Aturan:
- Konteks pribadi tidak disertakan otomatis; FE hanya mengirim ID konteks yang dibutuhkan dan BE memeriksa kepemilikan.
- Jangan mengirim semua isi dokumen atau seluruh riwayat persiapan ke model tanpa kebutuhan dan dasar pemrosesan yang jelas.
- Chatbot tidak boleh mengubah data, menghapus/menutup temuan, mengunggah berkas, mengirim pengajuan, atau memperbarui status.
- Jawaban persyaratan harus mengutip sumber yang tersedia atau menyatakan informasi belum tersedia.
- Perlakukan dokumen/teks pengguna sebagai input tidak tepercaya; prompt injection tidak boleh mengubah kebijakan.
- Jika AI tidak tersedia, kembalikan error terkontrol `503 AI_PROVIDER_UNAVAILABLE`; halaman panduan dan formulir tetap dapat digunakan.

### 14.2 `GET /assistant/sessions/{sessionId}/messages`

Hanya jika penyimpanan percakapan diaktifkan. Endpoint harus memverifikasi kepemilikan sesi dan kebijakan retensi. Penyimpanan permanen bukan kebutuhan wajib PRD.

---

## 15. Detail endpoint — administrasi

Endpoint admin wajib memakai role assignment yang diberikan server, pemeriksaan izin per tindakan, dan audit. Hak admin tidak otomatis memberi akses isi dokumen pribadi warga.

### 15.1 `GET /admin/services`

Query: `q`, `publication_status`, `region_id`, `page`, `page_size`.

Response `200`: daftar layanan termasuk status publikasi, versi aktif, dan status peninjauan sumber.

### 15.2 `POST /admin/services`

Request:

```json
{
  "name": "Nama layanan",
  "slug": "nama-layanan",
  "category_id": "uuid",
  "agency_id": "uuid",
  "region_id": "uuid",
  "summary": "Ringkasan layanan."
}
```

Response `201`: service baru berstatus draft/unpublished. BE membuat ID dan audit event.

### 15.3 `PATCH /admin/services/{serviceId}`

Update field metadata yang diizinkan. Gunakan optimistic concurrency/version check untuk mencegah overwrite. Response `200` berisi objek terbaru.

### 15.4 `POST /admin/services/{serviceId}/guide-versions`

Membuat draft versi panduan baru, tidak menimpa versi terbit.

Request:

```json
{
  "summary": "Ringkasan panduan yang diperbarui.",
  "requirements": [
    {
      "name": "Dokumen contoh",
      "description": "Deskripsi",
      "required": true,
      "condition": null,
      "source_ids": ["uuid"]
    }
  ],
  "procedure_steps": [
    {
      "step": 1,
      "title": "Langkah pertama",
      "description": "Keterangan langkah."
    }
  ],
  "official_fee": {
    "status": "unknown",
    "amount": null,
    "currency": "IDR",
    "display_text": "Belum tersedia pada sumber yang dicatat",
    "source_ids": []
  },
  "official_processing_time": {
    "status": "unknown",
    "value": null,
    "unit": null,
    "basis": null,
    "display_text": "Belum tersedia pada sumber yang dicatat",
    "source_ids": []
  },
  "reviewed_at": "2026-10-20T00:00:00Z"
}
```

Response `201`: `guide_version_id`, `version`, `status: draft`, `created_at`.

### 15.5 `POST /admin/guide-versions/{guideVersionId}/publish`

Request:

```json
{
  "confirm_sources_reviewed": true,
  "change_summary": "Memperbarui sumber persyaratan."
}
```

Response `200`: versi berstatus `published`, `published_at`, dan `version`. BE memvalidasi sumber wajib, tanggal peninjauan, dan kelengkapan data. Publikasi membuat versi baru; hasil inspeksi lama tetap merujuk versi sebelumnya dan persiapan terdampak diberi peringatan untuk meninjau ulang.

### 15.6 `POST /admin/rule-versions`

Membuat draft aturan pemeriksaan baru. Bentuk rule schema harus dikunci bersama tim AI/BE sebelum implementasi. Setiap aturan wajib memiliki `rule_id`, versi, kondisi, tindakan, persyaratan yang dirujuk, sumber, serta metadata evaluasi.

### 15.7 `POST /admin/rule-versions/{ruleVersionId}/publish`

Request:

```json
{
  "test_suite_id": "uuid",
  "review_notes": "Lulus uji dokumen sintetis."
}
```

Response `200`: aturan terbit dengan versi baru. Publikasi hanya diizinkan setelah validasi sumber dan pengujian dokumen sintetis. Jangan mengubah hasil pemeriksaan lama secara retroaktif.

### 15.8 `GET /admin/officers`

Daftar akun yang diberi role petugas, status akun, dan cakupan assignment. Tidak mengembalikan dokumen pribadi warga.

### 15.9 `PATCH /admin/users/{userId}/role-assignments`

Request:

```json
{
  "assignments": [
    {
      "role": "officer",
      "region_id": "uuid",
      "agency_id": "uuid",
      "active": true
    }
  ],
  "reason": "Penugasan operasional."
}
```

Response `200`: assignment terbaru. BE menolak role tidak dikenal dan menulis audit. Endpoint ini hanya admin berizin.

### 15.10 `GET /admin/audit-events`

Query: `actor_id`, `action`, `object_type`, `from`, `to`, `page`, `page_size`.

Response hanya metadata audit minimum. Jangan mengembalikan isi dokumen, OCR lengkap, token, atau identitas lengkap kecuali ada kebutuhan dan izin yang ditetapkan.

---

## 16. Detail endpoint — privasi dan penghapusan

### 16.1 `DELETE /me/documents`

Mengajukan penghapusan dokumen milik user. Respons `202`:

```json
{
  "data": {
    "request_id": "uuid",
    "status": "pending",
    "scope": [
      "raw_documents",
      "previews",
      "extracted_text",
      "derived_inspection_data"
    ],
    "created_at": "2026-10-29T08:15:30Z"
  }
}
```

Jika penghapusan asynchronous, sediakan endpoint status permintaan, misalnya `GET /me/deletion-requests/{requestId}`. Endpoint status ini perlu ditambahkan ke matriks final jika implementasi menggunakannya.

Penghapusan harus mengikuti kebijakan retensi, backup, audit, dan kewajiban penyimpanan yang telah ditetapkan. Jangan menjanjikan penghapusan dari backup seketika jika sistem tidak mendukungnya.

### 16.2 `DELETE /me/account`

Mengajukan penghapusan akun/data sesuai kebijakan yang disepakati. Respons `202` jika memerlukan proses bertahap. Sebelum konfirmasi, FE harus menjelaskan dampak pada persiapan, dokumen, hasil AI, notifikasi, dan catatan pengajuan. Masa retensi audit/status perlu ditetapkan terpisah.

---

## 17. Kontrak status dan aturan bisnis lintas modul

### 17.1 Siklus status pemeriksaan

| Status | Arti | Aksi FE |
|---|---|---|
| `queued` | Diterima antrean | Tampilkan menunggu; polling status. |
| `running` | Sedang diproses | Tampilkan tahap/progres jika tersedia. |
| `completed` + `needs_completion` | Ada kekurangan wajib terdeteksi | Tampilkan temuan dan tindakan perbaikan. |
| `completed` + `needs_review` | Ada ketidakpastian/perbedaan yang belum selesai | Minta konfirmasi/perbaikan; jangan label siap. |
| `completed` + `ready_initial_check` | Semua pemeriksaan wajib yang tersedia selesai tanpa penghalang yang terdeteksi | Tampilkan batas pemeriksaan dan sumber/versi aturan. |
| `failed` | Gangguan teknis | Tampilkan pesan aman dan tombol coba ulang jika `retryable: true`. |
| `cancelled` | Dibatalkan oleh sistem sesuai kebijakan | Tampilkan status; jangan menampilkan hasil final. |

### 17.2 Kapan hasil dianggap current

Hasil hanya current jika seluruh versi input pada `input_snapshot` masih sama dengan versi aktif yang relevan:
- versi data/formulir,
- versi dokumen yang digunakan,
- versi kondisi/jawaban yang berpengaruh,
- versi aturan/persyaratan yang berlaku untuk penilaian tersebut.

Jika tidak sama, `is_current_for_active_input: false` dan persiapan menjadi `needs_new_inspection`/`stale`. Hasil historis tetap dapat dilihat dengan label versi lama.

### 17.3 Siklus status pengajuan

| Status | Sumber yang dapat membuat | Label FE |
|---|---|---|
| `citizen_recorded_unconfirmed` | Warga | Dicatat warga — belum terkonfirmasi instansi |
| `accepted` | Petugas/integrasi/simulasi | Diterima — tampilkan sumber |
| `verification` | Petugas/integrasi/simulasi | Verifikasi — tampilkan sumber |
| `needs_correction` | Petugas/integrasi/simulasi | Perlu perbaikan — tampilkan alasan dan sumber |
| `processing` | Petugas/integrasi/simulasi | Diproses — tampilkan sumber |
| `completed` | Petugas/integrasi/simulasi | Selesai menurut sumber yang mencatat |
| `result_received_by_citizen` | Warga | Warga mengonfirmasi hasil diterima |

Jangan mengubah status pengajuan hanya karena pemeriksaan AI selesai. Catatan warga tidak boleh dilabeli sebagai pembaruan petugas. Jika sumber hanya simulasi, seluruh UI terkait harus menampilkan label simulasi.

### 17.4 Aturan perubahan data

- Perubahan data/dokumen membuat versi baru atau increment version.
- Koreksi OCR disimpan sebagai record terpisah dengan `value_origin: citizen_corrected`.
- Perubahan panduan/aturan diterbitkan sebagai versi baru.
- Hasil lama tidak ditimpa; simpan snapshot input.
- Status event tidak dihapus untuk menyamarkan kesalahan; buat event koreksi dengan referensi event asal.
- Tidak boleh ada auto-submit ke portal pemerintah pada baseline.

---

## 18. Kontrak FE untuk loading, polling, dan retry

### 18.1 Polling pemeriksaan

Sampai kanal real-time ditetapkan, FE dapat melakukan polling `GET /preparations/{preparationId}/inspections/{inspectionId}`.

Usulan awal (perlu disepakati dan disesuaikan kapasitas):
- Polling setiap 2–4 detik saat `queued`/`running`.
- Hentikan polling saat `completed`, `failed`, atau `cancelled`.
- Gunakan backoff jika terjadi error jaringan.
- Jangan membuka polling paralel untuk inspection ID yang sama dari beberapa komponen.
- Jangan mengasumsikan durasi maksimum sebelum target operasional disepakati.

SSE/WebSocket bukan bagian kontrak baseline. Jika dipilih, dokumentasikan protokol, autentikasi, event schema, reconnect, dan fallback polling secara terpisah.

### 18.2 Retry

- GET umumnya aman diulang.
- Mutasi yang dapat membuat resource atau menimbulkan biaya harus memakai idempotency jika didukung.
- Jangan otomatis retry `POST` tanpa `Idempotency-Key`.
- Retry pemeriksaan harus mengikuti `failure.retryable`.
- Jika input berubah, buat inspection baru terhadap versi terbaru.
- Pada `429`, hormati `Retry-After` jika dikirim.
- Pada `401`, hentikan permintaan privat dan jalankan flow autentikasi; jangan retry tanpa batas.

### 18.3 Optimistic UI

- FE boleh melakukan optimistic update hanya untuk aksi berisiko rendah seperti menandai notifikasi dibaca, dengan rollback saat gagal.
- Jangan optimistically mengubah status pengajuan, status pemeriksaan, kepemilikan, hasil AI, atau status publikasi aturan.
- Selalu tampilkan keadaan “belum tersimpan” jika autosave gagal.

---

## 19. Keamanan, privasi, dan audit

### 19.1 Otorisasi

- Server memeriksa role dan kepemilikan pada setiap GET, PATCH, POST, DELETE, preview, download, correction, dan timeline.
- Jangan mengandalkan ID yang sulit ditebak atau menyembunyikan tombol FE sebagai kontrol keamanan.
- Petugas dibatasi berdasarkan assignment aktif.
- Admin tidak otomatis dapat membaca konten dokumen pribadi.
- Semua URL dokumen harus terotorisasi dan berumur pendek jika signed URL dipakai.
- Link kembali setelah login harus dibatasi ke route internal yang aman.

### 19.2 Data dan log

- Minimalkan data yang dikirim ke OCR/LLM.
- Jangan mengirim dokumen pribadi ke penyedia eksternal sebelum syarat pemrosesan, retensi, dan persetujuan ditetapkan.
- Gunakan dokumen sintetis untuk demo bila pengelolaan data nyata belum siap.
- Jangan mencatat password, token, isi dokumen, teks OCR sensitif, atau nomor identitas lengkap dalam log.
- Audit mencatat aktor, tindakan, objek, waktu, hasil, dan request ID secukupnya.
- Enkripsi koneksi dan penyimpanan.
- Batasi rate request login, reset password, upload, inspection, chatbot, dan endpoint publik pencarian.

### 19.3 Upload dan AI

- Periksa file signature, malware, ukuran, halaman, dan file terkunci sesuai kebijakan.
- Preview tidak boleh mengeksekusi konten aktif dari file unggahan.
- Prompt injection dalam dokumen harus diperlakukan sebagai isi, bukan instruksi.
- LLM tidak menentukan hak akses.
- AI tidak boleh menciptakan persyaratan wajib yang tidak didukung versi aturan/sumber.
- Skor confidence bukan ukuran keaslian atau peluang diterima.
- Kegagalan provider harus menjadi status terkontrol yang bisa dicoba ulang.

### 19.4 Audit perubahan status

Setiap update status petugas/admin, publish panduan/aturan, role assignment, penghapusan, dan koreksi peristiwa harus menghasilkan audit event. Audit event tidak boleh menyimpan data dokumen yang tidak diperlukan.

---

## 20. Rekomendasi struktur frontend

Contoh modul FE (bukan kewajiban framework):

```text
src/
  api/
    client.ts
    auth.api.ts
    services.api.ts
    preparations.api.ts
    documents.api.ts
    inspections.api.ts
    applications.api.ts
    notifications.api.ts
    assistant.api.ts
    officer.api.ts
    admin.api.ts
  types/
    common.ts
    auth.ts
    service.ts
    preparation.ts
    document.ts
    inspection.ts
    application.ts
    notification.ts
```

### Aturan client API

- Satu API client terpusat untuk base URL, auth, parsing error, timeout, request ID, dan refresh jika dipakai.
- FE menggunakan enum dari kontrak, bukan menebak status dari teks `message`.
- FE harus menangani `null`, list kosong, field opsional, dan status async.
- Jangan menyimpan data dokumen sensitif lebih lama dari kebutuhan UI.
- Jangan memasukkan access token ke URL.
- FE harus membedakan error validasi, akses, konflik versi, limit, dan gangguan server.
- Untuk form bertahap, pertahankan data lokal sementara secara hati-hati dan tampilkan apakah sudah tersimpan ke server.

Contoh tipe TypeScript minimal:

```typescript
export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field?: string;
      issue?: string;
      message: string;
    }>;
    request_id?: string;
  };
};

export type ApiResponse<T> = {
  data: T;
  meta?: {
    request_id?: string;
    page?: number;
    page_size?: number;
    total_items?: number;
    total_pages?: number;
  };
};

export type PreparationStatus =
  | "draft"
  | "queued"
  | "inspecting"
  | "needs_completion"
  | "needs_review"
  | "ready_initial_check"
  | "inspection_incomplete"
  | "needs_new_inspection"
  | "archived";

export type InspectionStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type InspectionResult =
  | "needs_completion"
  | "needs_review"
  | "ready_initial_check"
  | "incomplete";

export type ApplicationStatus =
  | "citizen_recorded_unconfirmed"
  | "accepted"
  | "verification"
  | "needs_correction"
  | "processing"
  | "completed"
  | "result_received_by_citizen";

export type SourceType =
  | "citizen"
  | "officer"
  | "official_integration"
  | "simulation"
  | "system_reminder";
```

---

## 21. Skenario acceptance test API

| ID | Request/skenario | Hasil kontrak |
|---|---|---|
| API-AC-01 | GET katalog tanpa login | `200`, data publik tersedia. |
| API-AC-02 | Cari layanan dengan `region_id` | Hasil hanya layanan yang sesuai cakupan. |
| API-AC-03 | Biaya/waktu belum diketahui | `status: unknown`; tidak mengasumsikan gratis atau waktu tertentu. |
| API-AC-04 | Publik mengevaluasi pertanyaan kondisi | `200`, hanya kebutuhan berkas; tidak menyimpan identitas pribadi. |
| API-AC-05 | Publik membuat preparation | `401`. |
| API-AC-06 | Warga A membaca preparation Warga B | `404` atau `403` sesuai kebijakan, tanpa membocorkan isi. |
| API-AC-07 | Warga mengunggah format tak didukung | Error `FILE_TYPE_NOT_ALLOWED`. |
| API-AC-08 | Warga mengganti dokumen setelah hasil siap | Versi dokumen bertambah; hasil lama tidak current. |
| API-AC-09 | Warga menjalankan inspection | `202`; status awal queued/running, bukan hasil final palsu. |
| API-AC-10 | Request inspection identik dikirim ulang dengan idempotency key sama | Tidak membuat pekerjaan/biaya duplikat. |
| API-AC-11 | Input berubah sebelum inspection dibuat | Konflik versi atau inspection baru dengan snapshot versi terbaru. |
| API-AC-12 | Provider AI gagal | Status `failed`, `result: incomplete`, retryability jelas. |
| API-AC-13 | Ada kekurangan wajib | Hasil `needs_completion`, temuan memiliki dasar aturan dan tindakan. |
| API-AC-14 | Ada pembacaan meragukan | Hasil `needs_review`, tidak diberi status siap. |
| API-AC-15 | Pemeriksaan siap | Respons mencantumkan limitasi, versi sumber/aturan, bukan klaim persetujuan. |
| API-AC-16 | Warga mengoreksi OCR | Koreksi tercatat terpisah dengan asal `citizen_corrected`. |
| API-AC-17 | Warga mencatat pengajuan tanpa AI | `201`, `preparation_id: null` diizinkan. |
| API-AC-18 | Warga mengisi nomor resmi sendiri | `official_number_source: citizen_reported`. |
| API-AC-19 | Tidak ada status petugas/integrasi | Timeline menyatakan belum ada pembaruan instansi. |
| API-AC-20 | Warga menambahkan catatan status | Event `source_type: citizen`, bukan `officer`. |
| API-AC-21 | Petugas bukan assignee mengubah pengajuan | `403`/`404`; tidak ada mutasi. |
| API-AC-22 | Permintaan revisi tanpa alasan | `422 VALIDATION_ERROR`. |
| API-AC-23 | Admin menerbitkan aturan baru | Versi baru; hasil lama tetap merujuk versi lama. |
| API-AC-24 | Publik mendaftarkan role admin | Request ditolak atau field role diabaikan; role istimewa tidak diberikan. |
| API-AC-25 | Chatbot diminta mengubah status | Tidak ada mutasi; jawaban mengarahkan ke alur resmi. |
| API-AC-26 | Dokumen berisi prompt injection | Tidak mengubah aturan/akses pemeriksaan. |
| API-AC-27 | Penghapusan dokumen diminta | Status penghapusan tercatat dan mengikuti seluruh turunan data sesuai kebijakan. |
| API-AC-28 | Demo menggunakan simulasi | Flag dan label simulasi muncul di semua event terkait. |
| API-AC-29 | Notifikasi pengingat dibuat | Tidak dinyatakan sebagai pembaruan status baru. |
| API-AC-30 | Sesi kedaluwarsa pada endpoint privat | `401`; tidak ada data pribadi pada response. |

---

## 22. Keputusan yang harus disepakati sebelum implementasi

| ID | Keputusan | Dampak kontrak |
|---|---|---|
| D-01 | Metode auth: bearer token atau cookie session | Header, refresh, CSRF, penyimpanan sesi. |
| D-02 | Base URL per environment dan CORS | Konfigurasi FE/BE. |
| D-03 | Stack, format validasi, dan standar error final | Implementasi schema. |
| D-04 | Pagination: page-based atau cursor-based per endpoint | Bentuk `meta`. |
| D-05 | Batas file, jumlah file, halaman, tipe MIME, timeout | Upload dan UI batas file. |
| D-06 | Upload langsung ke API atau signed upload URL | Flow upload dan keamanan storage. |
| D-07 | Provider OCR/LLM, lokasi pemrosesan, retensi dan biaya | Consent, error, evaluasi, dan privasi. |
| D-08 | Strategi progress: polling, SSE, atau WebSocket | Kontrak status async. |
| D-09 | Model formulir dinamis dan schema `form_data` | Field preparation dan validasi. |
| D-10 | Cakupan layanan, wilayah, instansi pilot | Data service/guide/rules. |
| D-11 | Versi dan schema rule engine | Kontrak admin/rule/inspection. |
| D-12 | Masa simpan dokumen, OCR, hasil, chat, audit, backup | Endpoint penghapusan dan retensi. |
| D-13 | Apakah chatbot menyimpan riwayat | Endpoint sesi chat dan kebijakan privasi. |
| D-14 | Apakah modul petugas hanya simulasi atau operasional | `simulation`, assignment, dan label status. |
| D-15 | Apakah ada integrasi pemerintah yang sah | Kontrak integrasi terpisah; tidak termasuk baseline ini. |
| D-16 | Notifikasi selain in-app | Provider, preference, dan delivery status. |
| D-17 | Definisi transisi status per layanan | Validasi status petugas. |
| D-18 | Retensi audit dan koreksi event | Perilaku koreksi serta penghapusan. |
| D-19 | Target performa, rate limit, kuota AI, dan timeout | SLA operasional dan error retry. |
| D-20 | Apakah signed URL atau endpoint streaming dipakai | Kontrak akses preview/download. |

---

## 23. Definition of Done kontrak BE–FE

Kontrak dianggap siap dipakai untuk implementasi jika:

- [ ] Base URL, autentikasi, dan refresh/session behavior disepakati.
- [ ] Request/response schema disimpan dalam OpenAPI atau format kontrak terstruktur.
- [ ] Semua enum dan kode error telah disetujui bersama.
- [ ] Contoh response sukses/error tersedia untuk setiap endpoint prioritas P0.
- [ ] FE dan BE sepakat atas status pemeriksaan dan status pengajuan yang terpisah.
- [ ] Idempotency, optimistic concurrency, dan retry behavior telah ditentukan.
- [ ] Otorisasi ownership dan assignment diuji di server.
- [ ] Batas unggahan dan kebijakan dokumen ditetapkan.
- [ ] Penyimpanan, pemrosesan eksternal, retensi, dan penghapusan data telah ditetapkan sebelum dokumen pribadi nyata digunakan.
- [ ] Label sumber status dan label simulasi disepakati.
- [ ] Panduan dan aturan memiliki versi serta sumber yang dapat ditelusuri.
- [ ] Test case acceptance API dijalankan oleh BE dan FE.
- [ ] Endpoint yang belum dibangun diberi status eksplisit di dokumentasi, bukan dianggap tersedia.

---

## 24. Catatan implementasi

1. **Prioritas P0:** autentikasi yang dipilih, katalog/panduan publik, evaluasi kebutuhan, persiapan, upload privat, pemeriksaan AI async, hasil/temuan, ringkasan/kanal resmi, pencatatan pengajuan, timeline bersumber, pengelolaan panduan/aturan berversi, dan kontrol akses.
2. **Prioritas P1:** chatbot kontekstual, notifikasi in-app, dashboard lebih lengkap, dan ruang kerja petugas sesuai kesiapan demonstrasi.
3. **Prioritas P2:** email/push, integrasi resmi, ekspansi wilayah/layanan, dan analitik agregat.
4. Kontrak ini menggunakan endpoint REST usulan. Nama path, field, kode status, dan skema harus dibekukan melalui review BE–FE sebelum implementasi.
5. Untuk kontrak produksi, turunkan spesifikasi ini menjadi OpenAPI 3.1 dengan schema reusable, security schemes, request/response examples, serta endpoint upload yang tepat. Markdown ini adalah dokumen kerja yang siap disalin dan ditinjau.

