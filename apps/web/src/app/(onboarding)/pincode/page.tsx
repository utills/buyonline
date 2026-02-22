'use client';

import { useRouter } from 'next/navigation';
import PincodeInput from '@/components/onboarding/PincodeInput';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { apiClient } from '@/lib/api-client';

export default function PincodePage() {
  const router = useRouter();
  const { pincode, nearbyHospitals } = useOnboardingStore();
  const { applicationId } = useJourneyStore();
  const safePincode = pincode ?? '';

  const handleContinue = async () => {
    if (safePincode.length !== 6) return;
    try {
      if (applicationId) {
        await apiClient.patch(`/api/v1/applications/${applicationId}/pincode`, {
          pincode: safePincode,
        });
      }
    } catch {
      // Non-fatal — continue anyway
    }
    router.push('/pre-existing');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Your location</h1>
        <p className="text-sm text-gray-500 mt-1">
          We&apos;ll find network hospitals near you
        </p>
      </div>

      <PincodeInput />

      <button
        onClick={handleContinue}
        disabled={safePincode.length !== 6 || nearbyHospitals === 0}
        className="w-full rounded-lg bg-[#E31837] py-3 px-6 text-white font-semibold hover:bg-[#B8132D] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}
