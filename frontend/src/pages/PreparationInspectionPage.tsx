import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PreparationLayout } from "../components/PreparationLayout";
import { useApp } from "../context/AppContext";
import { documentSlots } from "../types/preparation";
import { analyzeDocumentImage, type DocumentScanResult } from "../utils/documentAiScanner";

export function PreparationInspectionPage() {
  const {
    services,
    activePreparation,
    documents,
    updateFormField,
    showToast,
  } = useApp();
  const [params] = useSearchParams();

  const currentService =
    services.find((s) => s.id === activePreparation.serviceId) || services[0];
  const slots = documentSlots(currentService, activePreparation.conditionKey);

  const buildQuery = () => {
    const q = new URLSearchParams();
    const prepId =
      params.get("prep") ||
      (activePreparation.id !== "prep-draft-uninitialized"
        ? activePreparation.id
        : "");
    if (prepId) q.set("prep", prepId);
    const appId = params.get("application");
    if (appId) q.set("application", appId);
    const qs = q.toString();
    return qs ? "?" + qs : "";
  };

  const querySuffix = buildQuery();
  const [selectedId, setSelectedId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<DocumentScanResult | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState("");

  const available = documents.filter(
    (doc) =>
      slots.some((slot) => slot.id === doc.id) && doc.status === "TERUNGGAH",
  );
  const selected =
    available.find((doc) => doc.id === selectedId) || available[0];

  // Jalankan analisis saat pertama kali membuka halaman atau saat dokumen dipilih
  const triggerAiScan = async () => {
    if (!selected) return;
    setIsScanning(true);

    const docType = selected.id.includes("ktp")
      ? "ktp"
      : selected.id.includes("kk")
      ? "kk"
      : "surat";

    const docUrl = selected.previewUrl || "/images/ktp-contoh.svg";

    try {
      // Berikan jeda animasi laser pemindai forensik (1 detik)
      await new Promise((r) => setTimeout(r, 900));
      const res = await analyzeDocumentImage(docUrl, docType, {
        nik: activePreparation.formData.nik,
        namaLengkap: activePreparation.formData.nama_lengkap,
        alamatLengkap: activePreparation.formData.alamat,
      });
      setScanResult(res);
      showToast("Pemindaian forensik AI dokumen selesai.", "success");
    } catch (e) {
      console.error("AI Scan error:", e);
      showToast("Gagal melakukan pemindaian AI.", "error");
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (selected && !scanResult && !isScanning) {
      triggerAiScan();
    }
  }, [selected?.id]);

  const handleApplyOcrToForm = () => {
    if (!scanResult) return;
    const { nik, nama, alamat } = scanResult.extractedData;
    let updatedCount = 0;

    if (nik && nik !== activePreparation.formData.nik) {
      updateFormField("nik", nik);
      updatedCount++;
    }
    if (nama && nama !== activePreparation.formData.nama_lengkap) {
      updateFormField("nama_lengkap", nama);
      updatedCount++;
    }
    if (alamat && !activePreparation.formData.alamat) {
      updateFormField("alamat", alamat);
      updatedCount++;
    }

    showToast(
      updatedCount > 0
        ? "Data hasil pembacaan berkas berhasil disalin ke formulir pemohon."
        : "Data formulir sudah sesuai dengan hasil pembacaan berkas.",
      "success"
    );
  };

  const handleSaveNote = (id: string) => {
    setNotes((prev) => ({ ...prev, [id]: tempNoteText }));
    setActiveNoteId(null);
    setTempNoteText("");
    showToast("Catatan mandiri berhasil disimpan.", "info");
  };

  return (
    <PreparationLayout
      step={4}
      title="Pemeriksaan Kelayakan & Verifikasi Berkas AI"
      actions={
        <>
          <Link
            to={"/persiapan/dokumen" + querySuffix}
            className="button-secondary text-[15px] min-h-[48px] px-5"
          >
            ← Kembali ke Dokumen
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={"/persiapan/ringkasan" + querySuffix}
              className="button-primary text-[15px] min-h-[48px] px-6"
            >
              Lanjut ke Tinjau &amp; Ajukan →
            </Link>
          </div>
        </>
      }
    >
      {/* Banner Informasi Inklusif & Jelas Bagi Warga */}
      <div className="mb-6 p-4 rounded-2xl bg-blue-50/90 border border-blue-200/80 text-[14px] sm:text-[15px] text-blue-950 leading-relaxed flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[24px] text-[#1769D2] shrink-0 mt-0.5">
            verified
          </span>
          <span>
            <strong>Pemeriksaan Otomatis:</strong> Sistem kecerdasan buatan (AI) memindai ketajaman gambar, mendeteksi kelengkapan sudut dokumen, dan mencocokkan NIK secara instan untuk mempercepat proses verifikasi di kelurahan.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Pratinjau Dokumen & Visual Forensik Meja Lampu (Light-Table) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="font-bold text-[16px] text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1769D2]">
                  document_scanner
                </span>
                Pratinjau Berkas
              </h3>
              <button
                type="button"
                onClick={triggerAiScan}
                disabled={isScanning || !selected}
                className="text-[13px] sm:text-[14px] font-semibold text-[#1769D2] hover:text-[#1255AC] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100/70 transition-all disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[18px] ${isScanning ? "animate-spin" : ""}`}>
                  {isScanning ? "sync" : "refresh"}
                </span>
                <span>{isScanning ? "Sedang Memindai…" : "Pindai Ulang"}</span>
              </button>
            </div>

            {/* Pilihan Dokumen yang Tersedia */}
            {available.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                {available.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(doc.id);
                      setScanResult(null);
                    }}
                    className={`text-[13px] px-3.5 py-2 rounded-xl font-medium transition-all shrink-0 ${
                      (selected?.id === doc.id)
                        ? "bg-[#142C4B] text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {doc.name}
                  </button>
                ))}
              </div>
            )}

            {/* Frame Pratinjau dengan Efek Laser Scanner Forensik */}
            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center min-h-[260px] max-h-[360px] shadow-inner group">
              {isScanning && <div className="scanner-beam" />}
              {selected?.previewUrl ? (
                <img
                  src={selected.previewUrl}
                  alt={selected.name}
                  className="max-h-[340px] w-auto object-contain transition-transform duration-300 group-hover:scale-102"
                />
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <span className="material-symbols-outlined text-[48px] mb-2 opacity-60">
                    photo_library
                  </span>
                  <p className="text-[14px]">Dokumen contoh resmi terpilih</p>
                </div>
              )}

              {/* Status Pemindaian Melayang */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl text-white text-[13px] flex items-center justify-between border border-slate-800">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isScanning ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`} />
                  {isScanning ? "AI Menganalisis Struktur Piksel…" : "Pemindaian Forensik Selesai"}
                </span>
                <span className="font-mono text-xs text-slate-300">
                  {scanResult?.forensicMetrics.aspectRatio ? `${scanResult.forensicMetrics.aspectRatio}:1 ID-1` : "ISO 7810"}
                </span>
              </div>
            </div>

            {/* Metrik Kualitas Citra (Grafik Indikator) */}
            {scanResult && (
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Ketajaman
                  </span>
                  <span className="text-[17px] font-bold text-slate-900 mt-0.5 block">
                    {scanResult.forensicMetrics.sharpnessScore}%
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium">Sangat Jelas</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Kontras
                  </span>
                  <span className="text-[17px] font-bold text-slate-900 mt-0.5 block">
                    {scanResult.forensicMetrics.contrastScore}%
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium">Optimal</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Pencahayaan
                  </span>
                  <span className="text-[17px] font-bold text-slate-900 mt-0.5 block">
                    {scanResult.forensicMetrics.lightingScore}%
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium">Bebas Silau</span>
                </div>
              </div>
            )}
          </div>

          {/* Kotak Ekstraksi Data NIK & Kemudahan Bagi Lansia */}
          {scanResult && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-[15px] text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600">
                    badge
                  </span>
                  Data Terbaca dari Berkas
                </h4>
                <span className="text-[12px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                  Terverifikasi
                </span>
              </div>
              <div className="space-y-2 text-[14px] bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">NIK:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {scanResult.extractedData.nik || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Nama:</span>
                  <span className="font-semibold text-slate-900">
                    {scanResult.extractedData.nama || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Jenis Kelamin:</span>
                  <span className="text-slate-800">
                    {scanResult.extractedData.jenisKelamin || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Alamat:</span>
                  <span className="text-slate-800 text-right max-w-[65%] truncate">
                    {scanResult.extractedData.alamat || "—"}
                  </span>
                </div>
              </div>

              {/* Tombol Salin Otomatis ke Formulir */}
              <button
                type="button"
                onClick={handleApplyOcrToForm}
                className="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1769D2] font-semibold text-[14px] flex items-center justify-center gap-2 border border-blue-200 transition-all active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px]">
                  auto_fix_high
                </span>
                <span>Salin Otomatis ke Formulir Pemohon</span>
              </button>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Rincian Hasil Evaluasi Checklist & Validasi */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-[18px] text-slate-900">
                  Hasil Uji Kelayakan Berkas
                </h3>
                <p className="text-[14px] text-slate-500 mt-0.5">
                  5 parameter pemeriksaan kepatuhan dokumen kependudukan
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Kesiapan {scanResult?.readinessPercentage || 92}%
                </span>
              </div>
            </div>

            {/* Daftar Temuan Checklist */}
            <div className="mt-5 space-y-3.5">
              {scanResult?.validationChecks.map((chk) => {
                const isPass = chk.status === "PASS";
                const isWarning = chk.status === "WARNING";
                const userNote = notes[chk.id];

                return (
                  <div
                    key={chk.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isPass
                        ? "bg-slate-50/70 border-slate-200/90"
                        : isWarning
                        ? "bg-amber-50/60 border-amber-200/90"
                        : "bg-red-50/60 border-red-200/90"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          className={`material-symbols-outlined text-[22px] shrink-0 mt-0.5 ${
                            isPass
                              ? "text-emerald-600"
                              : isWarning
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        >
                          {isPass ? "check_circle" : isWarning ? "warning" : "error"}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
                              {chk.category}
                            </span>
                          </div>
                          <h4 className="font-bold text-[15px] sm:text-[16px] text-slate-900 mt-0.5">
                            {chk.title}
                          </h4>
                          <p className="text-[14px] text-slate-700 mt-1 leading-relaxed">
                            {chk.detail}
                          </p>
                          {chk.recommendation && (
                            <p className="text-[13px] text-amber-800 bg-amber-100/70 px-3 py-1.5 rounded-lg mt-2 font-medium">
                              💡 Saran: {chk.recommendation}
                            </p>
                          )}

                          {/* Catatan Mandiri Warga */}
                          {userNote && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-slate-200 text-[13px] text-slate-800">
                              <span className="font-semibold text-slate-900">Catatan Pemohon:</span> {userNote}
                            </div>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[12px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                          isPass
                            ? "bg-emerald-100 text-emerald-800"
                            : isWarning
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isPass ? "Lulus" : isWarning ? "Perhatian" : "Perlu Perbaikan"}
                      </span>
                    </div>

                    {/* Form Tambah Catatan */}
                    {activeNoteId === chk.id ? (
                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                        <input
                          type="text"
                          value={tempNoteText}
                          onChange={(e) => setTempNoteText(e.target.value)}
                          placeholder="Tulis penjelasan untuk petugas verifikasi…"
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-[13px] focus:outline-hidden focus:border-[#1769D2]"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveNote(chk.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#142C4B] text-white text-[13px] font-medium"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveNoteId(null)}
                          className="px-2 py-1.5 text-slate-500 hover:text-slate-800 text-[13px]"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2.5 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveNoteId(chk.id);
                            setTempNoteText(userNote || "");
                          }}
                          className="text-[12px] text-slate-500 hover:text-[#1769D2] font-medium flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit_note</span>
                          {userNote ? "Ubah Catatan" : "Tambah Catatan Penjelasan"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tombol Lanjut ke Tahap Terakhir */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[14px] text-slate-500">
                Pemeriksaan selesai. Lanjutkan untuk meninjau dan mengirim berkas.
              </span>
              <Link
                to={"/persiapan/ringkasan" + querySuffix}
                className="w-full sm:w-auto button-primary text-[15px] font-semibold min-h-[48px] px-6 flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Tinjau &amp; Ajukan Berkas</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PreparationLayout>
  );
}
