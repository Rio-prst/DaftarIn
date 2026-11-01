import { useState, useEffect, type FormEvent } from "react";
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
  const { user, login, mode } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [identifier, setIdentifier] = useState(() => params.get("email") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const next = params.get("next");

  useEffect(() => {
    const emailParam = params.get("email");
    if (emailParam) {
      setIdentifier(emailParam);
      const timer = setTimeout(() => {
        document.getElementById("login-password")?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [params]);

  if (user)
    return <Navigate to={permittedReturnPath(next, user.role)} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!identifier.trim() || !password) {
      setError("Isi NIK/email dan kata sandi terlebih dahulu.");
      return;
    }
    if (mode === "api" && /^\d+$/.test(identifier.trim())) {
      setError("Pada mode API, gunakan alamat email terdaftar (bukan NIK).");
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
          : "Belum berhasil masuk. Coba lagi.",
      );
    } finally {
      setBusy(false);
    }
  };

  const isCustomCredential = (accId: string) => {
    try {
      const raw = localStorage.getItem("daftarin:accounts:v1");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const found = parsed.find(
          (a: { id?: string; credential?: unknown }) => a && a.id === accId,
        );
        return Boolean(found?.credential);
      }
    } catch {
      return false;
    }
    return false;
  };

  return (
    <AuthLayout
      title="Masuk ke DaftarIn"
      intro={
        mode === "api"
          ? "Gunakan email yang terdaftar."
          : "Gunakan NIK atau email yang terdaftar."
      }
    >
      {params.get("registered") === "1" && (
        <p className="plain-panel mb-4" role="status">
          Akun berhasil dibuat. Silakan masuk dengan email dan kata sandimu.
        </p>
      )}
      {params.get("password_changed") === "1" && (
        <p className="plain-panel mb-4" role="status">
          Kata sandi diperbarui dan seluruh sesi sudah dikeluarkan. Masuk
          kembali dengan kata sandi baru.
        </p>
      )}
      {(params.get("deviceCleared") ||
        new URLSearchParams(window.location.search).get("deviceCleared")) && (
        <p role="status" className="plain-panel">
          Salinan lokal DaftarIn telah dibersihkan. Akun server dan pengajuan
          resmi tidak ikut dihapus.
        </p>
      )}
      {(params.get("deviceClearFailed") ||
        new URLSearchParams(window.location.search).get(
          "deviceClearFailed",
        )) && (
        <p role="alert" className="plain-panel">
          Pembersihan belum selesai. Tutup tab DaftarIn lain dan gunakan
          pengaturan browser untuk membersihkan data situs bila diperlukan.
        </p>
      )}
      <form className="auth-form" onSubmit={submit} noValidate>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-field">
          <label htmlFor="login-identifier">
            {mode === "api" ? "Email" : "NIK atau email"}
          </label>
          <input
            id="login-identifier"
            autoComplete="username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
            autoCapitalize="none"
            spellCheck={false}
          />
        </div>
        <PasswordField
          id="login-password"
          label="Kata sandi"
          value={password}
          onChange={setPassword}
        />
        <Link className="text-link auth-recovery" to="/lupa-sandi">
          Lupa kata sandi?
        </Link>
        <button
          type="submit"
          className="button-primary auth-submit"
          disabled={busy}
        >
          {busy ? "Sedang masuk…" : "Masuk"}
        </button>
      </form>
      <p className="auth-switch">
        Belum punya akun?{" "}
        <Link
          to={"/daftar" + (next ? "?next=" + encodeURIComponent(next) : "")}
          className="text-link"
        >
          Daftar sebagai warga
        </Link>
      </p>
      {mode === "demo" && (
        <details className="example-accounts">
          <summary>Coba akun contoh</summary>
          <p>Setiap akun berisi data contoh sesuai perannya.</p>
          <div>
            {EXAMPLE_ACCOUNTS.map((account) => {
              const custom = isCustomCredential(account.id);
              return (
                <button
                  type="button"
                  key={account.id}
                  onClick={() => {
                    setIdentifier(account.email);
                    setError("");
                    if (custom) {
                      setPassword("");
                      document.getElementById("login-password")?.focus();
                    } else {
                      setPassword(EXAMPLE_PASSWORD);
                      document.getElementById("login-identifier")?.focus();
                    }
                  }}
                >
                  <span>
                    <strong>
                      {roleLabels[account.role]}
                      {custom && (
                        <span className="ml-1 text-xs font-normal text-amber-600">
                          (sandi baru)
                        </span>
                      )}
                    </strong>
                    <small>{account.email}</small>
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
              );
            })}
          </div>
          <p>
            Kata sandi default: <code>{EXAMPLE_PASSWORD}</code> (jika belum diubah)
          </p>
        </details>
      )}
    </AuthLayout>
  );
}
export default LoginPage;
