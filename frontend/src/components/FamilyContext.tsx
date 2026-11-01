import { relationships, type FamilyMember } from "../family/members";
export function FamilyContext({
  member,
  birth = false,
}: {
  member?: FamilyMember;
  birth?: boolean;
}) {
  if (!member) return null;
  return (
    <section
      aria-label="Anggota keluarga yang diurus"
      className="border-l-2 border-slate-300 pl-4 my-5"
    >
      <h2 className="text-sm font-semibold">Pengurusan untuk {member.name}</h2>
      {member.nik && (
        <p className="text-sm mt-1">
          NIK anggota keluarga:{" "}
          <span className="font-mono break-all">{member.nik}</span>
        </p>
      )}
      <p className="text-sm text-slate-600 mt-1">
        Hubungan dengan pengurus: {relationships[member.relationship]}.
        {birth
          ? " Formulir berikut berisi identitas orang tua atau pelapor, bukan NIK bayi."
          : " Data pada formulir harus sesuai pemohon layanan ini."}
      </p>
      {member.authorization&&<p className="text-sm text-slate-600 mt-2">Pernyataan pendampingan dicatat oleh {member.authorization.by}. Berlaku untuk persiapan dan tinjauan ini; tidak menggantikan bukti kewenangan dari instansi.</p>}
    </section>
  );
}
