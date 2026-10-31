import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  EXAMPLE_ACCOUNTS,
  EXAMPLE_PASSWORD,
  roleLabels,
} from "../auth/mockAuth";
import { permittedReturnPath } from "../auth/types";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordField } from "../components/PasswordField";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const next = params.get("next");

  if (user)
    return <Navigate to={permittedReturnPath(next, user.role)} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Harap isi NIK atau email dan kata sandi Anda.");
      return;
    }

    setBusy(true);
    try {
      const account = await login(identifier, password);
      navigate(permittedReturnPath(next, account.role), { replace: true });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Belum berhasil masuk. Pastikan NIK/email dan kata sandi sudah benar.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleQuickRoleSelect = async (account: typeof EXAMPLE_ACCOUNTS[0]) => {
    setIdentifier(account.email);
    setPassword(EXAMPLE_PASSWORD);
    setError("");
    setBusy(true);
    try {
      const logged = await login(account.email, EXAMPLE_PASSWORD);
      navigate(permittedReturnPath(next, logged.role), { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal masuk.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Masuk ke Portal DaftarIn"
      intro="Gunakan NIK 16 digit atau alamat email yang terdaftar."
    >
      <form className="auth-form space-y-4 font-sans" onSubmit={submit} noValidate>
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[14px] flex items-center gap-2" role="alert">
            <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="form-field space-y-1.5">
          <label htmlFor="login-identifier" className="text-[15px] font-semibold text-slate-800">
            Nomor Induk Kependudukan (NIK) atau Email
          </label>
          <input
            id="login-identifier"
            autoComplete="username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Contoh: 3171012405980002 atau warga@daftarin.id"
            required
            autoCapitalize="none"
            spellCheck={false}
            className="w-full h-[50px] px-4 rounded-xl border border-slate-300 text-[16px] text-[#0F223D] placeholder:text-slate-400 focus:outline-hidden focus:border-[#1769D2] focus:ring-2 focus:ring-[#1769D2]/20 transition-all"
          />
          <p className="text-[12px] sm:text-[13px] text-slate-500">
            NIK berupa 16 angka yang tertera pada bagian atas KTP-el atau Kartu Keluarga Anda.
          </p>
        </div>

        <div className="space-y-1.5">
          <PasswordField
            id="login-password"
            label="Kata Sandi Akun"
            value={password}
            onChange={setPassword}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <Link className="text-[14px] font-semibold text-[#1769D2] hover:underline" to="/lupa-sandi">
            Lupa kata sandi?
          </Link>
        </div>

        <button
          type="submit"
          className="button-primary w-full min-h-[50px] text-[16px] font-bold rounded-xl shadow-xs active:scale-98 transition-all"
          disabled={busy}
        >
          {busy ? "Sedang Memeriksa Akun…" : "Masuk ke Akun"}
        </button>
      </form>

      <p className="auth-switch text-center text-[15px] text-slate-600 mt-5">
        Belum memiliki akun warga?{" "}
        <Link
          to={"/daftar" + (next ? "?next=" + encodeURIComponent(next) : "")}
          className="text-[#1769D2] font-semibold hover:underline"
        >
          Daftar Akun Baru
        </Link>
      </p>

      {/* Panel Akses Cepat Peran yang Bersih & Elegan (Bukan Tacky Demo Box) */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-bold uppercase tracking-wider text-slate-500">
            Akses Cepat Pengujian Peran
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            1-Klik Masuk Langsung
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {EXAMPLE_ACCOUNTS.map((account) => {
            const isWarga = account.role === "warga";
            const isPetugas = account.role === "petugas";

            return (
              <button
                type="button"
                key={account.id}
                onClick={() => handleQuickRoleSelect(account)}
                disabled={busy}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#1769D2] bg-white hover:bg-blue-50/50 transition-all text-left flex flex-col justify-between group active:scale-97 shadow-2xs"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="material-symbols-outlined text-[20px] text-[#1769D2]">
                    {isWarga ? "person" : isPetugas ? "badge" : "admin_panel_settings"}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-[#1769D2] group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </div>
                <span className="text-[14px] font-bold text-slate-900 leading-tight">
                  {roleLabels[account.role]}
                </span>
                <span className="text-[12px] text-slate-500 truncate w-full mt-0.5">
                  {account.name.split(" ")[0]} ({account.role})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </AuthLayout>
  );
}
