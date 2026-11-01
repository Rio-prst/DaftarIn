# Frontend DaftarIn

Website responsif berbasis React, TypeScript, Vite, dan Tailwind untuk pendampingan persiapan serta pelacakan pengajuan layanan publik (**Public Service Tracking** & **Open Government Data**). Spesifikasi awal ada di [PRD](../backend/docs/PRD.md), keputusan produk terbaru ada di [PRODUCT-DECISIONS.md](docs/PRODUCT-DECISIONS.md), dan progres implementasi ada di [PROGRESS.md](docs/PROGRESS.md).

## Menjalankan

Status integrasi 1 November 2026: autentikasi, pengaturan akun, sesi, preferensi, dan pengelolaan akses admin sudah dapat memakai API backend tim. Modul persiapan, berkas, dan antrean petugas masih lokal. [Laporan integrasi terkini](docs/LAPORAN-INTEGRASI-API-2026-11-01.txt) menjelaskan batasnya; catatan historis scaffold di bawah tidak lagi mewakili status autentikasi.

Untuk mode server, gunakan `VITE_AUTH_MODE=api` dan `VITE_API_URL=/api`, lalu jalankan backend di port 3000. Lihat [API aktif](../backend/docs/IMPLEMENTED-API.md) untuk migrasi, admin pertama, serta reverse proxy produksi. Tanpa pilihan mode server, mode demo tetap digunakan. Akun contoh berikut hanya berlaku pada mode demo.

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

Akun warga contoh berisi dua pengajuan: satu membutuhkan perbaikan pada layanan **Pembaruan Data Kartu Keluarga (KK)**, satu memiliki tinjauan awal selesai pada layanan **Penerbitan Kartu Identitas Anak (KIA)**. Petugas contoh mendapat tiga penugasan. Pendaftaran baru membuat akun warga dengan pengajuan dan dokumen kosong.

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

## Alur utama saat ini

1. **Cari layanan dan baca panduan** — dapat diakses tanpa masuk. Pilihan layanan di beranda membuka panduan layanan yang dipilih, termasuk untuk akun yang sudah masuk.
2. **Masuk / daftar** — menggunakan akun contoh atau registrasi lokal.
3. **Kebutuhan** — tentukan layanan, wilayah, kondisi permohonan, dan siapa yang diurus.
4. **Data** — lengkapi data pemohon serta alasan permohonan.
5. **Dokumen** — unggah berkas sesuai kebutuhan. Validasi dasar memeriksa format, ukuran, dan kelengkapan, bukan membaca isi dengan AI.
6. **Tinjau & kirim** — periksa isian dan berikan persetujuan berbagi salinan kepada petugas contoh.
7. **Tinjauan dan revisi** — petugas contoh menilai data/berkas; warga dapat mengganti berkas dan mengirim revisi pada permintaan yang sama.
8. **Pelacakan** — tinjauan pendamping dan laporan hasil layanan pemerintah memiliki status terpisah.

Empat tahap persiapan yang ditampilkan adalah Kebutuhan -> Data -> Dokumen -> Tinjau & kirim. Halaman rincian validasi/simulasi aturan tetap opsional, bukan pemeriksaan AI yang wajib dilalui.

## Bantuan pendamping

Bantuan tersedia dari navigasi publik dan header akun. Tombol mengambang hanya ditampilkan kepada pengunjung pada beranda, katalog, dan panduan; tidak tampil di halaman akun, login, atau registrasi.

Bantuan mencari kata kunci pada materi lokal di frontend. Belum ada LLM, embedding, API AI, atau hubungan dengan Kemendagri. Pertanyaan tanpa kecocokan dijawab secara jujur; konteks layanan tidak boleh memaksakan jawaban yang tidak berkaitan. Rujukan yang ditampilkan berasal dari materi jawaban terpilih.

Modal mendukung Escape, Tab/Shift+Tab, pemulihan fokus, pembesaran teks, dan pembacaan jawaban melalui fitur suara browser. Dukungan suara bergantung pada perangkat/browser dan belum diverifikasi pada perangkat fisik.

## Data contoh dan penyimpanan

Backend saat ini masih scaffold NestJS dengan GET / -> Hello World!. Adapter API sudah disiapkan, tetapi autentikasi dan alur operasional frontend belum memakai endpoint backend produksi.

- Akun contoh, akun hasil registrasi, draf, metadata dokumen, pengajuan, panduan, dan aturan disimpan di localStorage.
- Sesi contoh memakai sessionStorage; logout menutup sesi.
- Isi unggahan PDF/gambar disimpan sebagai Blob di IndexedDB, sampai 5 MB. Unggahan nyata adalah file yang dipilih pengguna, tetapi penyimpanannya tetap lokal di browser.
- Berpindah akun warga/petugas pada browser yang sama dapat memperagakan tinjauan. Membuka browser atau perangkat lain belum menyinkronkan data itu.
- Registrasi KTP/NIK belum memverifikasi identitas ke Dukcapil; pemulihan akun belum mengirim email.
- Pemeriksaan OCR/AI, penyimpanan dokumen privat server, dan integrasi pemerintah belum terhubung.
- Gunakan identitas dan dokumen contoh, bukan data pribadi asli. Menghapus data browser dapat menghilangkan akun/draf/berkas lokal.

## Verifikasi 1 November 2026

19 pemeriksaan fungsi pada perbaikan bantuan, revisi, dan navigasi layanan lolos. Sebanyak 17 kombinasi halaman/peran/lebar layar diperiksa tanpa overflow horizontal dan tanpa error JavaScript yang tertangkap. Pengujian memakai Chrome headless pada browser context terpisah.

Build berhasil; lint exit code 0 dengan peringatan React yang telah ada. Peringatan bundel JavaScript >500 kB masih tersisa. Hasil ini bukan pengujian ulang menyeluruh seluruh alur backend atau seluruh 47 skenario historis.

Rincian dan langkah uji manual: docs/LAPORAN-PERBAIKAN-2026-11-01.txt.
