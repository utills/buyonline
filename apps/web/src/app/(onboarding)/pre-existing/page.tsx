'use client';

import { useRouter } from 'next/navigation';
import { useLeadStore } from '@/stores/useLeadStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import DiseaseDeclaration from '@/components/onboarding/DiseaseDeclaration';
import { apiClient } from '@/lib/api-client';

export default function PreExistingPage() {
  const router = useRouter();
  const { members } = useLeadStore();
  const { applicationId } = useJourneyStore();

  const safeMembers = members ?? { self: true, spouse: false, kidsCount: 0 };
  const memberChips: { id: string; label: string }[] = [];
  if (safeMembers.self) memberChips.push({ id: 'self', label: 'Myself' });
  if (safeMembers.spouse) memberChips.push({ id: 'spouse', label: 'Spouse' });
  for (let i = 0; i < safeMembers.kidsCount; i++) {
    memberChips.push({ id: `kid-${i + 1}`, label: `Kid ${i + 1}` });
  }

  const handleAnswer = async (hasDisease: boolean, _affectedMemberIds: string[]) => {
    try {
      if (applicationId && !hasDisease) {
        // Declare no diseases so the backend knows declaration is complete
        await apiClient.post(`/api/v1/applications/${applicationId}/diseases`, {
          diseases: [],
        });
      }
    } catch {
      // Non-fatal
    }
    if (hasDisease) {
      router.push('/critical-conditions');
    } else {
      router.push('/eligibility');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Health Declaration</h1>
        <p className="text-sm text-gray-500 mt-1">
          This helps us offer you the right coverage
        </p>
      </div>

      <DiseaseDeclaration
        question="Does any member have a pre-existing disease or medical condition?"
        infoText="Pre-existing diseases include diabetes, hypertension, heart disease, and other chronic conditions. Honest disclosure ensures smooth claim processing."
        members={memberChips}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
