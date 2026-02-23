'use client';

import React from 'react';
import { ConfigHeader } from '@/features/configurator/components/layout/ConfigHeader';
import { PlanConfigurator } from '@/features/configurator/components/plans/PlanConfigurator';
import { useConfigStore } from '@/features/configurator/store/useConfigStore';

export default function PlansConfigPage() {
  const { config, updatePlans, updateAddons } = useConfigStore();

  return (
    <>
      <ConfigHeader
        title="Plans & Add-ons"
        subtitle="Enable plans, set highlights, and configure default add-on selections"
      />
      <div className="flex-1 p-6">
        <PlanConfigurator
          plans={config.plans}
          addons={config.addons}
          onPlansChange={updatePlans}
          onAddonsChange={updateAddons}
        />
      </div>
    </>
  );
}
