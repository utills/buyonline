'use client';

import { useRouter } from 'next/navigation';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { JourneyStep } from '@buyonline/shared-types';
import KycSuccessComponent from '@/components/kyc/KycSuccess';

export default function KycSuccessPage() {
  const router = useRouter();
  const { markStepComplete, advanceTo } = useJourneyStore();

  const handleContinue = () => {
    markStepComplete(JourneyStep.KYC);
    advanceTo(JourneyStep.HEALTH);
    router.push('/personal');
  };

  return <KycSuccessComponent onContinue={handleContinue} />;
}
