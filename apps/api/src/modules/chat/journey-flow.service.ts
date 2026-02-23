import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Response } from 'express';
import { AgenticAuthToolsService } from './agentic-auth-tools.service.js';
import { AgenticPlanToolsService } from './agentic-plan-tools.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

// ─── Types ────────────────────────────────────────────────────────────────────

type FlowPhase =
  | 'greeting' | 'members' | 'age' | 'mobile'
  | 'otp_sent' | 'otp_verify' | 'pincode'
  | 'pre_existing' | 'plan_selection' | 'addon_selection' | 'complete';

interface Members { self: boolean; spouse: boolean; kidsCount: number }

interface FlowState {
  phase: FlowPhase;
  members?: Members;
  eldestAge?: number;
  mobile?: string;
  leadId?: string;
  applicationId?: string;
  pincode?: string;
  preExisting?: string[];
  planId?: string;
  planName?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseMembers(msg: string): Members | null {
  const q = msg.toLowerCase();

  // Detect kids count
  let kidsCount = 0;
  const kidsMatch = q.match(/(\d+)\s*(kid|child|children|son|daughter)/);
  if (kidsMatch) kidsCount = Math.min(parseInt(kidsMatch[1]), 4);
  if (q.includes('family of 3')) kidsCount = 1;
  if (q.includes('family of 4') || q.includes('family of 4+')) kidsCount = 2;

  const hasSpouse =
    q.includes('wife') || q.includes('spouse') || q.includes('husband') ||
    q.includes('partner') || q.includes('family of') || kidsCount > 0;

  if (q.match(/^(just me|just myself|only me|self only|me only|myself)$/i) || q === 'just myself') {
    return { self: true, spouse: false, kidsCount: 0 };
  }
  if (q.includes('myself') || q.includes('just me') || q.includes('only me') || q.includes('self only')) {
    return { self: true, spouse: hasSpouse, kidsCount };
  }

  // Quick replies
  if (q === 'self only') return { self: true, spouse: false, kidsCount: 0 };
  if (q === 'self + spouse') return { self: true, spouse: true, kidsCount: 0 };
  if (q === 'self + 2 kids') return { self: true, spouse: false, kidsCount: 2 };
  if (q === 'self + spouse + 2 kids') return { self: true, spouse: true, kidsCount: 2 };
  if (q === 'me and my spouse' || q === 'me and spouse') return { self: true, spouse: true, kidsCount: 0 };
  if (q.startsWith('family of')) return { self: true, spouse: true, kidsCount };
  if (q === 'family of 3') return { self: true, spouse: true, kidsCount: 1 };

  // Contains "me" or "i" → self is true
  if (q.includes(' me') || q.startsWith('me') || q.includes(' i ')) {
    return { self: true, spouse: hasSpouse, kidsCount };
  }

  // Fallback: if anything looks like a selection, make a default
  if (kidsCount > 0 || hasSpouse) {
    return { self: true, spouse: hasSpouse, kidsCount };
  }

  return null; // couldn't parse
}

function parseAge(msg: string): number | null {
  // Handle quick replies
  const q = msg.toLowerCase();
  if (q.includes('under 30')) return 28;
  if (q.includes('30') && q.includes('40')) return 35;
  if (q.includes('40') && q.includes('50')) return 45;
  if (q.includes('50+')) return 55;

  const match = msg.match(/\b(\d{1,2})\b/);
  if (match) {
    const age = parseInt(match[1]);
    if (age >= 18 && age <= 99) return age;
  }
  return null;
}

function parseMobile(msg: string): string | null {
  const cleaned = msg.replace(/\D/g, '');
  const mobile = cleaned.length === 10 ? cleaned : cleaned.slice(-10);
  if (/^[6-9]\d{9}$/.test(mobile)) return mobile;
  return null;
}

function parsePincode(msg: string): string | null {
  const match = msg.replace(/\D/g, '').match(/\d{6}/);
  return match ? match[0] : null;
}

function membersLabel(m: Members): string {
  const parts: string[] = [];
  if (m.self) parts.push('Self');
  if (m.spouse) parts.push('Spouse');
  if (m.kidsCount === 1) parts.push('1 Kid');
  if (m.kidsCount > 1) parts.push(`${m.kidsCount} Kids`);
  return parts.join(' + ') || 'Self';
}

function sse(res: Response, data: Record<string, unknown>) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

async function streamText(res: Response, text: string, delay = 18) {
  // Emit word-by-word for natural feel
  const words = text.split(' ');
  for (const word of words) {
    sse(res, { token: word + ' ' });
    await new Promise((r) => setTimeout(r, delay));
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class JourneyFlowService implements OnModuleDestroy {
  private readonly logger = new Logger(JourneyFlowService.name);
  private readonly REDIS_TTL = 3600; // 1 hour
  private readonly redis: Redis;
  private redisAvailable = true;

  constructor(
    private readonly config: ConfigService,
    private readonly authTools: AgenticAuthToolsService,
    private readonly planTools: AgenticPlanToolsService,
    private readonly prisma: PrismaService,
  ) {
    this.redis = new Redis(this.config.get<string>('REDIS_URL', 'redis://localhost:6379'), {
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    this.redis.on('error', () => { this.redisAvailable = false; });
    this.redis.on('connect', () => { this.redisAvailable = true; });
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  private stateKey(sessionId: string) {
    return `journey:flow:${sessionId}`;
  }

  private async loadState(sessionId: string): Promise<FlowState> {
    if (!this.redisAvailable) return { phase: 'greeting' };
    try {
      const raw = await this.redis.get(this.stateKey(sessionId));
      if (raw) return JSON.parse(raw) as FlowState;
    } catch { /* fall through */ }
    return { phase: 'greeting' };
  }

  private async saveState(sessionId: string, state: FlowState): Promise<void> {
    if (!this.redisAvailable) return;
    try {
      await this.redis.set(this.stateKey(sessionId), JSON.stringify(state), 'EX', this.REDIS_TTL);
    } catch { /* ignore */ }
  }

  async stream(sessionId: string, message: string, res: Response): Promise<void> {
    let state = await this.loadState(sessionId);
    this.logger.log(`[Journey] phase=${state.phase} msg="${message.slice(0, 60)}"`);

    try {
      state = await this.handlePhase(state, message, res);
      await this.saveState(sessionId, state);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[Journey] error: ${msg}`);
      await streamText(res, "Sorry, something went wrong. Please try again.");
    }

    sse(res, { stateUpdate: { phase: state.phase } });
    sse(res, { done: true });
    res.end();
  }

  private async handlePhase(state: FlowState, message: string, res: Response): Promise<FlowState> {
    switch (state.phase) {
      case 'greeting':
      case 'members':
        return this.handleMembers(state, message, res);

      case 'age':
        return this.handleAge(state, message, res);

      case 'mobile':
        return this.handleMobile(state, message, res);

      case 'otp_sent':
      case 'otp_verify':
        return this.handleOtp(state, message, res);

      case 'pincode':
        return this.handlePincode(state, message, res);

      case 'pre_existing':
        return this.handlePreExisting(state, message, res);

      case 'plan_selection':
        return this.handlePlanSelection(state, message, res);

      case 'addon_selection':
        return this.handleAddonSelection(state, message, res);

      default:
        await streamText(res, "Your application is complete. Redirecting...");
        return state;
    }
  }

  // ── Phase: Members ──────────────────────────────────────────────────────────

  private async handleMembers(state: FlowState, message: string, res: Response): Promise<FlowState> {
    const members = parseMembers(message);
    if (!members) {
      await streamText(res,
        "I didn't quite catch that. Could you tell me who you'd like to cover? " +
        "For example: \"Just myself\", \"Me and my spouse\", or \"Family of 4\"."
      );
      return { ...state, phase: 'members' };
    }

    const label = membersLabel(members);
    await streamText(res,
      `Got it — coverage for **${label}**. 👍\n\n` +
      `What's the age of the eldest member to be insured?`
    );

    sse(res, { stateUpdate: { members } });
    return { ...state, phase: 'age', members };
  }

  // ── Phase: Age ──────────────────────────────────────────────────────────────

  private async handleAge(state: FlowState, message: string, res: Response): Promise<FlowState> {
    const age = parseAge(message);
    if (!age) {
      await streamText(res, "Please enter a valid age between 18 and 99.");
      return { ...state, phase: 'age' };
    }

    await streamText(res,
      `Thanks! Age noted as **${age} years**.\n\n` +
      `Now I'll need your **10-digit mobile number** to send you an OTP for verification.`
    );

    sse(res, { stateUpdate: { eldestAge: age } });
    return { ...state, phase: 'mobile', eldestAge: age };
  }

  // ── Phase: Mobile ───────────────────────────────────────────────────────────

  private async handleMobile(state: FlowState, message: string, res: Response): Promise<FlowState> {
    const mobile = parseMobile(message);
    if (!mobile) {
      await streamText(res,
        "That doesn't look like a valid Indian mobile number. " +
        "Please enter your 10-digit number starting with 6, 7, 8, or 9."
      );
      return { ...state, phase: 'mobile' };
    }

    // Create/get lead first, then send OTP
    const leadResult = await this.authTools.execute('create_or_get_lead', {
      mobile,
      members: state.members,
      eldestMemberAge: state.eldestAge,
    }) as Record<string, unknown>;

    if (!leadResult['success']) {
      await streamText(res, "Sorry, I couldn't save your information. Please try again.");
      return { ...state, phase: 'mobile' };
    }

    const leadId = leadResult['leadId'] as string;

    const otpResult = await this.authTools.execute('send_otp', { mobile }) as Record<string, unknown>;
    if (!otpResult['success']) {
      await streamText(res, "Couldn't send OTP right now. Please try again in a moment.");
      return { ...state, phase: 'mobile' };
    }

    // Dev: log OTP if available
    if (otpResult['devOtp']) {
      this.logger.log(`[DEV] OTP for ${mobile}: ${otpResult['devOtp']}`);
    }

    await streamText(res,
      `An OTP has been sent to **+91 ${mobile}**.\n\n` +
      `Please enter the 6-digit code below to continue.`
    );

    sse(res, { stateUpdate: { mobile, phase: 'otp_sent' } });
    return { ...state, phase: 'otp_sent', mobile, leadId };
  }

  // ── Phase: OTP ──────────────────────────────────────────────────────────────

  private async handleOtp(state: FlowState, message: string, res: Response): Promise<FlowState> {
    const otp = message.replace(/\D/g, '').slice(0, 6);
    if (otp.length !== 6) {
      await streamText(res, "Please enter the complete 6-digit OTP sent to your mobile.");
      return { ...state, phase: 'otp_sent' };
    }

    const verifyResult = await this.authTools.execute('verify_otp', {
      mobile: state.mobile,
      otp,
    }) as Record<string, unknown>;

    if (!verifyResult['success']) {
      await streamText(res,
        "That OTP doesn't match. Please check the code sent to your mobile and try again. " +
        "(Tip: use **123456** in demo mode)"
      );
      return { ...state, phase: 'otp_sent' };
    }

    // Create application
    const appResult = await this.authTools.execute('create_application', {
      leadId: state.leadId ?? verifyResult['leadId'],
    }) as Record<string, unknown>;

    if (!appResult['success']) {
      await streamText(res, "Verified! But I had trouble setting up your application. Please try again.");
      return { ...state, phase: 'otp_verify' };
    }

    const applicationId = appResult['applicationId'] as string;

    await streamText(res,
      `✅ **Mobile verified!** You're all set.\n\n` +
      `Now, what's your **6-digit pincode**? This helps us find nearby network hospitals for you.`
    );

    sse(res, { stateUpdate: { phase: 'pincode' } });
    return { ...state, phase: 'pincode', leadId: state.leadId ?? (verifyResult['leadId'] as string), applicationId };
  }

  // ── Phase: Pincode ──────────────────────────────────────────────────────────

  private async handlePincode(state: FlowState, message: string, res: Response): Promise<FlowState> {
    const pincode = parsePincode(message);
    if (!pincode) {
      await streamText(res, "Please enter a valid 6-digit pincode.");
      return { ...state, phase: 'pincode' };
    }

    await this.authTools.execute('update_pincode', {
      applicationId: state.applicationId,
      pincode,
    });

    // Simulate hospital count lookup
    const hospitalCount = 40 + Math.floor(Math.random() * 200);

    await streamText(res,
      `Great! We found **${hospitalCount}+ network hospitals** near pincode ${pincode}. 🏥\n\n` +
      `Do you or any family member have any **pre-existing medical conditions**?\n\n` +
      `Examples: Diabetes, Hypertension, Thyroid, Heart condition. Or just say **"None"**.`
    );

    sse(res, { stateUpdate: { pincode, hospitalCount } });
    return { ...state, phase: 'pre_existing', pincode };
  }

  // ── Phase: Pre-existing ─────────────────────────────────────────────────────

  private async handlePreExisting(state: FlowState, message: string, res: Response): Promise<FlowState> {
    const q = message.toLowerCase();
    const isNone = q.includes('none') || q.includes('no condition') || q.includes('healthy') || q.includes('nothing');

    let conditions: string[] = [];
    if (!isNone) {
      // Extract comma-separated conditions
      conditions = message.split(/[,;]/).map((s) => s.trim()).filter((s) => s.length > 2);
      if (conditions.length === 0) conditions = [message.trim()];
    }

    await this.authTools.execute('declare_pre_existing', {
      applicationId: state.applicationId,
      conditions,
    });

    // Fetch plan recommendations
    const plans = await this.getRecommendedPlans(state);

    if (plans.length === 0) {
      await streamText(res,
        "Based on your profile, here are the plans available. " +
        "Please visit our plan page to explore options."
      );
      return { ...state, phase: 'plan_selection', preExisting: conditions };
    }

    const conditionSummary = conditions.length > 0
      ? `Noted — I've recorded: **${conditions.join(', ')}**.\n\n`
      : `No pre-existing conditions noted — that's great! 🎉\n\n`;

    let planText = conditionSummary + `Here are the **best plans** for your profile:\n\n`;
    plans.forEach((p, i) => {
      planText += `**${i + 1}. ${p.name}**\n`;
      planText += `   • Sum Insured: ${p.siLabel}\n`;
      planText += `   • Annual Premium: ₹${p.premium.toLocaleString('en-IN')}\n`;
      planText += `   • ${p.highlight}\n\n`;
    });
    planText += `Which plan would you like? Reply with **1**, **2**, or the plan name.`;

    await streamText(res, planText);

    sse(res, { stateUpdate: { preExisting: conditions } });
    return { ...state, phase: 'plan_selection', preExisting: conditions };
  }

  // ── Phase: Plan Selection ───────────────────────────────────────────────────

  private async handlePlanSelection(state: FlowState, message: string, res: Response): Promise<FlowState> {
    const plans = await this.getRecommendedPlans(state);
    const q = message.toLowerCase();

    let selectedPlan = plans[0]; // default to first
    if (q.includes('2') || q.includes('second') || q.includes('mid')) selectedPlan = plans[1] ?? plans[0];
    if (q.includes('3') || q.includes('third') || q.includes('premium') || q.includes('best')) selectedPlan = plans[2] ?? plans[0];
    if (q.includes('1') || q.includes('first') || q.includes('basic') || q.includes('affordable')) selectedPlan = plans[0];

    // Match by plan name keyword
    for (const p of plans) {
      if (q.includes(p.name.toLowerCase())) { selectedPlan = p; break; }
    }

    const result = await this.planTools.execute('select_plan', {
      applicationId: state.applicationId,
      planId: selectedPlan.id,
      sumInsured: selectedPlan.sumInsured,
      coverageLevel: (state.members?.spouse || (state.members?.kidsCount ?? 0) > 0) ? 'FLOATER' : 'INDIVIDUAL',
      tenureMonths: 12,
    }) as Record<string, unknown>;

    if (!result['success']) {
      await streamText(res, "I couldn't lock in that plan. Please try selecting again.");
      return { ...state, phase: 'plan_selection' };
    }

    const premium = result['totalPremium'] as number;

    await streamText(res,
      `✅ **${result['planName']}** selected!\n\n` +
      `Annual premium: **₹${(premium as number).toLocaleString('en-IN')}**\n\n` +
      `Would you like to add any optional riders? These enhance your coverage:\n\n` +
      `• **Hospital Cash** — Daily cash allowance during admission\n` +
      `• **Critical Illness** — Lump sum on diagnosis of 40+ critical illnesses\n` +
      `• **OPD Care** — Covers doctor consultations & medicines\n\n` +
      `Type the add-ons you want, or say **"Skip"** to proceed without any.`
    );

    return {
      ...state,
      phase: 'addon_selection',
      planId: selectedPlan.id,
      planName: selectedPlan.name,
    };
  }

  // ── Phase: Addon Selection ──────────────────────────────────────────────────

  private async handleAddonSelection(state: FlowState, message: string, res: Response): Promise<FlowState> {
    const q = message.toLowerCase();
    const skip = q.includes('skip') || q.includes('no') || q.includes('none') || q.includes("don't");

    let addonIds: string[] = [];
    if (!skip) {
      // Resolve addon IDs by name match from DB
      try {
        const allAddons = await this.prisma.addon.findMany({ where: { isActive: true }, take: 10 });
        for (const addon of allAddons) {
          if (q.includes(addon.name.toLowerCase().slice(0, 5))) {
            addonIds.push(addon.id);
          }
        }
      } catch { /* ignore */ }
    }

    await this.planTools.execute('select_addons', {
      applicationId: state.applicationId,
      addonIds,
    });

    // Initiate payment
    const paymentResult = await this.planTools.execute('initiate_payment', {
      applicationId: state.applicationId,
    }) as Record<string, unknown>;

    if (!paymentResult['success']) {
      await streamText(res, "Add-ons saved! There was a hiccup initiating payment — please proceed manually.");
      sse(res, { redirect: { path: '/proposer' } });
      return { ...state, phase: 'complete' };
    }

    await streamText(res,
      `${addonIds.length > 0 ? `Add-ons added! ` : `No problem — `}` +
      `Your application is ready. 🎉\n\n` +
      `Redirecting you to complete payment...`
    );

    sse(res, {
      handoff: {
        applicationId: paymentResult['applicationId'],
        leadId: paymentResult['leadId'],
        mobile: paymentResult['mobile'],
        redirectPath: '/gateway',
      },
    });

    return { ...state, phase: 'complete' };
  }

  // ── Plan Recommendation ─────────────────────────────────────────────────────

  /** Pick a recommended sum insured based on age */
  private recommendedSI(age: number): number {
    if (age < 30) return 500000;      // ₹5L
    if (age < 40) return 1000000;     // ₹10L
    if (age < 50) return 2500000;     // ₹25L
    return 5000000;                   // ₹50L
  }

  private async getRecommendedPlans(state: FlowState) {
    try {
      const age = state.eldestAge ?? 30;
      const isFamily = (state.members?.spouse || (state.members?.kidsCount ?? 0) > 0);
      const coverageLevel = isFamily ? 'FLOATER' : 'INDIVIDUAL';
      const targetSI = BigInt(this.recommendedSI(age));

      // Fetch all 3 plans at the recommended SI tier (12-month tenure)
      const pricings = await this.prisma.planPricing.findMany({
        where: {
          coverageLevel: coverageLevel as 'INDIVIDUAL' | 'FLOATER',
          tenureMonths: 12,
          sumInsured: targetSI,
        },
        include: { plan: true },
        orderBy: { basePremium: 'asc' },
      });

      if (pricings.length === 0) {
        // Fallback: nearest SI tier
        const fallback = await this.prisma.planPricing.findMany({
          where: { coverageLevel: coverageLevel as 'INDIVIDUAL' | 'FLOATER', tenureMonths: 12 },
          include: { plan: true },
          orderBy: [{ sumInsured: 'asc' }, { basePremium: 'asc' }],
          take: 9,
        });
        const seen = new Set<string>();
        const unique = fallback.filter((p) => {
          if (seen.has(p.planId)) return false;
          seen.add(p.planId);
          return true;
        });
        return unique.slice(0, 3).map((p) => this.toPlanOption(p));
      }

      return pricings.slice(0, 3).map((p) => this.toPlanOption(p));
    } catch (err) {
      this.logger.warn(`Plan fetch failed: ${err instanceof Error ? err.message : err}`);
      return [
        { id: 'plan-premier', name: 'PRUHealth Premier', sumInsured: 1000000, siLabel: '₹10 Lakh', premium: 12500, highlight: 'Essential coverage, great value' },
        { id: 'plan-signature', name: 'PRUHealth Signature', sumInsured: 1000000, siLabel: '₹10 Lakh', premium: 18500, highlight: 'Enhanced benefits, no room limit' },
        { id: 'plan-global', name: 'PRUHealth Global', sumInsured: 1000000, siLabel: '₹10 Lakh', premium: 28000, highlight: 'Worldwide coverage, no limits' },
      ];
    }
  }

  private toPlanOption(p: { planId: string; plan: { name: string; tier: string }; sumInsured: bigint; sumInsuredLabel: string; basePremium: bigint }) {
    return {
      id: p.planId,
      name: p.plan.name,
      sumInsured: Number(p.sumInsured),
      siLabel: p.sumInsuredLabel,
      premium: Number(p.basePremium),   // stored in rupees, display as-is
      highlight: p.plan.tier === 'PREMIER' ? 'Essential coverage, great value'
        : p.plan.tier === 'SIGNATURE' ? 'Enhanced benefits, no room rent limit'
        : 'Worldwide coverage, no limits',
    };
  }
}
