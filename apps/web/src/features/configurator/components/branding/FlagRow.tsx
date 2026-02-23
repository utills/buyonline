'use client';

import React from 'react';

interface FlagRowProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

export const FlagRow: React.FC<FlagRowProps> = ({ label, description, enabled, onToggle }) => (
  <div
    className="flex items-center justify-between px-4 py-3"
    style={{ borderBottom: '1px solid var(--cfg-border)' }}
  >
    <div>
      <div className="text-sm font-medium" style={{ color: 'var(--cfg-text)' }}>{label}</div>
      <div className="text-xs" style={{ color: 'var(--cfg-text-faint)' }}>{description}</div>
    </div>
    <button
      onClick={onToggle}
      className="flex-shrink-0 w-9 h-5 rounded-full relative transition-colors duration-200"
      style={{ background: enabled ? 'var(--cfg-success)' : 'var(--cfg-surface-3)' }}
      aria-label={`${enabled ? 'Disable' : 'Enable'} ${label}`}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  </div>
);
