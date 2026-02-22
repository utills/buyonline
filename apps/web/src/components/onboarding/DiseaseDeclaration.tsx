'use client';

import { useState } from 'react';
import MemberChipSelector from './MemberChipSelector';

interface MemberChip {
  id: string;
  label: string;
}

interface DiseaseDeclarationProps {
  question: string;
  infoText?: string;
  members: MemberChip[];
  onAnswer: (hasDisease: boolean, affectedMemberIds: string[]) => void;
  initialAnswer?: boolean;
  initialAffectedIds?: string[];
}

export default function DiseaseDeclaration({
  question,
  infoText,
  members,
  onAnswer,
  initialAnswer = false,
  initialAffectedIds = [],
}: DiseaseDeclarationProps) {
  const [hasDisease, setHasDisease] = useState(initialAnswer);
  const [affectedIds, setAffectedIds] = useState<string[]>(initialAffectedIds);

  const handleAnswer = (answer: boolean) => {
    setHasDisease(answer);
    if (!answer) {
      setAffectedIds([]);
      onAnswer(false, []);
    } else {
      onAnswer(true, affectedIds);
    }
  };

  const handleToggleMember = (memberId: string) => {
    const updated = affectedIds.includes(memberId)
      ? affectedIds.filter((id) => id !== memberId)
      : [...affectedIds, memberId];
    setAffectedIds(updated);
    onAnswer(hasDisease, updated);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <p className="text-base font-medium text-gray-900">{question}</p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleAnswer(true)}
          className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
            hasDisease
              ? 'bg-[#E31837] text-white border-[#E31837]'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => handleAnswer(false)}
          className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
            !hasDisease
              ? 'bg-gray-100 text-gray-800 border-gray-300'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
          }`}
        >
          No
        </button>
      </div>

      {hasDisease && members.length > 1 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Select affected members:</p>
          <MemberChipSelector
            members={members}
            selectedIds={affectedIds}
            onToggle={handleToggleMember}
          />
        </div>
      )}

      {infoText && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <svg
            className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs text-blue-700">{infoText}</p>
        </div>
      )}
    </div>
  );
}
