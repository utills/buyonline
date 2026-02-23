import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'brand';

/** Props for the Badge component. */
export interface BadgeProps {
  /** Color/semantic variant. Defaults to 'neutral'. */
  variant?: BadgeVariant;
  /** Content inside the badge. */
  children: React.ReactNode;
  /** When true, renders a small colored dot before the text. */
  dot?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

const variantStyles: Record<BadgeVariant, { badge: string; dot: string }> = {
  success: { badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  warning: { badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  error:   { badge: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
  info:    { badge: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500' },
  neutral: { badge: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400' },
  brand:   { badge: 'bg-red-50 text-[#E31837]',      dot: 'bg-[#E31837]' },
};

/**
 * Small pill/badge component for status labels and categories.
 * Server Component safe — no client-side event handlers.
 */
export default function Badge({ variant = 'neutral', children, dot = false, className = '' }: BadgeProps) {
  const { badge: badgeColor, dot: dotColor } = variantStyles[variant];
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        badgeColor,
        className,
      ].filter(Boolean).join(' ')}
    >
      {dot && (
        <span
          className={['w-1.5 h-1.5 rounded-full flex-shrink-0', dotColor].join(' ')}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}