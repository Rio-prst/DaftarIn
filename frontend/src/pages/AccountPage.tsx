import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { roleLabels } from "../auth/mockAuth";
import { useApp } from "../context/AppContext";
import { WorkspaceLayout } from "../components/WorkspaceLayout";
export function AccountPage() {
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [error, setError] = useState("");
  if (!user) return null;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      updateProfile({ name, phone });
      showToast("Data akun disimpan.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Perubahan belum tersimpan.",
      );
    }
  };
  return (
    <WorkspaceLayout title="Akun saya">
      <div className="account-grid">
        <section className="plain-panel">
          <h2 className="panel-title">Data akun</h2>
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
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="account-phone">Nomor telepon</label>
              <input
                id="account-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <dl className="record-details">
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Peran</dt>
                <dd>{roleLabels[user.role]}</dd>
              </div>
              {user.nik && (
                <div>
                  <dt>NIK</dt>
                  <dd>{"•••• •••• •••• " + user.nik.slice(-4)}</dd>
                </div>
              )}
            </dl>
            <button className="button-primary">Simpan perubahan</button>
          </form>
        </section>
        <section className="plain-panel">
          <h2 className="panel-title">
            {user.role === "warga" ? "Identitas" : "Informasi akses"}
          </h2>
          <p>
            {user.role !== "warga"
              ? "Akses akun pengelola diberikan melalui admin."
              : user.identityStatus === "pending"
                ? "Identitas belum diverifikasi."
                : "Identitas akun contoh telah diisi."}
          </p>
          {user.identityPhoto && (
            <>
              <p className="field-hint mt-3">
                Foto KTP: {user.identityPhoto.name}
              </p>
              {user.identityPhoto.sample && (
                <img
                  className="account-sample-photo"
                  src="/images/ktp-contoh.svg"
                  alt="Kartu identitas contoh"
                />
              )}
            </>
          )}
          <p className="field-hint mt-4">
            Versi ini menggunakan data contoh. Foto KTP tidak dikirim ke server
            dan identitas belum diperiksa melalui layanan pemerintah.
          </p>
          <button
            className="button-secondary mt-6"
            type="button"
            onClick={() => {
              logout();
              navigate("/", { replace: true });
            }}
          >
            Keluar dari akun
          </button>
        </section>
      </div>
    </WorkspaceLayout>
  );
}
