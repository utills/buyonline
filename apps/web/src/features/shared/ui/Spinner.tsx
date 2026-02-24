import React from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

/** Props for the Spinner component. */
export interface SpinnerProps {
  /** Size of the spinner. Defaults to 'md'. */
  size?: SpinnerSize;
  /** Tailwind text color class applied to the SVG. Defaults to 'text-[#ED1B2D]'. */
  color?: string;
  /** Additional CSS classes. */
  className?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

/**
 * Animated SVG spinner for loading states.
 * Server Component safe — no client-side event handlers.
 */
export default function Spinner({ size = 'md', color = 'text-[#ED1B2D]', className = '' }: SpinnerProps) {
  const sizeClass = sizeMap[size];
  const classes = ['animate-spin', sizeClass, color, className].filter(Boolean).join(' ');
  return (
    <svg
      className={classes}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}