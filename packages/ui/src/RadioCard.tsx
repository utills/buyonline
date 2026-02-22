'use client';

import React from 'react';

export interface RadioCardProps {
  label: string;
  description?: string;
  selected?: boolean;
  rightContent?: React.ReactNode;
  badge?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const RadioCard: React.FC<RadioCardProps> = ({
  label,
  description,
  selected = false,
  rightContent,
  badge,
  onClick,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'w-full text-left rounded-xl border-2 p-4 transition-all duration-200 relative',
        selected
          ? 'border-[#E31837] bg-red-50'
          : 'border-gray-200 bg-white hover:border-gray-300',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {badge && (
        <span className="absolute -top-2.5 left-4 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-3">
        <span
          className={[
            'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200',
            selected ? 'border-[#E31837]' : 'border-gray-300',
          ].join(' ')}
        >
          {selected && (
            <span className="w-2.5 h-2.5 rounded-full bg-[#E31837]" />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        {rightContent && (
          <div className="flex-shrink-0">{rightContent}</div>
        )}
      </div>
    </button>
  );
};
