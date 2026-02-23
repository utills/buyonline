'use client';

import React from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { JourneyPhaseConfig } from '@buyonline/shared-types';
import { SortablePhaseList } from './SortablePhaseList';
import { useFlowDragDrop } from '../../hooks/useFlowDragDrop';

interface FlowBuilderProps {
  phases: JourneyPhaseConfig[];
  onPhasesChange: (phases: JourneyPhaseConfig[]) => void;
}

export const FlowBuilder: React.FC<FlowBuilderProps> = ({ phases, onPhasesChange }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { handleDragStart, handleDragEnd } = useFlowDragDrop({ phases, onPhasesChange });

  const handleTogglePhase = (phaseId: string) => {
    const updated = phases.map((p) =>
      p.id === phaseId ? { ...p, enabled: !p.enabled } : p
    );
    onPhasesChange(updated);
  };

  const handleToggleStep = (phaseId: string, stepId: string) => {
    const updated = phases.map((p) =>
      p.id === phaseId
        ? {
            ...p,
            steps: p.steps.map((s) =>
              s.id === stepId && !s.required ? { ...s, enabled: !s.enabled } : s
            ),
          }
        : p
    );
    onPhasesChange(updated);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortablePhaseList
        phases={phases}
        onTogglePhase={handleTogglePhase}
        onToggleStep={handleToggleStep}
      />
    </DndContext>
  );
};
