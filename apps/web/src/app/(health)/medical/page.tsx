'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLeadStore } from '@/stores/useLeadStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { useHealthStore } from '@/stores/useHealthStore';
import MedicalQuestionRow from '@/components/health/MedicalQuestionRow';
import { apiClient } from '@/lib/api-client';
import { useJourneyConfig } from '@/features/configurator/hooks/useJourneyConfig';

const MEDICAL_QUESTIONS = [
  {
    key: 'heart',
    text: 'Has any member been diagnosed with or treated for heart disease, chest pain, or high blood pressure?',
  },
  {
    key: 'diabetes',
    text: 'Has any member been diagnosed with or treated for diabetes or high blood sugar?',
  },
  {
    key: 'respiratory',
    text: 'Has any member been diagnosed with or treated for asthma, bronchitis, or any respiratory condition?',
  },
  {
    key: 'cancer',
    text: 'Has any member been diagnosed with or treated for cancer or tumors?',
  },
  {
    key: 'kidney',
    text: 'Has any member been diagnosed with or treated for kidney disease or urinary disorders?',
  },
  {
    key: 'mental',
    text: 'Has any member been diagnosed with or treated for depression, anxiety, or any mental health condition?',
  },
];

export default function MedicalPage() {
  const router = useRouter();
  const { isQuestionEnabled } = useJourneyConfig();
  const { members } = useLeadStore();
  const { applicationId } = useJourneyStore();
  const { setMedicalAnswers } = useHealthStore();
  const [medicalAnswers, updateMedicalAnswers] = useState<
    Record<string, { answer: boolean; memberIds: string[] }>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  const safeMembers = members ?? { self: true, spouse: false, kidsCount: 0 };
  const memberChips: { id: string; label: string }[] = [];
  if (safeMembers.self) memberChips.push({ id: 'self', label: 'Myself' });
  if (safeMembers.spouse) memberChips.push({ id: 'spouse', label: 'Spouse' });
  for (let i = 0; i < safeMembers.kidsCount; i++) {
    memberChips.push({ id: `kid-${i + 1}`, label: `Kid ${i + 1}` });
  }

  const handleChange = (questionKey: string, answer: boolean, memberIds: string[]) => {
    updateMedicalAnswers((prev) => ({ ...prev, [questionKey]: { answer, memberIds } }));
  };

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      if (applicationId) {
        const answers: { memberId: string; questionId: string; answer: boolean }[] = [];
        for (const [questionId, { answer, memberIds }] of Object.entries(medicalAnswers)) {
          const affectedMembers = answer && memberIds.length > 0
            ? memberIds
            : memberChips.map((m) => m.id);
          affectedMembers.forEach((memberId) => {
            answers.push({ memberId, questionId, answer });
          });
        }
        if (answers.length > 0) {
          await apiClient.post(`/api/v1/applications/${applicationId}/health/medical`, {
            answers,
          });
          // Persist to store grouped by memberId for resume support
          const byMember = new Map<string, { memberId: string; questionKey: string; answer: boolean }[]>();
          for (const a of answers) {
            const existing = byMember.get(a.memberId) ?? [];
            existing.push({ memberId: a.memberId, questionKey: a.questionId, answer: a.answer });
            byMember.set(a.memberId, existing);
          }
          for (const [memberId, memberAnswers] of byMember) {
            setMedicalAnswers(memberId, memberAnswers);
          }
        }
      }
    } catch {
      // Non-fatal
    } finally {
      setIsSaving(false);
    }
    router.push('/hospitalization');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Medical History</h1>
        <p className="text-sm text-gray-500 mt-1">
          Please answer honestly for accurate coverage
        </p>
      </div>

      <div className="space-y-4">
        {MEDICAL_QUESTIONS.filter((q) => isQuestionEnabled(q.key)).map((q) => (
          <MedicalQuestionRow
            key={q.key}
            questionKey={q.key}
            questionText={q.text}
            members={memberChips}
            onChange={handleChange}
          />
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={isSaving}
        className="w-full rounded-lg py-3 px-6 text-white font-semibold disabled:opacity-40"
        style={{ backgroundColor: 'var(--brand-color, #E31837)' }}
      >
        {isSaving ? 'Saving...' : 'Continue'}
      </button>
    </div>
  );
}
