'use client';

import { SUM_INSURED_OPTIONS } from '@buyonline/shared-types';

interface SumInsuredModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedValue: number;
  onSelect: (value: number) => void;
  pricePerOption?: Record<number, number>;
}

export default function SumInsuredModal({
  isOpen,
  onClose,
  selectedValue,
  onSelect,
  pricePerOption,
}: SumInsuredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl sm:rounded-2xl">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Sum Insured</h3>
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
          {SUM_INSURED_OPTIONS.map((option) => {
            const isSelected = selectedValue === option.value;
            const price = pricePerOption?.[option.value];
            return (
              <button
                key={option.value}
                onClick={() => {
                  onSelect(option.value);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-[#E31837] bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-[#E31837]' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E31837]" />
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-base font-semibold text-gray-900">
                      {option.label}
                    </span>
                    {'isPopular' in option && option.isPopular && (
                      <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                </div>
                {price && (
                  <span className="text-sm text-gray-500">
                    Rs {price.toLocaleString('en-IN')}/yr
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
