'use client';

import type { PlanCardData } from '../types';

interface PlanRecommendationCardProps {
  data: PlanCardData;
  onSelect?: (plan: PlanCardData) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PlanRecommendationCard({ data, onSelect }: PlanRecommendationCardProps) {
  return (
    <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm max-w-xs">
      {data.isRecommended && (
        <div className="bg-[#E31837] text-white text-xs font-semibold text-center py-1 px-3">
          Recommended for you
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-bold text-gray-900 text-sm">{data.planName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{data.sumInsuredLabel} cover</p>
          </div>
          <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 font-medium">
            {data.planTier}
          </span>
        </div>

        {data.features && data.features.length > 0 && (
          <ul className="mb-3 space-y-1">
            {data.features.slice(0, 4).map((feature, idx) => (
              <li key={idx} className="flex items-center gap-1.5 text-xs text-gray-600">
                <svg
                  className="w-3.5 h-3.5 text-green-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500">Total premium</p>
            <p className="text-base font-bold text-gray-900">{formatCurrency(data.totalPremium)}</p>
            <p className="text-xs text-gray-400">{formatCurrency(data.monthlyPremium)}/month</p>
          </div>
          {onSelect && (
            <button
              onClick={() => onSelect(data)}
              className="bg-[#E31837] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#B8132D] transition-colors"
            >
              Select Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
