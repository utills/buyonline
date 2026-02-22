'use client';

import { useState } from 'react';
import MemberChipSelector from '@/components/onboarding/MemberChipSelector';

interface MemberChip {
  id: string;
  label: string;
}

interface MedicalQuestionRowProps {
  questionKey: string;
  questionText: string;
  members: MemberChip[];
  onChange: (questionKey: string, answer: boolean, memberIds: string[]) => void;
}

export default function MedicalQuestionRow({
  questionKey,
  questionText,
  members,
  onChange,
}: MedicalQuestionRowProps) {
  const [answer, setAnswer] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const handleAnswer = (val: boolean) => {
    setAnswer(val);
    if (!val) {
      setSelectedMembers([]);
      onChange(questionKey, false, []);
    } else {
      onChange(questionKey, true, selectedMembers);
    }
  };

  const handleToggle = (memberId: string) => {
    const updated = selectedMembers.includes(memberId)
      ? selectedMembers.filter((id) => id !== memberId)
      : [...selectedMembers, memberId];
    setSelectedMembers(updated);
    onChange(questionKey, answer, updated);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <p className="text-sm font-medium text-gray-900">{questionText}</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleAnswer(true)}
          className={`flex-1 py-2 rounded-lg border text-xs font-medium ${
            answer
              ? 'bg-[#E31837] text-white border-[#E31837]'
              : 'bg-white text-gray-600 border-gray-300'
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => handleAnswer(false)}
          className={`flex-1 py-2 rounded-lg border text-xs font-medium ${
            !answer
              ? 'bg-gray-100 text-gray-800 border-gray-300'
              : 'bg-white text-gray-600 border-gray-300'
          }`}
        >
          No
        </button>
      </div>

      {answer && members.length > 1 && (
        <MemberChipSelector
          members={members}
          selectedIds={selectedMembers}
          onToggle={handleToggle}
        />
      )}
    </div>
  );
}
