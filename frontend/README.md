# Frontend DaftarIn

Website responsif berbasis React, TypeScript, Vite, dan Tailwind untuk pendampingan persiapan serta pelacakan pengajuan layanan publik (**Public Service Tracking** & **Open Government Data**). Spesifikasi awal ada di [PRD](../backend/docs/PRD.md), keputusan produk terbaru ada di [PRODUCT-DECISIONS.md](docs/PRODUCT-DECISIONS.md), dan progres implementasi ada di [PROGRESS.md](docs/PROGRESS.md).

## Menjalankan

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Alamat lokal: `http://127.0.0.1:5173`. Build aplikasi: `npm run build`.

## Akun contoh

| Peran   | Email                 | NIK              |
| ------- | --------------------- | ---------------- |
| Warga   | warga@daftarin.test   | 0000000000000001 |
| Petugas | petugas@daftarin.test | 0000000000000002 |
| Admin   | admin@daftarin.test   | 0000000000000003 |

Kata sandi awal ketiganya: **DaftarIn2026!**. Halaman masuk (`http://127.0.0.1:5173/#/masuk`) menyediakan bagian “Coba akun contoh” untuk mengisi kredensial. Pilih akun lalu tekan Masuk. Kata sandi yang diubah melalui pemulihan menggantikan kata sandi awal di browser ini.

Akun warga contoh berisi dua pengajuan: satu membutuhkan perbaikan (`CONTOH-KK-001` untuk layanan percontohan **Pembaruan Data Kartu Keluarga (KK)**), satu selesai (`CONTOH-AKTA-002`). Petugas contoh mendapat tiga penugasan. Pendaftaran baru membuat akun warga dengan pengajuan dan dokumen kosong.

## Akses halaman

| Halaman                                | Belum masuk | Warga                                  | Petugas                         | Admin   |
| -------------------------------------- | ----------- | -------------------------------------- | ------------------------------- | ------- |
| Landing, katalog, panduan, privasi     | Ya          | Ya                                     | Ya                              | Ya      |
| Masuk, daftar, pemulihan               | Ya          | Masuk/daftar mengarah ke ruang sendiri | Sama                            | Sama    |
| Profil dan keluar                      | Tidak       | Sendiri                                | Sendiri                         | Sendiri |
| Persiapan, dokumen, pemeriksaan, ringkasan | Tidak   | Sendiri                                | Tidak                           | Tidak   |
| Pelacakan, catatan, perbaikan          | Tidak       | Sendiri                                | Penugasan melalui panel petugas | Tidak   |
| Panel petugas                          | Tidak       | Tidak                                  | Penugasan sendiri               | Tidak   |
| Panduan, aturan, akun petugas, audit   | Tidak       | Tidak                                  | Tidak                           | Ya      |

Mengakses halaman pribadi sebelum masuk membawa pengguna ke halaman masuk dan mempertahankan konteks layanan. Mengakses peran berbeda menampilkan keterangan akses dan tautan kembali ke ruang sendiri.

## Alur perjalanan utama yang tersedia

1. **Kebutuhan & Wilayah (`/katalog`)** → Filter wilayah (`Kota Contoh` vs wilayah belum didukung), kategori, dan pencarian layanan. Layanan percontohan utama adalah **Pembaruan Data Kartu Keluarga (KK)**.
2. **Panduan Bersumber & Kondisi Permohonan (`/panduan`)** → Memilih kondisi permohonan (mis. perubahan biodata umum vs perubahan status kawin vs penambahan anggota keluarga) yang menentukan dokumen **Wajib** dan **Opsional**, disertai informasi biaya resmi, estimasi waktu, kanal resmi, dan sumber regulasi.
3. **Masuk / Daftar (`/masuk`, `/daftar`)** → Menyimpan konteks layanan dan kondisi permohonan yang dipilih warga.
4. **Persiapan Data (`/persiapan/data`)** → Draf persiapan diberi kode referensi internal (`PREP-2026-0001`) dan versi data (`Data v1`, `v2`, dst.). Warga mengisi/memperbarui kondisi permohonan, nama lengkap, NIK 16 digit, Nomor KK 16 digit, kontak, alamat domisili, dan alasan permohonan. Tersedia tombol **Isi data contoh**.
5. **Persiapan Dokumen (`/persiapan/dokumen`)** → Menampilkan slot dokumen **Wajib** dan **Opsional** sesuai kondisi permohonan. Setiap unggahan atau penggantian berkas menaikkan versi dokumen (`Versi 1`, `Versi 2`). Tersedia tombol **Muat berkas contoh awal (v1 · ada bagian terpotong)** dan **Muat berkas contoh perbaikan (utuh)**.
6. **Pemeriksaan Otomatis (`/persiapan/pemeriksaan`)** → Mengevaluasi kelengkapan berkas wajib, konsistensi data pemohon, kualitas berkas sesuai versi (`sample_issue` pada v1 vs `sample_clean` pada v2), serta aturan pemeriksaan aktif dari Admin. Mengubah data atau mengganti berkas setelah pemeriksaan otomatis menandai hasil lama sebagai **Perlu diperiksa ulang** (`isStale: true`).
7. **Ringkasan Persiapan (`/persiapan/ringkasan`)** → Menampilkan status kesiapan draf secara jujur (tidak menampilkan "Siap" bila belum diperiksa, usang, atau masih ada kendala wajib), rincian kanal resmi, serta formulir pencatatan pengajuan atau perbaikan.
8. **Pelacakan & Tindak Lanjut (`/pelacakan`)** → Memisahkan catatan pengajuan mandiri warga (`DICATAT_WARGA` — belum dikonfirmasi instansi) dari pengajuan yang ditugaskan ke petugas contoh (`CONTOH-KK-001`). Menampilkan tahap saat ini, sumber & waktu pembaruan, kendala, tindakan berikutnya, riwayat versi lampiran, alur revisi tanpa membuat nomor pengajuan baru, hingga **Konfirmasi hasil diterima** (`HASIL_DITERIMA_WARGA`).
9. **Panel Petugas (`/petugas`) & Panel Admin (`/admin`)** → Petugas meninjau pengajuan yang ditugaskan beserta versi berkas perbaikan (`Versi 2`) dan memperbarui status; Admin mengelola versi panduan, sumber regulasi, aturan pemeriksaan, akun petugas, dan log audit.

## Penyimpanan dan batas implementasi

Frontend saat ini menggunakan adapter akun dan data browser sementara karena backend (`backend/src/`) masih berupa scaffold awal NestJS 11 (`Hello World!`) dan belum mengimplementasikan modul `/api/v1/*` maupun database.

- Akun, draf per warga (`PREP-...`), metadata versi dokumen, pengajuan contoh bersama, panduan, aturan, serta audit disimpan di `localStorage`.
- Sesi menggunakan `sessionStorage` dengan masa berlaku 8 jam; keluar menutup sesi.
- Pemeriksaan awal menggunakan mesin aturan dan preset kualitas berkas pada browser untuk mensimulasikan perilaku OCR/aturan secara konsisten terhadap perubahan data dan versi dokumen. Layanan AI/OCR server dan penyimpanan berkas privat (S3/MinIO) belum terhubung.
- Tidak ada pengiriman email, verifikasi NIK ke Dukcapil, penerbitan dokumen resmi, atau integrasi langsung ke sistem pemerintah.
- Pemeriksaan tampilan dan alur dilakukan pengguna sesuai permintaannya. Tidak menjalankan pengujian browser otomatis pada perubahan ini.
