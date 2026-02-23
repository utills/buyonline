'use client';

import React from 'react';
import { ConfigHeader } from '@/features/configurator/components/layout/ConfigHeader';
import { FlowBuilder } from '@/features/configurator/components/flow/FlowBuilder';
import { useConfigStore } from '@/features/configurator/store/useConfigStore';

export default function JourneyFlowPage() {
  const { config, updatePhases } = useConfigStore();

  return (
    <>
      <ConfigHeader
        title="Journey Flow"
        subtitle="Drag phases to reorder · Toggle steps on or off · Required steps are locked"
      />
      <div className="flex-1 p-6">
        <FlowBuilder phases={config.phases} onPhasesChange={updatePhases} />
      </div>
    </>
  );
}
