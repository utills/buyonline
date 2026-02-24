'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MemberSelector from '@/components/landing/MemberSelector';
import LeadForm from '@/components/landing/LeadForm';

export default function JourneyPicker() {
  const router = useRouter();
  const [showClassic, setShowClassic] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-5">
      <h2 className="text-gray-900 font-bold text-lg text-center">
        How would you like to apply?
      </h2>

      {!showClassic ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* AI Journey card */}
          <button
            onClick={() => router.push('/ai-journey')}
            className="group relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-[#ED1B2D] bg-red-50 hover:bg-red-100 transition-all text-center"
          >
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#ED1B2D] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              RECOMMENDED
            </span>
            <div className="w-12 h-12 bg-[#ED1B2D] rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Chat with AI</p>
              <p className="text-xs text-gray-500 mt-1">
                Just answer a few questions. AI recommends your perfect plan.
              </p>
              <p className="text-xs font-medium text-[#ED1B2D] mt-2">~3 minutes</p>
            </div>
          </button>

          {/* Classic Journey card */}
          <button
            onClick={() => setShowClassic(true)}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-center"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Self-Serve</p>
              <p className="text-xs text-gray-500 mt-1">
                Fill in step-by-step forms at your own pace.
              </p>
              <p className="text-xs font-medium text-gray-400 mt-2">~8 minutes</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setShowClassic(false)}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            &larr; Back to options
          </button>
          <MemberSelector />
          <hr className="border-gray-100" />
          <LeadForm />
        </div>
      )}
    </div>
  );
}
