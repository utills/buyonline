'use client';

import { useState } from 'react';
import { usePaymentStore } from '@/stores/usePaymentStore';

interface PaymentGatewayProps {
  amount: number;
  onSuccess: (transactionId: string) => void;
  onFailure: () => void;
}

export default function PaymentGateway({
  amount,
  onSuccess,
  onFailure,
}: PaymentGatewayProps) {
  const { setPaymentMethod } = usePaymentStore();
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const methods = [
    { id: 'upi', label: 'UPI', icon: 'U' },
    { id: 'card', label: 'Credit/Debit Card', icon: 'C' },
    { id: 'netbanking', label: 'Net Banking', icon: 'N' },
  ];

  const handlePay = async () => {
    setIsProcessing(true);
    setPaymentMethod(selectedMethod);
    try {
      // Payment gateway integration placeholder
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const txnId = `TXN${Date.now()}`;
      onSuccess(txnId);
    } catch {
      onFailure();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-500">Amount to pay</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">
          Rs {amount.toLocaleString('en-IN')}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Select Payment Method
        </h3>
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              selectedMethod === method.id
                ? 'border-[#E31837] bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                selectedMethod === method.id
                  ? 'bg-[#E31837] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {method.icon}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {method.label}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={handlePay}
        disabled={isProcessing}
        className="w-full rounded-lg bg-[#E31837] py-3.5 px-6 text-white font-semibold hover:bg-[#B8132D] disabled:opacity-60"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          `Pay Rs ${amount.toLocaleString('en-IN')}`
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>100% Secure Payment</span>
      </div>
    </div>
  );
}
