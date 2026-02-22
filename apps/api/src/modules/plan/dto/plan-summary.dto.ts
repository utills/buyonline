export class PlanSummaryDto {
  applicationId!: string;
  plan!: {
    name: string;
    tier: string;
    sumInsured: number;
    coverageLevel: string;
    tenureMonths: number;
  };
  pricing!: {
    basePremium: number;
    addonPremium: number;
    discountAmount: number;
    gstAmount: number;
    totalPremium: number;
  };
  addons!: Array<{
    name: string;
    price: number;
  }>;
  members!: Array<{
    memberType: string;
    label: string;
    age: number;
  }>;
}
