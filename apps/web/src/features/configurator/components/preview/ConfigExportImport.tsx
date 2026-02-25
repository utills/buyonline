'use client';

import React, { useRef } from 'react';
import type { JourneyConfig } from '@buyonline/shared-types';

interface ConfigExportImportProps {
  config: JourneyConfig;
  onImport: (config: JourneyConfig) => void;
}

export const ConfigExportImport: React.FC<ConfigExportImportProps> = ({ config, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journey-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as JourneyConfig;
        if (
          !parsed.phases ||
          !parsed.plans ||
          !parsed.addons ||
          !parsed.healthQuestions ||
          !parsed.chat ||
          !parsed.branding ||
          !parsed.featureFlags
        ) {
          alert('Invalid config file — missing required fields.');
          return;
        }
        onImport(parsed);
      } catch {
        alert('Failed to parse config file. Make sure it is valid JSON.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--cfg-text)' }}>
        Export / Import
      </h3>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: 'var(--cfg-success-dim)',
            color: 'var(--cfg-success)',
            border: '1px solid var(--cfg-success)',
          }}
        >
          ↓ Export JSON
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: 'var(--cfg-info-dim)',
            color: 'var(--cfg-info)',
            border: '1px solid var(--cfg-info)',
          }}
        >
          ↑ Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
      </div>
    </div>
  );
};
