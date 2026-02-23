'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { HealthQuestionConfig } from '@buyonline/shared-types';

interface QuestionRowProps {
  question: HealthQuestionConfig;
  questionText: string;
  onToggle: (key: string) => void;
}

export const QuestionRow: React.FC<QuestionRowProps> = ({ question, questionText, onToggle }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.questionKey,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    borderBottom: '1px solid var(--cfg-border)',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-4 py-3 transition-opacity"
      {...attributes}
    >
      {/* Drag handle */}
      <button
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing"
        style={{ color: 'var(--cfg-text-faint)', fontSize: '14px' }}
        aria-label="Drag to reorder"
      >
        ⣿
      </button>

      {/* Question text */}
      <div
        className="flex-1 text-sm"
        style={{ color: question.enabled ? 'var(--cfg-text)' : 'var(--cfg-text-faint)' }}
      >
        {questionText}
      </div>

      {/* Toggle */}
      <button
        onClick={() => onToggle(question.questionKey)}
        className="flex-shrink-0 w-9 h-5 rounded-full relative transition-colors duration-200"
        style={{ background: question.enabled ? 'var(--cfg-accent)' : 'var(--cfg-surface-3)' }}
        aria-label={`${question.enabled ? 'Disable' : 'Enable'} question`}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
          style={{ transform: question.enabled ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
};
