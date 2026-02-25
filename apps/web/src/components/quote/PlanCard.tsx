'use client';

import { Plan, PlanPricing } from '@buyonline/shared-types';
import { PLAN_TIER_LABELS } from '@/lib/constants';

interface PlanCardProps {
  plan: Plan;
  pricing?: PlanPricing;
  isSelected: boolean;
  onSelect: (planId: string) => void;
  onLearnMore: (planId: string) => void;
}

export default function PlanCard({
  plan,
  pricing,
  isSelected,
  onSelect,
  onLearnMore,
}: PlanCardProps) {
  const monthlyPrice = pricing
    ? Math.round(pricing.basePremium / (pricing.tenureMonths || 12))
    : 0;

  return (
    <div
      className={`w-72 flex-shrink-0 bg-white rounded-xl border-2 p-5 space-y-4 transition-all ${
        isSelected
          ? 'border-[#ED1B2D] shadow-md'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Plan tier badge */}
      <div className="flex items-center justify-between">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isSelected
              ? 'bg-[#ED1B2D] text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {PLAN_TIER_LABELS[plan.tier]}
        </span>
        {pricing?.isPopular && (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            Popular
          </span>
        )}
      </div>

      {/* Plan name */}
      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>

      {/* Pricing */}
      {pricing && (
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              Rs {monthlyPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-sm text-gray-500">/month</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Rs {pricing.basePremium.toLocaleString('en-IN')}/year
          </p>
        </div>
      )}

      {/* Features */}
      <ul className="space-y-2">
        {(Array.isArray(plan.features) ? plan.features : Object.values(plan.features)).slice(0, 4).map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={() => onSelect(plan.id)}
          className={`w-full rounded-lg py-2.5 px-4 text-sm font-semibold transition-all ${
            isSelected
              ? 'bg-[#ED1B2D] text-white'
              : 'bg-white text-[#ED1B2D] border border-[#ED1B2D] hover:bg-red-50'
          }`}
        >
          {isSelected ? 'Selected' : 'Select Plan'}
        </button>
        <button
          type="button"
          onClick={() => onLearnMore(plan.id)}
          className="w-full text-sm text-[#ED1B2D] font-medium hover:underline"
        >
          Learn More
        </button>
      </div>
    </div>
  );
}
