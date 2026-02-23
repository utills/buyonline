'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { JourneyPhaseConfig } from '@buyonline/shared-types';
import { SortableStepList } from './SortableStepList';

interface PhaseCardProps {
  phase: JourneyPhaseConfig;
  onTogglePhase: (phaseId: string) => void;
  onToggleStep: (phaseId: string, stepId: string) => void;
  index: number;
}

const PHASE_ICONS: Record<string, string> = {
  auth: '🔐', onboarding: '📍', quote: '📋',
  payment: '💳', kyc: '🪪', health: '🏥', complete: '✅',
};

export const PhaseCard: React.FC<PhaseCardProps> = ({ phase, onTogglePhase, onToggleStep, index }) => {
  const [expanded, setExpanded] = useState(index < 3);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: phase.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    animation: isDragging ? 'cfg-drag-lift 0.15s ease forwards' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl overflow-hidden cfg-animate-fade-up cfg-delay-${Math.min(index + 1, 6)}`}
      {...attributes}
    >
      <div
        className="p-4"
        style={{
          background: 'var(--cfg-surface)',
          border: `1px solid ${isDragging ? 'var(--cfg-accent)' : 'var(--cfg-border)'}`,
          borderRadius: expanded ? '12px 12px 0 0' : '12px',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Drag handle */}
          <button
            {...listeners}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--cfg-text-faint)', background: 'var(--cfg-surface-2)' }}
            aria-label="Drag phase to reorder"
          >
            ⣿
          </button>

          {/* Phase icon + info */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ background: 'var(--cfg-surface-2)' }}
          >
            {PHASE_ICONS[phase.id] ?? '◆'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm" style={{ color: phase.enabled ? 'var(--cfg-text)' : 'var(--cfg-text-faint)' }}>
              {phase.label}
            </div>
            <div className="text-xs" style={{ color: 'var(--cfg-text-faint)' }}>
              {phase.steps.filter((s) => s.enabled).length}/{phase.steps.length} steps active · order #{phase.sortOrder}
            </div>
          </div>

          {/* Expand/collapse */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--cfg-text-muted)', background: 'var(--cfg-surface-2)' }}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <span
              className="block transition-transform duration-200"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              ▾
            </span>
          </button>

          {/* Phase toggle */}
          <button
            onClick={() => onTogglePhase(phase.id)}
            className="flex-shrink-0 w-11 h-6 rounded-full relative transition-colors duration-200"
            style={{ background: phase.enabled ? 'var(--cfg-accent)' : 'var(--cfg-surface-3)' }}
            aria-label={`${phase.enabled ? 'Disable' : 'Enable'} ${phase.label}`}
          >
            <span
              className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
              style={{ transform: phase.enabled ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </button>
        </div>
      </div>

      {/* Steps list */}
      {expanded && (
        <div
          className="px-4 pb-4 cfg-animate-fade-in"
          style={{
            background: 'var(--cfg-surface)',
            border: '1px solid var(--cfg-border)',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
          }}
        >
          <SortableStepList
            steps={phase.steps}
            onToggleStep={(stepId) => onToggleStep(phase.id, stepId)}
          />
        </div>
      )}
    </div>
  );
};
