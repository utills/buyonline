import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // ─── PLANS ──────────────────────────────────────────────────────────
  const planPremier = await prisma.plan.upsert({
    where: { id: 'plan-premier' },
    update: {},
    create: {
      id: 'plan-premier',
      name: 'PRUHealth Premier',
      tier: 'PREMIER',
      description:
        'Essential health coverage with comprehensive hospitalization benefits',
      features: {
        roomRent: 'Single Private Room',
        preSurgery: '30 days',
        postSurgery: '60 days',
        daycare: 'Covered',
        ambulance: 'Up to Rs 5,000',
        healthCheckup: 'Annual',
        noClaimBonus: '10% per year',
        restoration: '100% Sum Insured',
      },
      sortOrder: 1,
    },
  });

  const planSignature = await prisma.plan.upsert({
    where: { id: 'plan-signature' },
    update: {},
    create: {
      id: 'plan-signature',
      name: 'PRUHealth Signature',
      tier: 'SIGNATURE',
      description:
        'Enhanced health coverage with wider network and additional benefits',
      features: {
        roomRent: 'No Limit',
        preSurgery: '60 days',
        postSurgery: '90 days',
        daycare: 'Covered',
        ambulance: 'Up to Rs 10,000',
        healthCheckup: 'Annual + Dental',
        noClaimBonus: '20% per year',
        restoration: '200% Sum Insured',
        internationalCoverage: 'Emergency Only',
        mentalHealth: 'Covered',
      },
      sortOrder: 2,
    },
  });

  const planGlobal = await prisma.plan.upsert({
    where: { id: 'plan-global' },
    update: {},
    create: {
      id: 'plan-global',
      name: 'PRUHealth Global',
      tier: 'GLOBAL',
      description:
        'Premium worldwide health coverage with no limits on room rent and global network access',
      features: {
        roomRent: 'No Limit',
        preSurgery: '90 days',
        postSurgery: '180 days',
        daycare: 'Covered',
        ambulance: 'No Limit',
        healthCheckup: 'Annual + Dental + Vision',
        noClaimBonus: '50% per year',
        restoration: '300% Sum Insured',
        internationalCoverage: 'Worldwide',
        mentalHealth: 'Covered',
        organDonor: 'Covered',
        airAmbulance: 'Covered',
      },
      sortOrder: 3,
    },
  });

  // ─── PRICING TIERS ─────────────────────────────────────────────────
  const sumInsuredOptions = [
    { value: 500000, label: '5 Lakh' },
    { value: 1000000, label: '10 Lakh' },
    { value: 2500000, label: '25 Lakh' },
    { value: 5000000, label: '50 Lakh' },
  ];

  const tenureOptions = [12, 24, 36, 48, 60]; // months

  const basePremiumMap: Record<string, Record<number, number>> = {
    'plan-premier': {
      500000: 8500,
      1000000: 13500,
      2500000: 22000,
      5000000: 35000,
    },
    'plan-signature': {
      500000: 12000,
      1000000: 19000,
      2500000: 30000,
      5000000: 48000,
    },
    'plan-global': {
      500000: 18000,
      1000000: 28000,
      2500000: 45000,
      5000000: 72000,
    },
  };

  const tenureMultiplier: Record<number, number> = {
    12: 1.0,
    24: 1.9,
    36: 2.7,
    48: 3.4,
    60: 4.0,
  };

  const discountMap: Record<number, number> = {
    12: 0,
    24: 5,
    36: 8,
    48: 10,
    60: 12,
  };

  for (const plan of [planPremier, planSignature, planGlobal]) {
    for (const si of sumInsuredOptions) {
      for (const tenure of tenureOptions) {
        const rawBase = basePremiumMap[plan.id]![si.value]!;
        const basePremium = Math.round(rawBase * tenureMultiplier[tenure]!);
        const discountPct = discountMap[tenure]!;
        const isPopular = si.value === 1000000 && tenure === 12;

        // INDIVIDUAL pricing
        await prisma.planPricing.upsert({
          where: {
            planId_sumInsured_coverageLevel_tenureMonths: {
              planId: plan.id,
              sumInsured: BigInt(si.value),
              coverageLevel: 'INDIVIDUAL',
              tenureMonths: tenure,
            },
          },
          update: { basePremium: BigInt(basePremium), discountPct, isPopular },
          create: {
            planId: plan.id,
            sumInsured: BigInt(si.value),
            sumInsuredLabel: si.label,
            coverageLevel: 'INDIVIDUAL',
            tenureMonths: tenure,
            basePremium: BigInt(basePremium),
            discountPct,
            gst: 18,
            isPopular,
          },
        });

        // FLOATER pricing (20% premium over INDIVIDUAL for family coverage)
        const floaterPremium = Math.round(basePremium * 1.2);
        await prisma.planPricing.upsert({
          where: {
            planId_sumInsured_coverageLevel_tenureMonths: {
              planId: plan.id,
              sumInsured: BigInt(si.value),
              coverageLevel: 'FLOATER',
              tenureMonths: tenure,
            },
          },
          update: { basePremium: BigInt(floaterPremium), discountPct, isPopular: false },
          create: {
            planId: plan.id,
            sumInsured: BigInt(si.value),
            sumInsuredLabel: si.label,
            coverageLevel: 'FLOATER',
            tenureMonths: tenure,
            basePremium: BigInt(floaterPremium),
            discountPct,
            gst: 18,
            isPopular: false,
          },
        });
      }
    }
  }

  console.log('Created pricing tiers for all plans');

  // ─── ADDONS ─────────────────────────────────────────────────────────
  const addonMaternity = await prisma.addon.upsert({
    where: { id: 'addon-maternity' },
    update: {},
    create: {
      id: 'addon-maternity',
      name: 'Maternity Coverage',
      description:
        'Covers pre and post-natal expenses, delivery charges, and newborn baby coverage for the first 90 days',
    },
  });

  const addonDental = await prisma.addon.upsert({
    where: { id: 'addon-dental' },
    update: {},
    create: {
      id: 'addon-dental',
      name: 'Dental Care',
      description:
        'Covers dental treatments including cleaning, fillings, root canals, and orthodontics',
    },
  });

  const addonVision = await prisma.addon.upsert({
    where: { id: 'addon-vision' },
    update: {},
    create: {
      id: 'addon-vision',
      name: 'Vision Care',
      description:
        'Covers eye examinations, prescription glasses, contact lenses, and corrective eye surgery',
    },
  });

  // ─── PLAN ADDONS ────────────────────────────────────────────────────
  const planAddonData = [
    // Premier - not pre-checked
    { planId: planPremier.id, addonId: addonMaternity.id, price: 3500, isPreChecked: false, isIncludedInBundle: false },
    { planId: planPremier.id, addonId: addonDental.id, price: 1500, isPreChecked: false, isIncludedInBundle: false },
    { planId: planPremier.id, addonId: addonVision.id, price: 1200, isPreChecked: false, isIncludedInBundle: false },
    // Signature - pre-checked
    { planId: planSignature.id, addonId: addonMaternity.id, price: 4500, isPreChecked: true, isIncludedInBundle: false },
    { planId: planSignature.id, addonId: addonDental.id, price: 2000, isPreChecked: true, isIncludedInBundle: false },
    { planId: planSignature.id, addonId: addonVision.id, price: 1500, isPreChecked: true, isIncludedInBundle: false },
    // Global - pre-checked and some bundled
    { planId: planGlobal.id, addonId: addonMaternity.id, price: 6000, isPreChecked: true, isIncludedInBundle: false },
    { planId: planGlobal.id, addonId: addonDental.id, price: 0, isPreChecked: true, isIncludedInBundle: true },
    { planId: planGlobal.id, addonId: addonVision.id, price: 0, isPreChecked: true, isIncludedInBundle: true },
  ];

  for (const pa of planAddonData) {
    await prisma.planAddon.upsert({
      where: {
        planId_addonId: { planId: pa.planId, addonId: pa.addonId },
      },
      update: { price: BigInt(pa.price), isPreChecked: pa.isPreChecked, isIncludedInBundle: pa.isIncludedInBundle },
      create: {
        planId: pa.planId,
        addonId: pa.addonId,
        price: BigInt(pa.price),
        isPreChecked: pa.isPreChecked,
        isIncludedInBundle: pa.isIncludedInBundle,
      },
    });
  }

  console.log('Created addons and plan-addon linkages');

  // ─── DISEASES ───────────────────────────────────────────────────────
  const diseases = [
    { name: 'Cancer', category: 'critical', description: 'Any form of malignancy or tumour' },
    { name: 'Diabetes', category: 'chronic', description: 'Type 1 or Type 2 diabetes mellitus' },
    { name: 'Hypertension', category: 'chronic', description: 'High blood pressure' },
    { name: 'Heart Disease', category: 'critical', description: 'Coronary artery disease, heart failure, etc.' },
    { name: 'Kidney Disease', category: 'critical', description: 'Chronic kidney disease or renal failure' },
    { name: 'Liver Disease', category: 'critical', description: 'Cirrhosis, hepatitis, or liver failure' },
    { name: 'Asthma', category: 'chronic', description: 'Chronic respiratory condition' },
    { name: 'Thyroid Disorder', category: 'chronic', description: 'Hypothyroidism or hyperthyroidism' },
    { name: 'Arthritis', category: 'chronic', description: 'Rheumatoid arthritis or osteoarthritis' },
    { name: 'Stroke', category: 'critical', description: 'Cerebrovascular accident' },
    { name: 'Epilepsy', category: 'neurological', description: 'Seizure disorder' },
    { name: 'HIV/AIDS', category: 'critical', description: 'Human immunodeficiency virus infection' },
    { name: 'Tuberculosis', category: 'infectious', description: 'Active or latent TB' },
    { name: 'COPD', category: 'chronic', description: 'Chronic obstructive pulmonary disease' },
    { name: 'Depression', category: 'mental_health', description: 'Major depressive disorder' },
    { name: 'Anxiety Disorder', category: 'mental_health', description: 'Generalized anxiety disorder' },
    { name: 'Obesity', category: 'lifestyle', description: 'BMI greater than 35' },
    { name: 'Sleep Apnea', category: 'chronic', description: 'Obstructive sleep apnea' },
    { name: 'Autoimmune Disorder', category: 'chronic', description: 'Lupus, multiple sclerosis, etc.' },
  ];

  for (const d of diseases) {
    await prisma.disease.upsert({
      where: { name: d.name },
      update: {},
      create: d,
    });
  }

  console.log('Created 19 diseases');

  // ─── HEALTH QUESTIONS ───────────────────────────────────────────────
  const healthQuestions = [
    { questionKey: 'hq_hospitalized_last_4_years', category: 'hospitalization', questionText: 'Have you been hospitalized in the last 4 years?', sortOrder: 1 },
    { questionKey: 'hq_surgery_planned', category: 'hospitalization', questionText: 'Do you have any surgery planned in the near future?', sortOrder: 2 },
    { questionKey: 'hq_chronic_medication', category: 'medication', questionText: 'Are you currently on any long-term medication?', sortOrder: 3 },
    { questionKey: 'hq_heart_condition', category: 'cardiac', questionText: 'Have you ever been diagnosed with any heart condition?', sortOrder: 4 },
    { questionKey: 'hq_diabetes', category: 'metabolic', questionText: 'Have you been diagnosed with diabetes or high blood sugar?', sortOrder: 5 },
    { questionKey: 'hq_blood_pressure', category: 'cardiac', questionText: 'Do you suffer from high or low blood pressure?', sortOrder: 6 },
    { questionKey: 'hq_respiratory', category: 'respiratory', questionText: 'Do you have any respiratory conditions like asthma or COPD?', sortOrder: 7 },
    { questionKey: 'hq_cancer_history', category: 'oncology', questionText: 'Have you ever been diagnosed with cancer or undergone cancer treatment?', sortOrder: 8 },
    { questionKey: 'hq_mental_health', category: 'mental_health', questionText: 'Have you been treated for any mental health conditions?', sortOrder: 9 },
    { questionKey: 'hq_disability', category: 'general', questionText: 'Do you have any physical disability or impairment?', sortOrder: 10 },
  ];

  for (const q of healthQuestions) {
    await prisma.healthQuestion.upsert({
      where: { questionKey: q.questionKey },
      update: {},
      create: q,
    });
  }

  console.log('Created 10 health questions');

  // ─── HOSPITALS ──────────────────────────────────────────────────────
  const hospitals = [
    { name: 'Apollo Hospital', address: '21 Greams Lane', city: 'Chennai', state: 'Tamil Nadu', pincode: '600006', latitude: 13.0614, longitude: 80.2519 },
    { name: 'Fortis Malar Hospital', address: '52 1st Main Road', city: 'Chennai', state: 'Tamil Nadu', pincode: '600020', latitude: 13.0095, longitude: 80.2563 },
    { name: 'Max Super Speciality Hospital', address: '1 Press Enclave Road', city: 'New Delhi', state: 'Delhi', pincode: '110017', latitude: 28.5566, longitude: 77.2036 },
    { name: 'Medanta - The Medicity', address: 'CH Baktawar Singh Road', city: 'Gurugram', state: 'Haryana', pincode: '122001', latitude: 28.4396, longitude: 77.0427 },
    { name: 'Kokilaben Dhirubhai Ambani Hospital', address: 'Rao Saheb Achutrao Patwardhan Marg', city: 'Mumbai', state: 'Maharashtra', pincode: '400053', latitude: 19.1310, longitude: 72.8264 },
    { name: 'Lilavati Hospital', address: 'A-791 Bandra Reclamation', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', latitude: 19.0504, longitude: 72.8280 },
    { name: 'Narayana Health', address: '258/A Bommasandra Industrial Area', city: 'Bangalore', state: 'Karnataka', pincode: '560099', latitude: 12.8100, longitude: 77.6770 },
    { name: 'Manipal Hospital', address: '98 HAL Airport Road', city: 'Bangalore', state: 'Karnataka', pincode: '560017', latitude: 12.9588, longitude: 77.6478 },
    { name: 'AIIMS', address: 'Sri Aurobindo Marg', city: 'New Delhi', state: 'Delhi', pincode: '110029', latitude: 28.5672, longitude: 77.2100 },
    { name: 'Ruby Hall Clinic', address: '40 Sasoon Road', city: 'Pune', state: 'Maharashtra', pincode: '411001', latitude: 18.5252, longitude: 73.8778 },
    { name: 'Sahyadri Hospital', address: '30-C Erandwane', city: 'Pune', state: 'Maharashtra', pincode: '411004', latitude: 18.5089, longitude: 73.8348 },
    { name: 'CMC Vellore', address: 'Ida Scudder Road', city: 'Vellore', state: 'Tamil Nadu', pincode: '632004', latitude: 12.9243, longitude: 79.1353 },
    { name: 'KIMS Hospital', address: '1-8-31/1 Minister Road', city: 'Hyderabad', state: 'Telangana', pincode: '500003', latitude: 17.3997, longitude: 78.4727 },
    { name: 'Yashoda Hospital', address: 'Raj Bhavan Road', city: 'Hyderabad', state: 'Telangana', pincode: '500082', latitude: 17.4287, longitude: 78.4481 },
    { name: 'Amrita Hospital', address: 'AIMS Ponekkara PO', city: 'Kochi', state: 'Kerala', pincode: '682041', latitude: 10.0316, longitude: 76.3090 },
    { name: 'Aster Medcity', address: 'Kuttisahib Road', city: 'Kochi', state: 'Kerala', pincode: '682027', latitude: 9.9453, longitude: 76.2845 },
    { name: 'PGIMER', address: 'Sector 12', city: 'Chandigarh', state: 'Chandigarh', pincode: '160012', latitude: 30.7643, longitude: 76.7760 },
    { name: 'Tata Memorial Hospital', address: 'Dr E Borges Road Parel', city: 'Mumbai', state: 'Maharashtra', pincode: '400012', latitude: 19.0048, longitude: 72.8423 },
    { name: 'Sir Ganga Ram Hospital', address: 'Rajinder Nagar', city: 'New Delhi', state: 'Delhi', pincode: '110060', latitude: 28.6373, longitude: 77.1901 },
    { name: 'BLK Super Speciality Hospital', address: 'Pusa Road', city: 'New Delhi', state: 'Delhi', pincode: '110005', latitude: 28.6459, longitude: 77.1812 },
    { name: 'Wockhardt Hospital', address: '1877 Dr Anand Rao Nair Marg', city: 'Mumbai', state: 'Maharashtra', pincode: '400011', latitude: 18.9677, longitude: 72.8253 },
    { name: 'Columbia Asia Hospital', address: 'Kirloskar Business Park', city: 'Bangalore', state: 'Karnataka', pincode: '560024', latitude: 12.9940, longitude: 77.5697 },
    { name: 'Sanjay Gandhi PGIMS', address: 'Raebareli Road', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226014', latitude: 26.7417, longitude: 80.9932 },
    { name: 'NIMHANS', address: 'Hosur Road', city: 'Bangalore', state: 'Karnataka', pincode: '560029', latitude: 12.9421, longitude: 77.5967 },
    { name: 'Breach Candy Hospital', address: '60-A Bhulabhai Desai Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400026', latitude: 18.9707, longitude: 72.8058 },
  ];

  for (const h of hospitals) {
    await prisma.hospital.create({ data: h });
  }

  console.log('Created 25 hospitals');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
