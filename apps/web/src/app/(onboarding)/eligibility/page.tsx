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
  const [checkError, setCheckError] = useState<string | null>(null);

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
        // Default: all eligible — but surface the error to the user
        setCheckError('Could not verify eligibility. Showing default result — you may continue.');
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
        <svg className="animate-spin w-10 h-10 text-[#ED1B2D]" width="40" height="40" viewBox="0 0 24 24" fill="none">
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

      {checkError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#ED1B2D]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0 mt-0.5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{checkError}</span>
        </div>
      )}

      <EligibilityResult members={memberList} onContinue={handleContinue} />
    </div>
  );
}
