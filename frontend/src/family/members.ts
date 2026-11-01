import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
export const relationships = {
  anak: "Anak",
  pasangan: "Pasangan",
  orang_tua: "Orang tua",
  saudara: "Saudara",
  lainnya: "Anggota keluarga lain",
};
export interface FamilyMember {
  authorization?: {by:string;confirmedAt:string;scope:'persiapan_dan_tinjauan'};
  id: string;
  name: string;
  relationship: keyof typeof relationships;
  nik: string;
}
function valid(value: unknown): value is FamilyMember {
  if (!value || typeof value !== "object") return false;
  const row = value as FamilyMember;
  return (
    typeof row.id === "string" &&
    typeof row.name === "string" &&
    row.name.trim().length >= 1 &&
    row.name.length <= 120 &&
    Object.hasOwn(relationships, row.relationship) &&
    typeof row.nik === "string" &&
    (!row.nik || /^\d{16}$/.test(row.nik))
  );
}
export function useFamilyMembers() {
  const { user } = useAuth();
  const key = "daftarin:" + (user?.id || "guest") + ":family:v1";
  const read = useCallback(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value.filter(valid).slice(0, 100) : [];
    } catch {
      return [];
    }
  }, [key]);
  const [members, setMembers] = useState<FamilyMember[]>(read);
  useEffect(() => {
    const sync = () => setMembers(read());
    window.addEventListener("storage", sync);
    window.addEventListener("daftarin-family-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("daftarin-family-updated", sync);
    };
  }, [read]);
  const write = (next: FamilyMember[]) => {
    if (!user || user.role !== "warga")
      throw new Error("Masuk sebagai warga untuk menyimpan data keluarga.");
    localStorage.setItem(key, JSON.stringify(next));
    setMembers(next);
    window.dispatchEvent(new Event("daftarin-family-updated"));
  };
  return {
    members,
    save: (member: FamilyMember) => {
      if (!valid(member))
        throw new Error("Periksa nama, hubungan, dan NIK anggota keluarga.");
      const rows = read();
      if (rows.length >= 100 && !rows.some((item) => item.id === member.id))
        throw new Error("Batas profil keluarga tercapai.");
      write([...rows.filter((item) => item.id !== member.id), member]);
    },
    remove: (id: string) => write(read().filter((item) => item.id !== id)),
  };
}
