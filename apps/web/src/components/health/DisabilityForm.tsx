'use client';

import { useState } from 'react';
import MemberChipSelector from '@/components/onboarding/MemberChipSelector';

interface MemberChip {
  id: string;
  label: string;
}

interface DisabilityFormProps {
  members: MemberChip[];
  onSave: (data: {
    hasDisability: boolean;
    disabilityMemberIds: string[];
    hasPriorInsuranceDecline: boolean;
    priorInsuranceDetails?: string;
  }) => void;
}

export default function DisabilityForm({ members, onSave }: DisabilityFormProps) {
  const [hasDisability, setHasDisability] = useState(false);
  const [disabilityMembers, setDisabilityMembers] = useState<string[]>([]);
  const [hasPriorDecline, setHasPriorDecline] = useState(false);
  const [priorDetails, setPriorDetails] = useState('');

  const handleSave = () => {
    onSave({
      hasDisability,
      disabilityMemberIds: disabilityMembers,
      hasPriorInsuranceDecline: hasPriorDecline,
      priorInsuranceDetails: priorDetails || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Disability */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-base font-medium text-gray-900">
          Does any member have a physical disability?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setHasDisability(true)}
            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium ${
              hasDisability
                ? 'bg-[#ED1B2D] text-white border-[#ED1B2D]'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => {
              setHasDisability(false);
              setDisabilityMembers([]);
            }}
            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium ${
              !hasDisability
                ? 'bg-gray-100 text-gray-800 border-gray-300'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            No
          </button>
        </div>
        {hasDisability && members.length > 1 && (
          <MemberChipSelector
            members={members}
            selectedIds={disabilityMembers}
            onToggle={(id) =>
              setDisabilityMembers((prev) =>
                prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
              )
            }
          />
        )}
      </div>

      {/* Prior Insurance Decline */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-base font-medium text-gray-900">
          Has any member&apos;s insurance application been declined, cancelled, or accepted with special conditions?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setHasPriorDecline(true)}
            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium ${
              hasPriorDecline
                ? 'bg-[#ED1B2D] text-white border-[#ED1B2D]'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => {
              setHasPriorDecline(false);
              setPriorDetails('');
            }}
            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium ${
              !hasPriorDecline
                ? 'bg-gray-100 text-gray-800 border-gray-300'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            No
          </button>
        </div>
        {hasPriorDecline && (
          <textarea
            value={priorDetails}
            onChange={(e) => setPriorDetails(e.target.value)}
            rows={3}
            placeholder="Please provide details..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#ED1B2D] resize-none"
          />
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-lg bg-[#ED1B2D] py-3 px-6 text-white font-semibold hover:bg-[#C8162A]"
      >
        Continue
      </button>
    </div>
  );
}
