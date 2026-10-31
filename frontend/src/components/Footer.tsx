import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
export function Footer() {
  const { openChat } = useApp();
  return (
    <footer className="public-footer">
      <div className="page-width flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <Link to="/" className="font-bold text-lg text-[#142C4B]">
            DaftarIn
          </Link>
          <p className="mt-2 text-sm text-slate-500">
            Pendamping persiapan berkas. Bukan portal resmi pemerintah.
          </p>
        </div>
        <nav className="flex gap-6 text-sm" aria-label="Navigasi footer">
          <Link to="/katalog">Cari layanan</Link>
          <Link to="/privasi">Privasi</Link>
          <button type="button" onClick={openChat}>
            Bantuan
          </button>
        </nav>
      </div>
    </footer>
  );
}
