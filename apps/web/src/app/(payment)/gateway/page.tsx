'use client';

import { useEffect, useRef } from 'react';
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

  // Initiate payment when page loads so we have a gatewayOrderId for the callback
  useEffect(() => {
    const initiatePayment = async () => {
      if (!applicationId || !amount) return;
      try {
        const res = await apiClient.post<{ gatewayOrderId: string }>(`/api/v1/payments/initiate`, {
          applicationId,
          amount,
        });
        gatewayOrderIdRef.current = res.gatewayOrderId;
      } catch {
        // Non-fatal — payment record missing but user can still proceed
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Payment</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete your payment to proceed
        </p>
      </div>

      <PaymentGatewayComponent
        amount={amount ?? 14160}
        onSuccess={handleSuccess}
        onFailure={handleFailure}
      />
    </div>
  );
}
