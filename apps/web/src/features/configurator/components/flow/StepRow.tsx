'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { JourneyStepConfig } from '@buyonline/shared-types';

interface StepRowProps {
  step: JourneyStepConfig;
  onToggle: (stepId: string) => void;
}

export const StepRow: React.FC<StepRowProps> = ({ step, onToggle }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
    disabled: step.required,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
      {...attributes}
    >
      {/* Drag handle */}
      <button
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 rounded"
        style={{ color: step.required ? 'transparent' : 'var(--cfg-text-faint)' }}
        disabled={step.required}
        aria-label="Drag to reorder"
      >
        ⣿
      </button>

      {/* Step info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: step.enabled ? 'var(--cfg-text)' : 'var(--cfg-text-faint)' }}>
            {step.label}
          </span>
          {step.required && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: 'var(--cfg-info-dim)', color: 'var(--cfg-info)' }}
            >
              required
            </span>
          )}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--cfg-text-faint)' }}>
          {step.route}
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => !step.required && onToggle(step.id)}
        disabled={step.required}
        className="flex-shrink-0 w-10 h-5 rounded-full relative transition-colors duration-200"
        style={{
          background: step.enabled ? 'var(--cfg-accent)' : 'var(--cfg-surface-3)',
          opacity: step.required ? 0.5 : 1,
          cursor: step.required ? 'not-allowed' : 'pointer',
        }}
        aria-label={`${step.enabled ? 'Disable' : 'Enable'} ${step.label}`}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
          style={{ transform: step.enabled ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
};
