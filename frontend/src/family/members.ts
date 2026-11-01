import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { request } from "../api/transport";

export const relationships = {
  anak: "Anak",
  pasangan: "Pasangan",
  orang_tua: "Orang tua",
  saudara: "Saudara",
  lainnya: "Anggota keluarga lain",
};

export interface FamilyMember {
  authorization?: {
    by: string;
    confirmedAt: string;
    scope: "persiapan_dan_tinjauan";
  };
  id: string;
  name: string;
  relationship: keyof typeof relationships;
  nik: string;
}

interface ApiFamilyMember {
  id: string;
  full_name: string;
  relationship: string;
  nik: string | null;
  birth_date: string | null;
  gender: string | null;
  is_under_age: boolean;
  created_at: string;
}

const relToApi: Record<keyof typeof relationships, string> = {
  anak: "CHILD",
  pasangan: "SPOUSE",
  orang_tua: "PARENT",
  saudara: "SIBLING",
  lainnya: "OTHER",
};

const apiToRel: Record<string, keyof typeof relationships> = {
  child: "anak",
  spouse: "pasangan",
  parent: "orang_tua",
  sibling: "saudara",
  other: "lainnya",
  ward: "lainnya",
};

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
  const { user, mode } = useAuth();
  const key = "daftarin:" + (user?.id || "guest") + ":family:v1";

  const readLocal = useCallback((): FamilyMember[] => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value.filter(valid).slice(0, 100) : [];
    } catch {
      return [];
    }
  }, [key]);

  const [members, setMembers] = useState<FamilyMember[]>(() =>
    mode === "demo" ? readLocal() : [],
  );
  const [loading, setLoading] = useState(mode === "api");
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (mode === "api") {
      if (!user || user.role !== "warga") {
        setMembers([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const rows = await request<ApiFamilyMember[]>("/account/family-members");
        const mapped: FamilyMember[] = rows.map((r) => ({
          id: r.id,
          name: r.full_name,
          relationship: apiToRel[r.relationship.toLowerCase()] || "lainnya",
          nik: r.nik || "",
        }));
        setMembers(mapped);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Gagal memuat data keluarga dari server.",
        );
      } finally {
        setLoading(false);
      }
    } else {
      setMembers(readLocal());
      setLoading(false);
    }
  }, [mode, user, readLocal]);

  useEffect(() => {
    void fetchMembers();
    if (mode === "demo") {
      const sync = () => setMembers(readLocal());
      window.addEventListener("storage", sync);
      window.addEventListener("daftarin-family-updated", sync);
      return () => {
        window.removeEventListener("storage", sync);
        window.removeEventListener("daftarin-family-updated", sync);
      };
    }
  }, [fetchMembers, mode, readLocal]);

  const writeLocal = (next: FamilyMember[]) => {
    if (!user || user.role !== "warga")
      throw new Error("Masuk sebagai warga untuk menyimpan data keluarga.");
    localStorage.setItem(key, JSON.stringify(next));
    setMembers(next);
    window.dispatchEvent(new Event("daftarin-family-updated"));
  };

  return {
    members,
    loading,
    error,
    reload: fetchMembers,
    save: async (member: FamilyMember) => {
      if (!valid(member))
        throw new Error("Periksa nama, hubungan, dan NIK anggota keluarga.");

      if (mode === "api") {
        if (!user || user.role !== "warga")
          throw new Error("Masuk sebagai warga untuk menyimpan data keluarga.");

        const isExisting = members.some((m) => m.id === member.id);
        const relApi = relToApi[member.relationship] || "OTHER";

        if (isExisting) {
          const updated = await request<ApiFamilyMember>(
            `/account/family-members/${encodeURIComponent(member.id)}`,
            {
              method: "PATCH",
              body: {
                full_name: member.name.trim(),
                relationship: relApi,
                nik: member.nik.trim() || undefined,
              },
            },
          );
          setMembers((curr) =>
            curr.map((item) =>
              item.id === member.id
                ? {
                    id: updated.id,
                    name: updated.full_name,
                    relationship:
                      apiToRel[updated.relationship.toLowerCase()] || "lainnya",
                    nik: updated.nik || "",
                  }
                : item,
            ),
          );
        } else {
          const created = await request<ApiFamilyMember>(
            "/account/family-members",
            {
              method: "POST",
              body: {
                full_name: member.name.trim(),
                relationship: relApi,
                nik: member.nik.trim() || undefined,
              },
            },
          );
          setMembers((curr) => [
            ...curr,
            {
              id: created.id,
              name: created.full_name,
              relationship:
                apiToRel[created.relationship.toLowerCase()] || "lainnya",
              nik: created.nik || "",
            },
          ]);
        }
      } else {
        const rows = readLocal();
        if (rows.length >= 100 && !rows.some((item) => item.id === member.id))
          throw new Error("Batas profil keluarga tercapai.");
        writeLocal([...rows.filter((item) => item.id !== member.id), member]);
      }
    },
    remove: async (id: string) => {
      if (mode === "api") {
        if (!user || user.role !== "warga")
          throw new Error("Masuk sebagai warga untuk menghapus data keluarga.");
        await request<void>(
          `/account/family-members/${encodeURIComponent(id)}`,
          {
            method: "DELETE",
          },
        );
        setMembers((curr) => curr.filter((item) => item.id !== id));
      } else {
        writeLocal(readLocal().filter((item) => item.id !== id));
      }
    },
  };
}
