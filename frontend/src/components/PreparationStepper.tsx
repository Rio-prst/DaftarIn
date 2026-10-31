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
  return (
    <nav aria-label="Tahap persiapan" className="preparation-navigation">
      <ol className="jmw-progress">
        {steps.map((step, index) => {
          const isCurrent = index + 1 === normalizedCurrentStep;
          const isComplete = step.completed;
          return (
            <li key={step.label}>
              <Link
                to={step.path}
                aria-current={isCurrent ? "step" : undefined}
                className={
                  "jmw-step" +
                  (isCurrent
                    ? " is-current"
                    : isComplete
                      ? " is-complete"
                      : "")
                }
              >
                <span className="jmw-step-dot" aria-hidden="true">
                  {isComplete ? "✓" : index + 1}
                </span>
                <span>{step.label}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
