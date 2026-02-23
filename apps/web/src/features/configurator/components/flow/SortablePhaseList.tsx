'use client';

import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { JourneyPhaseConfig } from '@buyonline/shared-types';
import { PhaseCard } from './PhaseCard';

interface SortablePhaseListProps {
  phases: JourneyPhaseConfig[];
  onTogglePhase: (phaseId: string) => void;
  onToggleStep: (phaseId: string, stepId: string) => void;
}

export const SortablePhaseList: React.FC<SortablePhaseListProps> = ({
  phases,
  onTogglePhase,
  onToggleStep,
}) => {
  const sortedPhases = [...phases].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <SortableContext items={sortedPhases.map((p) => p.id)} strategy={verticalListSortingStrategy}>
      <div className="space-y-3">
        {sortedPhases.map((phase, idx) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            index={idx}
            onTogglePhase={onTogglePhase}
            onToggleStep={onToggleStep}
          />
        ))}
      </div>
    </SortableContext>
  );
};
