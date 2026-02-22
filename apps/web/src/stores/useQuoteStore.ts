import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Plan,
  PlanPricing,
  Addon,
  PricingBreakdown,
  CoverageLevel,
  PlanTier,
} from '@buyonline/shared-types';

interface QuoteState {
  plans: Plan[];
  selectedPlanId: string | null;
  sumInsured: number;
  tenureMonths: number;
  coverageLevel: CoverageLevel;
  selectedTier: PlanTier;
  addons: Addon[];
  selectedAddonIds: string[];
  pricing: PricingBreakdown | null;
  planPricings: PlanPricing[];

  setPlans: (plans: Plan[]) => void;
  setSelectedPlanId: (id: string) => void;
  setSumInsured: (amount: number) => void;
  setTenureMonths: (months: number) => void;
  setCoverageLevel: (level: CoverageLevel) => void;
  setSelectedTier: (tier: PlanTier) => void;
  setAddons: (addons: Addon[]) => void;
  toggleAddon: (addonId: string) => void;
  setPricing: (pricing: PricingBreakdown) => void;
  setPlanPricings: (pricings: PlanPricing[]) => void;
  reset: () => void;
}

const initialState = {
  plans: [] as Plan[],
  selectedPlanId: null as string | null,
  sumInsured: 500_0000,
  tenureMonths: 12,
  coverageLevel: CoverageLevel.FLOATER,
  selectedTier: PlanTier.SIGNATURE,
  addons: [] as Addon[],
  selectedAddonIds: [] as string[],
  pricing: null as PricingBreakdown | null,
  planPricings: [] as PlanPricing[],
};

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set) => ({
      ...initialState,

      setPlans: (plans: Plan[]) => set({ plans }),

      setSelectedPlanId: (id: string) => set({ selectedPlanId: id }),

      setSumInsured: (amount: number) => set({ sumInsured: amount }),

      setTenureMonths: (months: number) => set({ tenureMonths: months }),

      setCoverageLevel: (level: CoverageLevel) => set({ coverageLevel: level }),

      setSelectedTier: (tier: PlanTier) => set({ selectedTier: tier }),

      setAddons: (addons: Addon[]) =>
        set({
          addons,
          selectedAddonIds: addons
            .filter((a) => a.isPreChecked)
            .map((a) => a.id),
        }),

      toggleAddon: (addonId: string) =>
        set((state) => {
          const ids = state.selectedAddonIds ?? [];
          return {
            selectedAddonIds: ids.includes(addonId)
              ? ids.filter((id) => id !== addonId)
              : [...ids, addonId],
          };
        }),

      setPricing: (pricing: PricingBreakdown) => set({ pricing }),

      setPlanPricings: (pricings: PlanPricing[]) => set({ planPricings: pricings }),

      reset: () => set(initialState),
    }),
    {
      name: 'buyonline-quote',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
