# Domain Context — DaftarIn

Dokumen ini menjelaskan konsep domain, istilah, dan batasan dunia nyata di balik **DaftarIn** supaya AI Agent tidak menebak istilah, alur, atau batasan produk. Sumber lengkap: [`PRD.md`](./PRD.md) (PRD v1.0).

> Catatan penamaan: PRD v1.0 masih memakai nama produk *JejakMasWowo*. Nama yang dipakai di repo dan dokumen ini adalah **DaftarIn**.

## Masalah yang diselesaikan

Warga sering tidak mengetahui nama layanan, persyaratan, biaya resmi, dan kanal pengajuan yang tepat. Informasi tersebar, berbeda menurut wilayah/kondisi, dan tidak jelas kebaruannya. Akibatnya kekurangan berkas baru diketahui setelah mengajukan, hasil pemeriksaan sulit dipahami, dan perkembangan pengajuan tidak terpantau.

DaftarIn menyatukan empat tahapan dalam satu perjalanan:

1. **Pahami layanan:** cari layanan berdasarkan kebutuhan, baca panduan bersumber, dan jawab pertanyaan kondisi.
2. **Siapkan dan periksa:** isi data, unggah dokumen, lalu jalankan pemeriksaan awal berbantuan AI.
3. **Ajukan:** gunakan ringkasan kesiapan untuk membuka kanal resmi instansi.
4. **Pantau:** catat pengajuan dan ikuti linimasa yang sumbernya jelas.

## Posisi produk

- Alat pendamping pengurusan layanan pemerintah; keputusan resmi tetap berada pada instansi.
- **Bukan** portal resmi pemerintah, **bukan** pengganti kanal pengajuan, dan **bukan** sistem yang terhubung otomatis ke instansi.
- Pemeriksaan AI hanya membantu menemukan masalah awal; hasilnya **bukan** persetujuan, verifikasi keaslian, atau jaminan diterima.
- Chatbot bersifat opsional; seluruh alur utama harus dapat diselesaikan tanpa chatbot.
- Jangan menulis klaim bahwa DaftarIn menjamin pengajuan diterima, selesai pada tanggal tertentu, atau terhubung ke pemerintah.

## Glosarium

| Istilah | Arti dalam sistem dan kode |
|---|---|
| Layanan (`service`) | Jenis pengurusan yang dipilih warga, terikat pada wilayah, instansi, kategori, dan versi panduan. |
| Panduan Layanan (`guide_version`) | Versi informasi layanan: persyaratan, prosedur, biaya, standar waktu, dan kanal. Setiap versi menyimpan sumber dan tanggal peninjauan. |
| Sumber Resmi (`official_source`) | Dokumen/tautan resmi yang mendukung kelompok informasi tertentu, lengkap dengan URL, penerbit, tanggal sumber, dan tanggal akses. |
| Wilayah (`region`) | Cakupan administratif tempat layanan berlaku. Layanan wilayah lain tidak boleh ditampilkan seolah berlaku di wilayah pilihan. |
| Instansi (`agency`) | Penyelenggara layanan beserta kanal resminya. Keberadaannya tidak menyiratkan kerja sama resmi. |
| Pertanyaan Kebutuhan | Pertanyaan kondisi nonidentitas yang menentukan berkas dan isian yang relevan sebelum login. |
| Persiapan (`preparation`) | Ruang pribadi berisi data, dokumen, dan hasil pemeriksaan sebelum pengajuan. Memiliki nomor internal yang berbeda dari nomor pengajuan resmi. |
| Dokumen (`document_version`) | Berkas milik persiapan dengan versi, tipe, ukuran, hash, dan lokasi privat. Penggantian file membuat versi baru. |
| Pemeriksaan Awal AI (`inspection_run`) | Proses yang membaca dokumen dan data, lalu menghasilkan temuan. Mengacu pada snapshot versi dokumen, data, layanan, dan aturan. |
| Temuan (`finding`) | Masalah atau ketidakpastian hasil pemeriksaan: kelengkapan, jenis dokumen, keterbacaan, data wajib, ketidaksesuaian, atau ketidakpastian. |
| Pengajuan (`application_record`) | Catatan bahwa warga telah mengajukan melalui kanal resmi. Nomor resmi bersifat opsional dan berlabel "dicatat warga" bila belum terverifikasi. |
| Peristiwa Status (`status_event`) | Satu baris riwayat pengajuan dengan status, sumber, waktu kejadian, waktu dicatat, dan catatan. Linimasa dibentuk dari peristiwa, bukan status yang ditimpa. |
| Catatan Warga | Kabar yang dimasukkan warga sendiri. Tidak boleh ditampilkan sebagai pembaruan resmi instansi. |
| Kanal Resmi | Portal/loket pemerintah tempat pengajuan sebenarnya dilakukan. DaftarIn hanya mengarahkan, tidak mengirim dokumen otomatis. |
| Simulasi | Data atau proses demonstrasi yang wajib diberi label simulasi dan tidak mewakili pengajuan pemerintah nyata. |
| Notifikasi | Pengingat atau pemberitahuan dalam aplikasi yang tertaut ke objek terkait; tidak boleh membuat status palsu. |

## Peran pengguna

Peran berikut masih konseptual di PRD; enum final belum ditetapkan.

| Peran | Siapa | Hak akses utama |
|---|---|---|
| Pengunjung | Belum login | Membaca panduan, mencari layanan, menjawab pertanyaan kebutuhan nonpribadi, mencoba contoh, memakai chatbot umum. Tidak mengakses dokumen atau pengajuan pribadi. |
| Warga | Pemilik akun | Mengelola persiapan, dokumen, hasil pemeriksaan, catatan pengajuan, notifikasi, dan profil miliknya sendiri. |
| Petugas | Petugas yang ditugaskan | Melihat dan memperbarui pengajuan sesuai penugasan, memberi alasan revisi, mencatat penyelesaian. Tidak otomatis melihat draf pribadi warga. |
| Admin | Pengelola sistem | Mengelola wilayah, instansi, layanan, sumber, panduan/aturan berversi, akun petugas, dan audit. Tidak otomatis memperoleh akses isi dokumen pribadi. |

Hak istimewa tidak boleh didapat dari pendaftaran publik. Jika satu orang memiliki beberapa peran, kewenangannya harus diberikan eksplisit.

## Dua jalur status yang wajib dipisah

**Status persiapan:** Draf, Menunggu pemeriksaan, Sedang diperiksa, Perlu dilengkapi, Perlu diperiksa ulang, Siap berdasarkan pemeriksaan awal, Pemeriksaan belum selesai, Perlu pemeriksaan baru, Diarsipkan.

**Status pengajuan:** Dicatat warga — belum terkonfirmasi instansi, Diterima, Verifikasi, Perlu perbaikan, Diproses, Selesai, Hasil diterima warga.

Persiapan yang "siap" tidak otomatis berarti pengajuan diterima. Status pengajuan hanya berubah berdasarkan sumber yang tercatat: warga, petugas, integrasi resmi, atau simulasi berlabel.

## Situasi nyata yang memengaruhi desain teknis

- **Informasi layanan tersebar dan bisa berubah:** simpan versi panduan, sumber per kelompok informasi, tanggal sumber, dan tanggal peninjauan. Perubahan harus diterbitkan sebagai versi baru; hasil lama tetap merujuk versi aturan saat dibuat.
- **Warga belum punya semua data:** harga, waktu, atau persyaratan yang tidak diketahui tidak boleh diisi asumsi. Tampilkan "Belum tersedia pada sumber yang dicatat", bukan gratis, Rp0, atau estimasi buatan.
- **Perangkat bisa dipakai bergantian:** saat sesi berakhir, akses pribadi harus dihentikan. Jangan menaruh data pribadi di URL, pratinjau notifikasi, atau cache yang bisa dibaca akun lain.
- **Koneksi bisa tidak stabil:** pemeriksaan AI berjalan sebagai pekerjaan latar yang tidak hilang saat halaman ditutup. Klik berulang tidak boleh menggandakan pekerjaan; hasil lama tidak boleh menimpa versi dokumen baru.
- **OCR/AI bisa salah baca:** bagian buram atau meragukan harus ditandai. Koreksi warga disimpan dengan asal "dikonfirmasi pengguna", bukan mengganti hasil OCR tanpa jejak.
- **Tidak ada integrasi pemerintah pada baseline:** status hanya berasal dari catatan warga, petugas/simulasi, atau integrasi yang benar-benar tersedia. Jangan mengarang linimasa instansi.
- **Beban dan kewenangan petugas terbatas:** akses harus diperiksa di server dan dibatasi pada penugasan. Admin tidak otomatis boleh membaca dokumen warga.

## Batasan produk (tidak boleh dilanggar oleh AI Agent)

1. **Jangan menyatakan keputusan resmi:** hasil AI bukan persetujuan, verifikasi keaslian, atau bukti sah. Keputusan tetap milik instansi.
2. **Jangan menjanjikan hasil atau tanggal:** tidak boleh mengklaim permohonan pasti diterima atau selesai pada waktu tertentu.
3. **Jangan mengarang integrasi pemerintah:** tanpa kontrak dan otorisasi resmi, jangan menampilkan status instansi seolah berasal dari sistem pemerintah.
4. **Jangan membuat persyaratan tanpa dasar:** AI tidak boleh menambah persyaratan wajib yang tidak didukung sumber layanan dan versi aturan.
5. **Jangan mencampur sumber status:** catatan warga, pembaruan petugas, integrasi, dan simulasi harus berlabel berbeda. Catatan warga tidak boleh tampil sebagai pembaruan instansi.
6. **Jangan menampilkan "siap" jika pemeriksaan belum tuntas:** kegagalan teknis menghasilkan "Pemeriksaan belum selesai", bukan penilaian kelengkapan.
7. **Jangan mengarang biaya atau waktu:** jika tidak ada di sumber, tulis belum tersedia. Jangan membuat tenggat otomatis bila aturan hari kerja/titik awal tidak diketahui.
8. **Jangan memakai AI untuk otorisasi atau perubahan status resmi:** akses, kepemilikan, dan transisi status diperiksa oleh aplikasi, bukan model.
9. **Jangan mengekspos dokumen privat:** tidak ada URL publik permanen. Sajikan melalui akses terotorisasi, dengan tautan sementara bila diperlukan.
10. **Jangan menjadikan chatbot jalur wajib:** chatbot tidak boleh mengubah data, mengirim berkas, menutup temuan, atau memperbarui status.
11. **Jangan meminta data berlebihan:** jangan meminta NIK atau foto KTP hanya untuk membuat akun. Kumpulkan data minimum yang diperlukan.
12. **Jangan menyamakan keterbacaan dengan keaslian:** skor kepercayaan atau kegagalan membaca dokumen tidak boleh dipakai untuk menuduh pemalsuan atau menurunkan penilaian secara sepihak.
13. **Jangan menampilkan angka "peluang diterima":** hindari skor kelayakan yang bisa disalahartikan sebagai probabilitas persetujuan instansi.
