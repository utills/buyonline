'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKycStore } from '@/stores/useKycStore';
import { KycMethod } from '@buyonline/shared-types';
import PanForm from '@/components/kyc/PanForm';
import AadharForm from '@/components/kyc/AadharForm';
import ManualUploadForm from '@/components/kyc/ManualUploadForm';

export default function KycDetailsPage() {
  const router = useRouter();
  const { method } = useKycStore();

  useEffect(() => {
    if (!method) {
      router.replace('/method');
    }
  }, [method, router]);

  if (!method) return null;

  const handleSubmit = () => {
    if (method === KycMethod.CKYC || method === KycMethod.MANUAL) {
      router.push('/otp');
    } else {
      router.push('/otp');
    }
  };

  const handleDigiLocker = () => {
    // DigiLocker redirect would happen here
    router.push('/otp');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {method === KycMethod.CKYC && 'PAN Verification'}
          {method === KycMethod.EKYC && 'Aadhar Verification'}
          {method === KycMethod.MANUAL && 'Document Upload'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter your details for verification
        </p>
      </div>

      {method === KycMethod.CKYC && <PanForm onSubmit={handleSubmit} />}
      {method === KycMethod.EKYC && (
        <AadharForm onSubmit={handleSubmit} onDigiLocker={handleDigiLocker} />
      )}
      {method === KycMethod.MANUAL && <ManualUploadForm onSubmit={handleSubmit} />}
    </div>
  );
}
