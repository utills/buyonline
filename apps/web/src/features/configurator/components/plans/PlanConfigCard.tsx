'use client';

import React from 'react';
import type { PlanConfig } from '@buyonline/shared-types';

interface PlanConfigCardProps {
  plan: PlanConfig;
  index: number;
  onChange: (updated: PlanConfig) => void;
}

const PLAN_LABELS: Record<string, { name: string; tier: string; color: string }> = {
  'plan-premier':   { name: 'Premier',   tier: 'Base',     color: '#6366F1' },
  'plan-signature': { name: 'Signature', tier: 'Mid-tier', color: '#F59E0B' },
  'plan-global':    { name: 'Global',    tier: 'Premium',  color: '#ED1B2D' },
};

export const PlanConfigCard: React.FC<PlanConfigCardProps> = ({ plan, index, onChange }) => {
  const meta = PLAN_LABELS[plan.planId] ?? { name: plan.planId, tier: '', color: 'var(--cfg-text-muted)' };

  return (
    <div
      className={`p-5 rounded-xl transition-all duration-200 cfg-animate-fade-up cfg-delay-${Math.min(index + 1, 6)}`}
      style={{
        background: 'var(--cfg-surface)',
        border: `1px solid ${plan.highlighted ? meta.color : 'var(--cfg-border)'}`,
        opacity: plan.enabled ? 1 : 0.55,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: `${meta.color}22`, color: meta.color }}
          >
            {meta.name[0]}
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: 'var(--cfg-text)' }}>
              {plan.customLabel || meta.name}
            </div>
            <div className="text-xs" style={{ color: 'var(--cfg-text-faint)' }}>
              {meta.tier} · {plan.planId}
            </div>
          </div>
        </div>

        {/* Enable toggle */}
        <button
          onClick={() => onChange({ ...plan, enabled: !plan.enabled })}
          className="flex-shrink-0 w-11 h-6 rounded-full relative transition-colors duration-200"
          style={{ background: plan.enabled ? 'var(--cfg-accent)' : 'var(--cfg-surface-3)' }}
          aria-label={`${plan.enabled ? 'Disable' : 'Enable'} ${meta.name}`}
        >
          <span
            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
            style={{ transform: plan.enabled ? 'translateX(20px)' : 'translateX(0)' }}
          />
        </button>
      </div>

      {/* Highlighted toggle */}
      <div
        className="flex items-center justify-between py-2.5 px-3 rounded-lg mb-3"
        style={{ background: 'var(--cfg-surface-2)' }}
      >
        <div>
          <div className="text-xs font-medium" style={{ color: 'var(--cfg-text)' }}>Highlighted / Recommended</div>
          <div className="text-xs" style={{ color: 'var(--cfg-text-faint)' }}>Shows a "Best Value" badge</div>
        </div>
        <button
          onClick={() => onChange({ ...plan, highlighted: !plan.highlighted })}
          className="flex-shrink-0 w-9 h-5 rounded-full relative transition-colors duration-200"
          style={{ background: plan.highlighted ? meta.color : 'var(--cfg-surface-3)' }}
          aria-label="Toggle highlighted"
        >
          <span
            className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
            style={{ transform: plan.highlighted ? 'translateX(16px)' : 'translateX(0)' }}
          />
        </button>
      </div>

      {/* Custom label */}
      <div>
        <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--cfg-text-muted)' }}>
          Custom label <span style={{ color: 'var(--cfg-text-faint)' }}>(optional)</span>
        </label>
        <input
          type="text"
          value={plan.customLabel ?? ''}
          onChange={(e) => onChange({ ...plan, customLabel: e.target.value || undefined })}
          placeholder={meta.name}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
          style={{
            background: 'var(--cfg-surface-2)',
            border: '1px solid var(--cfg-border)',
            color: 'var(--cfg-text)',
          }}
        />
      </div>
    </div>
  );
};
