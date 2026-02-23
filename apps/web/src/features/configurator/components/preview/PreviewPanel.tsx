'use client';

import React, { useState } from 'react';
import type { JourneyConfig } from '@buyonline/shared-types';
import { PhoneFrame } from './PhoneFrame';
import { ConfigExportImport } from './ConfigExportImport';

interface PreviewPanelProps {
  config: JourneyConfig;
  onImport: (config: JourneyConfig) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ config, onImport }) => {
  const [tab, setTab] = useState<'flow' | 'json'>('flow');

  return (
    <div className="flex gap-8 flex-wrap lg:flex-nowrap">
      {/* Phone preview */}
      <div className="flex-shrink-0">
        <div className="text-xs font-medium mb-4" style={{ color: 'var(--cfg-text-muted)' }}>
          JOURNEY PREVIEW
        </div>
        <PhoneFrame config={config} />
      </div>

      {/* Right panel */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Tab switcher */}
        <div
          className="flex gap-1 p-1 rounded-xl w-fit"
          style={{ background: 'var(--cfg-surface)' }}
        >
          {(['flow', 'json'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize"
              style={{
                background: tab === t ? 'var(--cfg-accent)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--cfg-text-muted)',
              }}
            >
              {t === 'flow' ? 'Flow Summary' : 'JSON Config'}
            </button>
          ))}
        </div>

        {tab === 'flow' && (
          <div className="space-y-2 cfg-animate-fade-in">
            {config.phases
              .filter((p) => p.enabled)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((phase) => (
                <div
                  key={phase.id}
                  className="p-3 rounded-xl"
                  style={{ background: 'var(--cfg-surface)', border: '1px solid var(--cfg-border)' }}
                >
                  <div className="text-xs font-semibold mb-2" style={{ color: 'var(--cfg-text)' }}>
                    {phase.label}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {phase.steps
                      .filter((s) => s.enabled)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((step) => (
                        <span
                          key={step.id}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--cfg-surface-2)', color: 'var(--cfg-text-muted)' }}
                        >
                          {step.label}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {tab === 'json' && (
          <pre
            className="text-xs rounded-xl p-4 overflow-auto cfg-animate-fade-in cfg-scroll"
            style={{
              background: 'var(--cfg-surface)',
              border: '1px solid var(--cfg-border)',
              color: 'var(--cfg-text-muted)',
              maxHeight: '400px',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {JSON.stringify(config, null, 2)}
          </pre>
        )}

        <ConfigExportImport config={config} onImport={onImport} />
      </div>
    </div>
  );
};
