'use client';

import React from 'react';
import type { JourneyConfig } from '@buyonline/shared-types';

interface StatsGridProps {
  config: JourneyConfig;
  lastSyncedAt: string | null;
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, color, delay }) => (
  <div
    className={`p-5 rounded-xl cfg-animate-fade-up cfg-delay-${delay}`}
    style={{
      background: 'var(--cfg-surface)',
      border: '1px solid var(--cfg-border)',
    }}
  >
    <div className="text-xs font-medium mb-2" style={{ color: 'var(--cfg-text-muted)' }}>
      {label}
    </div>
    <div
      className="text-3xl font-bold tracking-tight"
      style={{ color: color ?? 'var(--cfg-text)' }}
    >
      {value}
    </div>
    {sub && (
      <div className="text-xs mt-1" style={{ color: 'var(--cfg-text-faint)' }}>
        {sub}
      </div>
    )}
  </div>
);

export const StatsGrid: React.FC<StatsGridProps> = ({ config, lastSyncedAt }) => {
  const enabledPhases  = config.phases.filter((p) => p.enabled).length;
  const enabledPlans   = config.plans.filter((p) => p.enabled).length;
  const enabledAddons  = config.addons.filter((a) => a.enabled).length;
  const enabledQs      = config.healthQuestions.filter((q) => q.enabled).length;
  const activeFlags    = Object.values(config.featureFlags).filter(Boolean).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard delay={1} label="Active Phases"       value={`${enabledPhases}/${config.phases.length}`}              color="var(--cfg-accent)" />
      <StatCard delay={2} label="Enabled Plans"        value={`${enabledPlans}/${config.plans.length}`}                color="var(--cfg-success)" />
      <StatCard delay={3} label="Active Add-ons"       value={`${enabledAddons}/${config.addons.length}`}              />
      <StatCard delay={4} label="Health Questions"     value={`${enabledQs}/${config.healthQuestions.length}`}         />
      <StatCard delay={5} label="Feature Flags On"     value={`${activeFlags}/4`}                                      color="var(--cfg-info)" />
      <StatCard
        delay={6}
        label="Last Synced"
        value={lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
        sub={lastSyncedAt ? new Date(lastSyncedAt).toLocaleDateString() : 'Not yet synced'}
      />
    </div>
  );
};
