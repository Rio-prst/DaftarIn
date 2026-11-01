import { Link, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function PreparationStepper({ currentStep }: { currentStep: number }) {
  const { readiness, activePreparation } = useApp();
  const [params] = useSearchParams();
  const prepId =
    params.get("prep") ||
    (activePreparation.id !== "prep-draft-uninitialized"
      ? activePreparation.id
      : "");
  const applicationId = params.get("application");

  const queryParts: string[] = [];
  if (prepId) queryParts.push("prep=" + encodeURIComponent(prepId));
  if (applicationId)
    queryParts.push("application=" + encodeURIComponent(applicationId));
  const querySuffix = queryParts.length > 0 ? "?" + queryParts.join("&") : "";

  const normalizedCurrentStep = Math.min(Math.max(currentStep, 1), 4);

  const steps = [
    {
      label: "Kebutuhan",
      path: "/persiapan/kebutuhan" + querySuffix,
      completed: readiness.steps.step1Kebutuhan,
    },
    {
      label: "Data",
      path: "/persiapan/data" + querySuffix,
      completed: readiness.steps.step2Data,
    },
    {
      label: "Dokumen",
      path: "/persiapan/dokumen" + querySuffix,
      completed: readiness.steps.step3Dokumen,
    },
    {
      label: "Tinjau & kirim",
      path: "/persiapan/ringkasan" + querySuffix,
      completed: readiness.steps.step4Pemeriksaan,
    },
  ];
  const reachableStep = !readiness.steps.step1Kebutuhan
    ? 1
    : !readiness.steps.step2Data
      ? 2
      : !readiness.steps.step3Dokumen
        ? 3
        : 4;
  return (
    <nav aria-label="Tahap persiapan" className="preparation-navigation">
      <p className="preparation-step-caption">
        Langkah {normalizedCurrentStep} dari 4 ·{" "}
        <strong>{steps[normalizedCurrentStep - 1].label}</strong>
      </p>
      <ol className="jmw-progress">
        {steps.map((step, index) => {
          const isCurrent = index + 1 === normalizedCurrentStep;
          const isComplete = step.completed;
          const available = index + 1 <= reachableStep || isCurrent;
          const content = (
            <>
              <span className="jmw-step-dot" aria-hidden="true">
                {isComplete && !isCurrent ? "✓" : index + 1}
              </span>
              <span className="jmw-step-label">{step.label}</span>
            </>
          );
          const className =
            "jmw-step" +
            (isCurrent ? " is-current" : isComplete ? " is-complete" : "") +
            (!available ? " is-locked" : "");
          return (
            <li key={step.label}>
              {available ? (
                <Link
                  to={step.path}
                  aria-label={`${index + 1}. ${step.label}`}
                  aria-current={isCurrent ? "step" : undefined}
                  className={className}
                >
                  {content}
                </Link>
              ) : (
                <span
                  className={className}
                  aria-disabled="true"
                  aria-label={`${index + 1}. ${step.label}. Selesaikan langkah sebelumnya.`}
                >
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
