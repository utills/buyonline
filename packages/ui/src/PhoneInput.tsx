'use client';

import React from 'react';

export interface PhoneInputProps {
  countryCode?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  countryCode = '+91',
  value = '',
  onChange,
  error,
  label,
  required = false,
  disabled = false,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= 10) {
      onChange?.(raw);
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-[#ED1B2D] ml-0.5">*</span>}
        </label>
      )}
      <div className="flex">
        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-sm text-gray-600 font-medium select-none">
          {countryCode}
        </span>
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          placeholder="Enter mobile number"
          disabled={disabled}
          className={[
            'flex-1 min-w-0 rounded-r-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[#ED1B2D] focus:border-transparent',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 hover:border-gray-400',
            disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'bg-white',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  );
};
