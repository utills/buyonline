import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async getPricing(planId: string) {
    const pricingTiers = await this.prisma.planPricing.findMany({
      where: { planId },
      orderBy: [{ sumInsured: 'asc' }, { tenureMonths: 'asc' }],
    });

    if (pricingTiers.length === 0) {
      throw new NotFoundException('No pricing found for this plan');
    }

    return pricingTiers.map((tier) => ({
      id: tier.id,
      sumInsured: Number(tier.sumInsured),
      sumInsuredLabel: tier.sumInsuredLabel,
      coverageLevel: tier.coverageLevel,
      tenureMonths: tier.tenureMonths,
      basePremium: Number(tier.basePremium),
      discountPct: tier.discountPct,
      gst: tier.gst,
      isPopular: tier.isPopular,
      computedPremium: this.computePremium(
        Number(tier.basePremium),
        tier.discountPct,
        tier.gst,
      ),
    }));
  }

  computePremium(
    basePremium: number,
    discountPct: number,
    gstPct: number,
  ): {
    basePremium: number;
    discountAmount: number;
    premiumAfterDiscount: number;
    gstAmount: number;
    totalPremium: number;
  } {
    const discountAmount = Math.round(basePremium * (discountPct / 100));
    const premiumAfterDiscount = basePremium - discountAmount;
    const gstAmount = Math.round(premiumAfterDiscount * (gstPct / 100));
    const totalPremium = premiumAfterDiscount + gstAmount;

    return {
      basePremium,
      discountAmount,
      premiumAfterDiscount,
      gstAmount,
      totalPremium,
    };
  }
}
