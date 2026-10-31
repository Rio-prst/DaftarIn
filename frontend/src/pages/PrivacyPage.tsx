import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
export function PrivacyPage() {
  return (
    <div className="auth-shell">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="page-width legal-page">
        <h1>Privasi data</h1>
        <p>
          DaftarIn membantu menyiapkan berkas sebelum warga mengakses layanan
          pemerintah. Versi yang sedang kamu gunakan adalah versi contoh dan
          belum terhubung ke layanan pemerintah.
        </p>
        <h2>Data pendaftaran</h2>
        <p>
          Nama, NIK, email, nomor telepon, dan keterangan foto KTP digunakan
          untuk membuat akun warga. Gunakan identitas contoh saat mencoba
          aplikasi.
        </p>
        <h2>Foto KTP dan dokumen</h2>
        <p>
          Foto yang dipilih saat pendaftaran hanya ditampilkan sebagai
          pratinjau. Aplikasi menyimpan nama, ukuran, dan jenis file, tanpa
          menyimpan isi foto KTP. Foto tidak dikirim ke server. Untuk dokumen
          persiapan, versi ini juga hanya menyimpan keterangan file.
        </p>
        <h2>Penyimpanan pada browser</h2>
        <p>
          Akun contoh, draf, pengajuan, dan perubahan pengaturan tersimpan pada
          browser ini. Kata sandi akun baru disimpan dalam bentuk hasil olahan,
          bukan teks aslinya. Penyimpanan browser ini belum menggantikan sistem
          keamanan akun pada server.
        </p>
        <h2>Menghapus data contoh</h2>
        <p>
          Keluar dari akun untuk menutup sesi. Untuk menghapus seluruh data
          versi contoh, hapus data situs melalui pengaturan browser. Tindakan
          ini menghapus semua akun dan draf lokal di browser tersebut.
        </p>
        <h2>Sebelum layanan digunakan secara resmi</h2>
        <p>
          Penyimpanan dokumen privat, pemeriksaan identitas, pengiriman email,
          dan autentikasi server harus disiapkan sebelum menggunakan data
          pribadi asli.
        </p>
        <Link to="/daftar" className="text-link">
          Kembali ke pendaftaran →
        </Link>
      </main>
      <Footer />
    </div>
  );
}
