'use client';

import React from 'react';

export interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'info' | 'popular' | 'error';
  className?: string;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-orange-100 text-orange-700',
  info: 'bg-blue-100 text-blue-700',
  popular: 'bg-blue-100 text-blue-700',
  error: 'bg-red-100 text-red-700',
};

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'info',
  className = '',
}) => {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {text}
    </span>
  );
};
