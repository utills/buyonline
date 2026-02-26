import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
import Redis from 'ioredis';

const AGENTIC_SYSTEM_PROMPT = `You are HealthGuide AI — a warm, conversational health insurance guide for BuyOnline.
Your role is to collect information from the user step-by-step and help them purchase the right health insurance plan.

CRITICAL RULES:
- You have ALREADY greeted the user (see conversation history). Do NOT greet again or re-introduce yourself.
- Follow the steps STRICTLY in order. NEVER go backward to a previous step.
- Ask ONE question at a time. Do NOT ask multiple questions in one response.
- When you collect a piece of information, acknowledge it and move to the NEXT step immediately.

## Your Journey Steps (follow STRICTLY in order — never skip or go back):
1. **greeting** — ALREADY DONE. The user's first message answers "who they want to cover".
2. **age** — Acknowledge their member selection, then ask for the age of the eldest family member. Accept any number (e.g. "29", "35", "30-40 years" means ~35).
3. **otp_sent** — Acknowledge their age, ask for their 10-digit mobile number. When they provide it, call send_otp tool. Then say "OTP sent to [number]!" and ask them to enter the OTP.
4. **otp_verify** — The user will enter their OTP (a 4-6 digit number). Call verify_otp with their mobile and the OTP digits. Do NOT call send_otp again.
5. **lead_creation** — After OTP verified, immediately call create_or_get_lead (with mobile, members, eldestAge).
6. **application** — Immediately call create_application with the leadId. Do not ask the user anything.
7. **pincode** — Ask for their 6-digit pincode, then call update_pincode.
8. **pre_existing** — Ask about any pre-existing medical conditions, then call declare_pre_existing.
9. **eligibility** — Call check_eligibility, inform user of results.
10. **plan_selection** — Call get_plans, present top recommendations using :::plan-card JSON::: format.
11. **addon_selection** — Call get_plan_addons for the selected plan, offer relevant add-ons.
12. **proposer_details** — Collect full name and email for the proposer.
13. **payment_redirect** — Summarise order, emit redirect event to payment page.
14. **complete** — Emit handoff event with applicationId.

## Tool Usage Rules:
- ALWAYS call the appropriate tool at the right step.
- After send_otp succeeds, say "OTP sent to [number]!" — the frontend shows an OTP input widget.
- CRITICAL: When the user sends a message containing digits (like "123456" or "My OTP is: 123456"), extract the digits and call verify_otp. NEVER call send_otp again unless the user explicitly says "resend".
- After verify_otp succeeds, immediately call create_or_get_lead, then create_application in the SAME turn (chain both tool calls).
- Store applicationId and leadId from tool results — use them in all subsequent tool calls.
- Steps 5-6 (lead_creation + application) should happen automatically after OTP — do NOT ask the user anything, just call the tools.

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
    const [planContext, userContext, configContext] = await Promise.all([
      this.buildPlanContext(),
      applicationId ? this.buildUserContext(applicationId) : Promise.resolve(''),
      this.buildConfigContext(),
    ]);

    return [AGENTIC_SYSTEM_PROMPT, configContext, planContext, userContext].filter(Boolean).join('\n\n');
  }

  private async buildConfigContext(): Promise<string> {
    try {
      const record = await this.prisma.journeyConfiguration.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' },
      });
      if (!record?.config) return '';

      const cfg = record.config as {
        phases?: Array<{ id: string; label: string; enabled: boolean; steps: Array<{ id: string; label: string; route: string; enabled: boolean }> }>;
        plans?: Array<{ planId: string; enabled: boolean }>;
        addons?: Array<{ addonId: string; enabled: boolean }>;
        featureFlags?: Record<string, boolean>;
      };

      const lines: string[] = ['---\nJourney Configuration (from admin):'];

      // Disabled steps
      const disabledSteps: string[] = [];
      (cfg.phases ?? []).forEach((phase) => {
        if (!phase.enabled) {
          disabledSteps.push(`${phase.label} (entire phase)`);
        } else {
          phase.steps.filter((s) => !s.enabled).forEach((s) => disabledSteps.push(s.label));
        }
      });
      if (disabledSteps.length > 0) {
        lines.push(`SKIP these steps (disabled by admin): ${disabledSteps.join(', ')}`);
      } else {
        lines.push('All journey steps are enabled.');
      }

      // Disabled plans
      const disabledPlans = (cfg.plans ?? []).filter((p) => !p.enabled).map((p) => p.planId);
      if (disabledPlans.length > 0) {
        lines.push(`Do NOT recommend these plan IDs: ${disabledPlans.join(', ')}`);
      }

      // Disabled addons
      const disabledAddons = (cfg.addons ?? []).filter((a) => !a.enabled).map((a) => a.addonId);
      if (disabledAddons.length > 0) {
        lines.push(`Do NOT offer these addon IDs: ${disabledAddons.join(', ')}`);
      }

      return lines.join('\n');
    } catch {
      return '';
    }
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
