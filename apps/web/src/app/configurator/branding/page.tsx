'use client';

import React from 'react';
import { ConfigHeader } from '@/features/configurator/components/layout/ConfigHeader';
import { BrandingConfigurator } from '@/features/configurator/components/branding/BrandingConfigurator';
import { FeatureFlagsPanel } from '@/features/configurator/components/branding/FeatureFlagsPanel';
import { useConfigStore } from '@/features/configurator/store/useConfigStore';

export default function BrandingConfigPage() {
  const { config, updateBranding, updateFeatureFlags } = useConfigStore();

  return (
    <>
      <ConfigHeader
        title="Branding & Flags"
        subtitle="Customize brand colors, copy, and toggle platform feature flags"
      />
      <div className="flex-1 p-6 space-y-8">
        <BrandingConfigurator branding={config.branding} onChange={updateBranding} />
        <FeatureFlagsPanel flags={config.featureFlags} onChange={updateFeatureFlags} />
      </div>
    </>
  );
}
