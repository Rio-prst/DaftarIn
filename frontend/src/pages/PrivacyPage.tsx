import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
export function PrivacyPage() {
  const { mode } = useAuth();
  return (
    <div className="auth-shell">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="page-width legal-page">
        <h1>Privasi data</h1>
        <p className="field-hint">Pemberitahuan versi 1 November 2026</p>
        <p>
          DaftarIn membantu warga menyiapkan kebutuhan layanan. Aplikasi ini
          belum terhubung dengan sistem layanan pemerintah. Pemeriksaan otomatis
          isi dokumen belum diaktifkan.
        </p>
        <h2>Data pendaftaran dan akun</h2>
        {mode === "api" ? (
          <>
            <p>
              Nama, email, dan kata sandi dikirim ke server untuk membuat akun.
              Kata sandi disimpan sebagai hash. Waktu dan versi persetujuan
              penggunaan data dicatat bersama akun. Nomor telepon dapat
              ditambahkan melalui pengaturan profil.
            </p>
            <p>
              Profil, preferensi tampilan, dan sesi masuk tersimpan pada
              database server. Sesi menggunakan cookie HttpOnly. Email belum
              diverifikasi; pendaftaran tidak memeriksa identitas melalui
              Dukcapil. Pendaftaran pada mode ini belum meminta NIK atau foto
              KTP.
            </p>
          </>
        ) : (
          <p>
            Mode contoh menyimpan nama, email, NIK contoh, nomor telepon, dan
            keterangan foto KTP di browser. Foto KTP pendaftaran hanya digunakan
            untuk pratinjau. Isi foto tersebut tidak disimpan. Gunakan identitas
            dan kata sandi khusus contoh.
          </p>
        )}
        <h2>Persiapan dan dokumen</h2>
        <p>
          Profil keluarga berisi nama, hubungan dengan pemilik akun, dan NIK
          jika diisi. Profil ini masih disimpan pada perangkat. Data anggota
          yang dipilih disalin ke persiapan dan dibagikan untuk tinjauan hanya
          setelah persetujuan pengiriman. Mengubah profil tidak otomatis
          mengubah kiriman sebelumnya.
        </p>
        <p>
          Draf, data permohonan, pengajuan contoh, dan riwayat peninjauan saat
          ini masih disimpan pada browser. Isi berkas yang diunggah pada
          persiapan disimpan dalam IndexedDB di perangkat ini agar dapat dibuka
          kembali. Data tersebut belum disimpan pada penyimpanan dokumen server
          dan belum terkirim ke petugas instansi yang sebenarnya.
        </p>
        <p>
          Gunakan berkas contoh selama integrasi penyimpanan privat belum
          tersedia. Hapus data situs melalui pengaturan browser untuk menghapus
          draf serta berkas lokal. Menghapus data browser tidak menghapus akun
          yang tersimpan pada server.
        </p>
        <h2>Akses dan keamanan</h2>
        {mode === "api" ? (
          <p>
            Admin berwenang melihat daftar akun dan mengelola akses warga atau
            petugas. Perubahan akses dicatat pada server. Kamu dapat mencabut
            sesi lain atau mengganti kata sandi dari pengaturan keamanan.
            Mengganti kata sandi mengakhiri seluruh sesi masuk. Keluar dari akun
            menutup sesi saat ini dan tidak menghapus profil.
          </p>
        ) : (
          <p>
            Akun dan kata sandi contoh disimpan di browser untuk simulasi.
            Mekanisme ini belum menggantikan autentikasi server. Data contoh
            dalam browser dapat diakses oleh pengguna perangkat yang sama.
          </p>
        )}
        <h2>Chatbot pendamping</h2>
        <p>
          Jika AI diaktifkan, pertanyaan dan sebagian riwayat percakapan dikirim
          melalui server ke penyedia AI yang dikonfigurasi pengelola. Isian
          formulir dan berkas tidak dikirim otomatis ke chatbot. Jangan menulis
          kata sandi, NIK, nomor KK, atau isi dokumen pribadi. Saat AI tidak
          tersedia, aplikasi menandai jawaban sebagai panduan lokal.
        </p>
        <h2>Penghapusan akun dan bantuan</h2>
        <p>
          Penghapusan akun server dan pemulihan kata sandi melalui email belum
          tersedia. Sebelum layanan dibuka untuk publik, pengelola perlu
          menyediakan saluran bantuan, kebijakan masa simpan, verifikasi email,
          dan mekanisme permintaan penghapusan data.
        </p>
        <Link to="/daftar" className="text-link">
          Kembali ke pendaftaran →
        </Link>
      </main>
      <Footer />
    </div>
  );
}
