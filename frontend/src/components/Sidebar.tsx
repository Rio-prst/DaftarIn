import { NavLink, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { roleHome } from "../auth/types";
import { isNavItemActive, roleNavigation, type AppRole } from "./navigation";

export function Sidebar({ role }: { role?: AppRole }) {
  const { user } = useApp();
  const { pathname } = useLocation();
  const activeRole = role || user.role;
  const homePath = roleHome[activeRole] || "/dashboard";

  return (
    <aside className="app-sidebar">
      <NavLink
        to={homePath}
        className="brand px-6 h-[72px] border-b border-slate-200"
      >
        <span className="brand-mark" aria-hidden="true">
          <span className="material-symbols-outlined">task_alt</span>
        </span>
        DaftarIn
      </NavLink>
      <nav aria-label="Navigasi ruang kerja" className="p-3 space-y-1 flex-1">
        {roleNavigation[activeRole].map((item) => {
          const active = isNavItemActive(item.path, pathname);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              aria-current={active ? "page" : undefined}
              className={"workspace-link" + (active ? " is-active" : "")}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200 space-y-1">
        <NavLink
          to="/akun"
          className={({ isActive }) =>
            "workspace-link" + (isActive ? " is-active" : "")
          }
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            person
          </span>
          Akun saya
        </NavLink>
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
