'use client';

import React, { useState } from 'react';
import type { PlanConfig, AddonConfig } from '@buyonline/shared-types';
import { PlanConfigCard } from './PlanConfigCard';
import { AddonConfigList } from './AddonConfigList';

interface PlanConfiguratorProps {
  plans: PlanConfig[];
  addons: AddonConfig[];
  onPlansChange: (plans: PlanConfig[]) => void;
  onAddonsChange: (addons: AddonConfig[]) => void;
}

export const PlanConfigurator: React.FC<PlanConfiguratorProps> = ({
  plans,
  addons,
  onPlansChange,
  onAddonsChange,
}) => {
  const [tab, setTab] = useState<'plans' | 'addons'>('plans');

  return (
    <div>
      {/* Tab switcher */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-6 w-fit"
        style={{ background: 'var(--cfg-surface)' }}
      >
        {(['plans', 'addons'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize"
            style={{
              background: tab === t ? 'var(--cfg-accent)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--cfg-text-muted)',
            }}
          >
            {t === 'plans' ? `Plans (${plans.filter((p) => p.enabled).length}/${plans.length})` : `Add-ons (${addons.filter((a) => a.enabled).length}/${addons.length})`}
          </button>
        ))}
      </div>

      {tab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, idx) => (
            <PlanConfigCard
              key={plan.planId}
              plan={plan}
              index={idx}
              onChange={(updated) => onPlansChange(plans.map((p) => (p.planId === updated.planId ? updated : p)))}
            />
          ))}
        </div>
      )}

      {tab === 'addons' && (
        <AddonConfigList addons={addons} onChange={onAddonsChange} />
      )}
    </div>
  );
};
