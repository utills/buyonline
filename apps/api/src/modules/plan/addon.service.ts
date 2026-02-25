import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AddonService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllAddons() {
    const addons = await this.prisma.addon.findMany({ orderBy: { name: 'asc' } });
    return addons.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      price: 0,
      isPreChecked: false,
      isIncludedInBundle: false,
    }));
  }

  async getAddonsForPlan(planId: string) {
    const planAddons = await this.prisma.planAddon.findMany({
      where: { planId },
      include: { addon: true },
    });

    return planAddons.map((pa) => ({
      id: pa.addon.id,
      planAddonId: pa.id,
      name: pa.addon.name,
      description: pa.addon.description,
      price: Number(pa.price),
      isPreChecked: pa.isPreChecked,
      isIncludedInBundle: pa.isIncludedInBundle,
    }));
  }

  async selectAddons(applicationId: string, addonIds: string[]) {
    // Remove existing selected addons
    await this.prisma.selectedAddon.deleteMany({
      where: { applicationId },
    });

    if (addonIds.length === 0) return [];

    // Get addon prices from PlanAddon
    const selectedPlan = await this.prisma.selectedPlan.findUnique({
      where: { applicationId },
    });

    if (!selectedPlan) return [];

    const planAddons = await this.prisma.planAddon.findMany({
      where: {
        planId: selectedPlan.planId,
        addonId: { in: addonIds },
      },
    });

    const created = await Promise.all(
      planAddons.map((pa) =>
        this.prisma.selectedAddon.create({
          data: {
            applicationId,
            addonId: pa.addonId,
            price: pa.price,
          },
        }),
      ),
    );

    // Update addon premium in selected plan
    const totalAddonPremium = planAddons.reduce(
      (sum, pa) => sum + Number(pa.price),
      0,
    );

    await this.prisma.selectedPlan.update({
      where: { applicationId },
      data: {
        addonPremium: BigInt(totalAddonPremium),
        totalPremium:
          selectedPlan.basePremium -
          selectedPlan.discountAmount +
          selectedPlan.gstAmount +
          BigInt(totalAddonPremium),
      },
    });

    return created.map((a) => ({
      ...a,
      price: Number(a.price),
    }));
  }
}
