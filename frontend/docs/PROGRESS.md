# Progres frontend DaftarIn

Dilanjutkan dan diperbarui 31 Oktober 2026. Seluruh pembaruan frontend telah dipush ke `feat/frontend`, setelah sebelumnya disimpan pada branch `codex/frontend-flow-and-responsive-fixes`. Informasi branch dan lingkup perubahan tersedia di `INFORMASI-BRANCH.txt`; laporan teks biasa tersedia di `frontend/docs/LAPORAN-PEMBARUAN.txt`.

## Perbaikan hasil pengujian browser (31 Oktober 2026)

- Memperbaiki halaman Kebutuhan, panduan layanan, ringkasan, dan pelacakan yang melebar pada ponsel.
- Modal pratinjau memakai dialog native, fokus awal dan pemulihan fokus, Tab/Shift+Tab, latar inert, penguncian scroll, serta Escape termasuk pada frame PDF.
- Uji ulang: 47 pemeriksaan fungsi lolos, 66 kombinasi halaman/peran/lebar layar tanpa overflow, 0 error JavaScript.
- Build dan lint berhasil; peringatan React yang telah ada dan ukuran bundel >500 kB masih tersisa.
- Detail: [laporan perbaikan dan uji ulang](./LAPORAN-PERBAIKAN-2026-10-31.txt).
## Selesai pada finalisasi penyimpanan berkas IndexedDB, pratinjau per versi kiriman, penilaian eksplisit petugas, dan pemisahan status hasil layanan (31 Oktober 2026)

1. **Penyimpanan Berkas Nyata Berbasis IndexedDB Blob (`frontend/src/utils/fileStorage.ts` & `PreparationDocsPage.tsx`)**:
   - Menyamakan batas unggahan **5 MB** (`MAX_UPLOAD_FILE_BYTES = 5 * 1024 * 1024`) dengan kemampuan penyimpanan dan pratinjau menggunakan IndexedDB (`daftarin_file_storage_v1` / store `file_blobs`), tanpa menyimpan PDF/gambar besar sebagai Data URL di dalam satu objek JSON `localStorage`.
   - `readAndStoreUploadedFile()` membaca isi berkas, menulis `Blob` ke IndexedDB, dan memverifikasi hasil simpan sebelum metadata dokumen ditandai `TERUNGGAH`.
   - Jika pembacaan atau penyimpanan gagal, aplikasi menampilkan pesan error yang dapat ditindaklanjuti, tidak menambahkan metadata `TERUNGGAH`, dan mempertahankan berkas versi sebelumnya pada slot tersebut.
   - Mengikat proses unggah yang sedang berjalan ke `prepId` dan `slotId` asal (`addDocument(doc, ctx.prepId)`) sehingga perpindahan draf saat pembacaan file berlangsung tetap menyimpan berkas ke draf dan slot asal.
   - Memvalidasi ketersediaan isi berkas wajib (`unavailableRequiredDocs` dan `isDocumentContentAvailable`) saat mengirim permintaan tinjauan (`submitForOfficerReview`) maupun revisi (`resubmitApplication`).
2. **Pelestarian Pratinjau Sesuai Versi Kiriman & Penghapusan Heuristik Nama File (`DocumentPreviewModal.tsx`)**:
   - Menghapus pemotongan otomatis 8 entri pratinjau. Setiap versi berkas (`v1`, `v2`, dst.) disimpan dengan ID unik per versi sehingga `submitted_snapshot` dan `submission_history` (`Kiriman #1`, `Kiriman #2`) selalu membuka berkas sesuai versi kirimannya.
   - Penentuan dokumen contoh bawaan (`isBuiltInSampleDocument` dan `isCroppedSampleDocument`) kini murni menggunakan metadata eksplisit (`fixtureId` dan `qualityPreset: "sample_issue" | "sample_clean"`), tanpa pencocokan substring nama file (`"contoh"`, `"terpotong"`, `"simulasi"`, `"fixture"`). Berkas warga bernama `contoh-kk.pdf` (`qualityPreset: "user_file"`) menampilkan isi file asli warga atau status **"Berkas tidak tersedia"** apabila Blob-nya tidak ditemukan.
3. **Perbaikan Penyelesaian Tinjauan Petugas (`OfficerPage.tsx` & `AppContext.tsx`)**:
   - Menegakkan alur transisi utama: **Menunggu tinjauan (`DITERIMA`) / Perbaikan dikirim (`PERLU_PERBAIKAN` + `revision_pending`) → Sedang ditinjau (`VERIFIKASI`) → Perlu perbaikan (`PERLU_PERBAIKAN`) atau Tinjauan awal selesai (`SELESAI`)**.
   - Menghapus teks default pada `completeNote` dan mewajibkan penilaian eksplisit (`Sesuai` | `Perlu perbaikan` | `Belum dapat diperiksa`) untuk data pemohon dan setiap berkas persyaratan pada versi kiriman aktif.
   - Membuka modal pratinjau tidak otomatis menandai berkas sebagai `Sesuai`, dan berkas yang tidak tersedia tidak dapat ditandai `Sesuai` maupun meloloskan penyelesaian tinjauan.
   - Menyimpan keputusan, alasan, nama petugas, waktu, `submissionVersion`, dan penilaian per item ke `latest_evaluation` serta `evaluation_history`.
4. **Pemisahan Status Tinjauan Pendamping dan Hasil Layanan Pemerintah (`AppContext.tsx`, `TrackingPage.tsx`, `DashboardPage.tsx`)**:
   - Memisahkan status draf persiapan, status tinjauan pendamping DaftarIn (`getReviewStatusLabel`), dan status pengajuan/penerimaan hasil layanan pemerintah (`getOfficialSubmissionStatusLabel`).
   - `confirmApplicationResult()` menyimpan penerimaan hasil layanan pada `official_submission` (`status: "HASIL_DITERIMA_WARGA"`) dan linimasa dengan sumber **"Dilaporkan warga"** tanpa menimpa status tinjauan petugas (`current_status` tetap `"SELESAI"` / `"Tinjauan awal selesai"`).

## Selesai pada pembaruan arah produk: Validasi Dasar + Tinjauan Petugas Manusia & Penundaan AI/OCR (31 Oktober 2026)

1. **Pemisahan Validasi Dasar, Tinjauan Petugas, dan Analisis AI/OCR**:
   - Memperbarui `computePreparationReadiness()` di `types/preparation.ts` serta syarat pengiriman di `AppContext.tsx` (`submitForOfficerReview` dan `resubmitApplication`) agar kelanjutan proses ditentukan oleh **validasi dasar aplikasi** (`basicValidationPassed`: Tahap 1, Tahap 2, dan berkas wajib Tahap 3) + persetujuan pembagian (`consentAccepted`).
   - Berkas yang diunggah langsung dari perangkat warga (`user_file`) dapat langsung dikirim untuk ditinjau petugas tanpa harus memakai fixture simulasi dan tanpa terblokir oleh belum tersedianya OCR/LLM.
   - Mempertahankan adapter `evaluatePreparationDraft()` untuk pengembangan AI berikutnya pada halaman opsional `/persiapan/pemeriksaan`.
2. **Stepper 4 Tahap Pra-Pengiriman & Tahap 4 "Tinjau & kirim"**:
   - Memperbarui `PreparationStepper.tsx` menjadi 4 tahap: **1. Kebutuhan → 2. Data → 3. Dokumen → 4. Tinjau & kirim**.
   - Memperbarui `PreparationSummaryPage.tsx` menjadi halaman **Tinjau & kirim berkas** yang menampilkan ringkasan validasi dasar, data & dokumen yang akan dibagikan (dengan tombol **Lihat berkas**), unit penerima (`Unit Tinjauan Pendamping Adminduk — Budi Santoso`), perbedaan tinjauan DaftarIn vs pengajuan resmi instansi, kotak persetujuan pembagian, ringkasan perubahan sejak kiriman sebelumnya (`liveChangesFromSnapshot`), serta tombol **"Kirim untuk ditinjau petugas"** / **"Kirim perbaikan untuk ditinjau"**.
3. **Snapshot Kiriman Beku (`SubmissionSnapshot`) & Pratinjau Berkas Lintas Akun (`DocumentPreviewModal.tsx`)**:
   - Menambahkan `SubmissionSnapshot`, `SubmittedAttachment`, `OfficerRevisionDetail`, dan `OfficialSubmissionRecord`.
   - Saat warga menekan kirim, aplikasi membekukan `submitted_snapshot` dan menyimpannya ke `submission_history` dengan kode internal `TINJAU-2026-XXXX`. Perubahan draf setelah kirim ditandai sebagai `hasUnsentDraftChanges` dan tidak memutasi tampilan petugas secara diam-diam.
   - Membuat komponen `DocumentPreviewModal.tsx` beserta penyimpanan pratinjau demo lintas akun (`daftarin:shared-file-previews:v1`) sehingga berkas contoh berwatermark `CONTOH · BUKAN DOKUMEN RESMI` (baik KK terpotong v1 maupun KK utuh v2) dan berkas unggahan warga (≤ 1,5 MB) dapat dibuka dan diperiksa oleh warga maupun petugas.
4. **Panel Petugas (`OfficerPage.tsx`) untuk Pemeriksaan Manusia Terstruktur**:
   - Hanya menampilkan permintaan yang sudah dikirim warga dan ditugaskan ke petugas (`assigned_officer_id === user.id`).
   - Menampilkan identitas pemohon, subjek pengurusan, kondisi, persyaratan wajib layanan, isian formulir lengkap dari `submitted_snapshot`, daftar lampiran dengan tombol **"Buka pratinjau berkas"**, serta riwayat versi kiriman (`submission_history`).
   - Menyediakan 3 aksi terstruktur petugas: **1. Mulai tinjauan** (`officerStartReview`), **2. Minta perbaikan** (`officerRequestRevision` — memilih dokumen/field sasaran, kategori masalah: *Berkas tidak lengkap*, *Berkas sulit dibaca / bagian terpotong*, *Data isian tidak sesuai dokumen*, atau *Perlu klarifikasi tambahan*, penjelasan masalah, dan tindakan yang diminta), serta **3. Selesaikan tinjauan awal** (`officerCompleteReview`).
5. **Pemisahan Status Tinjauan DaftarIn vs Pengajuan Kanal Resmi di `TrackingPage.tsx`, `PreparationListPage.tsx`, dan `DashboardPage.tsx`**:
   - Menampilkan dua panel status terpisah di `TrackingPage.tsx`: (1) **Tinjauan Awal Pendamping DaftarIn** (`Belum dikirim`, `Menunggu tinjauan`, `Sedang ditinjau`, `Perlu perbaikan`, `Perbaikan dikirim`, `Tinjauan awal selesai`) dan (2) **Pengajuan di Kanal Resmi Instansi** (`Dicatat warga` / `Hasil layanan diterima warga`).

## Selesai pada revisi penutupan 5 celah alur & data (31 Oktober 2026)

1. **Konfirmasi mandiri warga tidak menjadi hasil pemeriksaan otomatis (`SIAP_AWAL`)**:
   - Menghapus `"citizen_confirmed"` dari `EvaluationStatus` dan memperbarui `confirmFindingCorrection()` di `AppContext.tsx` agar temuan dengan `evaluationStatus === "not_evaluated"` (berkas perangkat pengguna `user_file` atau aturan tambahan admin tanpa evaluator otomatis) tetap berstatus `evaluationStatus: "not_evaluated"` dan `resolved: false`.
   - Catatan pemeriksaan mandiri warga disimpan sebagai `userCorrection` dengan waktu dan sumber eksplisit (`"Catatan pemeriksaan mandiri warga (bukan hasil evaluasi otomatis sistem)"`).
   - `computePreparationReadiness()` memeriksa kelengkapan cakupan pemeriksaan otomatis wajib (`getRequiredInspectionScopes()`, `missingScopes`, dan `notEvaluatedFindings`) sehingga konfirmasi mandiri warga tidak pernah mengubah item `not_evaluated` menjadi `SIAP_AWAL`.
2. **Pengikatan ketat revisi pengajuan ke persiapan asal (`resolveApplicationPreparationLink`)**:
   - Menambahkan helper validasi terpusat `resolveApplicationPreparationLink()` di `types/preparation.ts` dan menggunakannya secara konsisten di `AppContext.tsx`, `PreparationLayout.tsx`, `TrackingPage.tsx`, dan `PreparationSummaryPage.tsx`.
   - Menolak pencocokan draf berdasarkan kesamaan `serviceId` semata, menolak fallback ke `activePreparation`, dan menolak kombinasi `?prep=` serta `?application=` yang tidak cocok.
   - Menyediakan tindakan eksplisit `createLinkedRevisionPreparation()` apabila ada pengajuan lama yang belum memiliki ikatan `preparation_id` yang dapat dibuktikan.
3. **Penanganan deterministik untuk `?prep=<id>` yang tidak valid & perpindahan draf**:
   - `PreparationLayout.tsx` menampilkan keadaan **"Persiapan tidak ditemukan"** dengan tindakan kembali ke `/persiapan` ketika parameter `?prep=` tidak ditemukan pada draf milik pengguna, tanpa menampilkan atau memutasi `activePreparation`.
   - Menahan render `{children}` dan `{actions}` selama 1 siklus sinkronisasi ketika `activePreparation.id !== resolvedPrep.id` serta memberi `key={activePreparation.id}` agar reload halaman, perpindahan antardraf, dan tombol Back/Forward browser selalu deterministik.
4. **Penyatuan prasyarat tahap dengan status kesiapan (`computePreparationReadiness`)**:
   - Mewajibkan `step1Kebutuhan`, `step2Data`, kelengkapan dokumen wajib, dan `consentAccepted === true` sebagai prasyarat sebelum draf dapat berstatus `PERLU_DITINJAU` atau `SIAP_AWAL`.
   - Mencabut centang persetujuan pemrosesan setelah pemeriksaan selesai langsung menurunkan status kesiapan menjadi `PERLU_DILENGKAPI` dan menonaktifkan penyelesaian Tahap 3 serta Tahap 4.
5. **Kejujuran bukti pemeriksaan pada migrasi data browser lama (`loadOrMigratePreparations`)**:
   - Menghapus pengisian `currentGuideSig`, `currentRulesSig`, dan `evaluatedScopes` saat memigrasikan snapshot dari `prep-meta:v2` atau `prep-meta:v1`.
   - Menandai snapshot migrasi lama dengan `legacyUnverifiedSnapshot: true` dan `evaluatedScopes: []` sehingga otomatis berstatus `PERLU_PERIKSA_ULANG` sampai diperiksa ulang oleh warga. Menekan **"Tandai sudah ditinjau"** hanya menutup catatan migrasi tanpa mengesahkan hasil pemeriksaan.

## Selesai pada revisi arsitektur PreparationRecord, pemeriksaan berbasis bukti, dan penyatuan aturan tahap

1. **Pemisahan setiap urusan persiapan (`PreparationRecord`) dengan ID unik (`daftarin:<userId>:preparations:v3`)**:
   - Mengganti penyimpanan `formData`, `documents`, `inspections`, dan `prepMetaByService` yang sebelumnya berbagi satu state per akun/layanan menjadi daftar `PreparationRecord` mandiri.
   - Setiap persiapan memiliki `id` unik (`prep-...`), `internalReference` berurutan (`PREP-2026-XXXX`), `applicantTarget` (`diri_sendiri` vs `anggota_keluarga`), `conditionKey`, `needConfirmed`, `formData`, `documents`, `consentAccepted`, `inspections`, `lastInspectionSnapshot`, dan `linkedApplicationId`.
   - Seluruh halaman tahapan persiapan (`/persiapan/kebutuhan`, `/persiapan/data`, `/persiapan/dokumen`, `/persiapan/pemeriksaan`, `/persiapan/ringkasan`) serta `PreparationLayout` dan `PreparationStepper` mempertahankan parameter URL `?prep=<id>` (dan `&application=<appId>`).
   - Dua pengurusan untuk layanan yang sama (mis. dua pembaruan KK untuk anggota keluarga berbeda) kini tersimpan terpisah tanpa saling menimpa.
   - Menyediakan migrasi otomatis dari penyimpanan browser lama (`prep-meta:v2`, `prep-meta:v1`, `form`, `documents`, `inspections`) lengkap dengan `migrationNote` apabila data lama berbagi satu `formData` untuk beberapa layanan.
2. **Pemeriksaan berkas berbasis bukti (`evaluatePreparationDraft` di `types/preparation.ts`)**:
   - Menghapus heuristik nama file (`terpotong`, `buram`) dan menghapus kesimpulan otomatis `docVer > 1` yang sebelumnya menganggap unggahan versi baru otomatis terbaca utuh.
   - Memisahkan pemeriksaan ke dalam 4 cakupan (`scope`): `format_formulir`, `keberadaan_berkas`, `analisis_isi_dokumen`, dan `aturan_admin`.
   - Berkas fixture simulasi (`sample_issue` dan `sample_clean`) diberi label eksplisit `[Simulasi Fixture]`, sedangkan berkas yang dipilih pengguna dari perangkat (`user_file`) ditandai sebagai `not_evaluated` (`warning`) karena OCR/AI backend belum terhubung.
   - Aturan tambahan admin yang belum memiliki evaluator otomatis dicatat sebagai `not_evaluated` (`warning`), bukan langsung dianggap selesai.
3. **Penyatuan aturan perpindahan tahap & validitas `InspectionSnapshot`**:
   - Menghapus pemanggilan `confirmNeedStep()` diam-diam dari `PreparationDataPage.tsx`. Tahap 1 hanya selesai jika dikonfirmasi pengguna pada `PreparationNeedPage.tsx`.
   - Menyatukan aturan penyelesaian 5 tahap di `computePreparationReadiness()`: Tahap 3 mewajibkan berkas wajib lengkap + `consentAccepted`, Tahap 4 mewajibkan pemeriksaan tidak usang + 0 error, dan Tahap 5 terikat pada `linkedApplicationId` milik persiapan tersebut.
   - Validitas pemeriksaan (`InspectionSnapshot`) membandingkan `dataSignature`, `docSignature`, `guideSignature` (versi + daftar syarat panduan), dan `rulesSignature` (ID, versi, kategori, tingkat keparahan, dan teks aturan aktif admin).
   - Mengamankan `runAIScanSimulation()` dengan penguncian per `prepId`, snapshot input saat pemeriksaan dimulai, dan pembatalan tulis apabila data/berkas berubah saat timer berjalan.
4. **Pelestarian konteks tamu, pengaitan revisi pengajuan, dan penanganan `PERLU_DITINJAU`**:
   - Menyimpan pilihan layanan, wilayah, dan kondisi tamu di `sessionStorage` (`daftarin:guest-intent:v1`) serta mengizinkan path `/persiapan/kebutuhan?...` pada `permittedReturnPath()` saat login/registrasi.
   - Mengaitkan `ApplicationRecord` dengan `preparation_id` (`sample-kk-01` -> `prep-sample-kk-01`) pada `TrackingPage.tsx` dan `PreparationSummaryPage.tsx`.
   - Menangani status `PERLU_DITINJAU` secara eksplisit di `PreparationSummaryPage.tsx` serta memisahkan tampilan ringkasan, status kesiapan pemeriksaan awal, pencatatan revisi pengajuan, dan pencatatan pengajuan luar aplikasi (`DICATAT_WARGA`).

## Selesai pada revisi konsistensi navigasi, tahapan persiapan, dan penyederhanaan UI sebelumnya

1. **Konsistensi layout ruang warga vs. publik (`/katalog`, `/panduan`, `/layanan/:id`)**:
   - Warga yang sudah masuk tetap berada di dalam layout ruang kerja warga (`Sidebar`, `TopBar`, navigasi mobile, `.workspace-content`) saat membuka **Cari layanan** maupun **Panduan layanan**, sementara pengunjung yang belum masuk tetap menggunakan layout publik (`Navbar` & `Footer`).
   - Isi katalog dan panduan menggunakan satu komponen bersama (`CatalogContent` dan `ServiceGuideContent`) sehingga tidak ada duplikasi logika.
   - Penanda navigasi aktif (`isNavItemActive` di `navigation.ts`) menyorot menu **Cari layanan** saat berada di `/katalog`, `/panduan`, atau `/layanan/:id`, serta menyorot **Persiapan saya** saat berada di `/persiapan` maupun seluruh sub-tahap `/persiapan/*`.
2. **Halaman daftar "Persiapan saya" (`/persiapan`) & perbaikan 5 tahap persiapan**:
   - Menu **Persiapan saya** membuka daftar persiapan warga (`/persiapan` — `PreparationListPage.tsx`). Akun warga baru menampilkan keadaan kosong dengan tombol **Mulai persiapan baru**.
   - Tahap 1 (**Kebutuhan** — `/persiapan/kebutuhan` — `PreparationNeedPage.tsx`) memuat pilihan layanan/wilayah, untuk siapa pengurusan dilakukan (`Diri sendiri` vs `Anggota keluarga`), serta kondisi permohonan yang menentukan dokumen wajib.

## Kondisi backend & batas pekerjaan saat ini

- Hasil pemeriksaan kode `backend/src/` menunjukkan backend masih berupa scaffold awal NestJS 11 (`AppController` -> `"Hello World!"`) tanpa modul `/api/v1/*`, autentikasi server, atau Prisma/PostgreSQL.
- Oleh karena itu, frontend menggunakan adapter browser (`localStorage` untuk data dan `sessionStorage` untuk sesi) dengan batas klaim produk yang jujur.
- Sistem OCR/LLM server, penyimpanan file privat (S3/MinIO), pengiriman email, verifikasi NIK pemerintah, dan sinkronisasi antrean instansi masih menunggu implementasi backend.
- Pengecekan tampilan dan alur diserahkan kepada pengguna; tidak menjalankan tes browser atau otomatis sesuai arahan. Build frontend diverifikasi dengan `npm run build` (`tsc -b && vite build`).

## Akun contoh

Kata sandi awal semua akun: `DaftarIn2026!`

- Warga: `warga@daftarin.test`
- Petugas: `petugas@daftarin.test`
- Admin: `admin@daftarin.test`

Buka `http://127.0.0.1:5173/#/masuk`, buka **Coba akun contoh**, pilih peran, lalu tekan **Masuk**.
