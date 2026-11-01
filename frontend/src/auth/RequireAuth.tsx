import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { Role } from "./types";
export function RequireAuth({ roles }: { roles?: Role[] }) {
  const { user, isLoading, error } = useAuth();
  const location = useLocation();
  if (isLoading)
    return (
      <main className="auth-page" aria-busy="true">
        <p role="status">Memeriksa sesi akun…</p>
      </main>
    );
  if (error)
    return (
      <main className="auth-page">
        <div className="plain-panel">
          <h1>Sesi belum dapat diperiksa</h1>
          <p role="alert">{error}</p>
          <button
            className="button-primary mt-4"
            onClick={() => window.location.reload()}
          >
            Coba lagi
          </button>
        </div>
      </main>
    );
  if (!user) {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("password_changed") === "1") {
      return <Navigate to={`/masuk${location.search}`} replace />;
    }
    return (
      <Navigate
        to={
          "/masuk?next=" +
          encodeURIComponent(location.pathname + location.search)
        }
        replace
      />
    );
  }
  if (roles && !roles.includes(user.role))
    return <Navigate to="/akses-ditolak" replace />;
  return <Outlet />;
}
