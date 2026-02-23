'use client';

import React from 'react';
import type { FeatureFlags } from '@buyonline/shared-types';
import { FlagRow } from './FlagRow';

interface FeatureFlagsPanelProps {
  flags: FeatureFlags;
  onChange: (updated: Partial<FeatureFlags>) => void;
}

const FLAG_CONFIG: { key: keyof FeatureFlags; label: string; description: string }[] = [
  {
    key: 'resumeJourneyEnabled',
    label: 'Resume Journey',
    description: 'Allow users to resume an incomplete journey via SMS token link',
  },
  {
    key: 'hospitalSearchEnabled',
    label: 'Hospital Search',
    description: 'Show network hospitals near user\'s pincode during onboarding',
  },
  {
    key: 'ekycEnabled',
    label: 'eKYC (Aadhar / DigiLocker)',
    description: 'Enable Aadhar-based electronic KYC verification option',
  },
  {
    key: 'ckycEnabled',
    label: 'CKYC (PAN + DOB)',
    description: 'Enable Central KYC verification option using PAN and date of birth',
  },
];

export const FeatureFlagsPanel: React.FC<FeatureFlagsPanelProps> = ({ flags, onChange }) => {
  const activeCount = Object.values(flags).filter(Boolean).length;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--cfg-border)', borderBottom: 'none' }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: 'var(--cfg-surface-2)', borderBottom: '1px solid var(--cfg-border)' }}
      >
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--cfg-text)' }}>Feature Flags</div>
          <div className="text-xs" style={{ color: 'var(--cfg-text-faint)' }}>{activeCount}/{FLAG_CONFIG.length} enabled</div>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-full"
          style={{ background: 'var(--cfg-info-dim)', color: 'var(--cfg-info)' }}
        >
          {activeCount} active
        </span>
      </div>
      {FLAG_CONFIG.map(({ key, label, description }) => (
        <FlagRow
          key={key}
          label={label}
          description={description}
          enabled={flags[key]}
          onToggle={() => onChange({ [key]: !flags[key] })}
        />
      ))}
    </div>
  );
};
