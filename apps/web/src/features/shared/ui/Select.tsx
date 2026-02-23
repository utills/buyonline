'use client';
import React, { useId } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  label?: string;
  id?: string;
}

/**
 * Styled select matching Input.tsx — same border, focus ring with #E31837, same text size.
 * Shows a red error message below when the error prop is provided.
 */
export default function Select({
  value,
  onChange,
  options,
  placeholder,
  error,
  disabled = false,
  label,
  id: idProp,
}: SelectProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const hasError = Boolean(error);

  const wrapperClasses = [
    'w-full rounded-lg border bg-white overflow-hidden transition-colors duration-150',
    hasError
      ? 'border-red-300 focus-within:ring-1 focus-within:ring-red-500 focus-within:border-red-500'
      : 'border-gray-300 focus-within:ring-1 focus-within:ring-[#E31837] focus-within:border-[#E31837]',
    disabled ? 'bg-gray-50 opacity-60 cursor-not-allowed' : '',
  ].filter(Boolean).join(' ');

  const selectClasses = [
    'w-full px-4 py-3 text-sm bg-transparent appearance-none',
    'focus:outline-none',
    value ? 'text-gray-900' : 'text-gray-400',
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
  ].filter(Boolean).join(' ');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}

      <div className={`relative ${wrapperClasses}`}>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={selectClasses}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Chevron icon */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      {hasError && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
