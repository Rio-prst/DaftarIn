import { Link } from "react-router-dom";
import type { ServiceDetail } from "../context/AppContext";
import { documentSlots } from "../types/preparation";
export function NextStepsGuide({
  service,
  condition,
}: {
  service: ServiceDetail;
  condition?: string;
}) {
  const slots = documentSlots(service, condition).filter(
    (slot) => slot.required,
  );
  let source: string | undefined;
  try {
    const url = new URL(service.source_url || "");
    if (url.protocol === "https:") source = url.href;
  } catch {
    /* Missing sources remain unavailable. */
  }
  const download = () => {
    const text = [
      "PANDUAN LANGKAH BERIKUTNYA — DAFTARIN",
      service.name,
      "",
      "Tinjauan awal tidak menggantikan pengajuan resmi.",
      service.source_verified
        ? "Periksa kembali informasi instansi sebelum berangkat."
        : "Panduan contoh; belum diverifikasi instansi daerah.",
      "",
      "Kanal yang tercantum: " + (service.official_channel || "Belum tersedia"),
      "",
      "Dokumen menurut panduan:",
      ...slots.map((slot, index) => index + 1 + ". " + slot.name),
      "",
      "Pastikan kebutuhan dokumen asli/salinan, formulir, jadwal, lokasi dan pendaftaran antrean melalui instansi.",
      "DaftarIn belum menyediakan pemesanan antrean atau konfirmasi jadwal kunjungan.",
      "",
      "Rujukan: " + (source || "Belum tersedia"),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "panduan-persiapan-" + service.id + ".txt";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section className="plain-panel mb-6" aria-labelledby="next-steps-title">
      <h2 id="next-steps-title" className="panel-title">
        Siapkan pengajuan ke instansi
      </h2>
      <p className="text-sm text-slate-600 mt-2">
        Tinjauan awal sudah selesai. Langkah berikutnya dilakukan melalui kanal
        resmi; DaftarIn belum mengirim berkas ke instansi.
      </p>
      <ol className="list-decimal pl-5 mt-4 space-y-4 text-sm">
        <li>
          <strong>Pastikan kanal dan ketentuan pelayanan.</strong>
          <p className="mt-1 text-slate-600">
            Kanal pada panduan: {service.official_channel || "Belum tersedia"}.
            Konfirmasikan alamat, jam layanan, serta kebutuhan pendaftaran
            antrean sebelum berangkat.
          </p>
        </li>
        <li>
          <strong>Siapkan berkas yang tercantum pada panduan.</strong>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            {slots.map((slot) => (
              <li key={slot.id}>{slot.name}</li>
            ))}
          </ul>
          <p className="mt-2 text-slate-600">
            Periksa kebutuhan dokumen asli, salinan, formulir, serta surat kuasa
            bila diwakilkan. Daftar ini bukan konfirmasi akhir persyaratan
            instansi.
          </p>
        </li>
        <li>
          <strong>Ajukan melalui loket atau portal resmi.</strong>
          <p className="mt-1 text-slate-600">
            Simpan bukti penerimaan. Setelah mengajukan, catat nomor tanda
            terima pada halaman ini agar tidak tertukar dengan nomor tinjauan
            DaftarIn.
          </p>
        </li>
      </ol>
      {!service.source_verified && (
        <p className="text-sm text-slate-600 mt-4">
          Panduan contoh — standar pelayanan daerah, alamat, dan jadwal
          kunjungan belum diverifikasi. Tidak ada jadwal atau nomor antrean yang
          diterbitkan oleh DaftarIn.
        </p>
      )}
      <div className="flex flex-wrap gap-4 mt-4">
        <button className="button-secondary" type="button" onClick={download}>
          Unduh panduan persiapan (.txt)
        </button>
        <Link
          className="text-link inline-flex items-center min-h-[44px]"
          to={"/layanan/" + service.id}
        >
          Buka panduan layanan
        </Link>
        {source && (
          <a
            className="text-link inline-flex items-center min-h-[44px]"
            href={source}
            target="_blank"
            rel="noopener noreferrer"
          >
            Lihat rujukan →
          </a>
        )}
      </div>
    </section>
  );
}
