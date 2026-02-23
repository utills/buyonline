'use client';

import { useRouter } from 'next/navigation';
import { useLeadStore } from '@/stores/useLeadStore';
import { useHealthStore } from '@/stores/useHealthStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import DisabilityForm from '@/components/health/DisabilityForm';
import { apiClient } from '@/lib/api-client';

export default function DisabilityPage() {
  const router = useRouter();
  const { members } = useLeadStore();
  const { setDisabilityDetails } = useHealthStore();
  const { applicationId } = useJourneyStore();

  const safeMembers = members ?? { self: true, spouse: false, kidsCount: 0 };
  const memberChips: { id: string; label: string }[] = [];
  if (safeMembers.self) memberChips.push({ id: 'self', label: 'Myself' });
  if (safeMembers.spouse) memberChips.push({ id: 'spouse', label: 'Spouse' });
  for (let i = 0; i < safeMembers.kidsCount; i++) {
    memberChips.push({ id: `kid-${i + 1}`, label: `Kid ${i + 1}` });
  }

  const handleSave = async (data: {
    hasDisability: boolean;
    disabilityMemberIds: string[];
    hasPriorInsuranceDecline: boolean;
    priorInsuranceDetails?: string;
  }) => {
    setDisabilityDetails({
      hasDisability: data.hasDisability,
      memberIds: data.disabilityMemberIds,
      hasPriorInsuranceDecline: data.hasPriorInsuranceDecline,
      priorInsuranceDetails: data.priorInsuranceDetails,
    });
    try {
      if (applicationId) {
        await apiClient.post(`/api/v1/applications/${applicationId}/health/disability`, {
          hasDisability: data.hasDisability,
          disabilityDetails: data.priorInsuranceDetails,
        });
      }
    } catch {
      // Non-fatal
    }
    router.push('/declaration');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Disability & Prior Insurance</h1>
        <p className="text-sm text-gray-500 mt-1">
          Almost done! Just a couple more questions
        </p>
      </div>

      <DisabilityForm members={memberChips} onSave={handleSave} />
    </div>
  );
}
