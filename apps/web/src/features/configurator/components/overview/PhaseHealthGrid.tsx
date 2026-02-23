'use client';

import React from 'react';
import type { JourneyPhaseConfig } from '@buyonline/shared-types';

interface PhaseHealthGridProps {
  phases: JourneyPhaseConfig[];
}

const PHASE_ICONS: Record<string, string> = {
  auth:       '🔐',
  onboarding: '📍',
  quote:      '📋',
  payment:    '💳',
  kyc:        '🪪',
  health:     '🏥',
  complete:   '✅',
};

export const PhaseHealthGrid: React.FC<PhaseHealthGridProps> = ({ phases }) => {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--cfg-text-muted)' }}>
        Phase Health
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {phases.map((phase, idx) => {
          const enabledSteps = phase.steps.filter((s) => s.enabled).length;
          const pct = phase.steps.length > 0 ? (enabledSteps / phase.steps.length) * 100 : 0;

          return (
            <div
              key={phase.id}
              className={`p-4 rounded-xl cfg-animate-fade-up cfg-delay-${Math.min(idx + 1, 6)}`}
              style={{
                background: 'var(--cfg-surface)',
                border: `1px solid ${phase.enabled ? 'var(--cfg-border)' : 'var(--cfg-border)'}`,
                opacity: phase.enabled ? 1 : 0.45,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{PHASE_ICONS[phase.id] ?? '◆'}</span>
                <div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--cfg-text)' }}>
                    {phase.label}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--cfg-text-faint)' }}>
                    {enabledSteps}/{phase.steps.length} steps
                  </div>
                </div>
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

              {/* Status badge */}
              <div className="mt-2 flex justify-end">
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: phase.enabled ? 'var(--cfg-success-dim)' : 'var(--cfg-border)',
                    color: phase.enabled ? 'var(--cfg-success)' : 'var(--cfg-text-faint)',
                  }}
                >
                  {phase.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
