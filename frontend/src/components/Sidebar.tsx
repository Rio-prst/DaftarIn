import { BrandLogo } from "./BrandLogo";
import { useAuth } from "../auth/AuthContext";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { roleHome } from "../auth/types";
import {
  isNavItemActive,
  workspaceNavigation,
  type AppRole,
} from "./navigation";

export function Sidebar({ role }: { role?: AppRole }) {
  const { mode } = useAuth();
  const { user } = useApp();
  const { pathname } = useLocation();
  const activeRole = role || user.role;
  const homePath = roleHome[activeRole] || "/dashboard";

  return (
    <aside className="app-sidebar">
      <NavLink
        to={homePath}
        aria-label="DaftarIn"
        className="brand px-6 h-[72px] border-b border-slate-200"
      >
        <BrandLogo />
      </NavLink>
      <nav aria-label="Navigasi ruang kerja" className="p-3 space-y-1">
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
              className={"workspace-link" + (active ? " is-active" : "")}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
        <div className="mt-3 border-t border-slate-200 pt-3">
          <NavLink
            to="/akun"
            className={({ isActive }) =>
              "workspace-link" +
              (isActive || pathname === "/keluarga" ? " is-active" : "")
            }
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              person
            </span>
            Akun saya
          </NavLink>
        </div>
      </nav>
      <div className="sidebar-home p-3 border-t border-slate-200">
        <NavLink to="/" className="workspace-link text-slate-500">
          <span className="material-symbols-outlined" aria-hidden="true">
            home
          </span>
          Kembali ke beranda
        </NavLink>
      </div>
    </aside>
  );
}
