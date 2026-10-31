import { useAuth } from "../auth/AuthContext";
import { roleHome } from "../auth/types";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const { openChat } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const how = () => {
    setExpanded(false);
    navigate("/", { state: { scrollTo: "cara-kerja" } });
  };
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <Link
          to="/"
          className="brand"
          onClick={() => setExpanded(false)}
          aria-label="DaftarIn, beranda"
        >
          <span className="brand-mark" aria-hidden="true">
            <span className="material-symbols-outlined">task_alt</span>
          </span>
          DaftarIn
        </Link>
        <nav className="public-nav" aria-label="Navigasi utama">
          <Link to="/katalog">Cari layanan</Link>
          <button type="button" onClick={how}>
            Cara kerja
          </button>
          <button type="button" onClick={openChat}>
            Bantuan
          </button>
        </nav>
        <div className="flex items-center gap-3">
          {!user && (
            <Link to="/daftar" className="button-secondary registration-link">
              Daftar
            </Link>
          )}
          <Link
            to={user ? roleHome[user.role] : "/masuk"}
            className="button-primary"
          >
            {user ? "Ruang saya" : "Masuk"}
          </Link>
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={expanded ? "Tutup menu" : "Buka menu"}
            aria-expanded={expanded}
            aria-controls="public-mobile-nav"
            onClick={() => setExpanded(!expanded)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {expanded ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>
      {expanded && (
        <nav
          id="public-mobile-nav"
          className="public-mobile-nav"
          aria-label="Navigasi utama di ponsel"
        >
          <Link to="/katalog" onClick={() => setExpanded(false)}>
            Cari layanan
          </Link>
          {!user && (
            <Link to="/daftar" onClick={() => setExpanded(false)}>
              Daftar akun warga
            </Link>
          )}
          <button type="button" onClick={how}>
            Cara kerja
          </button>
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              openChat();
            }}
          >
            Bantuan
          </button>
        </nav>
      )}
    </header>
  );
}
