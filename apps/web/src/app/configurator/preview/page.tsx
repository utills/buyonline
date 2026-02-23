'use client';

import React from 'react';
import { ConfigHeader } from '@/features/configurator/components/layout/ConfigHeader';
import { PreviewPanel } from '@/features/configurator/components/preview/PreviewPanel';
import { useConfigStore } from '@/features/configurator/store/useConfigStore';

export default function PreviewPage() {
  const { config, updateConfig } = useConfigStore();

  return (
    <>
      <ConfigHeader
        title="Preview"
        subtitle="Phone mockup of active journey · Export or import configuration JSON"
      />
      <div className="flex-1 p-6">
        <PreviewPanel config={config} onImport={updateConfig} />
      </div>
    </>
  );
}
