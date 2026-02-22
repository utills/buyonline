'use client';

interface ApplicationSummaryProps {
  applicationId: string;
  planName: string;
  totalPremium: number;
  proposerName: string;
  status: string;
}

export default function ApplicationSummary({
  applicationId,
  planName,
  totalPremium,
  proposerName,
  status,
}: ApplicationSummaryProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-[#E31837] to-[#B8132D] p-5 text-white text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold">Application Submitted!</h2>
        <p className="text-white/80 text-sm mt-1">Your application is being processed</p>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Application ID</span>
          <span className="font-medium text-gray-900">{applicationId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Plan</span>
          <span className="font-medium text-gray-900">{planName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Premium</span>
          <span className="font-bold text-gray-900">
            Rs {totalPremium.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Proposer</span>
          <span className="font-medium text-gray-900">{proposerName}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-gray-500">Status</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}
