import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useApp } from "../../context/AppContext";
import { accountApi, type AccountSession } from "../../api/account";
import { PasswordField } from "../PasswordField";
function date(value: string) {
  return (
    new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(new Date(value)) + " WIB"
  );
}
function Sessions() {
  const { mode } = useAuth();
  const { showToast } = useApp();
  const [rows, setRows] = useState<AccountSession[]>([]);
  const [loading, setLoading] = useState(mode === "api");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => {
    if (mode !== "api") return;
    let active = true;
    setLoading(true);
    setError("");
    accountApi
      .sessions()
      .then((value) => {
        if (active) setRows(value);
      })
      .catch((cause) => {
        if (active)
          setError(
            cause instanceof Error ? cause.message : "Sesi belum dapat dimuat.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [mode, attempt]);
  const revoke = async (id: string) => {
    setBusy(id);
    setError("");
    try {
      await accountApi.revokeSession(id);
      showToast("Sesi lain berhasil dikeluarkan.");
      setAttempt((value) => value + 1);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Sesi belum berhasil dikeluarkan.",
      );
    } finally {
      setBusy(null);
    }
  };
  return (
    <section className="plain-panel" aria-labelledby="sessions-title">
      <h2 id="sessions-title" className="panel-title">
        Sesi masuk
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Keluarkan sesi lain yang tidak kamu gunakan. Sesi di halaman ini tetap
        aktif.
      </p>
      {mode === "demo" ? (
        <p className="mt-4 rounded-lg border border-slate-200 p-4 text-sm">
          Sesi browser ini · akun contoh. Pengelolaan sesi antarperangkat
          tersedia saat memakai akun server.
        </p>
      ) : (
        <>
          {loading && (
            <p className="mt-4" role="status">
              Memuat sesi…
            </p>
          )}
          {error && (
            <div className="mt-4">
              <p className="form-error" role="alert">
                {error}
              </p>
              <button
                className="text-link mt-2"
                type="button"
                onClick={() => setAttempt((value) => value + 1)}
              >
                Muat ulang sesi
              </button>
            </div>
          )}
          {!loading && !error && (
            <ul className="mt-4 divide-y divide-slate-200">
              {rows.map((row) => (
                <li key={row.id} className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {row.current ? "Sesi ini" : "Sesi lain"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Masuk: {date(row.created_at)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Berlaku sampai: {date(row.expires_at)}
                      </p>
                    </div>
                    {!row.current && (
                      <button
                        className="button-secondary"
                        type="button"
                        disabled={busy !== null}
                        onClick={() => void revoke(row.id)}
                      >
                        {busy === row.id ? "Mengeluarkan…" : "Keluarkan sesi"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
export function SecuritySettings() {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!current) {
      setError("Isi kata sandi saat ini.");
      return;
    }
    if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
      setError(
        "Gunakan kata sandi minimal 8 karakter dan jangan terlalu panjang.",
      );
      return;
    }
    if (password !== confirm) {
      setError("Ulangi kata sandi baru yang sama.");
      return;
    }
    setBusy(true);
    try {
      await changePassword(current, password);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Kata sandi belum diubah.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="account-grid">
      <section className="plain-panel" aria-labelledby="password-title">
        <h2 id="password-title" className="panel-title">
          Ganti kata sandi
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Setelah kata sandi diperbarui, semua sesi akan dikeluarkan. Masuk
          kembali dengan kata sandi baru.
        </p>
        <form className="auth-form" onSubmit={submit} noValidate>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <PasswordField
            id="password-current"
            label="Kata sandi saat ini"
            value={current}
            onChange={setCurrent}
            autoComplete="current-password"
          />
          <PasswordField
            id="password-new"
            label="Kata sandi baru"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            hint="Minimal 8 karakter. Hindari menggunakan data identitas."
          />
          <PasswordField
            id="password-confirm"
            label="Ulangi kata sandi baru"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
          />
          <button className="button-primary" disabled={busy}>
            {busy ? "Memperbarui…" : "Perbarui kata sandi"}
          </button>
        </form>
      </section>
      <Sessions />
    </div>
  );
}
