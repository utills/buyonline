'use client';

import React from 'react';
import { ConfigHeader } from '@/features/configurator/components/layout/ConfigHeader';
import { StatsGrid } from '@/features/configurator/components/overview/StatsGrid';
import { PhaseHealthGrid } from '@/features/configurator/components/overview/PhaseHealthGrid';
import { useConfigStore } from '@/features/configurator/store/useConfigStore';

export default function ConfiguratorOverviewPage() {
  const { config, lastSyncedAt } = useConfigStore();

  return (
    <>
      <ConfigHeader
        title="Overview"
        subtitle="Current journey configuration at a glance"
      />
      <div className="flex-1 p-6 space-y-8">
        <StatsGrid config={config} lastSyncedAt={lastSyncedAt} />
        <PhaseHealthGrid phases={config.phases} />
      </div>
    </>
  );
}
