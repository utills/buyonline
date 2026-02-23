import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PricingService } from '../plan/pricing.service.js';

@Injectable()
export class AgenticPlanToolsService {
  private readonly logger = new Logger(AgenticPlanToolsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
  ) {}

  canHandle(name: string): boolean {
    return [
      'select_plan',
      'select_addons',
      'save_proposer_details',
      'initiate_payment',
    ].includes(name);
  }

  async execute(name: string, input: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'select_plan':
        return this.selectPlan(input);
      case 'select_addons':
        return this.selectAddons(input);
      case 'save_proposer_details':
        return this.saveProposerDetails(input);
      case 'initiate_payment':
        return this.initiatePayment(input);
      default:
        return null;
    }
  }

  private async selectPlan(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const applicationId = input['applicationId'] as string;
      const planId = input['planId'] as string;
      const sumInsured = input['sumInsured'] as number;
      const coverageLevel = (input['coverageLevel'] as string) ?? 'INDIVIDUAL';
      const tenureMonths = (input['tenureMonths'] as number) ?? 12;

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
        return { success: false, error: 'Pricing tier not found for the selected plan.' };
      }

      const computed = this.pricing.computePremium(
        Number(tier.basePremium),
        tier.discountPct,
        tier.gst,
      );

      await this.prisma.selectedPlan.upsert({
        where: { applicationId },
        create: {
          applicationId,
          planId,
          sumInsured: BigInt(sumInsured),
          coverageLevel: coverageLevel as 'INDIVIDUAL' | 'FLOATER',
          tenureMonths,
          basePremium: BigInt(computed.basePremium),
          discountAmount: BigInt(computed.discountAmount),
          gstAmount: BigInt(computed.gstAmount),
          totalPremium: BigInt(computed.totalPremium),
        },
        update: {
          planId,
          sumInsured: BigInt(sumInsured),
          coverageLevel: coverageLevel as 'INDIVIDUAL' | 'FLOATER',
          tenureMonths,
          basePremium: BigInt(computed.basePremium),
          discountAmount: BigInt(computed.discountAmount),
          gstAmount: BigInt(computed.gstAmount),
          totalPremium: BigInt(computed.totalPremium),
        },
      });

      await this.prisma.application.update({
        where: { id: applicationId },
        data: { currentStep: 'addons', status: 'PLAN_SELECTED' },
      });

      return {
        success: true,
        planName: tier.plan.name,
        planTier: tier.plan.tier,
        sumInsured,
        sumInsuredLabel: tier.sumInsuredLabel,
        totalPremium: computed.totalPremium,
        monthlyPremium: Math.round(computed.totalPremium / tenureMonths),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`selectPlan failed: ${msg}`);
      return { success: false, error: 'Failed to save plan selection. Please try again.' };
    }
  }

  private async selectAddons(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const applicationId = input['applicationId'] as string;
      const addonIds = (input['addonIds'] as string[]) ?? [];

      await this.prisma.selectedAddon.deleteMany({ where: { applicationId } });

      // Resolve the application's selected plan so we can look up PlanAddon prices
      const selectedPlan = await this.prisma.selectedPlan.findUnique({
        where: { applicationId },
      });

      if (!selectedPlan) {
        return { success: false, error: 'No plan selected for this application. Please select a plan first.' };
      }

      if (addonIds.length > 0) {
        // Fetch PlanAddon records to get actual prices for the chosen addons
        const planAddons = await this.prisma.planAddon.findMany({
          where: { planId: selectedPlan.planId, addonId: { in: addonIds } },
          select: { addonId: true, price: true },
        });

        const priceMap = new Map<string, bigint>(
          planAddons.map((pa) => [pa.addonId, pa.price]),
        );

        await this.prisma.selectedAddon.createMany({
          data: addonIds.map((addonId) => ({
            applicationId,
            addonId,
            // Use the real price from PlanAddon; fall back to 0 if not found in this plan
            price: priceMap.get(addonId) ?? BigInt(0),
          })),
          skipDuplicates: true,
        });
      }

      // Compute addon total and update SelectedPlan
      const savedAddons = await this.prisma.selectedAddon.findMany({
        where: { applicationId },
        select: { price: true },
      });
      const addonTotal = savedAddons.reduce((sum, a) => sum + Number(a.price), 0);
      const basePremium = Number(selectedPlan.basePremium);
      const discountAmount = Number(selectedPlan.discountAmount);
      const gstAmount = Number(selectedPlan.gstAmount);
      await this.prisma.selectedPlan.update({
        where: { applicationId },
        data: {
          addonPremium: BigInt(addonTotal),
          totalPremium: BigInt(basePremium - discountAmount + gstAmount + addonTotal),
        },
      });

      await this.prisma.application.update({
        where: { id: applicationId },
        data: { currentStep: 'proposer' },
      });

      return { success: true, selectedCount: addonIds.length };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`selectAddons failed: ${msg}`);
      return { success: false, error: 'Failed to save add-on selection. Please try again.' };
    }
  }

  private async saveProposerDetails(
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    try {
      const applicationId = input['applicationId'] as string;
      const fullName = ((input['fullName'] as string) ?? '').trim();
      const email = input['email'] as string;

      const nameParts = fullName.split(/\s+/);
      const firstName = nameParts[0] ?? 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      await this.prisma.proposerDetails.upsert({
        where: { applicationId },
        create: {
          applicationId,
          firstName,
          lastName,
          email,
          // dob is intentionally omitted here (nullable after schema update);
          // it will be populated with the verified value during the KYC step
        },
        update: { firstName, lastName, email },
      });

      await this.prisma.application.update({
        where: { id: applicationId },
        data: { currentStep: 'payment', status: 'PAYMENT_PENDING' },
      });

      return { success: true, firstName, lastName, email };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`saveProposerDetails failed: ${msg}`);
      return { success: false, error: 'Failed to save your details. Please try again.' };
    }
  }

  private async initiatePayment(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const applicationId = input['applicationId'] as string;
      const app = await this.prisma.application.findUnique({
        where: { id: applicationId },
        include: { lead: true, selectedPlan: true },
      });

      if (!app || !app.selectedPlan) {
        return { success: false, error: 'Application or selected plan not found.' };
      }

      const totalAmount = Number(app.selectedPlan.totalPremium);
      const transactionId = `TXN-${Date.now()}`;

      await this.prisma.payment.upsert({
        where: { applicationId },
        create: {
          applicationId,
          amount: BigInt(totalAmount),
          status: 'INITIATED',
          transactionId,
        },
        update: {
          amount: BigInt(totalAmount),
          status: 'INITIATED',
          transactionId,
        },
      });

      await this.prisma.application.update({
        where: { id: applicationId },
        data: { currentStep: 'payment', status: 'PAYMENT_PENDING' },
      });

      return {
        success: true,
        applicationId,
        leadId: app.leadId,
        mobile: app.lead.mobile,
        totalAmount,
        transactionId,
        redirectPath: '/gateway',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`initiatePayment failed: ${msg}`);
      return { success: false, error: 'Failed to initiate payment. Please try again.' };
    }
  }
}
