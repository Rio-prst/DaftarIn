export type LifeEvent = "kelahiran" | "pindah" | "dokumen";
export interface NeedAnswers {
  certificate?: string;
  familyCard?: string;
  move?: string;
  document?: string;
  problem?: string;
}
export interface SuggestedService {
  serviceId: number;
  condition?: string;
  reason: string;
  family?: boolean;
  later?: boolean;
}
export function suggestServices(
  event: LifeEvent,
  answers: NeedAnswers,
): SuggestedService[] {
  if (event === "kelahiran")
    return [
      ...(answers.certificate !== "yes"
        ? [
            {
              serviceId: 3,
              reason: "Menyiapkan pencatatan kelahiran anak.",
              family: true,
            },
          ]
        : []),
      ...(answers.familyCard !== "yes"
        ? [
            {
              serviceId: 1,
              condition: "penambahan_kelahiran",
              reason: "Menyiapkan pembaruan susunan keluarga karena kelahiran.",
            },
          ]
        : []),
      {
        serviceId: 5,
        condition: "kia_di_bawah_5",
        reason:
          "Pilihan tambahan untuk identitas anak; periksa kebutuhan akta dan KK pada panduan.",
        family: true,
        later: answers.certificate !== "yes" || answers.familyCard !== "yes",
      },
    ];
  if (event === "pindah")
    return [
      {
        serviceId: 4,
        condition:
          answers.move === "local"
            ? "pindah_dalam_kelurahan"
            : "pindah_kota_provinsi",
        reason: "Menyiapkan pengurusan perpindahan sesuai wilayah tujuan.",
      },
      {
        serviceId: 1,
        condition: "perubahan_biodata_keluarga",
        reason:
          "Periksa pembaruan alamat dan susunan keluarga setelah perpindahan.",
        later: true,
      },
      {
        serviceId: 2,
        condition: "ktp_rusak_ubah",
        reason:
          "Periksa apakah data KTP-el perlu diperbarui setelah perubahan alamat.",
        later: true,
      },
    ];
  if (answers.document !== "ktp") return [];
  return [
    {
      serviceId: 2,
      condition: answers.problem === "lost" ? "ktp_hilang" : "ktp_rusak_ubah",
      reason:
        answers.problem === "lost"
          ? "Menyiapkan penggantian KTP-el yang hilang."
          : "Menyiapkan penggantian KTP-el yang rusak.",
    },
  ];
}
