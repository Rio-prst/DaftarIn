# Chatbot: sambungan frontend dan backend

## Implementasi aktif

Frontend `src/utils/aiService.ts` mengirim `query`, `serviceId` opsional (angka 1–6), dan maksimum empat pesan `history` ke `POST /api/chat/messages`. URL mengikuti `VITE_API_URL`. Endpoint publik ini tidak memerlukan login.

Backend yang aktif adalah `backend/src/chat/chat.module.ts`, diimpor oleh `AppModule`. Controller dan service berada dalam file modul tersebut. Pembacaan env disatukan dalam `chat.config.ts`; implementasi controller/service/DTO lama yang tidak terdaftar sudah dihapus.

Respons sukses dibungkus dalam `data`, berisi `text`, `actionSteps`, `legalCitations`, `quickAction` opsional, dan `source: ai`. Frontend menggunakan panduan lokal dengan pemberitahuan jika server/provider gagal. Riwayat chat disimpan di sessionStorage browser, bukan database. Chat tersedia untuk pengunjung dan warga.

## Environment

Frontend hanya memerlukan URL backend, misalnya:

```env
VITE_API_URL=https://daftar-api-eta.vercel.app/api
```

Atur variabel berikut pada proyek **backend** Vercel, lalu redeploy:

```env
CHAT_AI_PROVIDER=openai_compatible
CHAT_AI_BASE_URL=https://atmorouter.dev/v1
CHAT_AI_API_KEY=ISI_KEY_PRIVAT
CHAT_AI_MODEL=ISI_MODEL_YANG_TERSEDIA
CHAT_AI_FALLBACK_MODEL=ISI_MODEL_CADANGAN_YANG_TERSEDIA
```

Model cadangan opsional. Jika memilih Gemini langsung, gunakan `CHAT_AI_PROVIDER=gemini`, `CHAT_GEMINI_API_KEY`, dan `CHAT_GEMINI_MODEL`. Gemini langsung tidak menjadi fallback otomatis dari AtmoRouter; fallback model AtmoRouter tetap memakai provider dan key yang sama.

`CORS_ORIGIN` backend harus memuat origin frontend. Key tidak boleh memakai awalan `VITE_`, berada di Git, atau dikirim ke browser. Redis/BullMQ tidak dipakai pada jalur chatbot aktif.

## Pemeriksaan setelah env dipasang

`GET /api/chat/status` mengembalikan `data.configured: true` jika provider, key, dan model terisi. Array `data.missing` menyebut `provider`, `api_key`, atau `model` yang belum sesuai, tanpa nilai rahasia. Nilai configured **tidak membuktikan** key/model diterima provider. Kirim satu pertanyaan umum melalui chat dan pastikan respons berasal dari `source: ai`, bukan panduan lokal. Jangan gunakan dokumen atau identitas pribadi untuk percobaan.

Untuk migrasi konfigurasi lama, backend juga membaca `OPENAI_*`, `GEMINI_*`, serta `VITE_AI_PROVIDER` / `VITE_OPENAI_*` / `VITE_GEMINI_*` yang dipasang pada server. Nama `CHAT_*` diprioritaskan. Provider dinormalisasi dari huruf besar/kecil dan spasi; `CHAT_AI_PROVIDER=disabled` tetap menonaktifkan chat. Alias ini bukan izin menaruh key di frontend. `AI_PROVIDER=disabled` untuk pemeriksaan dokumen tidak menonaktifkan chatbot.

Server membatasi input, riwayat, token keluaran, waktu panggilan provider, dan frekuensi request. Jawaban AI bukan keputusan pemerintah. Pengaturan env saja belum membuktikan kesiapan produksi atau ketepatan jawaban.
