import {
  PLAN_META,
  ADDONS,
  DISCOUNTS,
  INSTALLMENT_LOADING,
  ZONE_GUIDE,
  FAMILY_GUIDE,
  BUSINESS_RULES,
  applyGst,
  lookupPremium,
  formatMoney,
  parseSI,
  parseAge,
  parseZone,
  parseFamily,
  parsePlan,
} from './fallback-data.js';

// ─── Local helpers ─────────────────────────────────────────────────────────────
function matchesKeywords(query: string, keywords: string[]): boolean {
  return keywords.some((kw) => query.includes(kw));
}

// ─── Response Handlers ────────────────────────────────────────────────────────
export function greeting(): string {
    return `Hello! I'm the PRUHealth Assistant. I can help you with:\n\n• **Plan details** — PHI Basic, POSP, Flagship 1/2/3/4, Global plans, Senior & Sub-Standard\n• **Premium quotes** — Ask "How much for PHI Basic, age 35, Zone 2, ₹10L?"\n• **Add-ons** — Maternity, Critical Illness, Personal Accident, and 20+ more\n• **Discounts** — Tenure, CIBIL, NRI, Auto Debit, and more\n• **Claims & KYC process**\n• **Zones, family types, eligibility**\n\nWhat would you like to know?`;
  }

export function premiumLookup(message: string): string {
    const age = parseAge(message);
    const si = parseSI(message);
    const plan = parsePlan(message) || 'PHI Basic';
    const zone = parseZone(message);
    const family = parseFamily(message);

    if (!age || !si) {
      return `To calculate your premium, I need a few details:\n\n• **Plan** — which plan? (PHI Basic, Flagship 1/2/3/4, Global, etc.)\n• **Age** — how old is the eldest member?\n• **Sum Insured** — e.g. ₹5L, ₹10L, ₹20L\n• **Zone** — your city/zone (Zone 1=Metro, Zone 2=Tier-1, Zone 3/4=smaller cities)\n• **Family type** — 1A (individual), 2A (couple), 2A2C (2 adults + 2 kids), etc.\n\n**Example:** "How much for PHI Basic, age 35, Zone 2, ₹10L, individual?"`;
    }

    const basePremium = lookupPremium(plan, family, zone, age, si);
    if (!basePremium) {
      return `I couldn't find an exact match for **${plan}**, ${family}, ${zone}, age ${age}, ${formatMoney(si)}.\n\nPlease check: the SI range for this plan is **${PLAN_META[plan]?.siRange || 'unknown'}**, and eligible age is **${PLAN_META[plan]?.eligibleAge || 'unknown'}**.\n\nTry a different combination or call **1800-123-4567** for an exact quote.`;
    }

    const withGst = applyGst(basePremium);
    const tenureRows = [
      { yr: 1, disc: 0, base: basePremium },
      { yr: 2, disc: 0.075, base: basePremium },
      { yr: 3, disc: 0.10, base: basePremium },
      { yr: 5, disc: 0.15, base: basePremium },
    ].map(r => {
      const afterDisc = Math.round(r.base * (1 - r.disc));
      const total = applyGst(afterDisc * r.yr);
      const perYear = Math.round(total / r.yr);
      return `• **${r.yr} year${r.yr > 1 ? 's' : ''}**: ₹${perYear.toLocaleString('en-IN')}/year (total ₹${total.toLocaleString('en-IN')}${r.disc > 0 ? `, saves ${r.disc * 100}%` : ''})`;
    }).join('\n');

    return `**Premium Quote — ${plan}**\n\n| Detail | Value |\n|---|---|\n| Plan | ${plan} |\n| Family | ${family} (${FAMILY_GUIDE[family] || family}) |\n| Zone | ${zone} |\n| Age | ${age} years |\n| Sum Insured | ${formatMoney(si)} |\n\n**Base Premium (excl. GST):** ₹${basePremium.toLocaleString('en-IN')}/year\n**With GST (18%):** ₹${withGst.toLocaleString('en-IN')}/year\n\n**Multi-year pricing (incl. GST):**\n${tenureRows}\n\n_This is the base plan premium only. Add-ons (maternity, critical illness, etc.) and loadings/discounts will vary your final premium._\n\nCall **1800-123-4567** or visit our plans page for a complete quote.`;
  }

export function plansOverview(): string {
    const domestic = ['PHI Basic','PHI POSP','PHI Flagship 1','PHI Flagship 2/3','PHI Flagship 4 (PB)'];
    const global = ['PHI Global Excl US/Canada','PHI Global Asia Excl India','PHI Global Europe','PHI Global Plus Incl US/Canada','PHI Global Plus Excl US/Canada','PHI Global Plus Asia Excl India','PHI Global Plus Europe'];
    const special = ['PHI Sub Standard','PHI Senior'];

    const fmt = (plans: string[]) => plans.map(p => {
      const m = PLAN_META[p];
      return `**${p}**\n  SI: ${m.siRange} | Age: ${m.eligibleAge}\n  ${m.highlights[0]}`;
    }).join('\n\n');

    return `We offer **14 health insurance plans** across 3 categories:\n\n━━ **Domestic Plans** ━━\n${fmt(domestic)}\n\n━━ **Global Plans** ━━\n${fmt(global)}\n\n━━ **Specialised Plans** ━━\n${fmt(special)}\n\nAsk me about any specific plan for full details, or ask for a premium quote!`;
  }

export function comparePlans(message: string): string {
    const q = message.toLowerCase();
    // Check if comparing specific plans
    const planA = parsePlan(message.split(/\s+vs\s+|\s+versus\s+|\s+and\s+/i)[0]);
    const planB = parsePlan(message.split(/\s+vs\s+|\s+versus\s+|\s+and\s+/i)[1] || '');

    if (planA && planB && planA !== planB) {
      const mA = PLAN_META[planA];
      const mB = PLAN_META[planB];
      return `**${planA} vs ${planB}**\n\n| Feature | ${planA} | ${planB} |\n|---|---|---|\n| Sum Insured | ${mA.siRange} | ${mB.siRange} |\n| Eligible Age | ${mA.eligibleAge} | ${mB.eligibleAge} |\n| Zones | ${mA.zones} | ${mB.zones} |\n| Key Benefit | ${mA.highlights[0]} | ${mB.highlights[0]} |\n\n**${planA}:** ${mA.desc}\n**${planB}:** ${mB.desc}\n\nWant a premium quote for either plan? Just ask!`;
    }

    // General comparison — domestic plans
    return `**Domestic Plan Comparison:**\n\n| Feature | PHI Basic | Flagship 1 | Flagship 2/3 | Flagship 4 (PB) |\n|---|---|---|---|---|\n| Max SI | ₹1Cr | ₹10L | ₹20L | ₹1Cr |\n| Min Age | 5 | 5 | 5 | 5 |\n| Maternity | ✗ | ✓ | ✓ | ✓ |\n| Infertility | ✗ | ✗ | ✓ | ✓ |\n| Cashless OPD | ✗ | Limited | ✓ | ✓ |\n| Chronic Mgmt | ✓ | ✓ | ✓ | ✓ |\n| Double Cover 7yr | ✗ | ✗ | ✗ | ✓ |\n\n**When to choose:**\n• **PHI Basic** — Budget-conscious, SI up to ₹1Cr, all age groups\n• **Flagship 1** — Families needing maternity, SI up to ₹10L\n• **Flagship 2/3** — Comprehensive coverage, SI up to ₹20L\n• **Flagship 4 (PB)** — Priority Banking customers, maximum SI ₹1Cr\n\nWant me to compare Global plans too, or give a premium quote?`;
  }

export function planDetails(plan: string): string {
    const m = PLAN_META[plan];
    if (!m) return `I don't have details for "${plan}". Available plans: ${Object.keys(PLAN_META).join(', ')}`;
    return `**${plan}**\n\n${m.desc}\n\n| Detail | Value |\n|---|---|\n| Sum Insured | ${m.siRange} |\n| Eligible Age | ${m.eligibleAge} |\n| Zones | ${m.zones} |\n| Family Types | ${m.families} |\n\n**Key Highlights:**\n${m.highlights.map(h => `• ${h}`).join('\n')}\n\nWant a premium quote? Ask: "How much for ${plan}, age [X], Zone [Y], ₹[SI]?"`;
  }

export function addonsInfo(message: string): string {
    const q = message.toLowerCase();

    if (matchesKeywords(q, ['maternity', 'pregnancy', 'delivery', 'newborn', 'baby'])) {
      const m = ADDONS['Maternity & Newborn Expenses'];
      const prems = Object.entries(m.premiums).map(([limit, waits]) =>
        `  **${limit}:** ${Object.entries(waits as Record<string,string>).map(([w,p]) => `${w}: ${p}`).join(' | ')}`
      ).join('\n');
      return `**Maternity & Newborn Expenses Cover:**\n\n${m.desc}\n\n${prems}\n\n⚠️ ${m.note}\n\nAlso available: **Maternity Fixed Benefit** (lump sum) — ₹29,667–₹59,334/policy (3-year single-premium only)`;
    }

    if (matchesKeywords(q, ['critical illness', 'critical', 'ci cover'])) {
      const ci = ADDONS['Critical Illness Cover'];
      const rates = Object.entries(ci.rate_per_1000_SI).map(([ab, r]) => `${ab}: ${r}`).join(' | ');
      return `**Critical Illness Cover:**\n\n${ci.desc}\n\n**Rate (₹ per ₹1,000 SI):** ${rates}\n\n**Example:** ${ci.example}\n\n⚠️ ${ci.note}`;
    }

    if (matchesKeywords(q, ['personal accident', 'accident cover', 'pa cover'])) {
      const pa = ADDONS['Personal Accident Cover'];
      const prems = Object.entries(pa.premiums).map(([si, p]) => `${si}: ${p}`).join(' | ');
      return `**Personal Accident Cover:**\n\n${pa.desc}\n\n**Premiums:** ${prems}\n\n⚠️ ${pa.note}`;
    }

    if (matchesKeywords(q, ['loyalty bonus', 'loyalty', 'sum insured increase', 'si increase'])) {
      const lb = ADDONS['Loyalty Bonus'];
      return `**Loyalty Bonus:**\n\n${lb.desc}\n\n**Variants:**\n${lb.variants.map(v => `• **${v.name}:** ${v.loading}`).join('\n')}\n\n💡 ${lb.note}`;
    }

    if (matchesKeywords(q, ['cancer', 'cancer booster', 'cancer screening', 'annual screening'])) {
      const cb = ADDONS['Cancer Booster'];
      const sc = ADDONS['Annual Cancer Screening'];
      return `**Cancer-related Covers:**\n\n**1. Cancer Booster:**\nAdditional SI for cancer treatment.\nAge ≤45: ${cb.loading['Age ≤45']}\nAge 46+: ${cb.loading['Age 46+']}\n\n**2. Annual Cancer Screening:**\n${sc.desc}\n${sc.premium}`;
    }

    if (matchesKeywords(q, ['chronic', 'chronic management', 'chronic condition'])) {
      const cm = ADDONS['Chronic Management'];
      const prems = Object.entries(cm.premiums).map(([k, v]) => `• ${k}: ${v}`).join('\n');
      return `**Chronic Management:**\n\n${cm.desc}\n\n${prems}\n\n⚠️ ${cm.note}`;
    }

    if (matchesKeywords(q, ['room rent', 'room upgrade', 'private room', 'single room'])) {
      const rr = ADDONS['Room Rent Modification'];
      return `**Room Rent Modification:**\n\n${rr.desc}\n\n${rr.variants.map(v => `• **${v.name}:** ${v.loading}`).join('\n')}`;
    }

    if (matchesKeywords(q, ['opd', 'outpatient', 'cashless opd'])) {
      const opd = ADDONS['Cashless OPD'];
      return `**Cashless OPD:**\n\n${opd.desc}\n\n${Object.entries(opd.premiums).map(([l, p]) => `• ${l}: ${p}`).join('\n')}`;
    }

    if (matchesKeywords(q, ['infertility', 'ivf'])) {
      const inf = ADDONS['Infertility Cover'];
      const prems = Object.entries(inf.premiums).map(([limit, waits]) =>
        `**${limit}:** ${Object.entries(waits as Record<string,string>).map(([w,p]) => `${w}: ${p}`).join(' | ')}`
      ).join('\n');
      return `**Infertility Cover:**\n\n${inf.desc}\n\n${prems}\n\n⚠️ ${inf.note}`;
    }

    if (matchesKeywords(q, ['daily cash', 'hospital cash', 'daily hospital'])) {
      const dhc = ADDONS['Daily Hospital Cash'];
      return `**Daily Hospital Cash:**\n\n${dhc.desc}\n\n**Sample premiums (per member/year):**\n${Object.entries(dhc.premiums_per_member).map(([limit, ages]) =>
        `**${limit}:** ${Object.entries(ages as Record<string,string>).slice(0,4).map(([a,p]) => `Age ${a}: ${p}`).join(' | ')}`
      ).join('\n')}`;
    }

    if (matchesKeywords(q, ['air ambulance'])) {
      return `**Air Ambulance:** ${ADDONS['Air Ambulance'].desc}\n**Premium:** ${ADDONS['Air Ambulance'].premium}`;
    }

    if (matchesKeywords(q, ['fitness', 'gym', 'wellness'])) {
      return `**Fitness Plus:** ${ADDONS['Fitness Plus'].desc}\n**Premium:** ${ADDONS['Fitness Plus'].premium}\n\n(Age 12+ for Multi-Individual/1A policies)`;
    }

    if (matchesKeywords(q, ['health check', 'checkup', 'screening', 'preventive'])) {
      return `**Advance Health Check-up:**\n• **Advance level:** ${ADDONS['Advance Health Check-up (Advance)'].premium} — comprehensive tests + consultation\n• **Basic level:** ${ADDONS['Advance Health Check-up (Basic)'].premium} — standard panel\n\n⚠️ Only for adults in Floater policy`;
    }

    // All add-ons overview
    const addonNames = Object.keys(ADDONS);
    return `We offer **${addonNames.length} optional add-ons:**\n\n**Coverage Enhancements:**\n• Loyalty Bonus, Restoration Plus, Infinite Claim\n• Instant Hospitalization for Chronic Conditions\n• DME Cover, Home Care Treatment\n• Modern Treatment Plus\n\n**Wellness & Preventive:**\n• Advance Health Check-up (₹2,888/member)\n• Annual Cancer Screening (₹227–₹455/member)\n• Fitness Plus (₹649/policy)\n• Cashless OPD (₹1,667–₹5,833)\n\n**Family Protection:**\n• Maternity & Newborn (₹19,670–₹1,23,750)\n• Maternity Fixed Benefit\n• Infertility Cover\n• Surrogate Mother / Egg Donor\n• Child Protect, Spouse Protect\n\n**Income Protection:**\n• Critical Illness Cover\n• Personal Accident (₹700–₹7,000/member)\n• Daily Hospital Cash\n• Convalescence Benefit\n• Compassionate Benefit\n\n**Discounts / Deductibles:**\n• Smart Select Network (−15%)\n• Aggregate Deductible (−7.5% to −60%)\n• Per Claim Deductible\n• Co-Payment\n\nAsk about any specific add-on for details!`;
  }

export function discountsInfo(message: string): string {
    const q = message.toLowerCase();

    if (matchesKeywords(q, ['cibil', 'credit score'])) {
      const d = DISCOUNTS['CIBIL Score Discount'];
      return `**CIBIL Score Discount:**\n${Object.entries(d).filter(([k]) => k !== 'note').map(([score, disc]) => `• Score ${score}: **${disc}** discount`).join('\n')}\n\nA high CIBIL score (850+) gives you a **15% discount** on your premium!`;
    }
    if (matchesKeywords(q, ['nri'])) return `**NRI Discount:** **15% off** for Non-Resident Indians`;
    if (matchesKeywords(q, ['auto debit'])) return `**Auto Debit Discount:** **2.5% off** for choosing auto-debit payment`;
    if (matchesKeywords(q, ['multiple member', 'more member', 'more person'])) {
      return `**Multiple Member Discount:**\n• 2–3 members: **5% off**\n• 4+ members: **10% off**`;
    }

    return `**Available Discounts:**\n\n| Discount | Amount |\n|---|---|\n| Tenure (2 yr) | −7.5% |\n| Tenure (3 yr) | −10% |\n| Tenure (4 yr) | −12.5% |\n| Tenure (5 yr) | −15% |\n| CIBIL 850+ | −15% |\n| NRI | −15% |\n| Discount in Lieu of Commission | −15% |\n| Affiliate/Employee | −10% |\n| CIBIL 801–849 | −7.5% |\n| CIBIL 751–800 | −5% |\n| Corporate GMC Holder | −5% |\n| Multiple Members (4+) | −10% |\n| Multiple Members (2–3) | −5% |\n| Auto Debit | −2.5% |\n| Smart Select Network | −15% |\n| CIBIL 701–750 | −2.5% |\n\n⚠️ Employee Discount and Commission Discount cannot be combined.\n\nAsk about any specific discount for more details!`;
  }

export function zoneInfo(message: string): string {
    return `**Zone Classification:**\n\n${Object.entries(ZONE_GUIDE).map(([z, d]) => `**${z}:** ${d}`).join('\n')}\n\nThe zone is determined by your **place of residence**. Zone 1 attracts the highest premium due to higher cost of healthcare in metros.\n\nFor Global plans, the zone refers to the **geographical scope** (Worldwide, Asia, Europe, etc.) rather than city of residence.`;
  }

export function familyTypeInfo(message: string): string {
    return `**Family Types Available:**\n\n${Object.entries(FAMILY_GUIDE).map(([ft, d]) => `• **${ft}:** ${d}`).join('\n')}\n\n**Notes:**\n• PHI Senior only supports **1A and 2A**\n• PHI Sub Standard supports all combinations\n• Maximum 4 children across all plans\n• Children covered up to **age 25** (unmarried)\n• Parents/Parents-in-law can be included in Floater plans\n\nFor a **Family Floater**, all members share one sum insured. Ask for a quote specifying your family type!`;
  }

export function waitingPeriodInfo(): string {
    return `**Waiting Periods:**\n\n| Type | Default Period | Modification Available? |\n|---|---|---|\n| Initial (all illnesses) | 30 days | No |\n| Pre-Existing Diseases (PED) | 36 months (3 years) | Yes — reduce to 2 yr or 1 yr |\n| Specific Illness | 12–24 months | Yes — remove with add-on |\n| Maternity | 48 months (4 years) | Yes — reduce to 9/24/36 months |\n| Infertility | 48 months | Yes — reduce to 9/24/36 months |\n| Chronic Conditions | 2 years | Yes — Day 1 with add-on |\n| Cancer Booster | 90 days | No |\n\n✅ **No waiting period** for accidents and emergency hospitalisations.\n\n**To reduce waiting periods:**\n• PED: Pay +12% (3→2 yr) or +24% (3→1 yr) in Year 1\n• Specific Illness: +4.5% to +60% loading by age\n• Chronic Conditions: Instant Hospitalization add-on (+20–30%)`;
  }

export function preExistingInfo(): string {
    return `**Pre-Existing Diseases (PED):**\n\nAny illness or condition you had **before buying the policy** is considered pre-existing.\n\n**Standard waiting period:** 3 years from policy start\n\n**How to reduce it:**\n• Pay an additional **12%** loading → PED covered from Year 2\n• Pay an additional **24%** loading → PED covered from Year 1\n\n**Important rules:**\n• PED must be honestly declared during purchase\n• Non-disclosure can lead to claim rejection\n• PED modification cannot be combined with Instant Hospitalization for Chronic Conditions\n\nAfter the waiting period, all declared PEDs are fully covered up to your sum insured.`;
  }

export function claimInfo(): string {
    return `**Claims Process:**\n\n**Cashless Claims (network hospitals):**\n1. Get admitted to a network hospital\n2. Show PRUHealth insurance card at TPA/insurance desk\n3. Hospital sends pre-authorisation to us\n4. Approval within 2–4 hours\n5. Bills settled directly — you pay nothing (except non-covered items)\n\n**Reimbursement Claims (any hospital):**\n1. Pay hospital bills yourself\n2. Collect all originals: bills, discharge summary, prescriptions, lab reports\n3. Submit claim form + documents within **30 days of discharge**\n4. We reimburse within **15 working days**\n\n📞 **24/7 Claims Helpline: 1800-123-4567**\n\n**Important:** If you have opted for a co-payment, your share will be deducted from each claim.`;
  }

export function installmentInfo(): string {
    const rows = Object.entries(INSTALLMENT_LOADING).filter(([k]) => k !== 'note').map(([freq, load]) => `• **${freq}:** ${load} loading`).join('\n');
    return `**Premium Payment Frequency:**\n\n${rows}\n\n_${INSTALLMENT_LOADING.note}_\n\n**Example:** If your annual premium is ₹24,000:\n• Monthly: ₹24,000 × 1.06 ÷ 12 = **₹2,120/month**\n• Quarterly: ₹24,000 × 1.04 ÷ 4 = **₹6,240/quarter**\n• Half-Yearly: ₹24,000 × 1.02 ÷ 2 = **₹12,240/half-year**\n• Annual: **₹24,000** (no loading)\n\n💡 Annual payment has no loading and is the most cost-effective.`;
  }

export function tenureInfo(): string {
    const disc = DISCOUNTS['Tenure Discount'];
    return `**Policy Tenure Options (1–5 years):**\n\n| Tenure | Discount | Best For |\n|---|---|---|\n| 1 Year | 0% | Flexibility, can switch plans |\n| 2 Years | **7.5% off** | Moderate savings |\n| 3 Years | **10% off** | Good savings + enables Fixed Maternity Benefit |\n| 4 Years | **12.5% off** | Higher savings |\n| 5 Years | **15% off** | Maximum savings |\n\n_${disc.note}_\n\n**Special rules for 3-year tenure:**\n• Maternity Fixed Benefit available\n• Surrogate Mother cover available\n• Maternity with 9-month waiting available\n• Tenure Wise add-on becomes available\n\n💡 Multi-year policies lock in your current age-band premium, saving you from annual rate increases.`;
  }

export function kycInfo(): string {
    return `**KYC Requirements:**\n\nWe support 3 KYC methods:\n\n**1. CKYC (Central KYC)** — Fastest\n• Requires: PAN number + Date of birth\n• Verified instantly if already KYC-verified in the financial system\n\n**2. eKYC (via DigiLocker / Aadhaar)** \n• Links Aadhaar digitally\n• No physical documents needed\n• Verified in minutes\n\n**3. Manual KYC** — Document upload\n• Any 2 of: PAN card, Aadhaar, Passport, Voter ID, Driving License\n• Verified within 1–2 business days\n\nKYC is mandatory for all policy issuances as per IRDAI regulations.`;
  }

export function hospitalsInfo(): string {
    return `**Cashless Hospital Network:**\n\nWe have **25+ network hospitals** across India including:\n\n🏥 **Mumbai** — Kokilaben, Lilavati, Tata Memorial, Breach Candy, Wockhardt\n🏥 **Delhi/NCR** — AIIMS, Max, Sir Ganga Ram, BLK, Medanta (Gurugram)\n🏥 **Bangalore** — Narayana, Manipal, Columbia Asia, NIMHANS\n🏥 **Chennai** — Apollo, Fortis Malar, CMC Vellore\n🏥 **Hyderabad** — KIMS, Yashoda\n🏥 **Pune** — Ruby Hall, Sahyadri\n🏥 **Kochi** — Amrita, Aster Medcity\n🏥 **Chandigarh** — PGIMER\n🏥 **Lucknow** — Sanjay Gandhi PGIMS\n\nFor **Smart Select Network Discount** (−15%), treatment must be at a designated sub-network.\n\n📞 **Hospital helpline: 1800-123-4567**`;
  }

export function eligibilityInfo(): string {
    return `**Eligibility Summary:**\n\n| Plan | Min Age | Max Age | Family Types |\n|---|---|---|---|\n| PHI Basic | 5 years | 85+ | All (1A to 2A4C/1A4C) |\n| PHI POSP | 5 years | 85+ | All |\n| PHI Flagship 1/2/3 | 5 years | 85+ | All |\n| PHI Flagship 4 (PB) | 5 years | 85+ | All (Priority Banking only) |\n| PHI Global plans | 5 years | 85+ | 1A, 2A, and floater combos |\n| PHI Sub Standard | 46 years | 85+ | All combinations |\n| PHI Senior | 51 years | 85+ | 1A and 2A only |\n\n**Children:** Covered from **91 days** up to **age 25** (unmarried)\n**Adults:** Age 18 required for Personal Accident, Critical Illness, and Adventure Sports\n\nLifelong renewability is available for all plans once entered.`;
  }

export function copayInfo(): string {
    return `**Co-Payment & Deductible Options:**\n\n**Co-Payment (reduces your premium):**\n• 5% co-pay → **−5%** premium\n• 10% co-pay → **−10%** premium\n• 20% co-pay → **−20%** premium\n• 50% co-pay → **−50%** premium\n\n**Aggregate Deductible** (annual — you pay first):\n| SI | ₹25K deductible | ₹50K | ₹1L |\n|---|---|---|---|\n| ₹5L | −16% | −26.5% | −40% |\n| ₹10L | −12% | −21% | −33% |\n| ₹40L | −9% | −16% | −26.5% |\n\n**Per Claim Deductible:**\n| SI | ₹15K | ₹25K |\n|---|---|---|\n| ₹5L | −13% | −21% |\n| ₹10L | −10% | −16% |\n\n⚠️ Aggregate and Per Claim deductibles **cannot be combined**`;
  }

export function rulesInfo(): string {
    return `**Key Business Rules & Restrictions:**\n\n${BUSINESS_RULES.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nFor the complete list of product rules, please refer to the policy wordings or call **1800-123-4567**.`;
  }

export function defaultResponse(): string {
    return `I can help with any of the following:\n\n• **"What plans do you offer?"** — All 14 plan types\n• **"How much for PHI Basic, age 35, Zone 2, ₹10L?"** — Premium quote\n• **"Compare Flagship 1 vs Flagship 2"** — Plan comparison\n• **"Tell me about PHI Global"** — Plan details\n• **"What add-ons are available?"** — Full add-on list\n• **"What discounts can I get?"** — All discounts\n• **"What is the waiting period?"** — PED and illness waits\n• **"How does co-payment work?"** — Deductible and co-pay options\n• **"What are the business rules?"** — Combination restrictions\n\nFor personalised advice, call **1800-123-4567** (Mon–Sat, 9 AM–7 PM).`;
  }
