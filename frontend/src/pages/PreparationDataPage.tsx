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

    showToast("Data pemohon disimpan ke draf ini.", "success");
    navigate("/persiapan/dokumen" + querySuffix);
  };

  return (
    <PreparationLayout
      step={2}
      title="Data pemohon"
      actions={
        <>
          <Link
            to={"/persiapan/kebutuhan" + querySuffix}
            className="button-secondary"
          >
            Kembali ke kebutuhan
          </Link>
          <button
            type="button"
            className="button-primary"
            onClick={handleSaveAndContinue}
          >
            Simpan & lanjut ke dokumen →
          </button>
        </>
      }
    >
      {!readiness.steps.step1Kebutuhan && (
        <div className="case-update-note mb-5 flex flex-wrap items-center justify-between gap-3">
          <span>
            <strong>Prasyarat belum selesai:</strong> Tahap 1 (Kebutuhan) belum
            dikonfirmasi pada draf ini. Konfirmasi layanan, subjek pengurusan,
            dan kondisi (saat ini: <strong>{activeCondition.label}</strong>)
            sebelum melanjutkan ke tahap Dokumen.
          </span>
          <Link
            to={"/persiapan/kebutuhan" + querySuffix}
            className="button-primary !py-1.5 !px-3 !text-xs shrink-0"
          >
            Konfirmasi kebutuhan (Tahap 1) →
          </Link>
        </div>
      )}

      {error && (
        <p role="alert" className="form-error mb-5">
          {error}
        </p>
      )}

      <section className="plain-panel" aria-labelledby="identity-heading">
        <div className="panel-heading">
          <div>
            <h2 id="identity-heading" className="panel-title">
              Identitas pemohon dan rincian permohonan
            </h2>
            <p className="field-hint mt-1">
              Kondisi dipilih: <strong>{activeCondition.label}</strong> (
              {activePreparation.applicantTarget === "anggota_keluarga"
                ? "Untuk anggota keluarga"
                : "Untuk diri sendiri"}
              ) ·{" "}
              <Link
                to={"/persiapan/kebutuhan" + querySuffix}
                className="text-link text-xs"
              >
                Ubah kebutuhan
              </Link>
            </p>
          </div>
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              setError("");
              loadDemoFormData();
            }}
          >
            ✨ Isi Cepat Data Warga
          </button>
        </div>

        <div className="auth-form mt-4">
          <div className="form-field">
            <label htmlFor="applicant-name">
              Nama lengkap pemohon (sesuai KTP/Akta)
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
            />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="applicant-nik">
                NIK pemohon (16 angka){" "}
                <span className="text-xs text-slate-500 font-normal">
                  ({formData.nik.length}/16)
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
              />
            </div>

            <div className="form-field">
              <label htmlFor="family-number">
                Nomor Kartu Keluarga (16 angka){" "}
                <span className="text-xs text-slate-500 font-normal">
                  ({formData.no_kk.length}/16)
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
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="contact-phone">
                Nomor telepon / WhatsApp aktif
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={formData.telepon}
                onChange={(e) => updateFormField("telepon", e.target.value)}
                placeholder="081234567890"
              />
            </div>

            <div className="form-field">
              <label htmlFor="applicant-address">
                Alamat domisili sesuai KK
              </label>
              <input
                id="applicant-address"
                type="text"
                value={formData.alamat}
                onChange={(e) => {
                  setError("");
                  updateFormField("alamat", e.target.value);
                }}
                placeholder="Jl. Merdeka No. 12, Kota Contoh"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="application-reason">
              Rincian perubahan atau keperluan permohonan
            </label>
            <textarea
              id="application-reason"
              rows={3}
              value={formData.alasan}
              onChange={(e) => {
                setError("");
                updateFormField("alasan", e.target.value);
              }}
              placeholder="Contoh: Pembaruan elemen pendidikan dan susunan anggota keluarga pada Kartu Keluarga."
            />
          </div>
        </div>

        {readiness.isStale && (
          <p className="text-xs text-slate-500 mt-5 pt-4 border-t border-slate-200">
            Catatan: Perubahan data telah disimpan dan perlu diperiksa ulang
            pada tahap Pemeriksaan.
          </p>
        )}
      </section>
    </PreparationLayout>
  );
};
