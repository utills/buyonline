'use client';

import React from 'react';

export interface YesNoMemberChip {
  id: string;
  label: string;
  selected: boolean;
}

export interface YesNoSelectorProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  label?: string;
  memberChips?: YesNoMemberChip[];
  onMemberToggle?: (memberId: string) => void;
  infoText?: string;
  className?: string;
}

export const YesNoSelector: React.FC<YesNoSelectorProps> = ({
  value,
  onChange,
  label,
  memberChips,
  onMemberToggle,
  infoText,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {label && (
        <p className="text-sm font-medium text-gray-900">{label}</p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={[
            'flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all duration-200',
            value === true
              ? 'border-[#ED1B2D] bg-red-50 text-[#ED1B2D]'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
          ].join(' ')}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={[
            'flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all duration-200',
            value === false
              ? 'border-[#ED1B2D] bg-red-50 text-[#ED1B2D]'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
          ].join(' ')}
        >
          No
        </button>
      </div>

      {value === true && memberChips && memberChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {memberChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onMemberToggle?.(chip.id)}
              className={[
                'inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200',
                chip.selected
                  ? 'border-[#ED1B2D] bg-red-50 text-[#ED1B2D]'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300',
              ].join(' ')}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {infoText && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          {infoText}
        </p>
      )}
    </div>
  );
};
