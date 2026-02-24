'use client';

import React from 'react';

export interface StepTabsStep {
  key: string;
  label: string;
}

export interface StepTabsProps {
  steps: StepTabsStep[];
  activeStep: string;
  completedSteps?: string[];
  onStepClick?: (stepKey: string) => void;
  className?: string;
}

export const StepTabs: React.FC<StepTabsProps> = ({
  steps,
  activeStep,
  completedSteps = [],
  onStepClick,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <div className="flex border-b border-gray-200 min-w-max">
        {steps.map((step) => {
          const isActive = step.key === activeStep;
          const isCompleted = completedSteps.includes(step.key);
          const isClickable = isActive || isCompleted;

          return (
            <button
              key={step.key}
              type="button"
              onClick={() => isClickable && onStepClick?.(step.key)}
              disabled={!isClickable}
              className={[
                'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap',
                isActive
                  ? 'border-[#ED1B2D] text-[#ED1B2D]'
                  : isCompleted
                    ? 'border-transparent text-green-600 hover:text-green-700'
                    : 'border-transparent text-gray-400 cursor-not-allowed',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isCompleted && !isActive && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {step.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
