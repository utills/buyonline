'use client';

import React from 'react';
import { ConfigHeader } from '@/features/configurator/components/layout/ConfigHeader';
import { HealthQuestionsConfigurator } from '@/features/configurator/components/health/HealthQuestionsConfigurator';
import { useConfigStore } from '@/features/configurator/store/useConfigStore';

export default function HealthConfigPage() {
  const { config, updateHealthQuestions } = useConfigStore();

  return (
    <>
      <ConfigHeader
        title="Health Questions"
        subtitle="Drag to reorder · Toggle questions · Bulk enable/disable by category"
      />
      <div className="flex-1 p-6">
        <HealthQuestionsConfigurator
          questions={config.healthQuestions}
          onChange={updateHealthQuestions}
        />
      </div>
    </>
  );
}
