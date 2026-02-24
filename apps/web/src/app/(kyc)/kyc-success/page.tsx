'use client';

import { useRouter } from 'next/navigation';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { JourneyStep } from '@buyonline/shared-types';
import KycSuccessComponent from '@/components/kyc/KycSuccess';
import { useJourneyNav } from '@/features/configurator/hooks/useJourneyNav';

export default function KycSuccessPage() {
  const router = useRouter();
  const { nextRoute } = useJourneyNav();
  const { markStepComplete, advanceTo } = useJourneyStore();

  const handleContinue = () => {
    markStepComplete(JourneyStep.KYC);
    advanceTo(JourneyStep.HEALTH);
    router.push(nextRoute('/kyc-success', '/personal'));
  };

  return <KycSuccessComponent onContinue={handleContinue} />;
}
