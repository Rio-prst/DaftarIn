import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PreparationLayout } from "../components/PreparationLayout";
import { useApp } from "../context/AppContext";
import { FamilyPicker } from "../components/FamilyPicker";
import type { FamilyMember } from "../family/members";
import {
  documentSlots,
  getSelectedConditionOption,
  getServiceConditionConfig,
  type ApplicantTarget,
} from "../types/preparation";

export function PreparationNeedPage() {
  const {
    services,
    user,
    selectedRegion,
    activePreparation,
    createPreparation,
    guestIntent,
    consumeGuestIntent,
    confirmNeedStep,
    showToast,
  } = useApp();
  const navigate = useNavigate();
  const [familyMember, setFamilyMember] = useState<FamilyMember | undefined>(
    activePreparation.familyMember,
  );
  const [authorized, setAuthorized] = useState(
    Boolean(activePreparation.familyMember?.authorization),
  );
  const [needError, setNeedError] = useState("");
  useEffect(() => {
    setFamilyMember(activePreparation.familyMember);
    setAuthorized(Boolean(activePreparation.familyMember?.authorization));
    setNeedError("");
  }, [activePreparation.id]);
  const [params, setParams] = useSearchParams();
  const lastHandledNewQueryRef = useRef<string | null>(null);
  const [prefilledFromGuide, setPrefilledFromGuide] = useState(
    Boolean(params.get("fromGuide")),
  );

  // Handle `?new=1&service=...&condition=...` or guest intent carried across login/registration
  useEffect(() => {
    const isNewRequest = params.get("new") === "1";
    const prepParam = params.get("prep");
    const revisionParam = params.get("application");
    const serviceParam = params.get("service");
    const conditionParam = params.get("condition");

    if (
      !prepParam &&
      !revisionParam &&
      (isNewRequest || Boolean(guestIntent))
    ) {
      const currentQueryKey = params.toString();
      if (lastHandledNewQueryRef.current === currentQueryKey) return;
      lastHandledNewQueryRef.current = currentQueryKey;

      const savedIntent = consumeGuestIntent();
      const targetServiceId = serviceParam
        ? parseInt(serviceParam, 10)
        : savedIntent?.serviceId;
      const targetService =
        services.find((s) => s.id === targetServiceId) ||
        services.find((s) => s.id === activePreparation.serviceId) ||
        services[0];
      const targetCondition =
        conditionParam ||
        (savedIntent?.serviceId === targetService.id
          ? savedIntent.conditionKey
          : undefined) ||
        getSelectedConditionOption(targetService).value;

      if (targetService.availability === "paused") {
        setNeedError(
          "Panduan sedang dikoreksi. Buka Bantuan untuk menentukan langkah berikutnya.",
        );
        return;
      }
      const created = createPreparation({
        service: targetService,
        region: savedIntent?.region || targetService.region || selectedRegion,
        conditionKey: targetCondition,
        applicantTarget:
          params.get("target") === "anggota_keluarga"
            ? "anggota_keluarga"
            : savedIntent?.applicantTarget || "diri_sendiri",
        needConfirmed: false,
      });

      if (isNewRequest || savedIntent) {
        setPrefilledFromGuide(true);
      }

      const nextParams = new URLSearchParams();
      nextParams.set("prep", created.id);
      if (isNewRequest || savedIntent) {
        nextParams.set("fromGuide", "1");
      }
      setParams(nextParams, { replace: true });
    }
  }, [
    params,
    setParams,
    services,
    selectedRegion,
    activePreparation.serviceId,
    guestIntent,
    consumeGuestIntent,
    createPreparation,
  ]);

  const currentService =
    services.find((s) => s.id === activePreparation.serviceId) || services[0];

  const [selectedServiceId, setSelectedServiceId] = useState<number>(
    currentService.id,
  );
  const [target, setTarget] = useState<ApplicantTarget>(
    params.get("target") === "anggota_keluarga"
      ? "anggota_keluarga"
      : activePreparation.applicantTarget || "diri_sendiri",
  );
  const [selectedCondition, setSelectedCondition] = useState<string>(
    activePreparation.conditionKey ||
      getSelectedConditionOption(currentService).value,
  );

  // Sync local form controls when activePreparation changes
  useEffect(() => {
    setSelectedServiceId(activePreparation.serviceId);
    setTarget(
      params.get("target") === "anggota_keluarga"
        ? "anggota_keluarga"
        : activePreparation.applicantTarget || "diri_sendiri",
    );
    const svc =
      services.find((s) => s.id === activePreparation.serviceId) || services[0];
    setSelectedCondition(
      getSelectedConditionOption(svc, activePreparation.conditionKey).value,
    );
  }, [
    activePreparation.id,
    activePreparation.serviceId,
    activePreparation.applicantTarget,
    activePreparation.conditionKey,
    services,
  ]);

  const activeServiceObj =
    services.find((s) => s.id === selectedServiceId) || currentService;
  const conditionConfig = getServiceConditionConfig(activeServiceObj);
  const activeOption = getSelectedConditionOption(
    activeServiceObj,
    selectedCondition,
  );
  const slots = documentSlots(activeServiceObj, activeOption.value);
  const requiredSlots = slots.filter((slot) => slot.required);

  const buildNextQuery = () => {
    const q = new URLSearchParams();
    if (
      activePreparation.id &&
      activePreparation.id !== "prep-draft-uninitialized"
    ) {
      q.set("prep", activePreparation.id);
    }
    const appId = params.get("application");
    if (appId) q.set("application", appId);
    const qs = q.toString();
    return qs ? "?" + qs : "";
  };

  const handleConfirmAndNext = () => {
    if (target === "anggota_keluarga" && !familyMember) {
      setNeedError("Pilih atau tambahkan anggota keluarga yang diurus.");
      document.getElementById("family-member")?.focus();
      return;
    }
    if (target === "anggota_keluarga" && !authorized) {
      setNeedError(
        "Konfirmasikan kewenangan pendampingan sebelum melanjutkan.",
      );
      document.getElementById("family-authorization")?.focus();
      return;
    }
    confirmNeedStep(
      target,
      activeOption.value,
      activeServiceObj,
      target === "anggota_keluarga" && familyMember
        ? {
            ...familyMember,
            authorization: familyMember.authorization || {
              by: user.name,
              confirmedAt: new Date().toISOString(),
              scope: "persiapan_dan_tinjauan",
            },
          }
        : undefined,
    );
    showToast("Kebutuhan permohonan dikonfirmasi dan disimpan.", "success");
    navigate("/persiapan/data" + buildNextQuery());
  };

  return (
    <PreparationLayout
      step={1}
      title="Tentukan kebutuhan permohonan"
      actions={
        <>
          <Link to="/persiapan" className="button-secondary">
            Daftar persiapan
          </Link>
          <button
            type="button"
            className="button-primary"
            onClick={handleConfirmAndNext}
          >
            Konfirmasi kebutuhan & lanjut ke data →
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {needError && (
          <p className="form-error" role="alert">
            {needError}
          </p>
        )}
        {prefilledFromGuide && (
          <div className="case-update-note">
            Konteks layanan (<strong>{activeServiceObj.name}</strong>) dan
            kondisi (<strong>{activeOption.label}</strong>) dari halaman panduan
            telah dimuat. Tinjau subjek pengurusan di bawah, lalu konfirmasi
            untuk melanjutkan ke tahap Data.
          </div>
        )}

        <section className="plain-panel" aria-labelledby="service-info-heading">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 id="service-info-heading" className="panel-title">
                1. Layanan dan wilayah instansi
              </h2>
              <div className="mt-3">
                <label
                  htmlFor="prep-service-select"
                  className="text-xs font-semibold text-slate-600 block mb-1.5"
                >
                  Layanan yang diurus pada persiapan ini
                </label>
                <select
                  id="prep-service-select"
                  value={selectedServiceId}
                  onChange={(e) => {
                    const nextId = Number(e.target.value);
                    setSelectedServiceId(nextId);
                    const nextSvc =
                      services.find((s) => s.id === nextId) || services[0];
                    setSelectedCondition(
                      getSelectedConditionOption(nextSvc).value,
                    );
                  }}
                  className="field-select min-w-0 max-w-xl"
                >
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} — {svc.region || "Kota Contoh"}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {activeServiceObj.agency} ·{" "}
                {activeServiceObj.region || "Kota Contoh"} · Biaya resmi:{" "}
                {activeServiceObj.official_fee || "Gratis (Rp 0)"}
              </p>
            </div>
            <Link
              to={`/layanan/${activeServiceObj.id}`}
              className="text-link text-xs"
            >
              Baca panduan layanan →
            </Link>
          </div>
        </section>

        <section className="plain-panel" aria-labelledby="target-heading">
          <h2 id="target-heading" className="panel-title">
            2. Untuk siapa pengurusan ini dilakukan?
          </h2>
          <p className="field-hint mt-1">
            Jika kamu mengurus dokumen untuk anggota keluarga lain, draf ini
            menyimpan data pemohon secara terpisah dari urusan pribadimu.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <label
              className={
                "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors " +
                (target === "diri_sendiri"
                  ? "border-[#17324D] bg-[#f0f5fc]"
                  : "border-[#E6E7E4] bg-white hover:border-[#aab8c9]")
              }
            >
              <input
                type="radio"
                name="applicant-target"
                value="diri_sendiri"
                checked={target === "diri_sendiri"}
                onChange={() => setTarget("diri_sendiri")}
                className="mt-1 w-4 h-4 accent-[#17324D] shrink-0"
              />
              <div>
                <span className="font-semibold text-sm block text-[#17324D]">
                  Diri sendiri / Kepala keluarga
                </span>
                <span className="text-xs text-slate-600 mt-1 block leading-relaxed">
                  Mengurus dokumen atas nama pemilik akun atau kepala keluarga.
                </span>
              </div>
            </label>

            <label
              className={
                "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors " +
                (target === "anggota_keluarga"
                  ? "border-[#17324D] bg-[#f0f5fc]"
                  : "border-[#E6E7E4] bg-white hover:border-[#aab8c9]")
              }
            >
              <input
                type="radio"
                name="applicant-target"
                value="anggota_keluarga"
                checked={target === "anggota_keluarga"}
                onChange={() => setTarget("anggota_keluarga")}
                className="mt-1 w-4 h-4 accent-[#17324D] shrink-0"
              />
              <div>
                <span className="font-semibold text-sm block text-[#17324D]">
                  Anggota keluarga
                </span>
                <span className="text-xs text-slate-600 mt-1 block leading-relaxed">
                  Mengurus dokumen keluarga. Persyaratan hubungan atau kuasa
                  mengikuti panduan layanan.
                </span>
              </div>
            </label>
          </div>
        </section>

        {target === "anggota_keluarga" && (
          <section className="plain-panel" aria-label="Pemohon keluarga">
            <FamilyPicker
              value={familyMember}
              onChange={(member) => {
                setFamilyMember(member);
                setAuthorized(Boolean(member?.authorization));
              }}
            />
            <label className="consent-field mt-3">
              <input
                id="family-authorization"
                type="checkbox"
                checked={authorized}
                onChange={(event) => setAuthorized(event.target.checked)}
              />
              <span>
                Saya adalah orang tua/wali atau mendapat izin mendampingi
                anggota keluarga ini untuk persiapan dan tinjauan berkas. Saya
                akan memenuhi bukti perwakilan yang diminta layanan.
              </span>
            </label>
          </section>
        )}
        <section className="plain-panel" aria-labelledby="condition-heading">
          <h2 id="condition-heading" className="panel-title">
            3. {conditionConfig.question}
          </h2>
          <p className="field-hint mt-1">
            Pilihan ini menentukan berkas wajib yang perlu disiapkan pada tahap
            Dokumen.
          </p>

          <div className="grid gap-3 mt-4">
            {conditionConfig.options.map((opt) => {
              const selected = activeOption.value === opt.value;
              return (
                <label
                  key={opt.value}
                  className={
                    "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors " +
                    (selected
                      ? "border-[#17324D] bg-[#f0f5fc]"
                      : "border-[#E6E7E4] bg-white hover:border-[#aab8c9]")
                  }
                >
                  <input
                    type="radio"
                    name="preparation-condition"
                    value={opt.value}
                    checked={selected}
                    onChange={() => setSelectedCondition(opt.value)}
                    className="mt-1 w-4 h-4 accent-[#17324D] shrink-0"
                  />
                  <div>
                    <span className="font-semibold text-sm block text-[#17324D]">
                      {opt.label}
                    </span>
                    <span className="text-xs text-slate-600 mt-1 block leading-relaxed">
                      {opt.description}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-700">
              Dokumen wajib untuk kondisi ini ({requiredSlots.length} berkas):
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600 list-disc pl-5">
              {requiredSlots.map((slot) => (
                <li key={slot.id}>{slot.name}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </PreparationLayout>
  );
}
