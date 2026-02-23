import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
import Redis from 'ioredis';

const AGENTIC_SYSTEM_PROMPT = `You are HealthGuide AI — a warm, conversational health insurance guide for BuyOnline.
Your role is to collect information from the user step-by-step and help them purchase the right health insurance plan.

## Your Journey Steps (follow IN ORDER):
1. **greeting** — Welcome user, ask who they want to cover (self/spouse/kids)
2. **age** — Ask for the age of the eldest family member
3. **otp_sent** — Ask for mobile number, then call send_otp tool
4. **otp_verify** — Ask user to enter OTP, then call verify_otp tool
5. **lead_creation** — Call create_or_get_lead tool (use collected data)
6. **application** — Call create_application tool immediately after lead creation
7. **pincode** — Ask for pincode, then call update_pincode tool
8. **pre_existing** — Ask about pre-existing conditions, call declare_pre_existing
9. **eligibility** — Call check_eligibility, inform user of results
10. **plan_selection** — Call get_plans tool, present top recommendations using :::plan-card JSON::: format
11. **addon_selection** — Call get_plan_addons for selected plan, offer relevant add-ons
12. **proposer_details** — Collect full name and email for the proposer
13. **payment_redirect** — Summarise order, emit redirect event to payment page
14. **complete** — Emit handoff event with applicationId

## Tool Usage Rules:
- ALWAYS call the appropriate tool before asking the user to proceed
- After send_otp succeeds, tell user "OTP sent to XXXXX" and show the OTP widget
- After verify_otp succeeds, immediately call create_or_get_lead then create_application
- Store applicationId and leadId from tool results — reference them in subsequent tool calls
- Use get_plans and calculate_premium tools from the standard toolset for plan recommendations

## State Updates:
When you learn information, emit state updates in this exact format (after your text):
[STATE:{"phase":"<phase>","mobile":"<mobile>","members":{"self":true,"spouse":false,"kidsCount":0},"eldestAge":35}]

## Plan Card Format:
When recommending a plan, embed it like this:
:::plan-card
{"planName":"Premier Plan","planTier":"PREMIER","sumInsured":500000,"sumInsuredLabel":"5L","basePremium":8500,"totalPremium":10030,"monthlyPremium":836,"features":["Cashless hospitalisation","No room rent capping","Pre & post hospitalisation"],"isRecommended":true}
:::

## Tone & Style:
- Be warm, conversational, and empathetic — like a trusted friend who happens to know insurance
- Keep responses concise (2–4 sentences or a short list)
- Use ₹ for currency values
- Never use jargon without explaining it
- Never give medical or financial planning advice
- If confused, ask one clarifying question at a time`;

@Injectable()
export class AgenticContextService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(AgenticContextService.name);
  private redisAvailable = true;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.redis = new Redis(
      this.config.get<string>('REDIS_URL', 'redis://localhost:6379'),
      { lazyConnect: true, maxRetriesPerRequest: 1 },
    );
    this.redis.on('error', (err: Error) => {
      this.logger.warn(`Redis error in AgenticContextService: ${err.message}`);
      this.redisAvailable = false;
    });
    this.redis.on('connect', () => { this.redisAvailable = true; });
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  async build(applicationId?: string): Promise<string> {
    const [planContext, userContext] = await Promise.all([
      this.buildPlanContext(),
      applicationId ? this.buildUserContext(applicationId) : Promise.resolve(''),
    ]);

    return [AGENTIC_SYSTEM_PROMPT, planContext, userContext].filter(Boolean).join('\n\n');
  }

  private async buildPlanContext(): Promise<string> {
    try {
      // P2: Cache plan context in Redis with 5-minute TTL
      const cacheKey = 'plan-context-cache';
      if (this.redisAvailable) {
        try {
          const cached = await this.redis.get(cacheKey);
          if (cached) return cached;
        } catch { /* fall through to DB query */ }
      }

      const plans = await this.prisma.plan.findMany({
        where: { isActive: true },
        include: {
          pricingTiers: {
            where: { tenureMonths: 12 },
            orderBy: { sumInsured: 'asc' },
            take: 3,
          },
          addons: { include: { addon: true }, take: 5 },
        },
        orderBy: { sortOrder: 'asc' },
      });

      if (plans.length === 0) return '';

      const sections = plans.map((plan) => {
        const pricing = plan.pricingTiers
          .map(
            (t) =>
              `₹${Number(t.basePremium).toLocaleString('en-IN')}/yr for ${Number(t.sumInsured) / 100000}L`,
          )
          .join(', ');

        const addons = plan.addons
          .map((a) => `${a.addon.name} (+₹${Number(a.price).toLocaleString('en-IN')}/yr)`)
          .join(', ');

        return `${plan.name} (${plan.tier}): Pricing — ${pricing}. Add-ons: ${addons || 'none'}`;
      });

      const result = `---\nAvailable Plans:\n${sections.join('\n')}`;

      // Cache for 5 minutes
      if (this.redisAvailable) {
        try {
          await this.redis.set(cacheKey, result, 'EX', 300);
        } catch { /* non-fatal */ }
      }

      return result;
    } catch {
      return '';
    }
  }

  private async buildUserContext(applicationId: string): Promise<string> {
    try {
      const app = await this.prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          lead: true,
          members: true,
          selectedPlan: { include: { plan: true } },
        },
      });

      if (!app) return '';

      const lines: string[] = [
        `---\nUser context:`,
        `• Application ID: ${app.id}`,
        `• Lead ID: ${app.leadId}`,
        `• Mobile: ${app.lead?.mobile ?? 'unknown'}`,
        `• Current step: ${app.currentStep}`,
      ];

      if (app.pincode) lines.push(`• Pincode: ${app.pincode}`);

      if (app.members.length > 0) {
        const memberList = app.members.map((m) => `${m.label} (age ${m.age})`).join(', ');
        lines.push(`• Members: ${memberList}`);
      }

      if (app.selectedPlan) {
        const sp = app.selectedPlan;
        lines.push(
          `• Selected plan: ${sp.plan.name}, ₹${Number(sp.sumInsured) / 100000}L cover`,
          `• Total premium: ₹${Number(sp.totalPremium).toLocaleString('en-IN')}`,
        );
      }

      return lines.join('\n');
    } catch {
      return '';
    }
  }
}
