'use client';

import React from 'react';

export interface MemberChipProps {
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const MemberChip: React.FC<MemberChipProps> = ({
  label,
  icon,
  selected = false,
  onClick,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200',
        selected
          ? 'border-[#ED1B2D] bg-red-50 text-[#ED1B2D]'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </button>
  );
};
