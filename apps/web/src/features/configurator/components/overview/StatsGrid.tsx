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
  accent: string;
  delay: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, accent, delay, icon }) => (
  <div
    className={`rounded-xl p-5 cfg-animate-fade-up cfg-delay-${delay} flex flex-col gap-3`}
    style={{
      background: 'var(--cfg-surface)',
      border: '1px solid var(--cfg-border)',
    }}
  >
    {/* Top row: icon + label */}
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cfg-text-muted)' }}>
        {label}
      </span>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: `${accent}22`, color: accent }}
      >
        {icon}
      </div>
    </div>

    {/* Value */}
    <div>
      <div className="text-3xl font-bold tracking-tight leading-none" style={{ color: accent }}>
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-1.5" style={{ color: 'var(--cfg-text-faint)' }}>
          {sub}
        </div>
      )}
    </div>
  </div>
);

export const StatsGrid: React.FC<StatsGridProps> = ({ config, lastSyncedAt }) => {
  const enabledPhases = config.phases.filter((p) => p.enabled).length;
  const enabledPlans  = config.plans.filter((p) => p.enabled).length;
  const enabledAddons = config.addons.filter((a) => a.enabled).length;
  const enabledQs     = config.healthQuestions.filter((q) => q.enabled).length;
  const activeFlags   = Object.values(config.featureFlags).filter(Boolean).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        delay={1}
        label="Active Phases"
        value={`${enabledPhases}/${config.phases.length}`}
        sub={`${config.phases.length - enabledPhases} phases skipped`}
        accent="var(--cfg-accent)"
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="2.5" cy="8" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="13.5" cy="8" r="1.5" />
            <path d="M4 8h2.5M9.5 8h2.5" />
            <path d="M11.5 5.5l2.5 2.5-2.5 2.5" />
          </svg>
        }
      />
      <StatCard
        delay={2}
        label="Enabled Plans"
        value={`${enabledPlans}/${config.plans.length}`}
        sub={`${enabledPlans} plan${enabledPlans !== 1 ? 's' : ''} shown to users`}
        accent="var(--cfg-success)"
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="2" width="14" height="4" rx="1" />
            <rect x="1" y="8" width="14" height="4" rx="1" />
            <path d="M1 14h6" />
            <path d="M12 13v2M11 14h2" />
          </svg>
        }
      />
      <StatCard
        delay={3}
        label="Active Add-ons"
        value={`${enabledAddons}/${config.addons.length}`}
        sub={`${config.addons.filter((a) => a.preChecked).length} pre-checked`}
        accent="var(--cfg-info)"
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="12" height="12" rx="2" />
            <path d="M8 5v6M5 8h6" />
          </svg>
        }
      />
      <StatCard
        delay={4}
        label="Health Questions"
        value={`${enabledQs}/${config.healthQuestions.length}`}
        sub={`${config.healthQuestions.length - enabledQs} questions disabled`}
        accent="var(--cfg-warning)"
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 14S2 10.5 2 6A4 4 0 018 3a4 4 0 016 3c0 4.5-6 8-6 8z" />
          </svg>
        }
      />
      <StatCard
        delay={5}
        label="Feature Flags"
        value={`${activeFlags}/4`}
        sub={activeFlags === 4 ? 'All features enabled' : `${4 - activeFlags} feature${4 - activeFlags !== 1 ? 's' : ''} off`}
        accent="var(--cfg-info)"
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 2v12" />
            <path d="M2 2l10 3-10 3" />
          </svg>
        }
      />
      <StatCard
        delay={6}
        label="Last Synced"
        value={
          lastSyncedAt
            ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '—'
        }
        sub={
          lastSyncedAt
            ? `on ${new Date(lastSyncedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
            : 'Changes not yet saved'
        }
        accent="var(--cfg-text-muted)"
        icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3.5l2 2" />
          </svg>
        }
      />
    </div>
  );
};
