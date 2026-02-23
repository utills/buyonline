'use client';

import { useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { JourneyPhaseConfig } from '@buyonline/shared-types';

interface UseFlowDragDropProps {
  phases: JourneyPhaseConfig[];
  onPhasesChange: (phases: JourneyPhaseConfig[]) => void;
}

export function useFlowDragDrop({ phases, onPhasesChange }: UseFlowDragDropProps) {
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [activeStepId, setActiveStepId]   = useState<string | null>(null);

  const handleDragStart = ({ active }: DragStartEvent) => {
    const id = String(active.id);
    const isPhase = phases.some((p) => p.id === id);
    if (isPhase) {
      setActivePhaseId(id);
    } else {
      setActiveStepId(id);
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActivePhaseId(null);
    setActiveStepId(null);
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId   = String(over.id);

    // Phase reorder
    const oldPhaseIdx = phases.findIndex((p) => p.id === activeId);
    const newPhaseIdx = phases.findIndex((p) => p.id === overId);
    if (oldPhaseIdx !== -1 && newPhaseIdx !== -1) {
      const reordered = arrayMove(phases, oldPhaseIdx, newPhaseIdx).map((p, i) => ({
        ...p,
        sortOrder: i + 1,
      }));
      onPhasesChange(reordered);
      return;
    }

    // Step reorder within a phase
    for (const phase of phases) {
      const oldStepIdx = phase.steps.findIndex((s) => s.id === activeId);
      const newStepIdx = phase.steps.findIndex((s) => s.id === overId);
      if (oldStepIdx !== -1 && newStepIdx !== -1) {
        const reorderedSteps = arrayMove(phase.steps, oldStepIdx, newStepIdx).map((s, i) => ({
          ...s,
          sortOrder: i + 1,
        }));
        const updatedPhases = phases.map((p) =>
          p.id === phase.id ? { ...p, steps: reorderedSteps } : p
        );
        onPhasesChange(updatedPhases);
        return;
      }
    }
  };

  return { activePhaseId, activeStepId, handleDragStart, handleDragEnd };
}
