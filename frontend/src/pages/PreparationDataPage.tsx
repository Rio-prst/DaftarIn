import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PreparationLayout } from "../components/PreparationLayout";
import { useApp } from "../context/AppContext";
import { getSelectedConditionOption } from "../types/preparation";

export const PreparationDataPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const {
    services,
    activePreparation,
    formData,
    updateFormField,
    loadDemoFormData,
    readiness,
    showToast,
  } = useApp();

  const currentService =
    services.find((s) => s.id === activePreparation.serviceId) || services[0];
  const activeCondition = getSelectedConditionOption(
    currentService,
    activePreparation.conditionKey,
  );

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
  const [error, setError] = useState("");

  const handleSaveAndContinue = () => {
    setError("");
    if (!activePreparation.needConfirmed) {
      setError(
        "Tahap 1 (Kebutuhan) belum dikonfirmasi. Silakan tinjau dan konfirmasi kebutuhan permohonan terlebih dahulu.",
      );
      return;
    }
    if (formData.nama_lengkap.trim().length < 3) {
      setError("Isi nama lengkap pemohon sesuai KTP (minimal 3 karakter).");
      document.getElementById("applicant-name")?.focus();
      return;
    }
    if (!/^\d{16}$/.test(formData.nik.trim())) {
      setError("NIK pemohon harus terdiri dari 16 angka.");
      document.getElementById("applicant-nik")?.focus();
      return;
    }
    if (!/^\d{16}$/.test(formData.no_kk.trim())) {
      setError("Nomor Kartu Keluarga (KK) harus terdiri dari 16 angka.");
      document.getElementById("family-number")?.focus();
      return;
    }
    if (formData.alamat.trim().length < 5) {
      setError("Isi alamat domisili sesuai Kartu Keluarga (minimal 5 karakter).");
      document.getElementById("applicant-address")?.focus();
      return;
    }
    if (formData.alasan.trim().length < 5) {
      setError("Isi rincian perubahan atau alasan permohonan (minimal 5 karakter).");
      document.getElementById("application-reason")?.focus();
      return;
    }

    showToast("Data pemohon berhasil disimpan ke draf ini.", "success");
    navigate("/persiapan/dokumen" + querySuffix);
  };

  return (
    <PreparationLayout
      step={2}
      title="Data Pemohon & Formulir"
      actions={
        <>
          <Link
            to={"/persiapan/kebutuhan" + querySuffix}
            className="button-secondary min-h-[46px] px-5 text-sm font-semibold flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Kembali ke Kebutuhan</span>
          </Link>
          <button
            type="button"
            className="button-primary min-h-[46px] px-6 text-sm font-semibold flex items-center gap-2 shadow-xs"
            onClick={handleSaveAndContinue}
          >
            <span>Simpan &amp; Lanjut ke Dokumen</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </>
      }
    >
      {!readiness.steps.step1Kebutuhan && (
        <div className="case-update-note mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-blue-950 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <span>
            <strong>Prasyarat belum selesai:</strong> Tahap 1 (Kebutuhan) belum dikonfirmasi pada draf ini. Konfirmasi layanan, subjek pengurusan, dan kondisi (saat ini: <strong>{activeCondition.label}</strong>) sebelum melanjutkan ke tahap Dokumen.
          </span>
          <Link
            to={"/persiapan/kebutuhan" + querySuffix}
            className="button-primary !py-2 !px-3.5 !text-xs shrink-0"
          >
            Konfirmasi Kebutuhan (Tahap 1) →
          </Link>
        </div>
      )}

      {error && (
        <div role="alert" className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm font-medium text-rose-700 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-rose-600 shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      <section className="space-y-6" aria-labelledby="identity-heading">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 id="identity-heading" className="text-xl sm:text-2xl font-bold text-[#142C4B] font-display">
              Identitas Pemohon dan Rincian Permohonan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Kondisi dipilih: <strong className="text-[#142C4B]">{activeCondition.label}</strong> (
              {activePreparation.applicantTarget === "anggota_keluarga"
                ? "Untuk Anggota Keluarga"
                : "Untuk Diri Sendiri"}
              ) ·{" "}
              <Link
                to={"/persiapan/kebutuhan" + querySuffix}
                className="text-[#1769D2] hover:underline font-semibold"
              >
                Ubah Kebutuhan
              </Link>
            </p>
          </div>

          <button
            type="button"
            className="h-[40px] px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1769D2] font-semibold text-xs sm:text-sm border border-blue-200 transition-all flex items-center gap-1.5 active:scale-97"
            onClick={() => {
              setError("");
              loadDemoFormData();
            }}
          >
            <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
            <span>✨ Isi Cepat Data Warga</span>
          </button>
        </div>

        <div className="space-y-5">
          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <label htmlFor="applicant-name" className="text-sm font-bold text-[#142C4B]">
              Nama Lengkap Pemohon (Sesuai KTP/Akta)
            </label>
            <input
              id="applicant-name"
              type="text"
              value={formData.nama_lengkap}
              onChange={(e) => {
                setError("");
                updateFormField("nama_lengkap", e.target.value);
              }}
              placeholder={
                activePreparation.applicantTarget === "anggota_keluarga"
                  ? "Contoh: Bima Prasetya (Anggota Keluarga)"
                  : "Contoh: Ayu Lestari"
              }
              className="w-full h-[50px] px-4 rounded-xl border border-slate-300 text-base text-[#0F223D] placeholder:text-slate-400 focus:outline-hidden focus:border-[#1769D2] focus:ring-4 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Grid NIK & No KK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="applicant-nik" className="text-sm font-bold text-[#142C4B] flex items-center justify-between">
                <span>NIK Pemohon (16 Angka)</span>
                <span className="text-xs font-mono font-normal text-slate-500">
                  {formData.nik.length}/16
                </span>
              </label>
              <input
                id="applicant-nik"
                type="text"
                inputMode="numeric"
                maxLength={16}
                value={formData.nik}
                onChange={(e) => {
                  setError("");
                  updateFormField("nik", e.target.value.replace(/\D/g, ""));
                }}
                placeholder="3173051508950001"
                className="w-full h-[50px] px-4 rounded-xl border border-slate-300 text-base font-mono text-[#0F223D] placeholder:text-slate-400 focus:outline-hidden focus:border-[#1769D2] focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="family-number" className="text-sm font-bold text-[#142C4B] flex items-center justify-between">
                <span>Nomor Kartu Keluarga (16 Angka)</span>
                <span className="text-xs font-mono font-normal text-slate-500">
                  {formData.no_kk.length}/16
                </span>
              </label>
              <input
                id="family-number"
                type="text"
                inputMode="numeric"
                maxLength={16}
                value={formData.no_kk}
                onChange={(e) => {
                  setError("");
                  updateFormField("no_kk", e.target.value.replace(/\D/g, ""));
                }}
                placeholder="3173050101200009"
                className="w-full h-[50px] px-4 rounded-xl border border-slate-300 text-base font-mono text-[#0F223D] placeholder:text-slate-400 focus:outline-hidden focus:border-[#1769D2] focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Grid Telepon & Alamat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="contact-phone" className="text-sm font-bold text-[#142C4B]">
                Nomor Telepon / WhatsApp Aktif
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={formData.telepon}
                onChange={(e) => updateFormField("telepon", e.target.value)}
                placeholder="081234567890"
                className="w-full h-[50px] px-4 rounded-xl border border-slate-300 text-base text-[#0F223D] placeholder:text-slate-400 focus:outline-hidden focus:border-[#1769D2] focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="applicant-address" className="text-sm font-bold text-[#142C4B]">
                Alamat Domisili Sesuai KK
              </label>
              <input
                id="applicant-address"
                type="text"
                value={formData.alamat}
                onChange={(e) => {
                  setError("");
                  updateFormField("alamat", e.target.value);
                }}
                placeholder="Jl. Merdeka No. 12, RT 003 / RW 002"
                className="w-full h-[50px] px-4 rounded-xl border border-slate-300 text-base text-[#0F223D] placeholder:text-slate-400 focus:outline-hidden focus:border-[#1769D2] focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Alasan / Rincian Permohonan */}
          <div className="space-y-1.5">
            <label htmlFor="application-reason" className="text-sm font-bold text-[#142C4B]">
              Rincian Perubahan atau Keperluan Permohonan
            </label>
            <textarea
              id="application-reason"
              rows={3}
              value={formData.alasan}
              onChange={(e) => {
                setError("");
                updateFormField("alasan", e.target.value);
              }}
              placeholder="Contoh: Pembaruan susunan anggota keluarga karena penambahan anak baru lahir."
              className="w-full p-4 rounded-xl border border-slate-300 text-base text-[#0F223D] placeholder:text-slate-400 focus:outline-hidden focus:border-[#1769D2] focus:ring-4 focus:ring-blue-100 transition-all leading-relaxed"
            />
          </div>
        </div>

        {readiness.isStale && (
          <p className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-amber-500">info</span>
            <span>Perubahan data telah tersimpan dan akan diperiksa ulang pada tahap Pemeriksaan.</span>
          </p>
        )}
      </section>
    </PreparationLayout>
  );
};

export default PreparationDataPage;
