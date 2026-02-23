import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

const STATIC_PROMPT = `You are PRUHealth Assistant — a friendly, knowledgeable guide for BuyOnline, Prudential's health insurance platform.

Your responsibilities:
- Explain health insurance plans, coverage, premiums, addons, and eligibility
- Help users compare plans and choose the right coverage for their needs
- Guide users step-by-step through the purchase journey
- Answer FAQs about claims, waiting periods, network hospitals, and policy terms

Response guidelines:
- Keep answers concise: 2–4 sentences, or a short bullet list when comparing
- Use ₹ (Indian Rupee) for all monetary values
- Be warm, professional, and reassuring — avoid jargon
- Never diagnose medical conditions or give clinical advice
- Never provide financial planning advice beyond plan comparisons
- Never mention competitor insurance products by name
- If a question is outside your scope, say: "For personalised advice, please speak to our advisor at 1800-123-4567"

Action markers (optional):
- When recommending a specific plan, you MAY append an action marker at the very end of your response:
  [ACTIONS:Get Premier Quote|What plans do you offer?, Compare all plans|Compare Premier vs Signature]
- Use action markers ONLY when there is a clear next step the user can take
- Format: [ACTIONS:Button Label|message to send, Another Label|another message]
- Maximum 3 actions per response; keep labels short (2–4 words)`;

@Injectable()
export class ContextBuilderService {
  constructor(private readonly prisma: PrismaService) {}

  async build(applicationId?: string): Promise<string> {
    const [planContext, userContext] = await Promise.all([
      this.buildPlanContext(),
      applicationId ? this.buildUserContext(applicationId) : Promise.resolve(''),
    ]);

    return [STATIC_PROMPT, planContext, userContext].filter(Boolean).join('\n\n');
  }

  private async buildPlanContext(): Promise<string> {
    const plans = await this.prisma.plan.findMany({
      where: { isActive: true },
      include: {
        pricingTiers: {
          where: { tenureMonths: 12 },
          orderBy: { sumInsured: 'asc' },
          take: 4,
        },
        addons: { include: { addon: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const sections = plans.map((plan) => {
      const features = plan.features as Record<string, string>;
      const featureList = Object.entries(features)
        .map(([k, v]) => `  • ${k}: ${v}`)
        .join('\n');

      const pricing = plan.pricingTiers
        .map((t) => `    ₹${Number(t.basePremium).toLocaleString('en-IN')}/yr for ${Number(t.sumInsured) / 100000}L`)
        .join(', ');

      const addons = plan.addons
        .map((a) => `${a.addon.name} (+₹${Number(a.price).toLocaleString('en-IN')}/yr)`)
        .join(', ');

      return `${plan.name} (${plan.tier}):\n${featureList}\n  Pricing (1yr): ${pricing}\n  Optional addons: ${addons}`;
    });

    return `---\nAvailable Plans:\n\n${sections.join('\n\n')}`;
  }

  private async buildUserContext(applicationId: string): Promise<string> {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        members: true,
        selectedPlan: { include: { plan: true } },
      },
    });

    if (!app) return '';

    const lines: string[] = [`---\nCurrent user context:`, `• Journey step: ${app.currentStep}`];

    if (app.members.length > 0) {
      const memberList = app.members.map((m) => `${m.label} (age ${m.age})`).join(', ');
      lines.push(`• Members: ${memberList}`);
    }

    if (app.selectedPlan) {
      const sp = app.selectedPlan;
      lines.push(
        `• Selected plan: ${sp.plan.name}, ₹${Number(sp.sumInsured) / 100000}L, ${sp.tenureMonths / 12} year(s)`,
        `• Total premium: ₹${Number(sp.totalPremium).toLocaleString('en-IN')}`,
      );
    }

    return lines.join('\n');
  }
}
