'use client';

import React from 'react';

export interface ProgressBarProps {
  current: number;
  total: number;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  animated = true,
  className = '',
}) => {
  const percentage = total > 0 ? Math.min(Math.max((current / total) * 100, 0), 100) : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={[
            'h-full bg-[#ED1B2D] rounded-full',
            animated ? 'transition-all duration-500 ease-out' : '',
          ].join(' ')}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
