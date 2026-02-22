'use client';

import { useOnboardingStore } from '@/stores/useOnboardingStore';

interface MemberInfo {
  id: string;
  label: string;
}

interface EligibilityResultProps {
  members: MemberInfo[];
  onContinue: () => void;
}

export default function EligibilityResult({
  members,
  onContinue,
}: EligibilityResultProps) {
  const { eligibleMembers, ineligibleMembers } = useOnboardingStore();

  const safeEligibleMembers = eligibleMembers ?? [];
  const safeIneligibleMembers = ineligibleMembers ?? [];

  const eligible = members.filter((m) => safeEligibleMembers.includes(m.id));
  const ineligible = members.filter((m) =>
    safeIneligibleMembers.some((im) => im.memberId === m.id)
  );

  return (
    <div className="space-y-6">
      {/* Eligible Members */}
      {eligible.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-green-800">
              Covered Members
            </h3>
          </div>
          <div className="space-y-2">
            {eligible.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 text-sm text-green-700"
              >
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                {member.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ineligible Members */}
      {ineligible.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-orange-800">
              Not Covered
            </h3>
          </div>
          <div className="space-y-2">
            {ineligible.map((member) => {
              const reason = safeIneligibleMembers.find(
                (im) => im.memberId === member.id
              )?.reason;
              return (
                <div key={member.id} className="text-sm text-orange-700">
                  <span className="font-medium">{member.label}</span>
                  {reason && (
                    <span className="text-orange-600"> - {reason}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {eligible.length > 0 && (
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-lg bg-[#E31837] py-3 px-6 text-white font-semibold hover:bg-[#B8132D]"
        >
          Continue with {eligible.length} member{eligible.length > 1 ? 's' : ''}
        </button>
      )}

      {eligible.length === 0 && (
        <div className="text-center py-6">
          <p className="text-gray-600 text-sm">
            Unfortunately, none of the selected members are eligible for coverage at this time.
          </p>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mt-4 text-[#E31837] font-medium text-sm hover:underline"
          >
            Go back and modify selection
          </button>
        </div>
      )}
    </div>
  );
}
