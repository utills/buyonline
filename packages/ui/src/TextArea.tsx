'use client';

import React from 'react';

export interface TextAreaProps {
  label?: string;
  maxLength?: number;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  showCount?: boolean;
  placeholder?: string;
  error?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  maxLength = 200,
  value = '',
  onChange,
  showCount = true,
  placeholder,
  error,
  rows = 4,
  required = false,
  disabled = false,
  name,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-[#ED1B2D] ml-0.5">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        className={[
          'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-[#ED1B2D] focus:border-transparent',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 hover:border-gray-400',
          disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'bg-white',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      <div className="flex justify-between items-center">
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : (
          <span />
        )}
        {showCount && (
          <span className="text-xs text-gray-400">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};
