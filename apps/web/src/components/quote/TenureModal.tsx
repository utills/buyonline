'use client';

import { TENURE_OPTIONS } from '@buyonline/shared-types';

interface TenureModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonths: number;
  onSelect: (months: number) => void;
}

export default function TenureModal({
  isOpen,
  onClose,
  selectedMonths,
  onSelect,
}: TenureModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl sm:rounded-2xl">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Policy Tenure</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-3">
          {TENURE_OPTIONS.map((option) => {
            const isSelected = selectedMonths === option.months;
            return (
              <button
                key={option.months}
                onClick={() => {
                  onSelect(option.months);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-[#ED1B2D] bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-[#ED1B2D]' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ED1B2D]" />
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-base font-semibold text-gray-900">
                      {option.label}
                    </span>
                    {'isPopular' in option && option.isPopular && (
                      <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        Best Value
                      </span>
                    )}
                  </div>
                </div>
                {option.discountPct > 0 && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Save {option.discountPct}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
