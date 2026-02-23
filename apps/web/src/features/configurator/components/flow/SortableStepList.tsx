'use client';

import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { JourneyStepConfig } from '@buyonline/shared-types';
import { StepRow } from './StepRow';

interface SortableStepListProps {
  steps: JourneyStepConfig[];
  onToggleStep: (stepId: string) => void;
}

export const SortableStepList: React.FC<SortableStepListProps> = ({ steps, onToggleStep }) => {
  const sortedSteps = [...steps].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <SortableContext items={sortedSteps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
      <div
        className="mt-3 rounded-lg overflow-hidden"
        style={{ background: 'var(--cfg-surface-3)' }}
      >
        {sortedSteps.map((step) => (
          <StepRow key={step.id} step={step} onToggle={onToggleStep} />
        ))}
      </div>
    </SortableContext>
  );
};
