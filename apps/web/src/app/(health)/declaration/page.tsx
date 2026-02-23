'use client';

import { useRouter } from 'next/navigation';
import { useHealthStore } from '@/stores/useHealthStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { JourneyStep } from '@buyonline/shared-types';

const DECLARATION_SECTIONS = [
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    description: 'Smoking, alcohol, and physical activity habits declared',
    icon: (
      <svg className="w-5 h-5 text-[#E31837]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: 'medical',
    label: 'Medical History',
    description: 'Pre-existing conditions and ongoing medications declared',
    icon: (
      <svg className="w-5 h-5 text-[#E31837]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'hospitalization',
    label: 'Hospitalization',
    description: 'Past hospitalization history in the last 4 years declared',
    icon: (
      <svg className="w-5 h-5 text-[#E31837]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'disability',
    label: 'Disability & Prior Insurance',
    description: 'Disability status and prior insurance decline history declared',
    icon: (
      <svg className="w-5 h-5 text-[#E31837]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function DeclarationPage() {
  const router = useRouter();
  const { lifestyleAnswers, medicalAnswers, hospitalizationDetails, disabilityDetails } = useHealthStore();
  const { markStepComplete, advanceTo } = useJourneyStore();

  const getSectionStatus = (id: string): boolean => {
    switch (id) {
      case 'lifestyle':
        return Object.keys(lifestyleAnswers).length > 0;
      case 'medical':
        return Object.keys(medicalAnswers).length > 0;
      case 'hospitalization':
        return hospitalizationDetails !== null;
      case 'disability':
        return disabilityDetails !== null;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    markStepComplete(JourneyStep.HEALTH);
    advanceTo(JourneyStep.COMPLETE);
    router.push('/complete');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Health Declaration Summary</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your health declaration is complete. Please review before submitting.
        </p>
      </div>

      {/* Summary banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800">Declaration Complete</p>
          <p className="text-xs text-green-600 mt-0.5">
            All sections of your health declaration have been filled in. Review the summary below.
          </p>
        </div>
      </div>

      {/* Declaration sections */}
      <div className="space-y-3">
        {DECLARATION_SECTIONS.map((section) => {
          const isDone = getSectionStatus(section.id);
          return (
            <div
              key={section.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4"
            >
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                {section.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">{section.label}</p>
                  {isDone ? (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Filled
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Skipped
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Declaration acknowledgement */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-600 leading-relaxed">
          By clicking &quot;Submit Declaration&quot;, I confirm that all the information provided is true
          and accurate to the best of my knowledge. I understand that any false or misleading
          information may result in rejection or cancellation of my insurance policy.
        </p>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-[#E31837] text-white font-semibold rounded-xl hover:bg-[#c41530] active:bg-[#a81229] transition-colors"
      >
        Submit Declaration
      </button>
    </div>
  );
}
