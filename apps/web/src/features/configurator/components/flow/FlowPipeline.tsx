'use client';

import React from 'react';
import type { JourneyPhaseConfig } from '@buyonline/shared-types';

const PHASE_ICONS: Record<string, string> = {
  auth: '🔐', onboarding: '📍', quote: '📋',
  payment: '💳', kyc: '🪪', health: '🏥', complete: '✅',
};

interface FlowPipelineProps {
  phases: JourneyPhaseConfig[];
}

export const FlowPipeline: React.FC<FlowPipelineProps> = ({ phases }) => {
  const sorted = [...phases].sort((a, b) => a.sortOrder - b.sortOrder);
  const activeCount = sorted.filter((p) => p.enabled).length;

  return (
    <div
      className="rounded-xl mb-6 cfg-animate-fade-in"
      style={{ background: 'var(--cfg-surface)', border: '1px solid var(--cfg-border)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--cfg-border)' }}
      >
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--cfg-text)' }}>
            Flow Sequence
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--cfg-text-faint)' }}>
            Live view of the journey order · drag cards below to reorder
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: 'var(--cfg-success-dim)', color: 'var(--cfg-success)' }}
          >
            {activeCount} active
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full"
            style={{ background: 'var(--cfg-surface-2)', color: 'var(--cfg-text-muted)' }}
          >
            {sorted.length - activeCount} skipped
          </span>
        </div>
      </div>

      {/* Pipeline strip */}
      <div className="px-5 py-5 overflow-x-auto cfg-scroll">
        <div className="flex items-center gap-1 min-w-max">
          {sorted.map((phase, idx) => (
            <React.Fragment key={phase.id}>
              {/* Phase node */}
              <div
                className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all"
                style={{
                  background: phase.enabled ? 'var(--cfg-surface-2)' : 'transparent',
                  border: `1px solid ${phase.enabled ? 'var(--cfg-border-bright)' : 'var(--cfg-border)'}`,
                  opacity: phase.enabled ? 1 : 0.4,
                  minWidth: '88px',
                }}
              >
                {/* Order number */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold"
                  style={{
                    background: phase.enabled ? 'var(--cfg-accent)' : 'var(--cfg-surface-3)',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                >
                  {idx + 1}
                </div>

                {/* Emoji icon */}
                <span className="text-[22px] leading-none">{PHASE_ICONS[phase.id] ?? '◆'}</span>

                {/* Phase label */}
                <span
                  className="text-xs font-medium text-center leading-tight"
                  style={{ color: phase.enabled ? 'var(--cfg-text)' : 'var(--cfg-text-faint)' }}
                >
                  {phase.label}
                </span>

                {/* Steps pill */}
                <span
                  className="rounded-full px-2 py-0.5 font-medium"
                  style={{
                    background: phase.enabled ? 'var(--cfg-success-dim)' : 'var(--cfg-surface-3)',
                    color: phase.enabled ? 'var(--cfg-success)' : 'var(--cfg-text-faint)',
                    fontSize: '10px',
                  }}
                >
                  {phase.steps.filter((s) => s.enabled).length}/{phase.steps.length} steps
                </span>
              </div>

              {/* Arrow connector */}
              {idx < sorted.length - 1 && (
                <div
                  className="flex-shrink-0 self-center"
                  style={{ color: phase.enabled ? 'var(--cfg-border-bright)' : 'var(--cfg-border)' }}
                >
                  <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
                    <path
                      d="M2 8h24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeDasharray={phase.enabled ? undefined : '3 3'}
                    />
                    <path
                      d="M22 4l6 4-6 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div
        className="px-5 py-2.5 flex items-center gap-2"
        style={{ borderTop: '1px solid var(--cfg-border)', background: 'var(--cfg-surface-2)', borderRadius: '0 0 12px 12px' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="7" cy="7" r="6" stroke="var(--cfg-text-faint)" strokeWidth="1.2" />
          <path d="M7 6.5v3.5M7 5.5v.01" stroke="var(--cfg-text-faint)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span className="text-xs" style={{ color: 'var(--cfg-text-faint)' }}>
          Disabled phases are skipped during the journey (shown as dashed arrows above).
          Toggle or reorder phases in the cards below.
        </span>
      </div>
    </div>
  );
};
