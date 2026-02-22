'use client';

import { PlanTier } from '@buyonline/shared-types';
import { PLAN_TIER_LABELS } from '@/lib/constants';

interface CoverageLevelSelectorProps {
  selectedTier: PlanTier;
  onSelect: (tier: PlanTier) => void;
  tierPrices?: Record<PlanTier, number>;
}

export default function CoverageLevelSelector({
  selectedTier,
  onSelect,
  tierPrices,
}: CoverageLevelSelectorProps) {
  const tiers = [PlanTier.PREMIER, PlanTier.SIGNATURE, PlanTier.GLOBAL];

  return (
    <div className="flex rounded-xl bg-gray-100 p-1">
      {tiers.map((tier) => {
        const isSelected = selectedTier === tier;
        return (
          <button
            key={tier}
            type="button"
            onClick={() => onSelect(tier)}
            className={`flex-1 py-2.5 px-3 rounded-lg text-center transition-all ${
              isSelected
                ? 'bg-white shadow-sm'
                : 'hover:bg-gray-50'
            }`}
          >
            <span
              className={`text-sm font-semibold block ${
                isSelected ? 'text-[#E31837]' : 'text-gray-600'
              }`}
            >
              {PLAN_TIER_LABELS[tier]}
            </span>
            {tierPrices?.[tier] && (
              <span className="text-xs text-gray-400 block mt-0.5">
                from Rs {tierPrices[tier].toLocaleString('en-IN')}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
