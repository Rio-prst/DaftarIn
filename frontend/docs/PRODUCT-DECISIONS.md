# Keputusan produk dan UI/UX

Diperbarui 31 Oktober 2026 berdasarkan arahan pemilik produk.

## Pembaruan Arah Produk: Validasi Dasar + Tinjauan Manusia Petugas Pendamping (AI/OCR Ditunda)

1. **Dasar alur pelayanan KK daerah (bukan klaim integrasi SIAK)**:
   - Mengacu pada referensi prosedur pelayanan Kartu Keluarga daerah (Disdukcapil Kota Pekalongan `https://disdukcapil.pekalongankota.go.id/halaman/penerbitan-kartu-keluarga.html` dan Disdukcapil Kab. Ponorogo `https://dukcapil.ponorogo.go.id/persyaratan-mengurus-kartu-keluarga-kk/`): warga menyiapkan formulir dan persyaratan sesuai permohonan -> petugas memeriksa kelengkapan dan kesesuaian -> kekurangan dikembalikan dengan arahan perbaikan -> berkas yang sesuai diteruskan untuk pengolahan/pengesahan -> hasil diserahkan melalui kanal pelayanan resmi.
   - DaftarIn adalah produk pendamping persiapan & tinjauan awal, **bukan** sistem SIAK dan tidak mengklaim kewenangan menerbitkan dokumen resmi pemerintah.
2. **Pemisahan peran Validasi Dasar, Tinjauan Petugas, dan AI/OCR**:
   - **Validasi dasar aplikasi**: memeriksa konfirmasi kebutuhan (Tahap 1), format isian wajib pemohon (Tahap 2: Nama, 16 digit NIK, 16 digit Nomor KK, alamat, alasan), serta keberadaan berkas persyaratan wajib dengan jenis PDF/JPG/PNG dan ukuran ≤ 5 MB (Tahap 3).
   - **Tinjauan petugas pendamping**: pemeriksaan manusia atas data dan berkas yang dibagikan warga setelah warga menekan tombol kirim pada Tahap 4.
   - **Analisis AI/OCR**: ditunda sebagai kemampuan tambahan berikutnya. Tidak tersedianya OCR/LLM atau penggunaan berkas perangkat pengguna (`user_file`) **tidak menghalangi** warga mengirim berkas untuk ditinjau petugas maupun mengirim perbaikan. Aplikasi tidak pernah mengklaim isi dokumen sudah sesuai hanya karena validasi dasar lolos.
3. **4 Tahap Persiapan Sebelum Kirim (`1. Kebutuhan → 2. Data → 3. Dokumen → 4. Tinjau & kirim`)**:
   - Tahap pra-pengiriman warga disederhanakan menjadi 4 langkah: **Kebutuhan**, **Data**, **Dokumen**, dan **Tinjau & kirim**.
   - Pekerjaan petugas setelah berkas dikirim ditampilkan pada halaman status tinjauan & pelacakan (`/pelacakan`), bukan di dalam stepper persiapan warga.
   - Halaman `/persiapan/pemeriksaan` tetap dipertahankan sebagai rincian validasi & simulasi aturan opsional agar tautan lama tetap berjalan aman.
4. **Pemisahan Draf Pribadi, Tinjauan Awal DaftarIn (`TINJAU-2026-XXXX`), dan Pengajuan Resmi Instansi**:
   - Draf persiapan (`PREP-2026-XXXX`) bersifat privat di akun warga sampai warga secara eksplisit mencentang persetujuan pembagian dan menekan **"Kirim untuk ditinjau petugas"**.
   - Pengiriman membuat permintaan tinjauan ber-ID internal `TINJAU-2026-XXXX` (bukan nomor registrasi instansi) dengan salinan kiriman beku (`SubmissionSnapshot`) yang ditugaskan ke antrean petugas contoh (`officer-budi`). Mengedit draf setelah dikirim tidak mengubah salinan yang sedang dilihat petugas sampai warga menekan **"Kirim perbaikan untuk ditinjau"**.
   - Status tinjauan awal DaftarIn menggunakan label yang jelas: **Belum dikirim**, **Menunggu tinjauan**, **Sedang ditinjau**, **Perlu perbaikan**, **Perbaikan dikirim**, dan **Tinjauan awal selesai**.
   - Catatan pengajuan kanal resmi dan konfirmasi penerimaan hasil layanan pemerintah disimpan secara terpisah pada `official_submission` dengan sumber eksplisit **"Dilaporkan warga"** dan **tidak pernah menimpa** status tinjauan petugas pendamping.
5. **Penyimpanan Berkas Browser (IndexedDB Blob) & Kejujuran Pratinjau**:
   - Untuk frontend dummy, isi berkas unggahan warga (PDF/JPG/PNG hingga **5 MB**) disimpan sebagai `Blob` di **IndexedDB** (`daftarin_file_storage_v1`), bukan sebagai Data URL besar di dalam satu objek JSON `localStorage`. Penyimpanan browser ini hanya untuk simulasi frontend lokal dan **belum menggantikan penyimpanan privat pada backend (S3/MinIO)**.
   - Setiap versi berkas (`v1`, `v2`) memiliki kunci penyimpanan sendiri dan tidak dihapus otomatis ketika melebihi 8 unggahan, sehingga riwayat versi kiriman (`Kiriman #1`, `Kiriman #2`) tetap menampilkan berkas yang sesuai.
   - Dokumen contoh bawaan ditentukan murni dari metadata eksplisit (`fixtureId` dan `qualityPreset`), bukan dari nama file. Berkas warga bernama `contoh-kk.pdf` tidak pernah ditampilkan sebagai lembar contoh sintetis.
6. **Aturan Penyelesaian Tinjauan Petugas**:
   - Alur status utama petugas: **Menunggu tinjauan / Perbaikan dikirim → Sedang ditinjau → Perlu perbaikan atau Tinjauan awal selesai**.
   - Petugas hanya dapat menyelesaikan tinjauan setelah masuk status **Sedang ditinjau**, seluruh berkas wajib tersedia, data pemohon serta seluruh berkas dinilai eksplisit sebagai **Sesuai**, dan petugas menuliskan catatan hasil tinjauan sendiri (tanpa teks klaim default). Membuka modal pratinjau saja tidak otomatis menandai berkas sebagai **Sesuai**.

## Sumber desain

Google Stitch adalah referensi awal. Perubahan desain berikutnya dikerjakan langsung di frontend. Tidak perlu mempertahankan halaman, tata letak, atau elemen yang tidak mendukung kebutuhan pengguna.

## Pengguna muda hingga lansia

- Pertahankan bahasa Indonesia yang sederhana, label formulir nyata, dan kesalahan yang menjelaskan cara memperbaiki isian.
- Ukuran input 16 px, sasaran tombol utama setidaknya sekitar 44–48 px, serta kontras teks yang jelas.
- Satu judul halaman; susunan bagian dan navigasi konsisten. Tampilan HP adalah versi responsif dari web.
- Tindakan tidak dibedakan melalui warna saja. Status yang ditampilkan harus berkaitan dengan pekerjaan nyata.
- Dukungan fokus keyboard, tautan lewati ke isi, tombol tampilkan kata sandi, dan menu yang bisa ditutup.
- Chatbot adalah bantuan opsional bagi warga yang kebingungan, bukan syarat menyelesaikan proses.

## Pemilihan layanan percontohan utama (Pilot Service)

Layanan **Pembaruan Data Kartu Keluarga (KK)** (`service_id: 1`, `slug: "pembaruan-kartu-keluarga"`, instansi `Disdukcapil Kota Contoh`) ditetapkan sebagai layanan percontohan perjalanan lengkap dari hulu ke hilir dengan alasan berikut:

1. Sudah terhubung langsung dengan pengajuan contoh `CONTOH-KK-001` (`sample-kk-01`) milik akun warga contoh (`warga@daftarin.test`) yang berstatus `PERLU_PERBAIKAN` dan ditugaskan kepada petugas contoh (`petugas@daftarin.test` / `officer-budi`).
2. Memiliki variasi kondisi permohonan yang nyata (pembaruan elemen biodata umum, perubahan status perkawinan, penambahan anggota keluarga/kelahiran, pengurangan anggota keluarga) yang secara dinamis menentukan dokumen mana yang **Wajib** dan mana yang **Opsional**.
3. Memiliki aturan pemeriksaan aktif di panel Admin (`rule-required`, `rule-image`, `rule-name`) sehingga perubahan aturan oleh Admin langsung memengaruhi hasil pemeriksaan draf warga.

## Pemisahan Setiap Urusan (`PreparationRecord`) dan Pemeriksaan Berbasis Bukti

- **Model persiapan mandiri (`PreparationRecord`)**:
  - Setiap persiapan warga disimpan sebagai entitas terpisah dengan ID unik (`prep-...`) dan referensi berurutan (`PREP-2026-0001`, `PREP-2026-0002`, dst.).
  - Satu akun warga dapat membuat beberapa persiapan untuk layanan yang sama (misalnya dua pembaruan KK untuk anggota keluarga berbeda) tanpa saling menimpa `formData`, `documents`, maupun riwayat `inspections`.
  - Parameter URL `?prep=<id>` digunakan secara konsisten di seluruh tahapan persiapan (`/persiapan/kebutuhan`, `/persiapan/data`, `/persiapan/dokumen`, `/persiapan/pemeriksaan`, `/persiapan/ringkasan`).
- **Pemeriksaan awal berbasis bukti (tanpa heuristik nama file, tanpa auto-pass versi, dan tanpa menjadikan konfirmasi mandiri sebagai hasil pemeriksaan otomatis)**:
  - Nama berkas (seperti `terpotong` atau `buram`) dan nomor versi dokumen (`Versi 2`) tidak pernah dijadikan bukti otomatis bahwa isi dokumen terbaca atau masalah sudah selesai.
  - Pemeriksaan memisahkan 4 cakupan eksplisit: `format_formulir`, `keberadaan_berkas`, `analisis_isi_dokumen`, dan `aturan_admin`.
  - Preset pengujian contoh ditandai secara jujur sebagai `[Simulasi Fixture]`, sedangkan berkas nyata yang diunggah pengguna dari perangkat ditandai sebagai `not_evaluated` (`warning`) karena layanan OCR/AI backend belum terhubung.
  - Catatan pemeriksaan mandiri warga disimpan sebagai `userCorrection` dengan sumber jelas (`"Catatan pemeriksaan mandiri warga (bukan hasil evaluasi otomatis sistem)"`) dan **tidak pernah** mengubah temuan `not_evaluated` menjadi selesai atau menghasilkan status `SIAP_AWAL`.
- **Snapshot validitas pemeriksaan (`InspectionSnapshot`) & prasyarat terpadu**:
  - Hasil pemeriksaan menyimpan `dataSignature`, `docSignature`, `guideSignature` (versi dan rincian persyaratan panduan layanan), serta `rulesSignature` (ID, versi, kategori, tingkat keparahan, dan teks aturan aktif admin).
  - Perubahan pada salah satu dari keempat komponen tersebut otomatis mengubah status persiapan menjadi `PERLU_PERIKSA_ULANG`.
  - Data lama hasil migrasi (`prep-meta:v2`/`v1`) tidak diberi signature atau cakupan pemeriksaan masa kini secara palsu, melainkan ditandai `legacyUnverifiedSnapshot: true` sehingga wajib diperiksa ulang.
  - Status `SIAP_AWAL` mewajibkan seluruh prasyarat tahap (`step1Kebutuhan`, `step2Data`, seluruh berkas wajib terunggah, dan `consentAccepted === true`) serta seluruh cakupan pemeriksaan otomatis wajib selesai tanpa temuan `not_evaluated` atau `error`. Mencabut persetujuan pemrosesan langsung menurunkan status kesiapan menjadi `PERLU_DILENGKAPI`.
- **Pencatatan pengajuan, revisi terikat ketat, dan pelacakan**:
  - Pengajuan baru yang dicatat warga diberi status `DICATAT_WARGA` dengan label sumber `"Catatan warga — belum dikonfirmasi instansi"`. Warga dapat mencatat pengajuan yang sudah dilakukan di luar aplikasi tanpa harus memalsukan status pemeriksaan awal DaftarIn menjadi lulus.
  - Pengajuan yang berstatus `PERLU_PERBAIKAN` divalidasi melalui `resolveApplicationPreparationLink()` agar terikat 1-ke-1 dengan `preparation_id` asalnya, menolak pencocokan hanya dari kesamaan layanan (`service_id`), menolak kombinasi `?prep=` dan `?application=` yang tidak cocok, serta mempertahankan nomor pengajuan yang sama.

## Pembaruan persyaratan pendaftaran

Arahan pengguna terbaru meminta NIK dan foto KTP pada pendaftaran warga, meskipun PRD awal F-02 menyebut tidak memintanya hanya untuk membuat akun. Implementasi frontend mengikuti arahan terbaru.

Data tetap dummy. Formulir menyediakan isian identitas dan ilustrasi KTP contoh. Format 16 angka tidak berarti NIK telah diverifikasi. Foto hanya dipratinjau dan metadata disimpan; belum ada pemeriksaan identitas pemerintah.

## Peran dan sumber informasi

- Pendaftaran publik membuat warga saja. Akun petugas dibuat admin.
- Draf warga dibatasi menurut akun. Petugas melihat pengajuan yang ditugaskan; admin mengelola panduan/aturan/akun tanpa akses otomatis ke dokumen warga.
- Panduan contoh mencantumkan secara jujur bahwa tautan rujukan mengarah ke portal regulasi umum dan standar pelayanan instansi daerah belum diverifikasi otomatis.

## Pekerjaan frontend saat ini

Alur akun, dashboard warga, daftar persiapan per urusan (`PreparationRecord`), pemeriksaan berbasis bukti & snapshot, pencatatan/perbaikan pengajuan, panel petugas, dan panel admin disiapkan untuk dicoba dengan data contoh. Sistem AI/OCR server, email, autentikasi server, penyimpanan privat, dan integrasi pemerintah dikerjakan pada tahap backend.

Pengguna meminta melakukan pengecekan tampilan dan alur sendiri. Jangan menjalankan pengujian browser atau otomatis tanpa arahan baru.
