'use client';

import { useRouter } from 'next/navigation';
import ProposerForm from '@/components/payment/ProposerForm';

export default function ProposerPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Proposer Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter the details of the person buying this policy
        </p>
      </div>

      <ProposerForm onSubmit={() => router.push('/gateway')} />
    </div>
  );
}
