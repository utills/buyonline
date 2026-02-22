'use client';

import { useRouter } from 'next/navigation';
import { useLeadStore } from '@/stores/useLeadStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { useHealthStore } from '@/stores/useHealthStore';
import LifestyleQuestions from '@/components/health/LifestyleQuestions';
import { apiClient } from '@/lib/api-client';

export default function LifestylePage() {
  const router = useRouter();
  const { members } = useLeadStore();
  const { applicationId } = useJourneyStore();
  const { setLifestyleAnswers } = useHealthStore();

  const safeMembers = members ?? { self: true, spouse: false, kidsCount: 0 };
  const memberChips: { id: string; label: string }[] = [];
  if (safeMembers.self) memberChips.push({ id: 'self', label: 'Myself' });
  if (safeMembers.spouse) memberChips.push({ id: 'spouse', label: 'Spouse' });
  for (let i = 0; i < safeMembers.kidsCount; i++) {
    memberChips.push({ id: `kid-${i + 1}`, label: `Kid ${i + 1}` });
  }

  const handleSave = async (answers: {
    tobacco: { answer: boolean; memberIds: string[] };
    alcohol: { answer: boolean; memberIds: string[] };
  }) => {
    try {
      if (applicationId) {
        const lifestyleAnswers: { memberId: string; questionKey: string; answer: boolean }[] = [];

        const tobaccoMembers = answers.tobacco.answer && answers.tobacco.memberIds.length > 0
          ? answers.tobacco.memberIds
          : memberChips.map((m) => m.id);
        tobaccoMembers.forEach((memberId) => {
          lifestyleAnswers.push({ memberId, questionKey: 'tobacco', answer: answers.tobacco.answer });
        });

        const alcoholMembers = answers.alcohol.answer && answers.alcohol.memberIds.length > 0
          ? answers.alcohol.memberIds
          : memberChips.map((m) => m.id);
        alcoholMembers.forEach((memberId) => {
          lifestyleAnswers.push({ memberId, questionKey: 'alcohol', answer: answers.alcohol.answer });
        });

        await apiClient.post(`/api/v1/applications/${applicationId}/health/lifestyle`, {
          answers: lifestyleAnswers,
        });
        // Persist to store grouped by memberId for resume support
        const byMember = new Map<string, typeof lifestyleAnswers>();
        for (const a of lifestyleAnswers) {
          const existing = byMember.get(a.memberId) ?? [];
          existing.push(a);
          byMember.set(a.memberId, existing);
        }
        for (const [memberId, memberAnswers] of byMember) {
          setLifestyleAnswers(memberId, memberAnswers as Parameters<typeof setLifestyleAnswers>[1]);
        }
      }
    } catch {
      // Non-fatal
    }
    router.push('/medical');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Lifestyle</h1>
        <p className="text-sm text-gray-500 mt-1">
          A few questions about lifestyle habits
        </p>
      </div>

      <LifestyleQuestions members={memberChips} onSave={handleSave} />
    </div>
  );
}
