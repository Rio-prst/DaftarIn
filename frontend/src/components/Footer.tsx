import { BrandLogo } from "./BrandLogo";
import { Link } from "react-router-dom";
export function Footer() {
  return (
    <footer className="public-footer">
      <div className="page-width flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <Link to="/" className="brand footer-brand" aria-label="DaftarIn">
            <BrandLogo />
          </Link>
          <p className="mt-2 text-sm text-slate-500">
            Pendamping persiapan berkas. Bukan portal resmi pemerintah.
          </p>
        </div>
        <nav className="flex gap-6 text-sm" aria-label="Navigasi footer">
          <Link to="/katalog">Cari layanan</Link>
          <Link to="/privasi">Privasi</Link>
          <Link to="/bantuan">Bantuan</Link>
        </nav>
      </div>
    </footer>
  );
}
