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

const GripVertical = () => (
  <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor" aria-hidden="true">
    <circle cx="3.5" cy="4"  r="1.5" />
    <circle cx="8.5" cy="4"  r="1.5" />
    <circle cx="3.5" cy="10" r="1.5" />
    <circle cx="8.5" cy="10" r="1.5" />
    <circle cx="3.5" cy="16" r="1.5" />
    <circle cx="8.5" cy="16" r="1.5" />
  </svg>
);

const ChevronDown = ({ rotated }: { rotated: boolean }) => (
  <svg
    width="16" height="16" viewBox="0 0 16 16" fill="none"
    style={{ transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
    aria-hidden="true"
  >
    <path d="M3 5.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PhaseCard: React.FC<PhaseCardProps> = ({ phase, onTogglePhase, onToggleStep, index }) => {
  const [expanded, setExpanded] = useState(index < 3);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: phase.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 100 : undefined,
  };

  const enabledSteps = phase.steps.filter((s) => s.enabled).length;
  const stepPct = phase.steps.length > 0 ? (enabledSteps / phase.steps.length) * 100 : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cfg-animate-fade-up cfg-delay-${Math.min(index + 1, 6)}`}
    >
      {/* Card header row */}
      <div
        style={{
          background: isDragging ? 'var(--cfg-surface-2)' : 'var(--cfg-surface)',
          border: `1px solid ${isDragging ? 'var(--cfg-accent)' : 'var(--cfg-border)'}`,
          borderRadius: expanded ? '12px 12px 0 0' : '12px',
          boxShadow: isDragging ? '0 20px 60px rgba(0,0,0,0.6)' : undefined,
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        {...attributes}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Grip handle */}
          <button
            {...listeners}
            className="flex-shrink-0 py-1.5 px-1 rounded-md transition-colors cursor-grab active:cursor-grabbing"
            style={{ color: 'var(--cfg-text-faint)' }}
            aria-label="Drag to reorder phase"
            title="Drag to reorder"
          >
            <GripVertical />
          </button>

          {/* Order number badge */}
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-bold"
            style={{
              background: phase.enabled ? 'var(--cfg-accent)' : 'var(--cfg-surface-3)',
              color: '#fff',
              fontSize: '15px',
              boxShadow: phase.enabled ? '0 2px 8px rgba(227,24,55,0.35)' : undefined,
            }}
          >
            {index + 1}
          </div>

          {/* Phase icon */}
          <span className="text-2xl flex-shrink-0 leading-none">{PHASE_ICONS[phase.id] ?? '◆'}</span>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <div
              className="font-semibold text-sm leading-tight"
              style={{ color: phase.enabled ? 'var(--cfg-text)' : 'var(--cfg-text-faint)' }}
            >
              {phase.label}
            </div>
            <div className="flex items-center gap-3 mt-1">
              {/* Mini progress bar */}
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--cfg-surface-3)', width: '60px', flexShrink: 0 }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stepPct}%`,
                    background: phase.enabled ? 'var(--cfg-success)' : 'var(--cfg-text-faint)',
                  }}
                />
              </div>
              <span className="text-xs" style={{ color: 'var(--cfg-text-faint)' }}>
                {enabledSteps}/{phase.steps.length} steps
              </span>
              {!phase.enabled && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: 'var(--cfg-warning-dim)',
                    color: 'var(--cfg-warning)',
                    fontSize: '10px',
                  }}
                >
                  skipped
                </span>
              )}
            </div>
          </div>

          {/* Expand/collapse */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--cfg-text-muted)', background: 'var(--cfg-surface-2)' }}
            aria-label={expanded ? 'Collapse steps' : 'Expand steps'}
          >
            <ChevronDown rotated={expanded} />
          </button>

          {/* Phase enable/disable toggle */}
          <button
            onClick={() => onTogglePhase(phase.id)}
            className="flex-shrink-0 rounded-full relative transition-colors duration-200"
            style={{
              width: '44px',
              height: '24px',
              background: phase.enabled ? 'var(--cfg-accent)' : 'var(--cfg-surface-3)',
            }}
            aria-label={`${phase.enabled ? 'Disable' : 'Enable'} ${phase.label} phase`}
          >
            <span
              className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200"
              style={{ transform: phase.enabled ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </button>
        </div>
      </div>

      {/* Expanded steps panel */}
      {expanded && (
        <div
          className="cfg-animate-fade-in"
          style={{
            background: 'var(--cfg-surface)',
            border: '1px solid var(--cfg-border)',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
          }}
        >
          {/* Steps subheader */}
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{
              borderBottom: '1px solid var(--cfg-border)',
              background: 'var(--cfg-surface-2)',
            }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--cfg-text-faint)' }}
            >
              Steps in this phase
            </span>
            <span className="text-xs" style={{ color: 'var(--cfg-text-faint)' }}>
              Drag to reorder · required steps are locked
            </span>
          </div>
          <div className="p-3">
            <SortableStepList
              steps={phase.steps}
              onToggleStep={(stepId) => onToggleStep(phase.id, stepId)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
