'use client';

import { useCallback, useState } from 'react';
import type { AgenticCollectedData, AgenticPhase } from '../types';

// ─── Progress Checklist Item ──────────────────────────────────────────────────
function CheckItem({
  emoji,
  label,
  value,
  done,
}: {
  emoji: string;
  label: string;
  value: string;
  done: boolean;
}) {
  return (
    <div className="flex items-start gap-2 py-2">
      <span className="text-sm flex-shrink-0 mt-0.5">{emoji}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p
          className={`text-sm font-medium truncate ${
            done ? 'text-gray-900' : 'text-gray-300'
          }`}
        >
          {value}
        </p>
      </div>
      {done && (
        <svg
          className="w-4 h-4 text-green-500 flex-shrink-0 ml-auto mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );
}

// ─── Members Label ────────────────────────────────────────────────────────────
function getMembersLabel(members?: AgenticCollectedData['members']): string {
  if (!members) return '—';
  const parts: string[] = [];
  if (members.self) parts.push('Self');
  if (members.spouse) parts.push('Spouse');
  if (members.kidsCount === 1) parts.push('1 Kid');
  if (members.kidsCount > 1) parts.push(`${members.kidsCount} Kids`);
  return parts.length > 0 ? parts.join(', ') : '—';
}

// ─── Progress Calculation ─────────────────────────────────────────────────────
function calculateProgress(data: Partial<AgenticCollectedData>, phase: AgenticPhase): number {
  const steps = [
    !!data.members,
    !!data.eldestAge,
    !!data.mobile,
    !!data.pincode,
    !!(data.planSelected),
    !!(data.paymentDone),
    !!(data.kycVerified),
    !!(data.healthSubmitted),
  ];
  const done = steps.filter(Boolean).length;
  // Also factor in phase for partial credit
  if (phase === 'complete') return 100;
  return Math.round((done / steps.length) * 100);
}

// ─── Progress Panel ───────────────────────────────────────────────────────────
interface ProgressPanelProps {
  collectedData: Partial<AgenticCollectedData>;
  phase: AgenticPhase;
  onReset: () => void;
}

export default function ProgressPanel({ collectedData, phase, onReset }: ProgressPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(() => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const progress = calculateProgress(collectedData, phase);
  const data = collectedData;

  const membersLabel = getMembersLabel(data.members);
  const ageLabel = data.eldestAge ? `${data.eldestAge} years` : '—';
  const pincodeLabel = data.pincode ?? '—';
  const hospitalLabel = data.hospitalCount ? `${data.hospitalCount} nearby` : '—';
  const identityLabel = data.mobile ? 'Verified' : '—';
  const planLabel = data.planSelected
    ? `${data.planSelected.planName} — ${data.planSelected.sumInsuredLabel}`
    : '—';
  const paymentLabel = data.paymentDone ? 'Done' : '—';
  const kycLabel = data.kycVerified ? 'Verified' : '—';
  const healthLabel = data.healthSubmitted ? 'Submitted' : '—';

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        Your Journey
      </h2>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-semibold text-[#E31837]">{progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E31837] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="flex-1 divide-y divide-gray-50">
        <CheckItem emoji="👥" label="Members" value={membersLabel} done={membersLabel !== '—'} />
        <CheckItem emoji="📅" label="Age" value={ageLabel} done={ageLabel !== '—'} />
        <CheckItem emoji="📍" label="Pincode" value={pincodeLabel} done={pincodeLabel !== '—'} />
        <CheckItem emoji="🏥" label="Hospitals" value={hospitalLabel} done={hospitalLabel !== '—'} />
        <CheckItem emoji="🔒" label="Identity" value={identityLabel} done={identityLabel !== '—'} />
        <CheckItem emoji="📋" label="Plan" value={planLabel} done={!!data.planSelected} />
        <CheckItem emoji="✓" label="Payment" value={paymentLabel} done={!!data.paymentDone} />
        <CheckItem emoji="✓" label="KYC" value={kycLabel} done={!!data.kycVerified} />
        <CheckItem emoji="✓" label="Health" value={healthLabel} done={!!data.healthSubmitted} />
      </div>

      {/* Copy resume link */}
      <button
        onClick={handleCopyLink}
        className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-gray-500 border border-gray-200 rounded-lg py-2 px-3 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        {copied ? 'Link copied!' : 'Copy Resume Link'}
      </button>

      {/* Start over */}
      <button
        onClick={onReset}
        className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600 py-1.5 transition-colors"
      >
        Start Over
      </button>
    </div>
  );
}
