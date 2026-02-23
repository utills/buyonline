'use client';

import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { HealthQuestionConfig } from '@buyonline/shared-types';
import { QuestionRow } from './QuestionRow';

interface SortableQuestionListProps {
  questions: HealthQuestionConfig[];
  questionTexts: Record<string, string>;
  onToggle: (key: string) => void;
}

export const SortableQuestionList: React.FC<SortableQuestionListProps> = ({
  questions,
  questionTexts,
  onToggle,
}) => {
  const sorted = [...questions].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <SortableContext items={sorted.map((q) => q.questionKey)} strategy={verticalListSortingStrategy}>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--cfg-border)' }}
      >
        {sorted.map((q) => (
          <QuestionRow
            key={q.questionKey}
            question={q}
            questionText={questionTexts[q.questionKey] ?? q.questionKey}
            onToggle={onToggle}
          />
        ))}
      </div>
    </SortableContext>
  );
};
