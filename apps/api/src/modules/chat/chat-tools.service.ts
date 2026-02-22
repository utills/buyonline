import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PricingService } from '../plan/pricing.service.js';

@Injectable()
export class ChatToolsService {
  private readonly logger = new Logger(ChatToolsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
  ) {}

  async execute(name: string, input: Record<string, unknown>): Promise<unknown> {
    this.logger.debug(`Executing tool: ${name} with input: ${JSON.stringify(input)}`);
    switch (name) {
      case 'get_plans':
        return this.getPlans();
      case 'calculate_premium':
        return this.calculatePremium(
          input.planId as string,
          input.sumInsured as number,
          input.coverageLevel as string,
          input.tenureMonths as number,
        );
      case 'get_plan_addons':
        return this.getPlanAddons(input.planId as string);
      case 'get_hospital_network':
        return this.getHospitalNetwork(input.pincode as string);
      default:
        return { error: `Unknown tool: ${name}` };
    }
  }

  private async getPlans() {
    const plans = await this.prisma.plan.findMany({
      where: { isActive: true },
      include: {
        pricingTiers: {
          where: { tenureMonths: 12 },
          orderBy: { sumInsured: 'asc' },
        },
        addons: { include: { addon: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      tier: plan.tier,
      description: plan.description,
      features: plan.features,
      pricingTiers: plan.pricingTiers.map((t) => ({
        sumInsured: Number(t.sumInsured),
        sumInsuredLabel: t.sumInsuredLabel,
        coverageLevel: t.coverageLevel,
        basePremium: Number(t.basePremium),
        discountPct: t.discountPct,
        gst: t.gst,
        computedPremium: this.pricing.computePremium(
          Number(t.basePremium),
          t.discountPct,
          t.gst,
        ).totalPremium,
      })),
      addons: plan.addons.map((a) => ({
        id: a.addon.id,
        name: a.addon.name,
        price: Number(a.price),
      })),
    }));
  }

  private async calculatePremium(
    planId: string,
    sumInsured: number,
    coverageLevel: string,
    tenureMonths: number,
  ) {
    const tier = await this.prisma.planPricing.findFirst({
      where: {
        planId,
        sumInsured: BigInt(sumInsured),
        coverageLevel: coverageLevel as 'INDIVIDUAL' | 'FLOATER',
        tenureMonths,
      },
      include: { plan: true },
    });

    if (!tier) {
      return { error: 'No matching pricing tier found for the given parameters.' };
    }

    const computed = this.pricing.computePremium(
      Number(tier.basePremium),
      tier.discountPct,
      tier.gst,
    );

    return {
      planId,
      planName: tier.plan.name,
      sumInsured,
      coverageLevel,
      tenureMonths,
      basePremium: computed.basePremium,
      discountAmount: computed.discountAmount,
      gstAmount: computed.gstAmount,
      totalPremium: computed.totalPremium,
      monthlyEquivalent: Math.round(computed.totalPremium / tenureMonths),
    };
  }

  private async getPlanAddons(planId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: { addons: { include: { addon: true } } },
    });

    if (!plan) {
      return { error: `Plan '${planId}' not found.` };
    }

    return {
      planId,
      planName: plan.name,
      addons: plan.addons.map((a) => ({
        id: a.addon.id,
        name: a.addon.name,
        description: a.addon.description,
        price: Number(a.price),
        isPreChecked: a.isPreChecked,
      })),
    };
  }

  private async getHospitalNetwork(pincode: string) {
    const hospitals = await this.prisma.hospital.findMany({
      where: { pincode },
      take: 10,
      orderBy: { name: 'asc' },
    });

    if (hospitals.length === 0) {
      return {
        pincode,
        message: `No network hospitals found for pincode ${pincode}. Try a nearby pincode or call 1800-123-4567 for assistance.`,
        hospitals: [],
      };
    }

    return {
      pincode,
      count: hospitals.length,
      hospitals: hospitals.map((h) => ({
        name: h.name,
        address: h.address,
        city: h.city,
        isNetworkHospital: h.isNetworkHospital,
      })),
    };
  }
}
