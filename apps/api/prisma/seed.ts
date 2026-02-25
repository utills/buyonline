import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PLAN_DEFINITIONS, SUM_INSURED_OPTIONS, TENURE_OPTIONS, BASE_PREMIUM_MAP, TENURE_MULTIPLIER, DISCOUNT_MAP } from './seed-data/plans.data';
import { ADDON_DEFINITIONS, PLAN_ADDON_CONFIG } from './seed-data/addons.data';
import { DISEASES, HEALTH_QUESTIONS } from './seed-data/health.data';
import { HOSPITALS } from './seed-data/hospitals.data';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // ─── PLANS ──────────────────────────────────────────────────────────
  const planRecords: Record<string, { id: string }> = {};
  for (const plan of PLAN_DEFINITIONS) {
    const record = await prisma.plan.upsert({
      where:  { id: plan.id },
      update: { name: plan.name, description: plan.description, features: plan.features, sortOrder: plan.sortOrder },
      create: plan,
    });
    planRecords[plan.id] = record;
  }
  console.log(`Upserted ${PLAN_DEFINITIONS.length} plans`);

  // ─── PLAN PRICING ────────────────────────────────────────────────────
  // Plans × SI tiers × 3 tenures × 2 coverage levels (skips SI tiers not in XL for a plan)
  let pricingCount = 0;
  for (const plan of PLAN_DEFINITIONS) {
    for (const si of SUM_INSURED_OPTIONS) {
      const rawBase = BASE_PREMIUM_MAP[plan.id]?.[si.value];
      if (!rawBase) continue; // SI not available for this plan in the XL
      for (const tenure of TENURE_OPTIONS) {
        const basePremium  = Math.round(rawBase * TENURE_MULTIPLIER[tenure]!);
        const discountPct  = DISCOUNT_MAP[tenure]!;
        const isPopular    = si.value === 1000000 && tenure === 12;

        for (const coverageLevel of ['INDIVIDUAL', 'FLOATER'] as const) {
          const premium = coverageLevel === 'FLOATER' ? Math.round(basePremium * 1.2) : basePremium;
          await prisma.planPricing.upsert({
            where: { planId_sumInsured_coverageLevel_tenureMonths: {
              planId: plan.id, sumInsured: BigInt(si.value), coverageLevel, tenureMonths: tenure,
            }},
            update: { basePremium: BigInt(premium), discountPct, isPopular: coverageLevel === 'INDIVIDUAL' && isPopular },
            create: {
              planId: plan.id, sumInsured: BigInt(si.value), sumInsuredLabel: si.label,
              coverageLevel, tenureMonths: tenure, basePremium: BigInt(premium),
              discountPct, gst: 18, isPopular: coverageLevel === 'INDIVIDUAL' && isPopular,
            },
          });
          pricingCount++;
        }
      }
    }
  }
  console.log(`Upserted ${pricingCount} pricing rows`);

  // ─── ADDONS ──────────────────────────────────────────────────────────
  for (const addon of ADDON_DEFINITIONS) {
    await prisma.addon.upsert({
      where:  { id: addon.id },
      update: { name: addon.name, description: addon.description },
      create: addon,
    });
  }
  console.log(`Upserted ${ADDON_DEFINITIONS.length} addons`);

  // ─── PLAN ADDONS ─────────────────────────────────────────────────────
  const planMap: Record<string, string> = {
    'plan-premier': 'premier', 'plan-signature': 'signature', 'plan-global': 'global', 'plan-flagship4': 'flagship4',
  };
  let planAddonCount = 0;
  for (const planId of Object.keys(planMap)) {
    const key = planMap[planId] as 'premier' | 'signature' | 'global' | 'flagship4';
    for (const cfg of PLAN_ADDON_CONFIG) {
      const entry = cfg[key];
      await prisma.planAddon.upsert({
        where:  { planId_addonId: { planId, addonId: cfg.addonId } },
        update: { price: BigInt(entry.price), isPreChecked: entry.isPreChecked, isIncludedInBundle: entry.isIncludedInBundle },
        create: { planId, addonId: cfg.addonId, price: BigInt(entry.price), isPreChecked: entry.isPreChecked, isIncludedInBundle: entry.isIncludedInBundle },
      });
      planAddonCount++;
    }
  }
  console.log(`Upserted ${planAddonCount} plan-addon linkages`);

  // ─── DISEASES ────────────────────────────────────────────────────────
  for (const d of DISEASES) {
    await prisma.disease.upsert({ where: { name: d.name }, update: {}, create: d });
  }
  console.log(`Upserted ${DISEASES.length} diseases`);

  // ─── HEALTH QUESTIONS ────────────────────────────────────────────────
  for (const q of HEALTH_QUESTIONS) {
    await prisma.healthQuestion.upsert({ where: { questionKey: q.questionKey }, update: {}, create: q });
  }
  console.log(`Upserted ${HEALTH_QUESTIONS.length} health questions`);

  // ─── HOSPITALS ───────────────────────────────────────────────────────
  // Delete and recreate — Hospital has no FK dependants; this gives a clean sync on every run
  await prisma.hospital.deleteMany();
  await prisma.hospital.createMany({ data: HOSPITALS });
  console.log(`Created ${HOSPITALS.length} hospitals`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => { console.error('Seeding failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
