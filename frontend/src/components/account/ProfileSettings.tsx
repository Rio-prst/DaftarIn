import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useApp } from "../../context/AppContext";
import { accountApi, type AccountProfile } from "../../api/account";
import { roleLabels } from "../../auth/mockAuth";
export function ProfileSettings() {
  const { user, mode, updateProfile } = useAuth();
  const { showToast } = useApp();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(mode === "api");
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (mode !== "api") return;
    let active = true;
    setLoading(true);
    setLoadError("");
    accountApi
      .profile()
      .then((result) => {
        if (active) {
          setProfile(result);
          setName(result.display_name);
          setPhone(result.phone);
        }
      })
      .catch((cause) => {
        if (active)
          setLoadError(
            cause instanceof Error
              ? cause.message
              : "Profil belum dapat dimuat.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [mode, user?.id, attempt]);
  if (!user) return null;
  const nikLastFour = mode === "api" ? profile?.identity?.nik_last_four : user.nik?.slice(-4);
  const familyCardLastFour = mode === "api"
    ? profile?.identity?.family_card_last_four
    : user.familyCardNumber?.slice(-4);
  const photoAdded = mode === "api" ? profile?.identity?.photo_uploaded : !!user.identityPhoto;
  const showIdentity = user.role === "warga" && !loading && !loadError;
  const masked = (lastFour?: string) => lastFour ? "•••• •••• •••• " + lastFour : "Belum tercatat";
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (name.trim().length < 1) {
      setError("Isi nama lengkap sesuai identitas.");
      return;
    }
    const normalizedPhone = phone.replace(/[\s-]/g, "");
    if (normalizedPhone && !/^\+?\d{10,15}$/.test(normalizedPhone)) {
      setError("Isi nomor telepon 10–15 angka.");
      return;
    }
    setBusy(true);
    try {
      const version = await updateProfile({
        name: name.trim(),
        phone: normalizedPhone,
        expectedUpdatedAt: profile?.updated_at,
      });
      if (version)
        setProfile((previous) =>
          previous
            ? {
                ...previous,
                display_name: name.trim(),
                phone: normalizedPhone,
                updated_at: version,
              }
            : previous,
        );
      showToast("Data akun disimpan.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Data akun belum tersimpan.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="account-grid">
      <section className="plain-panel" aria-labelledby="profile-title">
        <h2 id="profile-title" className="panel-title">
          Profil
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Gunakan nama dan nomor telepon yang dapat dihubungi.
        </p>
        {loading && (
          <p role="status" className="mt-4">
            Memuat profil…
          </p>
        )}
        {loadError && (
          <div className="mt-4">
            <p role="alert" className="form-error">
              {loadError}
            </p>
            <button
              type="button"
              className="button-secondary mt-3"
              onClick={() => setAttempt((value) => value + 1)}
            >
              Muat ulang profil
            </button>
          </div>
        )}
        <form className="auth-form" onSubmit={submit} noValidate>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="form-field">
            <label htmlFor="account-name">Nama lengkap</label>
            <input
              id="account-name"
              autoComplete="name"
              maxLength={200}
              value={name}
              disabled={loading || !!loadError || busy}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="account-phone">Nomor telepon</label>
            <input
              id="account-phone"
              type="tel"
              autoComplete="tel"
              maxLength={30}
              value={phone}
              disabled={loading || !!loadError || busy}
              onChange={(event) => setPhone(event.target.value)}
            />
            <p className="field-hint">Contoh: 081234567890.</p>
          </div>
          <button
            className="button-primary"
            disabled={loading || !!loadError || busy}
          >
            {busy ? "Menyimpan…" : "Simpan profil"}
          </button>
        </form>
      </section>
      <section className="plain-panel" aria-labelledby="account-details-title">
        <h2 id="account-details-title" className="panel-title">
          Informasi akun
        </h2>
        <dl className="record-details mt-4">
          <div>
            <dt>Email</dt>
            <dd className="[overflow-wrap:anywhere]">{user.email}</dd>
          </div>
          <div>
            <dt>Peran</dt>
            <dd>{roleLabels[user.role]}</dd>
          </div>
          {showIdentity && (
            <>
              <div>
                <dt>NIK</dt>
                <dd>{masked(nikLastFour)}</dd>
              </div>
              <div>
                <dt>Nomor Kartu Keluarga</dt>
                <dd>{masked(familyCardLastFour)}</dd>
              </div>
              <div>
                <dt>Foto KTP</dt>
                <dd>{photoAdded ? "Sudah ditambahkan" : "Belum tercatat"}</dd>
              </div>
            </>
          )}
          {(profile?.created_at || user.createdAt) && (
            <div>
              <dt>Terdaftar</dt>
              <dd>
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "long",
                  timeZone: "Asia/Jakarta",
                }).format(new Date(profile?.created_at || user.createdAt))}
              </dd>
            </div>
          )}
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          {mode === "api"
            ? "Profil akun disimpan di server. Verifikasi NIK dan foto KTP belum terhubung ke layanan pemerintah."
            : "Profil ini memakai data contoh yang tersimpan di browser ini."}
        </p>
        <Link className="text-link mt-4 inline-block" to="/privasi">
          Tentang penggunaan data →
        </Link>
      </section>
    </div>
  );
}
