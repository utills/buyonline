'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CriticalConditionsModal from '@/components/onboarding/CriticalConditionsModal';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { apiClient } from '@/lib/api-client';

export default function CriticalConditionsPage() {
  const router = useRouter();
  const { setCriticalConditions } = useOnboardingStore();
  const { applicationId } = useJourneyStore();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleConfirm = async (selected: string[]) => {
    setCriticalConditions('all', selected);
    try {
      if (applicationId) {
        await apiClient.post(`/api/v1/applications/${applicationId}/critical-conditions`, {
          conditions: selected.map((diseaseId) => ({ memberId: 'all', diseaseId })),
        });
      }
    } catch {
      // Non-fatal
    }
    router.push('/eligibility');
  };

  return (
    <div className="space-y-6">
      <CriticalConditionsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          router.push('/eligibility');
        }}
        onConfirm={handleConfirm}
      />

      {!isModalOpen && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full rounded-lg border border-gray-300 py-3 px-6 text-gray-700 font-semibold hover:bg-gray-50"
        >
          Review Conditions
        </button>
      )}
    </div>
  );
}
