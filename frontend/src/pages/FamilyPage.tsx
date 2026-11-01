import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { WorkspaceLayout } from "../components/WorkspaceLayout";
import { FamilyEditor } from "../components/FamilyEditor";
import {
  relationships,
  useFamilyMembers,
  type FamilyMember,
} from "../family/members";
export function FamilyPage() {
  const location = useLocation();
  const previous = location.state?.returnTo;
  const back =
    typeof previous === "string" && previous.startsWith("/persiapan/kebutuhan?")
      ? previous
      : "/akun";
  const { members, save, remove } = useFamilyMembers();
  const [editing, setEditing] = useState<FamilyMember | null | undefined>(
    undefined,
  );
  const [error, setError] = useState("");
  return (
    <WorkspaceLayout
      title="Data keluarga"
      description="Simpan profil keluarga untuk memilih pemohon pada persiapan berikutnya."
      actions={
        <Link className="text-link" to={back}>
          {back === "/akun" ? "Kembali ke akun" : "Kembali ke persiapan"}
        </Link>
      }
    >
      <p className="text-sm text-slate-600 mb-5">
        Data masih berada di perangkat ini. Perubahan profil tidak otomatis
        mengubah data pada persiapan atau berkas yang sudah dikirim.
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {editing !== undefined ? (
        <section className="plain-panel mb-5">
          <h2 className="panel-title">
            {editing ? "Ubah anggota keluarga" : "Tambah anggota keluarga"}
          </h2>
          <FamilyEditor
            key={editing?.id || "new"}
            initial={editing || undefined}
            onCancel={() => setEditing(undefined)}
            onSave={(member) => {
              save(member);
              setEditing(undefined);
            }}
          />
        </section>
      ) : (
        <button
          className="button-primary mb-5"
          type="button"
          onClick={() => setEditing(null)}
        >
          Tambah anggota keluarga
        </button>
      )}
      {members.length ? (
        <ul className="plain-panel !py-0">
          {members.map((member) => (
            <li
              key={member.id}
              className="py-5 border-b border-slate-200 last:border-0"
            >
              <h2 className="font-semibold">{member.name}</h2>
              <p className="text-sm text-slate-600 mt-2">
                {relationships[member.relationship]} ·{" "}
                {member.nik
                  ? "NIK berakhir " + member.nik.slice(-4)
                  : "NIK belum diisi"}
              </p>
              <div className="flex gap-5 mt-2">
                <button
                  className="text-link min-h-[44px]"
                  type="button"
                  aria-label={"Ubah " + member.name}
                  onClick={() => setEditing(member)}
                >
                  Ubah
                </button>
                <button
                  className="text-link min-h-[44px]"
                  type="button"
                  aria-label={"Hapus " + member.name}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Hapus profil " +
                          member.name +
                          "? Data pada persiapan yang sudah dibuat tetap tersimpan.",
                      )
                    )
                      try {
                        remove(member.id);
                      } catch {
                        setError("Data keluarga belum dapat dihapus.");
                      }
                  }}
                >
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <h2>Belum ada profil keluarga</h2>
          <p>
            Tambahkan anggota keluarga agar datanya tidak tertukar dengan
            pengurusan pribadi.
          </p>
        </div>
      )}
    </WorkspaceLayout>
  );
}
