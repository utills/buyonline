'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { PlanTier } from '@buyonline/shared-types';
import CoverageLevelSelector from '@/components/quote/CoverageLevelSelector';
import PlanCarousel from '@/components/quote/PlanCarousel';
import SumInsuredModal from '@/components/quote/SumInsuredModal';
import TenureModal from '@/components/quote/TenureModal';
import { apiClient } from '@/lib/api-client';
import type { Plan, PlanPricing } from '@buyonline/shared-types';

export default function PlansPage() {
  const router = useRouter();
  const {
    plans, selectedPlanId, selectedTier, sumInsured, tenureMonths, coverageLevel, planPricings,
    setPlans, setSelectedPlanId, setSelectedTier, setSumInsured, setTenureMonths, setPlanPricings,
  } = useQuoteStore();
  const { applicationId } = useJourneyStore();
  const [showSumInsured, setShowSumInsured] = useState(false);
  const [showTenure, setShowTenure] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Backend returns array of plans with nested pricingTiers and addons
        const response = await apiClient.get<Array<{
          id: string;
          name: string;
          tier: string;
          description?: string;
          features: string[];
          pricingTiers: PlanPricing[];
          addons: Array<{ id: string; name: string; price: number; isPreChecked: boolean }>;
        }>>(`/api/v1/plans`);

        const plansData: Plan[] = response.map((p) => ({
          id: p.id,
          name: p.name,
          tier: p.tier as PlanTier,
          description: p.description,
          features: Array.isArray(p.features)
            ? p.features
            : Object.values(p.features as unknown as Record<string, string>),
          isActive: true,
        }));
        setPlans(plansData);

        // Flatten all pricingTiers into a single array with planId
        const allPricings: PlanPricing[] = response.flatMap((p) =>
          p.pricingTiers.map((t) => ({ ...t, planId: p.id }))
        );
        setPlanPricings(allPricings);
      } catch {
        setFetchError('Unable to load plans. Please refresh the page.');
      }
    };
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safePlans = plans ?? [];
  const safePlanPricings = planPricings ?? [];

  const filteredPlans = safePlans.filter((p) => p.tier === selectedTier);
  const filteredPricings = safePlanPricings.filter(
    (p) => p.sumInsured === sumInsured && p.tenureMonths === tenureMonths
  );

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleContinue = async () => {
    if (!selectedPlanId) return;
    setIsSaving(true);
    try {
      if (applicationId) {
        await apiClient.post(`/api/v1/applications/${applicationId}/selected-plan`, {
          planId: selectedPlanId,
          sumInsured,
          coverageLevel,
          tenureMonths,
        });
      }
    } catch {
      // Non-fatal — summary placeholder will show on error
    } finally {
      setIsSaving(false);
    }
    router.push('/addons');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Choose your plan</h1>
        <p className="text-sm text-gray-500 mt-1">Select the coverage that suits you best</p>
      </div>

      {/* Coverage Level Tabs */}
      <CoverageLevelSelector
        selectedTier={selectedTier}
        onSelect={(tier: PlanTier) => setSelectedTier(tier)}
      />

      {/* Filters */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowSumInsured(true)}
          className="flex-1 flex items-center justify-between px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm hover:border-gray-400"
        >
          <span className="text-gray-500">Sum Insured</span>
          <span className="font-semibold text-gray-900">
            Rs {(sumInsured / 100000).toFixed(0)}L
          </span>
        </button>
        <button
          onClick={() => setShowTenure(true)}
          className="flex-1 flex items-center justify-between px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm hover:border-gray-400"
        >
          <span className="text-gray-500">Tenure</span>
          <span className="font-semibold text-gray-900">
            {tenureMonths / 12} yr{tenureMonths > 12 ? 's' : ''}
          </span>
        </button>
      </div>

      {/* Error Banner */}
      {fetchError && filteredPlans.length === 0 && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#E31837]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0 mt-0.5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{fetchError}</span>
        </div>
      )}

      {/* Plan Cards */}
      <PlanCarousel
        plans={filteredPlans}
        pricings={filteredPricings}
        selectedPlanId={selectedPlanId}
        onSelect={handleSelectPlan}
        onLearnMore={() => {}}
      />

      {/* CTA */}
      <button
        onClick={handleContinue}
        disabled={!selectedPlanId || isSaving}
        className="w-full rounded-lg bg-[#E31837] py-3 px-6 text-white font-semibold hover:bg-[#B8132D] disabled:opacity-40"
      >
        {isSaving ? 'Saving...' : 'Continue with Selected Plan'}
      </button>

      {/* Modals */}
      <SumInsuredModal
        isOpen={showSumInsured}
        onClose={() => setShowSumInsured(false)}
        selectedValue={sumInsured}
        onSelect={setSumInsured}
      />
      <TenureModal
        isOpen={showTenure}
        onClose={() => setShowTenure(false)}
        selectedMonths={tenureMonths}
        onSelect={setTenureMonths}
      />
    </div>
  );
}
