'use client';

import { useState } from 'react';
import MemberChipSelector from '@/components/onboarding/MemberChipSelector';

interface MemberChip {
  id: string;
  label: string;
}

interface LifestyleQuestionsProps {
  members: MemberChip[];
  onSave: (answers: {
    tobacco: { answer: boolean; memberIds: string[] };
    alcohol: { answer: boolean; memberIds: string[] };
  }) => void;
}

export default function LifestyleQuestions({
  members,
  onSave,
}: LifestyleQuestionsProps) {
  const [tobaccoAnswer, setTobaccoAnswer] = useState(false);
  const [tobaccoMembers, setTobaccoMembers] = useState<string[]>([]);
  const [alcoholAnswer, setAlcoholAnswer] = useState(false);
  const [alcoholMembers, setAlcoholMembers] = useState<string[]>([]);

  const handleSave = () => {
    onSave({
      tobacco: { answer: tobaccoAnswer, memberIds: tobaccoMembers },
      alcohol: { answer: alcoholAnswer, memberIds: alcoholMembers },
    });
  };

  const toggleMember = (
    list: string[],
    setList: (ids: string[]) => void,
    id: string
  ) => {
    setList(
      list.includes(id) ? list.filter((m) => m !== id) : [...list, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Tobacco */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-base font-medium text-gray-900">
          Does any member consume tobacco in any form?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setTobaccoAnswer(true)}
            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium ${
              tobaccoAnswer
                ? 'bg-[#E31837] text-white border-[#E31837]'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => {
              setTobaccoAnswer(false);
              setTobaccoMembers([]);
            }}
            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium ${
              !tobaccoAnswer
                ? 'bg-gray-100 text-gray-800 border-gray-300'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            No
          </button>
        </div>
        {tobaccoAnswer && members.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Select members:</p>
            <MemberChipSelector
              members={members}
              selectedIds={tobaccoMembers}
              onToggle={(id) => toggleMember(tobaccoMembers, setTobaccoMembers, id)}
            />
          </div>
        )}
      </div>

      {/* Alcohol */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-base font-medium text-gray-900">
          Does any member consume alcohol regularly?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAlcoholAnswer(true)}
            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium ${
              alcoholAnswer
                ? 'bg-[#E31837] text-white border-[#E31837]'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => {
              setAlcoholAnswer(false);
              setAlcoholMembers([]);
            }}
            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium ${
              !alcoholAnswer
                ? 'bg-gray-100 text-gray-800 border-gray-300'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            No
          </button>
        </div>
        {alcoholAnswer && members.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Select members:</p>
            <MemberChipSelector
              members={members}
              selectedIds={alcoholMembers}
              onToggle={(id) => toggleMember(alcoholMembers, setAlcoholMembers, id)}
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-lg bg-[#E31837] py-3 px-6 text-white font-semibold hover:bg-[#B8132D]"
      >
        Continue
      </button>
    </div>
  );
}
