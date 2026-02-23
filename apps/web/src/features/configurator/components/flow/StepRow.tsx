'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { JourneyStepConfig } from '@buyonline/shared-types';

interface StepRowProps {
  step: JourneyStepConfig;
  onToggle: (stepId: string) => void;
}

const GripSmall = () => (
  <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true">
    <circle cx="2.5" cy="3"  r="1.2" />
    <circle cx="7.5" cy="3"  r="1.2" />
    <circle cx="2.5" cy="8"  r="1.2" />
    <circle cx="7.5" cy="8"  r="1.2" />
    <circle cx="2.5" cy="13" r="1.2" />
    <circle cx="7.5" cy="13" r="1.2" />
  </svg>
);

export const StepRow: React.FC<StepRowProps> = ({ step, onToggle }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
    disabled: step.required,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? 'var(--cfg-surface-2)' : 'transparent',
      }}
      {...attributes}
    >
      {/* Grip handle */}
      <button
        {...listeners}
        className="flex-shrink-0 px-1 py-1 rounded"
        style={{
          color: step.required ? 'transparent' : 'var(--cfg-text-faint)',
          cursor: step.required ? 'default' : 'grab',
          pointerEvents: step.required ? 'none' : undefined,
        }}
        tabIndex={step.required ? -1 : undefined}
        aria-label="Drag to reorder step"
      >
        <GripSmall />
      </button>

      {/* Step info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-sm font-medium"
            style={{ color: step.enabled ? 'var(--cfg-text)' : 'var(--cfg-text-faint)' }}
          >
            {step.label}
          </span>
          {step.required && (
            <span
              className="px-1.5 py-0.5 rounded"
              style={{
                background: 'var(--cfg-info-dim)',
                color: 'var(--cfg-info)',
                fontSize: '10px',
                fontWeight: 600,
              }}
            >
              required
            </span>
          )}
        </div>
        <code
          className="text-xs mt-0.5 block"
          style={{ color: 'var(--cfg-text-faint)', fontFamily: 'ui-monospace, monospace' }}
        >
          {step.route}
        </code>
      </div>

      {/* Toggle */}
      <button
        onClick={() => !step.required && onToggle(step.id)}
        disabled={step.required}
        className="flex-shrink-0 rounded-full relative transition-colors duration-200"
        style={{
          width: '40px',
          height: '22px',
          background: step.enabled ? 'var(--cfg-accent)' : 'var(--cfg-surface-3)',
          opacity: step.required ? 0.4 : 1,
          cursor: step.required ? 'not-allowed' : 'pointer',
        }}
        aria-label={`${step.enabled ? 'Disable' : 'Enable'} ${step.label} step`}
      >
        <span
          className="absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200"
          style={{ transform: step.enabled ? 'translateX(18px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
};
