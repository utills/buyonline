'use client';

import { useRouter } from 'next/navigation';
import { useHealthStore } from '@/stores/useHealthStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import HospitalizationForm from '@/components/health/HospitalizationForm';
import { apiClient } from '@/lib/api-client';

export default function HospitalizationPage() {
  const router = useRouter();
  const { setHospitalizationDetails } = useHealthStore();
  const { applicationId } = useJourneyStore();

  const handleSave = async (data: {
    reason: string;
    isDischargeSummaryAvailable: boolean;
    dischargeSummaryUrl?: string;
    medicationName?: string;
    investigationName?: string;
    symptomName?: string;
    treatmentName?: string;
  }) => {
    setHospitalizationDetails(data);
    try {
      if (applicationId) {
        await apiClient.post(`/api/v1/applications/${applicationId}/health/hospitalization`, {
          hospitalizationReason: data.reason,
          dischargeSummaryUrl: data.dischargeSummaryUrl,
          medicationDetails: data.medicationName,
        });
      }
    } catch {
      // Non-fatal
    }
    router.push('/disability');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Hospitalization History</h1>
        <p className="text-sm text-gray-500 mt-1">
          Have any members been hospitalized in the last 4 years?
        </p>
      </div>

      <HospitalizationForm onSave={handleSave} />
    </div>
  );
}
