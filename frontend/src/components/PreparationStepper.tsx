import React from 'react';
import { Link } from 'react-router-dom';

interface PreparationStepperProps {
  currentStep: number; // 1 to 5
}

export const PreparationStepper: React.FC<PreparationStepperProps> = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'Kebutuhan', path: '/layanan/1' },
    { num: 2, label: 'Data', path: '/persiapan/data' },
    { num: 3, label: 'Dokumen', path: '/persiapan/dokumen' },
    { num: 4, label: 'Pemeriksaan', path: '/persiapan/pemeriksaan' },
    { num: 5, label: 'Ringkasan', path: '/persiapan/ringkasan' },
  ];

  return (
    <div className="jmw-progress">
      {steps.map((step) => {
        const isComplete = step.num < currentStep;
        const isCurrent = step.num === currentStep;

        let stepClass = 'jmw-step';
        if (isComplete) stepClass += ' is-complete';
        if (isCurrent) stepClass += ' is-current';

        return (
          <Link key={step.num} to={step.path} className={stepClass}>
            <div className="jmw-step-dot">
              {isComplete ? (
                <span className="material-symbols-outlined text-[18px]">check</span>
              ) : (
                step.num
              )}
            </div>
            <span className="jmw-step-label">{step.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
