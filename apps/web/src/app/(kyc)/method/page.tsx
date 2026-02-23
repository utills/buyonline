'use client';

import { useRouter } from 'next/navigation';
import { useKycStore } from '@/stores/useKycStore';
import { KycMethod } from '@buyonline/shared-types';
import KycMethodCard from '@/components/kyc/KycMethodCard';
import { useJourneyConfig } from '@/features/configurator/hooks/useJourneyConfig';

export default function KycMethodPage() {
  const router = useRouter();
  const { method, setMethod } = useKycStore();
  const { featureFlags } = useJourneyConfig();

  const handleContinue = () => {
    if (method) {
      router.push('/details');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">KYC Verification</h1>
        <p className="text-sm text-gray-500 mt-1">
          Choose your preferred verification method
        </p>
      </div>

      <div className="space-y-3">
        {featureFlags.ckycEnabled && (
          <KycMethodCard
            method={KycMethod.CKYC}
            title="CKYC (PAN Based)"
            description="Verify instantly using your PAN card and date of birth"
            isSelected={method === KycMethod.CKYC}
            onSelect={setMethod}
            badge="Fastest"
          />
        )}
        {featureFlags.ekycEnabled && (
          <KycMethodCard
            method={KycMethod.EKYC}
            title="eKYC (Aadhar Based)"
            description="Verify using your Aadhar number or DigiLocker"
            isSelected={method === KycMethod.EKYC}
            onSelect={setMethod}
          />
        )}
        <KycMethodCard
          method={KycMethod.MANUAL}
          title="Manual Upload"
          description="Upload identity and address proof documents"
          isSelected={method === KycMethod.MANUAL}
          onSelect={setMethod}
        />
      </div>

      <button
        onClick={handleContinue}
        disabled={!method}
        className="w-full rounded-lg bg-[#E31837] py-3 px-6 text-white font-semibold hover:bg-[#B8132D] disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );
}
