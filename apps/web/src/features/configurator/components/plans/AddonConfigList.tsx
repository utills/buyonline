'use client';

import React from 'react';
import type { AddonConfig } from '@buyonline/shared-types';

interface AddonMeta {
  id: string;
  name: string;
  category: string;
}

const ADDON_META: AddonMeta[] = [
  { id: 'addon-maternity',     name: 'Maternity Coverage',             category: 'Family' },
  { id: 'addon-dental',        name: 'Dental Care',                    category: 'Wellness' },
  { id: 'addon-vision',        name: 'Vision Care',                    category: 'Wellness' },
  { id: 'addon-critical',      name: 'Critical Illness Rider',         category: 'Riders' },
  { id: 'addon-accident',      name: 'Personal Accident Cover',        category: 'Riders' },
  { id: 'addon-opd',           name: 'OPD & Consultation Cover',       category: 'Outpatient' },
  { id: 'addon-travel',        name: 'International Travel Cover',     category: 'Travel' },
  { id: 'addon-cancer',        name: 'Cancer Care Rider',              category: 'Riders' },
  { id: 'addon-mental',        name: 'Mental Wellness Program',        category: 'Wellness' },
  { id: 'addon-physio',        name: 'Physiotherapy & Rehabilitation', category: 'Wellness' },
  { id: 'addon-home',          name: 'Home Healthcare',                category: 'Outpatient' },
  { id: 'addon-bariatric',     name: 'Bariatric Surgery Cover',        category: 'Surgical' },
  { id: 'addon-organ',         name: 'Organ Transplant Cover',         category: 'Surgical' },
  { id: 'addon-wellness',      name: 'Wellness & Preventive Care',     category: 'Wellness' },
  { id: 'addon-hospital-cash', name: 'Daily Hospital Cash',            category: 'Cash Benefits' },
];

interface AddonConfigListProps {
  addons: AddonConfig[];
  onChange: (updated: AddonConfig[]) => void;
}

interface AddonRowProps {
  addon: AddonConfig;
  name: string;
  onToggleEnabled: () => void;
  onTogglePreChecked: () => void;
}

const AddonRow: React.FC<AddonRowProps> = ({ addon, name, onToggleEnabled, onTogglePreChecked }) => (
  <div
    className="flex items-center gap-3 px-4 py-3 transition-opacity duration-200"
    style={{ opacity: addon.enabled ? 1 : 0.45, borderBottom: '1px solid var(--cfg-border)' }}
  >
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium" style={{ color: 'var(--cfg-text)' }}>{name}</div>
      {addon.enabled && (
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={onTogglePreChecked}
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: addon.preChecked ? 'var(--cfg-success)' : 'var(--cfg-text-faint)' }}
          >
            <span
              className="w-3.5 h-3.5 rounded border flex items-center justify-center text-xs"
              style={{
                background: addon.preChecked ? 'var(--cfg-success)' : 'transparent',
                borderColor: addon.preChecked ? 'var(--cfg-success)' : 'var(--cfg-border-bright)',
                color: '#fff',
              }}
            >
              {addon.preChecked ? '✓' : ''}
            </span>
            Pre-checked for users
          </button>
        </div>
      )}
    </div>

    <button
      onClick={onToggleEnabled}
      className="flex-shrink-0 w-9 h-5 rounded-full relative transition-colors duration-200"
      style={{ background: addon.enabled ? 'var(--cfg-accent)' : 'var(--cfg-surface-3)' }}
      aria-label={`${addon.enabled ? 'Disable' : 'Enable'} ${name}`}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: addon.enabled ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  </div>
);

export const AddonConfigList: React.FC<AddonConfigListProps> = ({ addons, onChange }) => {
  const categories = [...new Set(ADDON_META.map((m) => m.category))];

  const updateAddon = (addonId: string, updates: Partial<AddonConfig>) => {
    onChange(addons.map((a) => (a.addonId === addonId ? { ...a, ...updates } : a)));
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const categoryAddons = ADDON_META.filter((m) => m.category === category);
        return (
          <div
            key={category}
            className="rounded-xl overflow-hidden cfg-animate-fade-up"
            style={{ border: '1px solid var(--cfg-border)', borderBottom: 'none' }}
          >
            <div
              className="px-4 py-2.5 text-xs font-semibold tracking-wider uppercase"
              style={{ background: 'var(--cfg-surface-2)', color: 'var(--cfg-text-muted)' }}
            >
              {category}
            </div>
            {categoryAddons.map((meta) => {
              const addon = addons.find((a) => a.addonId === meta.id);
              if (!addon) return null;
              return (
                <AddonRow
                  key={meta.id}
                  addon={addon}
                  name={meta.name}
                  onToggleEnabled={() => updateAddon(meta.id, { enabled: !addon.enabled })}
                  onTogglePreChecked={() => updateAddon(meta.id, { preChecked: !addon.preChecked })}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
