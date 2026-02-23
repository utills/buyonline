export interface IPlanService {
  getAllPlans(coverageLevel?: string): Promise<PlanDto[]>;
  getPlanById(id: string): Promise<PlanDto | null>;
}

export interface IAddonService {
  getAddonsByPlan(planId: string): Promise<AddonDto[]>;
}

export interface IPricingService {
  computePremium(basePremium: number, discountPct: number, gst: number): PremiumBreakdown;
}

export interface PlanDto {
  id: string;
  name: string;
  tier: string;
  description: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface AddonDto {
  id: string;
  name: string;
  description: string;
  price: number;
  isPreChecked: boolean;
}

export interface PremiumBreakdown {
  basePremium: number;
  discountAmount: number;
  gstAmount: number;
  totalPremium: number;
}
