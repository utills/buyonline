import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PricingService } from './pricing.service.js';
import { SelectPlanDto } from './dto/select-plan.dto.js';

@Injectable()
export class PlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
  ) {}

  async getPlans(applicationId?: string) {
    // Optionally verify application exists
    if (applicationId) {
      const app = await this.prisma.application.findUnique({
        where: { id: applicationId },
      });
      if (!app) {
        throw new NotFoundException('Application not found');
      }
    }

    const plans = await this.prisma.plan.findMany({
      where: { isActive: true },
      include: {
        pricingTiers: {
          orderBy: [{ sumInsured: 'asc' }, { tenureMonths: 'asc' }],
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
        id: t.id,
        sumInsured: Number(t.sumInsured),
        sumInsuredLabel: t.sumInsuredLabel,
        coverageLevel: t.coverageLevel,
        tenureMonths: t.tenureMonths,
        basePremium: Number(t.basePremium),
        discountPct: t.discountPct,
        gst: t.gst,
        isPopular: t.isPopular,
      })),
      addons: plan.addons.map((a) => ({
        id: a.addon.id,
        name: a.addon.name,
        price: Number(a.price),
        isPreChecked: a.isPreChecked,
      })),
    }));
  }

  async selectPlan(applicationId: string, dto: SelectPlanDto) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    // Find matching pricing tier
    const pricingTier = await this.prisma.planPricing.findFirst({
      where: {
        planId: dto.planId,
        sumInsured: BigInt(dto.sumInsured),
        coverageLevel: dto.coverageLevel,
        tenureMonths: dto.tenureMonths,
      },
    });

    if (!pricingTier) {
      throw new NotFoundException('No matching pricing tier found');
    }

    const computed = this.pricingService.computePremium(
      Number(pricingTier.basePremium),
      pricingTier.discountPct,
      pricingTier.gst,
    );

    // Upsert selected plan
    const selectedPlan = await this.prisma.selectedPlan.upsert({
      where: { applicationId },
      create: {
        applicationId,
        planId: dto.planId,
        sumInsured: BigInt(dto.sumInsured),
        coverageLevel: dto.coverageLevel,
        tenureMonths: dto.tenureMonths,
        basePremium: BigInt(computed.basePremium),
        discountAmount: BigInt(computed.discountAmount),
        gstAmount: BigInt(computed.gstAmount),
        totalPremium: BigInt(computed.totalPremium),
      },
      update: {
        planId: dto.planId,
        sumInsured: BigInt(dto.sumInsured),
        coverageLevel: dto.coverageLevel,
        tenureMonths: dto.tenureMonths,
        basePremium: BigInt(computed.basePremium),
        discountAmount: BigInt(computed.discountAmount),
        gstAmount: BigInt(computed.gstAmount),
        totalPremium: BigInt(computed.totalPremium),
      },
    });

    // Update application status
    await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'PLAN_SELECTED', currentStep: 'addons' },
    });

    return {
      ...selectedPlan,
      sumInsured: Number(selectedPlan.sumInsured),
      basePremium: Number(selectedPlan.basePremium),
      addonPremium: Number(selectedPlan.addonPremium),
      discountAmount: Number(selectedPlan.discountAmount),
      gstAmount: Number(selectedPlan.gstAmount),
      totalPremium: Number(selectedPlan.totalPremium),
    };
  }

  async getSummary(applicationId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        selectedPlan: { include: { plan: true } },
        selectedAddons: { include: { addon: true } },
        members: true,
      },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    if (!app.selectedPlan) {
      throw new NotFoundException('No plan selected for this application');
    }

    return {
      applicationId,
      plan: {
        name: app.selectedPlan.plan.name,
        tier: app.selectedPlan.plan.tier,
        sumInsured: Number(app.selectedPlan.sumInsured),
        coverageLevel: app.selectedPlan.coverageLevel,
        tenureMonths: app.selectedPlan.tenureMonths,
      },
      pricing: {
        basePremium: Number(app.selectedPlan.basePremium),
        addonPremium: Number(app.selectedPlan.addonPremium),
        discountAmount: Number(app.selectedPlan.discountAmount),
        gstAmount: Number(app.selectedPlan.gstAmount),
        totalPremium: Number(app.selectedPlan.totalPremium),
      },
      addons: app.selectedAddons.map((a) => ({
        name: a.addon.name,
        price: Number(a.price),
      })),
      members: app.members.map((m) => ({
        memberType: m.memberType,
        label: m.label,
        age: m.age,
      })),
    };
  }
}
