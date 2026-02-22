'use client';

import { useRouter } from 'next/navigation';
import { usePaymentStore } from '@/stores/usePaymentStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { JourneyStep } from '@buyonline/shared-types';
import PaymentSuccessComponent from '@/components/payment/PaymentSuccess';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { transactionId, amount } = usePaymentStore();
  const { markStepComplete, advanceTo } = useJourneyStore();

  const handleContinue = () => {
    markStepComplete(JourneyStep.PAYMENT);
    advanceTo(JourneyStep.KYC);
    router.push('/method');
  };

  return (
    <PaymentSuccessComponent
      transactionId={transactionId ?? 'N/A'}
      amount={amount ?? 14160}
      onContinue={handleContinue}
    />
  );
}
