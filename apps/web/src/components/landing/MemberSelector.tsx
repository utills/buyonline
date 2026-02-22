'use client';

import { useLeadStore } from '@/stores/useLeadStore';

export default function MemberSelector() {
  const { members, setSelf, setSpouse, setKidsCount } = useLeadStore();
  const safeMembers = members ?? { self: true, spouse: false, kidsCount: 0 };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Who would you like to insure?
      </h3>

      <div className="flex items-center justify-center gap-6">
        {/* Self */}
        <button
          type="button"
          onClick={() => setSelf(!safeMembers.self)}
          className="flex flex-col items-center gap-2"
        >
          <div
            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
              safeMembers.self
                ? 'border-[#E31837] bg-red-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <svg
              className={`w-7 h-7 ${safeMembers.self ? 'text-[#E31837]' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <span
            className={`text-xs font-medium ${
              safeMembers.self ? 'text-[#E31837]' : 'text-gray-500'
            }`}
          >
            Self
          </span>
        </button>

        {/* Spouse */}
        <button
          type="button"
          onClick={() => setSpouse(!safeMembers.spouse)}
          className="flex flex-col items-center gap-2"
        >
          <div
            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
              safeMembers.spouse
                ? 'border-[#E31837] bg-red-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <svg
              className={`w-7 h-7 ${safeMembers.spouse ? 'text-[#E31837]' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <span
            className={`text-xs font-medium ${
              safeMembers.spouse ? 'text-[#E31837]' : 'text-gray-500'
            }`}
          >
            Spouse
          </span>
        </button>

        {/* Kids */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
              safeMembers.kidsCount > 0
                ? 'border-[#E31837] bg-red-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <svg
              className={`w-7 h-7 ${
                safeMembers.kidsCount > 0 ? 'text-[#E31837]' : 'text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <span
            className={`text-xs font-medium ${
              safeMembers.kidsCount > 0 ? 'text-[#E31837]' : 'text-gray-500'
            }`}
          >
            Kids
          </span>
          {/* Counter */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setKidsCount(safeMembers.kidsCount - 1)}
              disabled={safeMembers.kidsCount === 0}
              className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:border-[#E31837] hover:text-[#E31837]"
            >
              <span className="text-xs font-bold">-</span>
            </button>
            <span className="text-sm font-semibold w-4 text-center">
              {safeMembers.kidsCount}
            </span>
            <button
              type="button"
              onClick={() => setKidsCount(safeMembers.kidsCount + 1)}
              disabled={safeMembers.kidsCount >= 4}
              className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:border-[#E31837] hover:text-[#E31837]"
            >
              <span className="text-xs font-bold">+</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
