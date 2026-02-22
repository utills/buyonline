'use client';

import React from 'react';

export interface InfoBoxProps {
  variant?: 'info' | 'warning';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<NonNullable<InfoBoxProps['variant']>, { border: string; bg: string; iconColor: string }> = {
  info: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  warning: {
    border: 'border-l-orange-500',
    bg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
};

export const InfoBox: React.FC<InfoBoxProps> = ({
  variant = 'info',
  icon,
  children,
  className = '',
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={[
        'flex items-start gap-3 rounded-r-lg border-l-4 p-4',
        styles.border,
        styles.bg,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && (
        <span className={`flex-shrink-0 mt-0.5 ${styles.iconColor}`}>
          {icon}
        </span>
      )}
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  );
};
