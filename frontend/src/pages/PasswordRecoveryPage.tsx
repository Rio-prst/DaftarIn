import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { mockAuth } from "../auth/mockAuth";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordField } from "../components/PasswordField";
export function PasswordRecoveryPage() {
  const { logout } = useAuth();
  const [params] = useSearchParams();
  const token = params.get("token");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (token) {
      if (password.length < 8 || password !== confirm) {
        setError("Gunakan minimal 8 karakter dan ulangi kata sandi yang sama.");
        return;
      }
      setBusy(true);
      try {
        await mockAuth.resetPassword(token, password);
        logout();
        setDone(true);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Kata sandi belum berhasil diganti.",
        );
      } finally {
        setBusy(false);
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Isi alamat email yang benar.");
        return;
      }
      setResetToken(mockAuth.requestReset(email));
      setSent(true);
    }
  };
  return (
    <AuthLayout
      title={
        done
          ? "Kata sandi diperbarui"
          : token
            ? "Buat kata sandi baru"
            : "Lupa kata sandi?"
      }
      intro={
        done
          ? "Gunakan kata sandi baru untuk masuk."
          : token
            ? "Pilih kata sandi minimal 8 karakter."
            : "Masukkan email yang digunakan saat mendaftar."
      }
    >
      {done ? (
        <Link to="/masuk" className="button-primary">
          Kembali masuk
        </Link>
      ) : (
        <>
          <form className="auth-form" onSubmit={submit} noValidate>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {token ? (
              <>
                <PasswordField
                  id="reset-password"
                  label="Kata sandi baru"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                />
                <PasswordField
                  id="reset-confirm"
                  label="Ulangi kata sandi"
                  value={confirm}
                  onChange={setConfirm}
                  autoComplete="new-password"
                />
              </>
            ) : (
              <div className="form-field">
                <label htmlFor="reset-email">Email</label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            )}
            <button className="button-primary auth-submit" disabled={busy}>
              {busy
                ? "Menyimpan…"
                : token
                  ? "Simpan kata sandi"
                  : "Minta tautan pemulihan"}
            </button>
          </form>
          {sent && (
            <div className="recovery-message" role="status">
              <p>
                Jika email terdaftar, tautan pemulihan tersedia di kotak pesan
                contoh.
              </p>
              {resetToken && (
                <div>
                  <strong>Kotak pesan contoh</strong>
                  <p>
                    Layanan email belum terhubung. Tautan ini berlaku 15 menit
                    dan hanya dapat digunakan sekali di browser ini.
                  </p>
                  <Link
                    className="text-link"
                    to={"/lupa-sandi?token=" + resetToken}
                    onClick={() => {
                      setSent(false);
                      setError("");
                    }}
                  >
                    Buka tautan pemulihan →
                  </Link>
                </div>
              )}
            </div>
          )}
          <p className="auth-switch">
            <Link to="/masuk" className="text-link">
              Kembali masuk
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
