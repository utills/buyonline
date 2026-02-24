'use client';

import { useState } from 'react';
import { CHRONIC_CONDITIONS } from '@buyonline/shared-types';

interface CriticalConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selected: string[]) => void;
  initialSelected?: string[];
}

export default function CriticalConditionsModal({
  isOpen,
  onClose,
  onConfirm,
  initialSelected = [],
}: CriticalConditionsModalProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);

  if (!isOpen) return null;

  const toggleCondition = (condition: string) => {
    setSelected((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Critical Conditions
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          <p className="text-sm text-gray-600 mb-4">
            Does any member have any of the following conditions?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CHRONIC_CONDITIONS.map((condition) => {
              const isSelected = selected.includes(condition);
              return (
                <button
                  key={condition}
                  type="button"
                  onClick={() => toggleCondition(condition)}
                  className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                    isSelected
                      ? 'bg-red-50 border-[#ED1B2D] text-[#ED1B2D] font-medium'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {condition}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 space-y-3">
          <button
            onClick={handleConfirm}
            className="w-full rounded-lg bg-[#ED1B2D] py-3 px-6 text-white font-semibold hover:bg-[#C8162A]"
          >
            Confirm ({selected.length} selected)
          </button>
          <button
            onClick={() => {
              setSelected([]);
              onConfirm([]);
              onClose();
            }}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            None of the above
          </button>
        </div>
      </div>
    </div>
  );
}
