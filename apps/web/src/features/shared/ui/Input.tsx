'use client';
import React, { useId } from 'react';

/** Props for the Input component. Extends all native input HTML attributes. */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional visible label rendered above the input. */
  label?: string;
  /** Error message shown below the input; switches the input to error styling. */
  error?: string;
  /** Hint text shown below the input when there is no error. */
  hint?: string;
  /** Content rendered inside the input's left edge (e.g. country code, icon). */
  leftAddon?: React.ReactNode;
  /** Content rendered inside the input's right edge (e.g. unit, icon button). */
  rightAddon?: React.ReactNode;
}

/**
 * Reusable text input with optional label, left/right addons, validation error, and hint text.
 * Uses Prudential brand red (#E31837) for focus and error rings.
 */
export default function Input({
  label,
  error,
  hint,
  leftAddon,
  rightAddon,
  className = '',
  id: idProp,
  disabled,
  ...props
}: InputProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const hasError = Boolean(error);

  const wrapperClasses = [
    'flex items-center w-full rounded-lg border bg-white overflow-hidden transition-colors duration-150',
    hasError
      ? 'border-red-300 focus-within:ring-1 focus-within:ring-red-500 focus-within:border-red-500'
      : 'border-gray-300 focus-within:ring-1 focus-within:ring-[#E31837] focus-within:border-[#E31837]',
    disabled ? 'bg-gray-50 opacity-60 cursor-not-allowed' : '',
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'flex-1 min-w-0 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent',
    'focus:outline-none',
    disabled ? 'text-gray-400 cursor-not-allowed' : '',
    className,
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

      <div className={wrapperClasses}>
        {leftAddon && (
          <div className="flex items-center px-3 py-3 bg-gray-100 border-r border-gray-300 text-gray-600 text-sm font-medium flex-shrink-0">
            {leftAddon}
          </div>
        )}

        <input
          id={id}
          disabled={disabled}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          {...props}
        />

        {rightAddon && (
          <div className="flex items-center px-3 py-3 text-gray-500 flex-shrink-0">
            {rightAddon}
          </div>
        )}
      </div>

      {hasError && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      {!hasError && hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}