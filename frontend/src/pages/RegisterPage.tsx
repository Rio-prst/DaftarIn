import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { permittedReturnPath, type IdentityPhoto } from "../auth/types";
import { EXAMPLE_PASSWORD } from "../auth/mockAuth";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordField } from "../components/PasswordField";
type Fields = {
  name: string;
  nik: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
};
const empty: Fields = {
  name: "",
  nik: "",
  email: "",
  phone: "",
  password: "",
  confirm: "",
};
export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [fields, setFields] = useState(empty);
  const [photo, setPhoto] = useState<IdentityPhoto | null>(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(
    () => () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  if (user)
    return (
      <Navigate
        to={permittedReturnPath(params.get("next"), user.role)}
        replace
      />
    );
  const change = (key: keyof Fields, value: string) => {
    setFields((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
  };
  const choosePhoto = (file?: File) => {
    if (!file) return;
    const valid =
      ["image/jpeg", "image/png"].includes(file.type) &&
      /\.(jpg|jpeg|png)$/i.test(file.name);
    if (!valid || file.size <= 0 || file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        photo:
          "Pilih foto JPG atau PNG, maksimal 5 MB, dan pastikan file tidak kosong.",
      }));
      return;
    }
    setPhoto({
      name: file.name,
      type: file.type,
      size: file.size,
      sample: false,
    });
    setPreview(URL.createObjectURL(file));
    setErrors((previous) => ({ ...previous, photo: "" }));
  };
  const example = () => {
    const unique = Date.now().toString();
    setFields({
      name: "Warga Contoh",
      nik: ("0000000000000000" + unique).slice(-16),
      email: "warga." + unique + "@contoh.test",
      phone: "080000000001",
      password: EXAMPLE_PASSWORD,
      confirm: EXAMPLE_PASSWORD,
    });
    setPhoto({
      name: "ktp-contoh.svg",
      type: "image/svg+xml",
      size: 0,
      sample: true,
    });
    setPreview("/images/ktp-contoh.svg");
    setErrors({});
    setError("");
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (fields.name.trim().length < 3)
      nextErrors.name = "Isi nama lengkap, minimal 3 karakter.";
    if (!/^\d{16}$/.test(fields.nik))
      nextErrors.nik = "NIK harus berisi 16 angka.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      nextErrors.email = "Isi alamat email yang benar.";
    if (!/^\+?\d{10,15}$/.test(fields.phone))
      nextErrors.phone = "Isi nomor telepon 10–15 angka.";
    if (!photo) nextErrors.photo = "Pilih foto KTP atau gunakan foto contoh.";
    if (fields.password.length < 8)
      nextErrors.password = "Gunakan minimal 8 karakter.";
    if (fields.confirm !== fields.password || !fields.confirm)
      nextErrors.confirm = "Ketik ulang kata sandi yang sama.";
    if (!consent)
      nextErrors.consent = "Persetujuan diperlukan untuk membuat akun.";
    setErrors(nextErrors);
    setError("");
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() =>
        document
          .getElementById("register-" + Object.keys(nextErrors)[0])
          ?.focus(),
      );
      return;
    }
    setBusy(true);
    try {
      const account = await register({ ...fields, identityPhoto: photo! });
      navigate(permittedReturnPath(params.get("next"), account.role), {
        replace: true,
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Akun belum berhasil dibuat.",
      );
    } finally {
      setBusy(false);
    }
  };
  const input = (
    key: "name" | "nik" | "email" | "phone",
    label: string,
    type = "text",
    autoComplete?: string,
  ) => (
    <div className="form-field">
      <label htmlFor={"register-" + key}>{label}</label>
      <input
        id={"register-" + key}
        value={fields[key]}
        type={type}
        autoComplete={autoComplete}
        inputMode={key === "nik" ? "numeric" : undefined}
        maxLength={key === "nik" ? 16 : undefined}
        onChange={(event) =>
          change(
            key,
            key === "nik"
              ? event.target.value.replace(/\D/g, "")
              : event.target.value,
          )
        }
        aria-invalid={!!errors[key]}
        aria-describedby={
          errors[key] ? "register-" + key + "-error" : undefined
        }
      />
      {errors[key] && (
        <p className="field-error" id={"register-" + key + "-error"}>
          {errors[key]}
        </p>
      )}
    </div>
  );
  return (
    <AuthLayout
      title="Daftar akun warga"
      intro="Simpan persiapan berkas dan ikuti perkembangan pengajuanmu."
      wide
    >
      <div className="sample-registration">
        <p>Gunakan data dan foto contoh untuk mencoba pendaftaran.</p>
        <button type="button" className="text-link" onClick={example}>
          Isi data contoh
        </button>
      </div>
      <form className="auth-form" onSubmit={submit} noValidate>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <fieldset>
          <legend>Data diri</legend>
          <div className="form-grid">
            {input("name", "Nama lengkap", "text", "name")}
            {input("nik", "NIK (16 angka)")}
            {input("email", "Email", "email", "email")}
            {input("phone", "Nomor telepon", "tel", "tel")}
          </div>
        </fieldset>
        <fieldset>
          <legend>Foto KTP</legend>
          <p className="field-hint">
            JPG atau PNG, maksimal 5 MB. Pastikan tulisan dan seluruh sisi kartu
            terlihat.
          </p>
          <div className="identity-upload">
            {preview && (
              <img src={preview} alt="Pratinjau foto KTP yang dipilih" />
            )}
            <div>
              <input
                id="register-photo"
                type="file"
                accept="image/jpeg,image/png"
                onChange={(event) => choosePhoto(event.target.files?.[0])}
                aria-invalid={!!errors.photo}
                aria-describedby="register-photo-hint"
              />
              {photo && <p className="selected-file">{photo.name}</p>}
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setPhoto({
                    name: "ktp-contoh.svg",
                    type: "image/svg+xml",
                    size: 0,
                    sample: true,
                  });
                  setPreview("/images/ktp-contoh.svg");
                  setErrors((previous) => ({ ...previous, photo: "" }));
                }}
              >
                Gunakan foto contoh
              </button>
              <p
                id="register-photo-hint"
                className={errors.photo ? "field-error" : "field-hint"}
              >
                {errors.photo ||
                  "Foto hanya dipratinjau selama pendaftaran. Pada versi contoh ini, yang disimpan hanya keterangan file."}
              </p>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>Keamanan akun</legend>
          <div className="form-grid">
            <PasswordField
              id="register-password"
              label="Kata sandi"
              value={fields.password}
              onChange={(value) => change("password", value)}
              autoComplete="new-password"
              hint="Gunakan minimal 8 karakter."
              error={errors.password}
            />
            <PasswordField
              id="register-confirm"
              label="Ulangi kata sandi"
              value={fields.confirm}
              onChange={(value) => change("confirm", value)}
              autoComplete="new-password"
              error={errors.confirm}
            />
          </div>
        </fieldset>
        <div>
          <label className="consent-field">
            <input
              id="register-consent"
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? "consent-error" : undefined}
            />
            <span>
              Saya menyetujui penggunaan data untuk pendaftaran akun sesuai{" "}
              <Link
                to="/privasi"
                className="text-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                kebijakan privasi
              </Link>
              .
            </span>
          </label>
          {errors.consent && (
            <p id="consent-error" className="field-error">
              {errors.consent}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={busy}
          className="button-primary auth-submit"
        >
          {busy ? "Sedang membuat akun…" : "Buat akun"}
        </button>
      </form>
      <p className="auth-switch">
        Sudah punya akun?{" "}
        <Link
          className="text-link"
          to={
            "/masuk" +
            (params.get("next")
              ? "?next=" + encodeURIComponent(params.get("next")!)
              : "")
          }
        >
          Masuk
        </Link>
      </p>
    </AuthLayout>
  );
}
