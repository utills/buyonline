'use client';

import React from 'react';
import type { JourneyPhaseConfig } from '@buyonline/shared-types';

interface PhaseHealthGridProps {
  phases: JourneyPhaseConfig[];
}

const PHASE_ICONS: Record<string, string> = {
  auth: '🔐', onboarding: '📍', quote: '📋',
  payment: '💳', kyc: '🪪', health: '🏥', complete: '✅',
};

export const PhaseHealthGrid: React.FC<PhaseHealthGridProps> = ({ phases }) => {
  const sorted = [...phases].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--cfg-text)' }}>
          Phase Health
        </h2>
        <span className="text-xs" style={{ color: 'var(--cfg-text-faint)' }}>
          {sorted.filter((p) => p.enabled).length} of {sorted.length} phases active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sorted.map((phase, idx) => {
          const enabledSteps = phase.steps.filter((s) => s.enabled).length;
          const pct = phase.steps.length > 0 ? (enabledSteps / phase.steps.length) * 100 : 0;

          return (
            <div
              key={phase.id}
              className={`rounded-xl p-4 cfg-animate-fade-up cfg-delay-${Math.min(idx + 1, 6)}`}
              style={{
                background: 'var(--cfg-surface)',
                border: `1px solid ${phase.enabled ? 'var(--cfg-border)' : 'var(--cfg-border)'}`,
                opacity: phase.enabled ? 1 : 0.5,
              }}
            >
              {/* Top row: order badge + icon */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      background: phase.enabled ? 'var(--cfg-accent)' : 'var(--cfg-surface-3)',
                      color: '#fff',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-lg leading-none">{PHASE_ICONS[phase.id] ?? '◆'}</span>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: phase.enabled ? 'var(--cfg-success-dim)' : 'var(--cfg-surface-3)',
                    color: phase.enabled ? 'var(--cfg-success)' : 'var(--cfg-text-faint)',
                    fontSize: '10px',
                  }}
                >
                  {phase.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>

              {/* Phase name */}
              <div
                className="font-semibold text-sm mb-1"
                style={{ color: phase.enabled ? 'var(--cfg-text)' : 'var(--cfg-text-muted)' }}
              >
                {phase.label}
              </div>
              <div className="text-xs mb-3" style={{ color: 'var(--cfg-text-faint)' }}>
                {enabledSteps}/{phase.steps.length} steps enabled
              </div>

              {/* Progress bar */}
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--cfg-surface-3)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: phase.enabled ? 'var(--cfg-accent)' : 'var(--cfg-text-faint)',
                  }}
                />
              </div>

              {/* Steps list (abbreviated) */}
              <div className="mt-3 space-y-1">
                {phase.steps.slice(0, 3).map((step) => (
                  <div key={step.id} className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: step.enabled ? 'var(--cfg-success)' : 'var(--cfg-surface-3)',
                      }}
                    />
                    <span
                      className="text-xs truncate"
                      style={{ color: step.enabled ? 'var(--cfg-text-faint)' : 'var(--cfg-text-faint)', opacity: step.enabled ? 1 : 0.5 }}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
                {phase.steps.length > 3 && (
                  <div className="text-xs" style={{ color: 'var(--cfg-text-faint)', paddingLeft: '14px' }}>
                    +{phase.steps.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
