import { CoverageLevel, PlanTier } from './enums';

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  description?: string;
  features: string[];
  isActive: boolean;
}

export interface PlanPricing {
  id: string;
  planId: string;
  sumInsured: number;
  sumInsuredLabel: string;
  coverageLevel: CoverageLevel;
  tenureMonths: number;
  basePremium: number;
  discountPct: number;
  gst: number;
  isPopular: boolean;
}

export interface Addon {
  id: string;
  name: string;
  description?: string;
  price: number;
  isPreChecked: boolean;
  isIncludedInBundle: boolean;
}

export interface PlanSummary {
  planName: string;
  planTier: PlanTier;
  sumInsured: number;
  sumInsuredLabel: string;
  tenureMonths: number;
  coverageLevel: CoverageLevel;
  membersCount: number;
  memberLabels: string[];
  addons: { name: string; price: number }[];
  basePremium: number;
  addonPremium: number;
  discountAmount: number;
  gstAmount: number;
  totalPremium: number;
  monthlyPremium: number;
}

export interface PricingBreakdown {
  basePremium: number;
  addonPremium: number;
  discountAmount: number;
  subtotal: number;
  gstAmount: number;
  totalPremium: number;
  monthlyEquivalent: number;
}

export const SUM_INSURED_OPTIONS = [
  { value: 1000000, label: 'Rs 10 Lakh' },
  { value: 2500000, label: 'Rs 25 Lakh' },
  { value: 5000000, label: 'Rs 50 Lakh', isPopular: true },
  { value: 10000000, label: 'Rs 1 Crore' },
] as const;

export const TENURE_OPTIONS = [
  { months: 12, label: '1 year', discountPct: 0 },
  { months: 24, label: '2 years', discountPct: 7.5 },
  { months: 36, label: '3 years', discountPct: 10, isPopular: true },
  { months: 48, label: '4 years', discountPct: 12.5 },
  { months: 60, label: '5 years', discountPct: 15 },
] as const;
