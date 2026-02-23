'use client';

import React from 'react';
import { useConfigStore } from '../../store/useConfigStore';

interface ConfigHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const ConfigHeader: React.FC<ConfigHeaderProps> = ({ title, subtitle, actions }) => {
  const { reset } = useConfigStore();

  const handleReset = () => {
    if (confirm('Reset all configuration to defaults? This cannot be undone.')) {
      reset();
    }
  };

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-6 cfg-animate-fade-in"
      style={{
        height: 'var(--cfg-header-height)',
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--cfg-border)',
      }}
    >
      <div>
        <h1 className="text-base font-semibold" style={{ color: 'var(--cfg-text)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs" style={{ color: 'var(--cfg-text-faint)' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-xs rounded-lg transition-colors duration-150"
          style={{
            background: 'var(--cfg-surface-2)',
            color: 'var(--cfg-text-muted)',
            border: '1px solid var(--cfg-border)',
          }}
        >
          Reset defaults
        </button>
      </div>
    </header>
  );
};
