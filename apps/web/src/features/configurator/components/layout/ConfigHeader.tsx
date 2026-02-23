'use client';

import React, { useState } from 'react';
import { useConfigStore } from '../../store/useConfigStore';

interface ConfigHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const ConfigHeader: React.FC<ConfigHeaderProps> = ({ title, subtitle, actions }) => {
  const { reset } = useConfigStore();
  const [confirming, setConfirming] = useState(false);

  const handleReset = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    reset();
    setConfirming(false);
  };

  return (
    <header
      className="sticky top-0 z-40 px-6 cfg-animate-fade-in"
      style={{
        minHeight: 'var(--cfg-header-height)',
        background: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--cfg-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      {/* Page title */}
      <div className="min-w-0">
        <h1 className="text-lg font-bold leading-tight truncate" style={{ color: 'var(--cfg-text)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--cfg-text-faint)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all duration-150"
          style={{
            background: confirming ? 'rgba(245,158,11,0.15)' : 'var(--cfg-surface-2)',
            color: confirming ? 'var(--cfg-warning)' : 'var(--cfg-text-muted)',
            border: `1px solid ${confirming ? 'var(--cfg-warning)' : 'var(--cfg-border)'}`,
          }}
          title="Reset all configuration to defaults"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.5 6A4.5 4.5 0 1110.5 6" />
            <path d="M1.5 3v3h3" />
          </svg>
          {confirming ? 'Click again to confirm' : 'Reset defaults'}
        </button>
      </div>
    </header>
  );
};
