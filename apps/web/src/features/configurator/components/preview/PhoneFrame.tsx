'use client';

import React from 'react';
import type { JourneyConfig } from '@buyonline/shared-types';

interface PhoneFrameProps {
  config: JourneyConfig;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ config }) => {
  const enabledPhases = config.phases.filter((p) => p.enabled).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div
      className="relative mx-auto"
      style={{
        width: '240px',
        height: '480px',
        borderRadius: '28px',
        border: '3px solid var(--cfg-border-bright)',
        background: '#fff',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}
    >
      {/* Notch */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-3 rounded-full"
        style={{ background: 'var(--cfg-border-bright)', zIndex: 10 }}
      />

      {/* Header bar */}
      <div
        className="flex items-center justify-between px-3 pt-7 pb-2"
        style={{ background: config.branding.primaryColor }}
      >
        <span className="text-white text-xs font-bold">{config.branding.logoText}</span>
        <span className="text-white text-xs opacity-70">●●●</span>
      </div>

      {/* Journey steps */}
      <div className="overflow-y-auto h-full pb-8" style={{ background: '#f8f8f8' }}>
        {enabledPhases.map((phase) => (
          <div key={phase.id} className="px-2 pt-2">
            <div
              className="text-xs font-semibold px-2 py-1 mb-1"
              style={{ color: config.branding.primaryColor }}
            >
              {phase.label}
            </div>
            {phase.steps
              .filter((s) => s.enabled)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((step) => (
                <div
                  key={step.id}
                  className="flex items-center gap-2 px-2 py-1.5 mb-1 rounded"
                  style={{ background: '#fff', border: '1px solid #e8e8e8' }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: config.branding.primaryColor }}
                  />
                  <span className="text-xs text-gray-700">{step.label}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};
