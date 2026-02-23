'use client';

import React from 'react';
import type { BrandingConfig } from '@buyonline/shared-types';

interface BrandingConfiguratorProps {
  branding: BrandingConfig;
  onChange: (updated: Partial<BrandingConfig>) => void;
}

export const BrandingConfigurator: React.FC<BrandingConfiguratorProps> = ({ branding, onChange }) => {
  return (
    <div className="space-y-5 max-w-2xl">
      {/* Color picker */}
      <div
        className="p-4 rounded-xl space-y-3"
        style={{ background: 'var(--cfg-surface)', border: '1px solid var(--cfg-border)' }}
      >
        <div className="text-sm font-medium" style={{ color: 'var(--cfg-text)' }}>Primary Brand Color</div>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={branding.primaryColor}
            onChange={(e) => onChange({ primaryColor: e.target.value })}
            className="w-10 h-10 rounded-lg cursor-pointer border-0 outline-none"
            style={{ background: 'none' }}
          />
          <input
            type="text"
            value={branding.primaryColor}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange({ primaryColor: v });
            }}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-mono outline-none"
            style={{
              background: 'var(--cfg-surface-2)',
              border: '1px solid var(--cfg-border)',
              color: 'var(--cfg-text)',
            }}
          />
          {/* Preview */}
          <div
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: branding.primaryColor }}
          >
            Preview
          </div>
        </div>
      </div>

      {/* Logo text */}
      <div
        className="p-4 rounded-xl space-y-2"
        style={{ background: 'var(--cfg-surface)', border: '1px solid var(--cfg-border)' }}
      >
        <label className="text-sm font-medium block" style={{ color: 'var(--cfg-text)' }}>Logo / Brand Name</label>
        <input
          type="text"
          value={branding.logoText}
          onChange={(e) => onChange({ logoText: e.target.value })}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--cfg-surface-2)',
            border: '1px solid var(--cfg-border)',
            color: 'var(--cfg-text)',
          }}
        />
        <div
          className="mt-2 px-3 py-2 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--cfg-surface-2)', color: branding.primaryColor }}
        >
          {branding.logoText || 'PRUHealth'}
        </div>
      </div>

      {/* Tagline */}
      <div
        className="p-4 rounded-xl space-y-2"
        style={{ background: 'var(--cfg-surface)', border: '1px solid var(--cfg-border)' }}
      >
        <label className="text-sm font-medium block" style={{ color: 'var(--cfg-text)' }}>Tagline</label>
        <input
          type="text"
          value={branding.tagline}
          onChange={(e) => onChange({ tagline: e.target.value })}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--cfg-surface-2)',
            border: '1px solid var(--cfg-border)',
            color: 'var(--cfg-text)',
          }}
        />
      </div>

      {/* Live brand preview card */}
      <div
        className="p-5 rounded-xl"
        style={{ background: 'var(--cfg-surface)', border: '1px solid var(--cfg-border)' }}
      >
        <div className="text-xs font-medium mb-3" style={{ color: 'var(--cfg-text-faint)' }}>
          BRAND PREVIEW
        </div>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--cfg-border)' }}>
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ background: branding.primaryColor }}
          >
            <span className="text-white font-bold text-sm">{branding.logoText}</span>
            <span className="text-white text-xs opacity-80">Health Insurance</span>
          </div>
          <div className="px-4 py-4" style={{ background: '#fff' }}>
            <div className="text-gray-800 text-sm font-semibold">{branding.tagline}</div>
            <div className="mt-3 flex gap-2">
              <div
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: branding.primaryColor }}
              >
                Get Quote
              </div>
              <div
                className="px-4 py-1.5 rounded-lg text-xs font-semibold"
                style={{ border: `1px solid ${branding.primaryColor}`, color: branding.primaryColor }}
              >
                Learn More
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
