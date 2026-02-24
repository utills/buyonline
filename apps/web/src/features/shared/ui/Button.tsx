'use client';
import React from 'react';
import Spinner from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Props for the Button component. Extends all native button HTML attributes. */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. Defaults to 'primary'. */
  variant?: ButtonVariant;
  /** Size of the button. Defaults to 'md'. */
  size?: ButtonSize;
  /** When true, shows a spinner and disables interaction. */
  loading?: boolean;
  /** Icon node rendered to the left of the button label. */
  leftIcon?: React.ReactNode;
  /** Icon node rendered to the right of the button label. */
  rightIcon?: React.ReactNode;
  /** When true, button stretches to fill the full width of its container. */
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#ED1B2D] text-white hover:bg-[#C8162A] active:bg-[#9A1028] shadow-sm',
  secondary:
    'bg-gray-900 text-white hover:bg-gray-700 active:bg-gray-800 shadow-sm',
  outline:
    'border-2 border-[#ED1B2D] text-[#ED1B2D] bg-transparent hover:bg-red-50 active:bg-red-100',
  ghost:
    'text-gray-600 bg-transparent hover:bg-gray-100 active:bg-gray-200',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 rounded-xl',
  lg: 'text-base px-6 py-3 rounded-xl font-semibold',
};

const spinnerColorByVariant: Record<ButtonVariant, string> = {
  primary:   'text-white',
  secondary: 'text-white',
  outline:   'text-[#ED1B2D]',
  ghost:     'text-gray-600',
  danger:    'text-white',
};

/**
 * Variant-based button supporting primary, secondary, outline, ghost, and danger styles.
 * Includes loading state with a spinner, icon slots, and full-width mode.
 * Uses Prudential brand red (#ED1B2D) as the primary color.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const classes = [
    'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED1B2D] focus-visible:ring-offset-2 select-none',
    variantStyles[variant],
    sizeStyles[size],
    isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  const spinnerSize = size === 'lg' ? 'sm' : 'xs';

  return (
    <button type="button" disabled={isDisabled} className={classes} {...props}>
      {loading ? (
        <>
          <Spinner size={spinnerSize} color={spinnerColorByVariant[variant]} />
          {children}
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}