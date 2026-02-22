'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLeadStore } from '@/stores/useLeadStore';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { JourneyStep } from '@buyonline/shared-types';
import EligibilityResult from '@/components/onboarding/EligibilityResult';
import { apiClient } from '@/lib/api-client';

export default function EligibilityPage() {
  const router = useRouter();
  const { members } = useLeadStore();
  const { setEligibleMembers, setIneligibleMembers } = useOnboardingStore();
  const { applicationId, advanceTo, markStepComplete } = useJourneyStore();
  const [isLoading, setIsLoading] = useState(true);

  const safeMembers = members ?? { self: true, spouse: false, kidsCount: 0 };
  const memberList: { id: string; label: string }[] = [];
  if (safeMembers.self) memberList.push({ id: 'self', label: 'Myself' });
  if (safeMembers.spouse) memberList.push({ id: 'spouse', label: 'Spouse' });
  for (let i = 0; i < safeMembers.kidsCount; i++) {
    memberList.push({ id: `kid-${i + 1}`, label: `Kid ${i + 1}` });
  }

  useEffect(() => {
    const checkEligibility = async () => {
      if (!applicationId) {
        setEligibleMembers(memberList.map((m) => m.id));
        setIneligibleMembers([]);
        setIsLoading(false);
        return;
      }
      try {
        const response = await apiClient.get<{
          applicationId: string;
          allEligible: boolean;
          members: Array<{
            memberId: string;
            memberType: string;
            label: string;
            isEligible: boolean;
            ineligibilityReason?: string;
          }>;
        }>(`/api/v1/applications/${applicationId}/eligibility`);

        if (!response.members || response.members.length === 0) {
          // No DB members found — treat all local members as eligible
          setEligibleMembers(memberList.map((m) => m.id));
          setIneligibleMembers([]);
        } else {
          // Use memberId directly from API response (already matches local IDs)
          const eligible = response.members
            .filter((m) => m.isEligible)
            .map((m) => m.memberId);
          const ineligible = response.members
            .filter((m) => !m.isEligible)
            .map((m) => ({
              memberId: m.memberId,
              reason: m.ineligibilityReason ?? '',
            }));
          setEligibleMembers(eligible);
          setIneligibleMembers(ineligible);
        }
      } catch {
        // Default: all eligible
        setEligibleMembers(memberList.map((m) => m.id));
        setIneligibleMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    checkEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    markStepComplete(JourneyStep.ONBOARDING);
    advanceTo(JourneyStep.QUOTE);
    router.push('/loading');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <svg className="animate-spin w-10 h-10 text-[#E31837]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-gray-500">Checking eligibility...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Eligibility Result</h1>
        <p className="text-sm text-gray-500 mt-1">
          Based on the information provided
        </p>
      </div>

      <EligibilityResult members={memberList} onContinue={handleContinue} />
    </div>
  );
}
