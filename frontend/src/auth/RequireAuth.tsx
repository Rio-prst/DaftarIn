import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { Role } from "./types";
export function RequireAuth({ roles }: { roles?: Role[] }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user)
    return (
      <Navigate
        to={
          "/masuk?next=" +
          encodeURIComponent(location.pathname + location.search)
        }
        replace
      />
    );
  if (roles && !roles.includes(user.role))
    return <Navigate to="/akses-ditolak" replace />;
  return <Outlet />;
}
