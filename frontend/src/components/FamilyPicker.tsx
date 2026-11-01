import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  useFamilyMembers,
  relationships,
  type FamilyMember,
} from "../family/members";
import { FamilyEditor } from "./FamilyEditor";
export function FamilyPicker({
  value,
  onChange,
}: {
  value?: FamilyMember;
  onChange: (value?: FamilyMember) => void;
}) {
  const { members, save } = useFamilyMembers();
  const location = useLocation();
  const returnQuery = new URLSearchParams(location.search);
  returnQuery.set("target", "anggota_keluarga");
  const [adding, setAdding] = useState(false);
  const current = members.find((item) => item.id === value?.id);
  return (
    <div className="mt-5 border-t border-slate-200 pt-4">
      <div className="form-field">
        <label htmlFor="family-member">Anggota keluarga yang diurus</label>
        <select
          id="family-member"
          value={value?.id || ""}
          onChange={(event) => {
            const member = members.find(
              (item) => item.id === event.target.value,
            );
            onChange(member ? { ...member } : undefined);
          }}
        >
          <option value="">Pilih anggota keluarga</option>
          {value && !current && (
            <option value={value.id}>
              {value.name} · data pada persiapan ini
            </option>
          )}
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name} · {relationships[member.relationship]}
            </option>
          ))}
        </select>
      </div>
      {value && (
        <p className="text-sm mt-2">
          Untuk {value.name} ({relationships[value.relationship]}). Data orang
          yang mengurus diisi terpisah.
        </p>
      )}
      {current && JSON.stringify(current) !== JSON.stringify(value) && (
        <button
          type="button"
          className="text-link min-h-[44px]"
          onClick={() => onChange({ ...current })}
        >
          Gunakan data keluarga terbaru
        </button>
      )}
      <div className="flex flex-wrap gap-4 mt-2">
        <button
          type="button"
          className="text-link min-h-[44px]"
          onClick={() => setAdding(!adding)}
        >
          {adding ? "Tutup penambahan" : "Tambah anggota keluarga"}
        </button>
        <Link
          className="text-link min-h-[44px] inline-flex items-center"
          to="/keluarga"
          state={{ returnTo: location.pathname + "?" + returnQuery.toString() }}
        >
          Kelola data keluarga →
        </Link>
      </div>
      {adding && (
        <FamilyEditor
          onCancel={() => setAdding(false)}
          onSave={(member) => {
            save(member);
            onChange(member);
            setAdding(false);
          }}
        />
      )}
      <p className="field-hint mt-2">
        Data keluarga masih disimpan di perangkat ini dan belum diverifikasi
        melalui Dukcapil.
      </p>
    </div>
  );
}
