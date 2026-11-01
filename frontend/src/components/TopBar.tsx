import { NotificationsBell } from "./NotificationsBell";
import { AccessibilityControl } from "./AccessibilityControl";
import { useAuth } from "../auth/AuthContext";
import { AccountMenu } from "./AccountMenu";
import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  isNavItemActive,
  workspaceNavigation,
  type AppRole,
} from "./navigation";

interface TopBarProps {
  breadcrumbs: string[];
  onOpenHelp?: () => void;
  role?: AppRole;
}
export function TopBar({ breadcrumbs, onOpenHelp, role }: TopBarProps) {
  const { mode } = useAuth();
  const navigate = useNavigate();
  const { user } = useApp();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeRole = role || user.role;
  return (
    <header className="workspace-header">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          className="mobile-menu-button"
          aria-label={menuOpen ? "Tutup navigasi" : "Buka navigasi"}
          aria-expanded={menuOpen}
          aria-controls="workspace-mobile-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {menuOpen ? "close" : "menu"}
          </span>
        </button>
        <nav aria-label="Lokasi halaman" className="min-w-0">
          <ol className="flex items-center gap-2 text-sm text-slate-500">
            {breadcrumbs.map((crumb, index) => (
              <li
                className={
                  index === breadcrumbs.length - 1
                    ? "truncate text-[#17324D] font-medium"
                    : "hidden sm:flex items-center gap-2"
                }
                key={index}
              >
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="hidden sm:inline text-slate-300"
                  >
                    /
                  </span>
                )}
                <span
                  aria-current={
                    index === breadcrumbs.length - 1 ? "page" : undefined
                  }
                >
                  {crumb}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <AccessibilityControl />
        <NotificationsBell />
        <button
          type="button"
          className="help-button"
          aria-label="Bantuan"
          onClick={
            onOpenHelp ||
            (() =>
              navigate(activeRole === "admin" ? "/admin/bantuan" : "/bantuan"))
          }
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            help_outline
          </span>
          <span className="hidden sm:inline">Bantuan</span>
        </button>
        <AccountMenu />
      </div>
      {menuOpen && (
        <nav
          id="workspace-mobile-nav"
          className="workspace-mobile-nav"
          aria-label="Navigasi ruang kerja di ponsel"
        >
          {workspaceNavigation(activeRole, mode).map((item) => {
            const active = isNavItemActive(
              item.path,
              activeRole === "admin" && mode === "api" && pathname === "/admin"
                ? "/admin/petugas"
                : pathname,
            );
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={"workspace-link" + (active ? " is-active" : "")}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
          <NavLink
            className={({ isActive }) =>
              "workspace-link" + (isActive ? " is-active" : "")
            }
            to="/akun"
            onClick={() => setMenuOpen(false)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              person
            </span>
            Akun saya
          </NavLink>
          <NavLink
            className="workspace-link text-slate-500"
            to="/"
            onClick={() => setMenuOpen(false)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              home
            </span>
            Kembali ke beranda
          </NavLink>
        </nav>
      )}
    </header>
  );
}
