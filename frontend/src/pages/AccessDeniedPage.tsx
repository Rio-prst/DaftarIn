import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { roleHome } from "../auth/types";
import { AuthLayout } from "../components/AuthLayout";
export function AccessDeniedPage() {
  const { user } = useAuth();
  return (
    <AuthLayout
      title="Halaman ini memerlukan akses berbeda"
      intro="Akunmu tidak memiliki izin untuk membuka halaman ini."
    >
      <Link
        className="button-primary"
        to={user ? roleHome[user.role] : "/masuk"}
      >
        Kembali ke ruang saya
      </Link>
    </AuthLayout>
  );
}
export function NotFoundPage() {
  return (
    <AuthLayout
      title="Halaman tidak ditemukan"
      intro="Alamat halaman mungkin berubah atau sudah tidak tersedia."
    >
      <Link className="button-primary" to="/katalog">
        Cari layanan
      </Link>
    </AuthLayout>
  );
}
