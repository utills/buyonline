'use client';

import React from 'react';

export interface CounterProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
}

export const Counter: React.FC<CounterProps> = ({
  value,
  min = 0,
  max = 99,
  onChange,
  label,
  className = '',
}) => {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {label && (
        <span className="text-sm font-medium text-gray-700 mr-auto">{label}</span>
      )}
      <div className="flex items-center gap-0">
        <button
          type="button"
          onClick={() => canDecrement && onChange(value - 1)}
          disabled={!canDecrement}
          className={[
            'w-9 h-9 rounded-l-lg border border-gray-300 flex items-center justify-center text-lg font-semibold transition-colors duration-200',
            canDecrement
              ? 'text-[#ED1B2D] hover:bg-red-50 cursor-pointer'
              : 'text-gray-300 cursor-not-allowed',
          ].join(' ')}
          aria-label="Decrease"
        >
          -
        </button>
        <span className="w-12 h-9 flex items-center justify-center border-t border-b border-gray-300 text-sm font-semibold text-gray-900 bg-white select-none">
          {value}
        </span>
        <button
          type="button"
          onClick={() => canIncrement && onChange(value + 1)}
          disabled={!canIncrement}
          className={[
            'w-9 h-9 rounded-r-lg border border-gray-300 flex items-center justify-center text-lg font-semibold transition-colors duration-200',
            canIncrement
              ? 'text-[#ED1B2D] hover:bg-red-50 cursor-pointer'
              : 'text-gray-300 cursor-not-allowed',
          ].join(' ')}
          aria-label="Increase"
        >
          +
        </button>
      </div>
    </div>
  );
};
