'use client';

import { JourneyStep } from '@buyonline/shared-types';
import { STEP_LABELS } from '@/lib/constants';
import { useJourneyStore } from '@/stores/useJourneyStore';

const VISIBLE_STEPS = [
  JourneyStep.QUOTE,
  JourneyStep.PAYMENT,
  JourneyStep.KYC,
  JourneyStep.HEALTH,
];

interface StepTabsProps {
  activeStep: JourneyStep;
}

export default function StepTabs({ activeStep }: StepTabsProps) {
  const { completedSteps } = useJourneyStore();
  const safeCompletedSteps = completedSteps ?? [];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-md mx-auto px-4">
        <div className="flex">
          {VISIBLE_STEPS.map((step, index) => {
            const isActive = step === activeStep;
            const isCompleted = safeCompletedSteps.includes(step);
            const stepNumber = index + 1;

            return (
              <div
                key={step}
                className={`flex-1 py-3 text-center relative ${
                  isActive
                    ? 'border-b-2 border-[#ED1B2D]'
                    : ''
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-[#ED1B2D] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive
                        ? 'text-[#ED1B2D]'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {STEP_LABELS[step]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
