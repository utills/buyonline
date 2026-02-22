'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuoteStore } from '@/stores/useQuoteStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { usePaymentStore } from '@/stores/usePaymentStore';
import { JourneyStep } from '@buyonline/shared-types';
import PlanSummaryComponent from '@/components/quote/PlanSummary';
import { apiClient } from '@/lib/api-client';
import type { PlanSummary } from '@buyonline/shared-types';

export default function SummaryPage() {
  const router = useRouter();
  const { applicationId, markStepComplete, advanceTo } = useJourneyStore();
  const { selectedPlanId } = useQuoteStore();
  const { setAmount } = usePaymentStore();
  const [summary, setSummary] = useState<PlanSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!applicationId) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await apiClient.get<{
          applicationId: string;
          plan: {
            name: string;
            tier: PlanSummary['planTier'];
            sumInsured: number;
            coverageLevel: PlanSummary['coverageLevel'];
            tenureMonths: number;
          };
          pricing: {
            basePremium: number;
            addonPremium: number;
            discountAmount: number;
            gstAmount: number;
            totalPremium: number;
          };
          addons: { name: string; price: number }[];
          members: { memberType: string; label: string; age: number }[];
        }>(`/api/v1/applications/${applicationId}/summary`);
        setSummary({
          planName: response.plan.name,
          planTier: response.plan.tier,
          sumInsured: response.plan.sumInsured,
          sumInsuredLabel: `Rs ${(response.plan.sumInsured / 100000).toFixed(0)} Lakh`,
          tenureMonths: response.plan.tenureMonths,
          coverageLevel: response.plan.coverageLevel,
          membersCount: response.members.length,
          memberLabels: response.members.map((m) => m.label),
          addons: response.addons,
          basePremium: response.pricing.basePremium,
          addonPremium: response.pricing.addonPremium,
          discountAmount: response.pricing.discountAmount,
          gstAmount: response.pricing.gstAmount,
          totalPremium: response.pricing.totalPremium,
          monthlyPremium: Math.round(response.pricing.totalPremium / response.plan.tenureMonths),
        });
        setAmount(response.pricing.totalPremium);
      } catch {
        // Use placeholder
        setSummary({
          planName: 'Health Shield',
          planTier: 'SIGNATURE' as PlanSummary['planTier'],
          sumInsured: 5000000,
          sumInsuredLabel: 'Rs 50 Lakh',
          tenureMonths: 12,
          coverageLevel: 'FLOATER' as PlanSummary['coverageLevel'],
          membersCount: 2,
          memberLabels: ['Self', 'Spouse'],
          addons: [],
          basePremium: 12000,
          addonPremium: 0,
          discountAmount: 0,
          gstAmount: 2160,
          totalPremium: 14160,
          monthlyPremium: 1180,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const handleContinue = () => {
    markStepComplete(JourneyStep.QUOTE);
    advanceTo(JourneyStep.PAYMENT);
    router.push('/proposer');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin w-8 h-8 text-[#E31837]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Plan Summary</h1>
        <p className="text-sm text-gray-500 mt-1">Review your plan before proceeding</p>
      </div>

      {summary && <PlanSummaryComponent summary={summary} />}

      <button
        onClick={handleContinue}
        className="w-full rounded-lg bg-[#E31837] py-3 px-6 text-white font-semibold hover:bg-[#B8132D]"
      >
        Proceed to Payment
      </button>
    </div>
  );
}
