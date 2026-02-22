'use client';

import { useLeadStore } from '@/stores/useLeadStore';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { members } = useLeadStore();
  const safeMembers = members ?? { self: true, spouse: false, kidsCount: 0 };

  const memberLabels: string[] = [];
  if (safeMembers.self) memberLabels.push('Self');
  if (safeMembers.spouse) memberLabels.push('Spouse');
  for (let i = 0; i < safeMembers.kidsCount; i++) {
    memberLabels.push(`Kid ${i + 1}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Member Summary Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#E31837] rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">BuyOnline</span>
          </div>
          <div className="flex items-center gap-1.5">
            {memberLabels.map((label, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-red-50 text-[#E31837] text-xs font-medium rounded-full"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}
