'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePaymentStore } from '@/stores/usePaymentStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { PaymentStatus } from '@buyonline/shared-types';
import PaymentGatewayComponent from '@/components/payment/PaymentGateway';
import { apiClient } from '@/lib/api-client';

export default function GatewayPage() {
  const router = useRouter();
  const { amount, setTransactionId, setPaymentStatus } = usePaymentStore();
  const { applicationId } = useJourneyStore();
  const gatewayOrderIdRef = useRef<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initiate payment when page loads so we have a gatewayOrderId for the callback
  useEffect(() => {
    const initiatePayment = async () => {
      if (!applicationId || !amount) {
        setIsInitializing(false);
        return;
      }
      try {
        const res = await apiClient.post<{ gatewayOrderId: string }>(`/api/v1/payments/initiate`, {
          applicationId,
          amount,
        });
        gatewayOrderIdRef.current = res.gatewayOrderId;
      } catch {
        // Non-fatal — payment record missing but user can still proceed
      } finally {
        setIsInitializing(false);
      }
    };
    initiatePayment();
  }, [applicationId, amount]);

  const handleSuccess = async (txnId: string) => {
    setTransactionId(txnId);
    setPaymentStatus(PaymentStatus.SUCCESS);
    try {
      if (gatewayOrderIdRef.current) {
        await apiClient.post(`/api/v1/payments/callback`, {
          gatewayOrderId: gatewayOrderIdRef.current,
          gatewayPaymentId: txnId,
          status: 'SUCCESS',
          transactionId: txnId,
        });
      }
    } catch {
      // Non-fatal
    }
    router.push('/payment-success');
  };

  const handleFailure = async () => {
    setPaymentStatus(PaymentStatus.FAILED);
    try {
      if (gatewayOrderIdRef.current) {
        await apiClient.post(`/api/v1/payments/callback`, {
          gatewayOrderId: gatewayOrderIdRef.current,
          gatewayPaymentId: `FAILED_${Date.now()}`,
          status: 'FAILED',
        });
      }
    } catch {
      // Non-fatal
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#E31837] animate-spin" />
        <p className="text-sm text-gray-500">Setting up payment...</p>
      </div>
    );
  }

  if (!amount || amount <= 0) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">Payment amount not set. Please go back and select a plan.</p>
        <button onClick={() => router.push('/proposer')} className="mt-4 text-[#E31837] underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Payment</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete your payment to proceed
        </p>
      </div>

      <PaymentGatewayComponent
        amount={amount}
        onSuccess={handleSuccess}
        onFailure={handleFailure}
      />
    </div>
  );
}
