'use client';

import { Plan, PlanPricing } from '@buyonline/shared-types';
import PlanCard from './PlanCard';

interface PlanCarouselProps {
  plans: Plan[];
  pricings: PlanPricing[];
  selectedPlanId: string | null;
  onSelect: (planId: string) => void;
  onLearnMore: (planId: string) => void;
}

export default function PlanCarousel({
  plans,
  pricings,
  selectedPlanId,
  onSelect,
  onLearnMore,
}: PlanCarouselProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
        {plans.map((plan) => {
          const pricing = pricings.find((p) => p.planId === plan.id);
          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              pricing={pricing}
              isSelected={selectedPlanId === plan.id}
              onSelect={onSelect}
              onLearnMore={onLearnMore}
            />
          );
        })}
      </div>
    </div>
  );
}
