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
      setError("Isi NIK/email dan kata sandi terlebih dahulu.");
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
  return (
    <AuthLayout
      title="Masuk ke DaftarIn"
      intro="Gunakan NIK atau email yang terdaftar."
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-field">
          <label htmlFor="login-identifier">NIK atau email</label>
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
      <details className="example-accounts">
        <summary>Coba akun contoh</summary>
        <p>Setiap akun berisi data contoh sesuai perannya.</p>
        <div>
          {EXAMPLE_ACCOUNTS.map((account) => (
            <button
              type="button"
              key={account.id}
              onClick={() => {
                setIdentifier(account.email);
                setPassword(EXAMPLE_PASSWORD);
                setError("");
                document.getElementById("login-identifier")?.focus();
              }}
            >
              <span>
                <strong>{roleLabels[account.role]}</strong>
                <small>{account.email}</small>
              </span>
              <span aria-hidden="true">→</span>
            </button>
          ))}
        </div>
        <p>
          Kata sandi: <code>{EXAMPLE_PASSWORD}</code>
        </p>
      </details>
    </AuthLayout>
  );
}
