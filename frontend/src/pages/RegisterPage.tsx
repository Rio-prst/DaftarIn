import { DEMO_HELPERS_ENABLED } from "../utils/demoHelpers";
import { PhotoPreparationDialog } from "../components/PhotoPreparationDialog";
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
  familyCardNumber: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
};
const empty: Fields = {
  name: "",
  nik: "",
  familyCardNumber: "",
  email: "",
  phone: "",
  password: "",
  confirm: "",
};
export function RegisterPage() {
  const { user, register, mode } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [stage, setStage] = useState(1);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [fields, setFields] = useState(empty);
  const [photo, setPhoto] = useState<IdentityPhoto | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
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
  const maxPhotoMb = mode === "api" ? 4 : 5;
  const maxPhotoBytes = maxPhotoMb * 1024 * 1024;
  const choosePhoto = (file?: File, allowPreparation = true) => {
    if (!file) return;
    setPhoto(null);
    setPhotoFile(null);
    setPreview("");
    if (allowPreparation && file.type.startsWith("image/") && file.size > maxPhotoBytes) {
      setPendingPhoto(file);
      return;
    }
    const valid =
      ["image/jpeg", "image/png"].includes(file.type) &&
      /\.(jpg|jpeg|png)$/i.test(file.name);
    if (!valid || file.size <= 0 || file.size > maxPhotoBytes) {
      setErrors((previous) => ({
        ...previous,
        photo:
          `Pilih foto JPG atau PNG, maksimal ${maxPhotoMb} MB, dan pastikan file tidak kosong.`,
      }));
      return;
    }
    setPhoto({
      name: file.name,
      type: file.type,
      size: file.size,
      sample: false,
    });
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
    setErrors((previous) => ({ ...previous, photo: "" }));
  };
  const useExamplePhoto = async () => {
    if (mode === "api") {
      try {
        const response = await fetch("/demo-documents/ktp-contoh.png");
        if (!response.ok) throw new Error();
        choosePhoto(new File([await response.blob()], "ktp-contoh.png", { type: "image/png" }));
      } catch {
        setErrors((previous) => ({ ...previous, photo: "Foto contoh gagal dimuat. Pilih foto dari perangkat." }));
      }
      return;
    }
    setPhoto({
      name: "ktp-contoh.svg",
      type: "image/svg+xml",
      size: 0,
      sample: true,
    });
    setPreview("/images/ktp-contoh.svg");
    setErrors((previous) => ({ ...previous, photo: "" }));
  };
  const example = () => {
    setStage(1);
    const unique = Date.now().toString();
    setFields({
      name: "Warga Contoh",
      nik: ("0000000000000000" + unique).slice(-16),
      familyCardNumber: "0000000000000010",
      email: "warga." + unique + "@contoh.test",
      phone: "080000000001",
      password: EXAMPLE_PASSWORD,
      confirm: EXAMPLE_PASSWORD,
    });
    void useExamplePhoto();
    setConsent(false);
    setErrors({});
    setError("");
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (stage === 1) {
      const next: Record<string, string> = {};
      if (!fields.name.trim()) next.name = "Isi nama lengkap sesuai identitas.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
        next.email = "Isi alamat email yang benar.";
      setErrors(next);
      if (!Object.keys(next).length) setStage(2);
      return;
    }
    const nextErrors: Record<string, string> = {};
    if (fields.name.trim().length < 1)
      nextErrors.name = "Isi nama lengkap sesuai identitas.";
    if (!/^\d{16}$/.test(fields.nik))
      nextErrors.nik = "NIK harus berisi 16 angka.";
    if (!/^\d{16}$/.test(fields.familyCardNumber))
      nextErrors.familyCardNumber = "Nomor KK harus berisi 16 angka.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      nextErrors.email = "Isi alamat email yang benar.";
    if (!/^\+?\d{10,15}$/.test(fields.phone))
      nextErrors.phone = "Isi nomor telepon 10–15 angka.";
    if (mode === "api" ? !photoFile : !photo)
      nextErrors.photo = "Pilih foto KTP.";
    if (fields.password.length < 8)
      nextErrors.password = "Gunakan minimal 8 karakter.";
    if (new TextEncoder().encode(fields.password).length > 72)
      nextErrors.password = "Kata sandi terlalu panjang. Gunakan karakter yang lebih pendek.";
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
      const result = await register({
        ...fields,
        identityPhoto: photo ?? undefined,
        identityPhotoFile: mode === "api" ? photoFile ?? undefined : undefined,
      });
      navigate(
        result.signedIn
          ? permittedReturnPath(params.get("next"), result.account.role)
          : "/masuk?registered=1&email=" +
              encodeURIComponent(fields.email) +
              (params.get("next")
                ? "&next=" + encodeURIComponent(params.get("next")!)
                : ""),
        {
          replace: true,
        },
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Akun belum berhasil dibuat.",
      );
    } finally {
      setBusy(false);
    }
  };
  const input = (
    key: "name" | "nik" | "familyCardNumber" | "email" | "phone",
    label: string,
    type = "text",
    autoComplete?: string,
  ) => {
    const numericId = key === "nik" || key === "familyCardNumber";
    return (
    <div className="form-field">
      <label htmlFor={"register-" + key}>{label}</label>
      <input
        id={"register-" + key}
        value={fields[key]}
        type={type}
        autoComplete={autoComplete}
        inputMode={numericId ? "numeric" : undefined}
        maxLength={numericId ? 16 : undefined}
        onChange={(event) =>
          change(
            key,
            numericId
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
  };
  return (
    <AuthLayout
      title="Daftar akun warga"
      intro="Simpan persiapan berkas dan ikuti perkembangan pengajuanmu."
      wide
    >
      {DEMO_HELPERS_ENABLED && (
        <div className="sample-registration">
          <p>Gunakan data fiktif saat mencoba. Baca persetujuan sebelum mencentangnya.</p>
          <button type="button" className="text-link" onClick={example}>
            Isi data contoh
          </button>
        </div>
      )}
      <p className="text-sm mt-4" role="status">
        Langkah {stage} dari 2 ·{" "}
        {stage === 1 ? "Nama dan akun" : "Identitas dan keamanan"}
      </p>
      <Link
        className="text-link inline-flex items-center min-h-[44px]"
        to="/bantuan"
      >
        Tidak punya email atau dibantu keluarga? Lihat panduan pendampingan →
      </Link>
      {pendingPhoto && (
        <PhotoPreparationDialog
          file={pendingPhoto}
          onClose={() => setPendingPhoto(null)}
          onReady={(file) => {
            setPendingPhoto(null);
            choosePhoto(file, false);
          }}
        />
      )}
      <form className="auth-form" onSubmit={submit} noValidate>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <fieldset hidden={stage !== 1}>
          <legend>Data akun</legend>
          <div className="form-grid">
            {input("name", "Nama lengkap", "text", "name")}
            {input("email", "Email", "email", "email")}
          </div>
        </fieldset>
        {stage === 1 && (
          <button type="submit" className="button-primary">
            Lanjutkan ke data identitas
          </button>
        )}
        <div hidden={stage !== 2} className="space-y-5">
          <p>
            {fields.name} · {fields.email}
          </p>
          <button
            type="button"
            className="text-link min-h-[44px]"
            onClick={() => setStage(1)}
          >
            Ubah data akun
          </button>
          <div className="form-grid">
            {input("nik", "NIK (16 angka)")}
            {input("familyCardNumber", "Nomor Kartu Keluarga (16 angka)")}
            {input("phone", "Nomor telepon", "tel", "tel")}
          </div>
          <fieldset>
            <legend>Foto KTP</legend>
            <p className="field-hint">
              JPG atau PNG, maksimal {maxPhotoMb} MB. Pastikan tulisan dan seluruh sisi
              kartu terlihat.
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
                {(mode === "demo" || DEMO_HELPERS_ENABLED) && (
                  <button type="button" className="text-link" onClick={useExamplePhoto}>
                    Gunakan foto contoh
                  </button>
                )}
                <p
                  id="register-photo-hint"
                  className={errors.photo ? "field-error" : "field-hint"}
                >
                  {errors.photo ||
                    (mode === "api"
                      ? "Foto KTP disimpan secara privat untuk pendaftaran akun."
                      : "Mode contoh hanya menyimpan keterangan file di browser.")}
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
        </div>
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
