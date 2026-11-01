import { useState, type FormEvent } from "react";
import { relationships, type FamilyMember } from "../family/members";
export function FamilyEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: FamilyMember;
  onSave: (value: FamilyMember) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [relation, setRelation] = useState<FamilyMember["relationship"]>(
    initial?.relationship || "anak",
  );
  const [nik, setNik] = useState(initial?.nik || "");
  const [error, setError] = useState("");
  const save = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (name.trim().length < 1 || (nik && !/^\d{16}$/.test(nik))) {
      setError(
        "Isi nama sesuai identitas. NIK boleh kosong; jika diisi harus 16 angka.",
      );
      return;
    }
    try {
      onSave({
        id: initial?.id || crypto.randomUUID(),
        name: name.trim(),
        relationship: relation,
        nik,
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Data belum tersimpan.",
      );
    }
  };
  return (
    <form className="auth-form mt-4 max-w-2xl" onSubmit={save}>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-field">
        <label htmlFor="family-name">Nama anggota keluarga</label>
        <input
          id="family-name"
          required
          minLength={3}
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="form-field">
        <label htmlFor="family-relation">Hubungan dengan pemilik akun</label>
        <select
          id="family-relation"
          value={relation}
          onChange={(event) =>
            setRelation(event.target.value as FamilyMember["relationship"])
          }
        >
          {Object.entries(relationships).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="family-nik">
          NIK anggota keluarga (jika sudah ada)
        </label>
        <input
          id="family-nik"
          inputMode="numeric"
          maxLength={16}
          value={nik}
          onChange={(event) => setNik(event.target.value.replace(/\D/g, ""))}
        />
        <p className="field-hint">
          Boleh kosong untuk anak yang belum memiliki NIK. Persyaratan setiap
          layanan tetap perlu diperiksa.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="button-primary">Simpan data keluarga</button>
        <button type="button" className="button-secondary" onClick={onCancel}>
          Batal
        </button>
      </div>
    </form>
  );
}
