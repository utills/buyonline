export const ADDONS = {
  'Loyalty Bonus': {
    desc: 'Increases your sum insured every claim-free year at no extra premium cost',
    variants: [
      { name: '100% upto 200%', loading: '5% of base premium (age ≤45) / 7.5% (age 46+)' },
      { name: '100% upto 500%', loading: '10% of base premium (age ≤45) / 15% (age 46+)' },
      { name: '100% upto 1000%', loading: '15% of base premium (age ≤45) / 20% (age 46+)' },
    ],
    note: 'For SI ≥₹75L, rates are lower (7.5%/12.5%)',
  },
  'Instant Hospitalization for Chronic Conditions': {
    desc: 'Removes the 2-year waiting period for chronic illness hospitalisation from Day 1',
    loading: 'Single condition: +20% | Two comorbid: +25% | Three comorbid: +30%',
    note: 'Cannot be combined with PED Waiting Period Modification',
  },
  'Consumables Cover List I': {
    desc: 'Covers consumable items (gloves, syringes, etc.) during hospitalisation',
    loading: '+5% of base premium',
  },
  'Consumable Plus (List I–IV)': {
    desc: 'Extended consumables coverage including List I, II, III, and IV items',
    loading: '+9% of base premium',
    note: 'Cannot be combined with Consumables List I',
  },
  'PED Waiting Period Modification': {
    desc: 'Reduces waiting period for pre-existing diseases',
    variants: [
      { name: '3 years → 2 years', loading: '+12% in Year 1 only' },
      { name: '3 years → 1 year', loading: '+24% in Year 1 only' },
    ],
    note: 'Cannot be combined with Instant Hospitalization for Chronic Conditions',
  },
  'Specific Illness Waiting Period Removal': {
    desc: 'Removes 1–2 year waiting period for specific listed illnesses',
    loading_by_age: {
      '5–17': '4.5%', '18–35': '8.25%', '36–40': '27%', '41–55': '33%',
      '56–60': '42%', '61–65': '48%', '66–70': '51%', '71–75': '57%', '76+': '60%',
    },
  },
  'Modern Treatment Plus': {
    desc: 'Covers advanced treatments like robotic surgery, stem cell therapy, etc.',
    loading: '+2.89% for Basic/POSP | −2.89% (discount) for Flagship/Global plans',
  },
  'Room Rent Modification': {
    desc: 'Change your room rent entitlement from the default',
    variants: [
      { name: 'General Room (Basic)', loading: '−10%' },
      { name: 'Single Private AC (Basic)', loading: '+16%' },
      { name: 'Any Room (Basic)', loading: '+29%' },
      { name: 'Shared Room (Flagship)', loading: '−22.5%' },
      { name: 'Single Private AC (Flagship)', loading: '−10%' },
      { name: 'Any Room (POSP)', loading: '+11%' },
    ],
  },
  'DME Cover': {
    desc: 'Covers Durable Medical Equipment (wheelchairs, crutches, etc.)',
    loading: 'Age ≤45: +10–15% | Age 46+: +11–15% (varies by SI)',
  },
  'Infinite Claim': {
    desc: 'Unlimited claim amount in a policy year (no sum insured cap)',
    loading: 'SI ₹2L: +10% | ₹5L–₹2M: +7.5–10% | ₹4M+: +2.5–5%',
  },
  'Restoration Plus': {
    desc: 'Auto-restores sum insured within the same policy year after exhaustion',
    loading: 'Age ≤35: 0.15–2.15% | Age 36+: 0.25–3.6% (varies by SI)',
  },
  'Daily Hospital Cash': {
    desc: 'Fixed daily cash benefit during hospitalisation',
    premiums_per_member: {
      '₹500/day': { '18–35': '₹124', '46–50': '₹188', '56–60': '₹258', '61–65': '₹344', '71–75': '₹520', '81+': '₹657' },
      '₹1,000/day': { '18–35': '₹247', '46–50': '₹375', '56–60': '₹516', '61–65': '₹689', '71–75': '₹1,040', '81+': '₹1,314' },
      '₹2,000/day': { '18–35': '₹494', '46–50': '₹750', '56–60': '₹1,031', '61–65': '₹1,377', '71–75': '₹2,080', '81+': '₹2,628' },
      '₹5,000/day': { '18–35': '₹1,239', '46–50': '₹1,876', '56–60': '₹2,578', '61–65': '₹3,441', '71–75': '₹5,199', '81+': '₹6,567' },
    },
  },
  'Convalescence Benefit': {
    desc: 'Lump sum payout after extended hospitalisation',
    premiums: {
      '₹5,000 (>10 days)': '₹69/policy', '₹5,000 (>5 days)': '₹190/policy', '₹5,000 (>3 days)': '₹513/policy',
      '₹10,000 (>10 days)': '₹137/policy', '₹10,000 (>5 days)': '₹379/policy', '₹10,000 (>3 days)': '₹1,026/policy',
      '₹20,000 (>10 days)': '₹275/policy', '₹20,000 (>5 days)': '₹758/policy', '₹20,000 (>3 days)': '₹2,051/policy',
    },
  },
  'Personal Accident Cover': {
    desc: 'Accidental death and disability cover per member',
    premiums: {
      '₹10L': '₹700/member', '₹20L': '₹1,400/member', '₹30L': '₹2,100/member',
      '₹50L': '₹3,500/member', '₹1Cr': '₹7,000/member',
    },
    note: 'Only for individuals aged 18+ in Floater policy',
  },
  'Air Ambulance': { desc: 'Air evacuation to nearest hospital', premium: '₹433/policy/year' },
  'Fitness Plus': { desc: 'Covers fitness activities and gym memberships', premium: '₹649/policy/year' },
  'Second E-Opinion': { desc: 'Second medical opinion from expert panel', premium: '₹67/policy/year' },
  'Advance Health Check-up (Advance)': { desc: 'Comprehensive annual health check-up', premium: '₹2,888/member/year' },
  'Advance Health Check-up (Basic)': { desc: 'Basic annual health check-up', premium: '₹975/member/year' },
  'Compassionate Benefit': {
    desc: 'Travel expenses for accompanying family member during hospitalisation',
    premiums: { '₹25,000': '₹10/policy', '₹50,000': '₹21/policy' },
  },
  'Maternity & Newborn Expenses': {
    desc: 'Covers delivery, pre/post-natal expenses, and newborn for 90 days',
    note: 'Not available for 1A, 1A1C, 1A2C, 1A3C, 1A4C family types',
    premiums: {
      '₹50,000 limit': { '9M waiting': '₹37,500/policy', '24M waiting': '₹34,058/policy', '36M waiting': '₹24,966/policy', '48M waiting': '₹19,670/policy' },
      '₹1,00,000 limit': { '9M waiting': '₹70,417/policy', '24M waiting': '₹63,937/policy', '36M waiting': '₹47,098/policy', '48M waiting': '₹37,226/policy' },
      '₹2,00,000 limit': { '9M waiting': '₹1,23,750/policy', '24M waiting': '₹1,12,388/policy', '36M waiting': '₹82,988/policy', '48M waiting': '₹66,483/policy' },
    },
  },
  'Maternity Fixed Benefit': {
    desc: 'Fixed lump sum payout on delivery regardless of actual expenses',
    note: 'Only for 3-year tenure with single premium. Not for 1A/1A1C–4C families',
    premiums: {
      '₹50,000': '₹29,667/policy (0–6M waiting) | ₹28,183/policy (9M waiting)',
      '₹1,00,000': '₹59,334/policy (0–6M waiting) | ₹56,366/policy (9M waiting)',
    },
  },
  'Infertility Cover': {
    desc: 'Covers IVF and infertility treatment expenses',
    premiums: {
      '₹1,00,000 limit': { '9M': '₹30,254', '24M': '₹7,563', '36M': '₹5,544', '48M': '₹4,368' },
      '₹2,00,000 limit': { '9M': '₹57,324', '24M': '₹14,331', '36M': '₹10,557', '48M': '₹8,344' },
    },
    note: 'Cannot be combined with Maternity ₹50K limit',
  },
  'Surrogate Mother (In-patient)': {
    desc: 'Covers hospitalisation for surrogate mother',
    premium: '₹908/policy (36-month cover, ₹5L limit, 3-year single-premium policy only)',
  },
  'Egg Donor Cover': {
    desc: 'Covers expenses for egg donor procedure',
    premium: '₹846/policy (₹5L limit, 3-year single-premium policy only)',
  },
  'Chronic Management': {
    desc: 'Ongoing disease management for chronic conditions (age 18+ only)',
    premiums: {
      'Single condition': '₹3,650/member/year',
      'Two comorbid conditions': '₹4,650/member/year',
      'Three comorbid conditions': '₹5,050/member/year',
    },
    note: 'Can only be opted if Instant Hospitalization for Chronic Conditions is opted',
  },
  'Critical Illness Cover': {
    desc: 'Lump sum on diagnosis of listed critical illnesses',
    rate_per_1000_SI: {
      '18–25': '₹1.01', '26–30': '₹1.11', '31–35': '₹1.22', '36–40': '₹1.52',
      '41–45': '₹2.17', '46–50': '₹3.33', '51–55': '₹5.47', '56–60': '₹8.54',
      '61–65': '₹13.35', '66–70': '₹22.57', '71–75': '₹35.06', '76–80': '₹52.44',
    },
    example: 'For ₹10L CI cover, age 56–60: ₹10,00,000 × ₹8.54/₹1,000 = ₹8,540/year/member',
    note: 'Only for members aged 18+',
  },
  'Cancer Booster': {
    desc: 'Additional sum insured specifically for cancer treatment',
    loading: {
      'Age ≤45': 'SI ₹2L–4L: +6.5% | SI ₹5L–10L: +5.5% | SI ₹15L–₹1M: +4.5% | SI ₹75L+: +3%',
      'Age 46+': 'SI ₹2L–4L: +6.5% | SI ₹5L–10L: +5.5% | SI ₹15L–₹1M: +4.5% | SI ₹75L+: +3%',
    },
  },
  'Annual Cancer Screening': {
    desc: 'Annual cancer screening tests',
    premium: '₹227/member (age <46, domestic) | ₹455/member (age 46+ or Global plans)',
  },
  'Cashless OPD': {
    desc: 'Cashless outpatient treatment at empanelled centres',
    premiums: { '₹2,500 limit': '₹1,667/year', '₹5,000 limit': '₹2,917/year', '₹10,000 limit': '₹5,833/year' },
  },
  'Adventure Sports Cover': {
    desc: 'Covers injuries from adventure and extreme sports',
    premium: '₹183/member (adults only in Floater)',
  },
  'Female Vaccination': { desc: 'Vaccination coverage for female members', premium: '₹3,333/member' },
  'Child Protect': { desc: 'Additional protection for child members', premium: '₹100/policy' },
  'Spouse Protect': {
    desc: 'Covers new spouse added mid-policy year',
    loading: '5.5–6% of base premium (SI ₹2L–50L+)',
    note: 'Only for 1A, 1A1C, 1A2C, 1A3C, 1A4C family types',
  },
  'Smart Select Network Discount': { desc: 'Discount for choosing from a smaller, curated hospital network', loading: '−15% of base premium' },
  'Home Care Treatment': { desc: 'Covers treatment at home post-hospitalisation', premium: '₹167/policy/year (₹835 for 5-year policy)' },
  'Aggregate Deductible': {
    desc: 'Annual deductible — you pay the first portion of total annual claims',
    discount_by_si: {
      '₹2L SI': { '₹25K deductible': '−24%', '₹50K': '−40%', '₹1L': '−60%' },
      '₹5L SI': { '₹25K': '−16%', '₹50K': '−26.5%', '₹1L': '−40%' },
      '₹10L SI': { '₹25K': '−12%', '₹50K': '−21%', '₹1L': '−33%' },
      '₹40L SI': { '₹25K': '−9%', '₹50K': '−16%', '₹1L': '−26.5%' },
      '₹1Cr SI': { '₹25K': '−7.5%', '₹50K': '−14%', '₹1L': '−24%' },
    },
    note: 'Cannot be combined with Per Claim Deductible',
  },
  'Per Claim Deductible': {
    desc: 'Deductible applied to each individual claim',
    discount_by_si: {
      '₹2L SI': { '₹15K': '−19%', '₹25K': '−32%' },
      '₹5L SI': { '₹15K': '−13%', '₹25K': '−21%' },
      '₹10L SI': { '₹15K': '−10%', '₹25K': '−16%' },
      '₹40L SI': { '₹15K': '−7%', '₹25K': '−12%' },
      '₹1Cr SI': { '₹15K': '−5.5%', '₹25K': '−10%' },
    },
  },
  'Co-Payment': {
    desc: 'You pay a percentage of each claim — reduces your premium',
    omnibus_discount: { '5%': '−5%', '10%': '−10%', '20%': '−20%', '50%': '−50%' },
    senior_loading: {
      note: 'For PHI Senior — co-pay reduces loading (base is +100% for 0% co-pay)',
      '0%': '+100%', '5%': '+90%', '10%': '+80%', '20%': '+60%', '60%': '−20%',
    },
  },
};

// ─── Discounts ───────────────────────────────────────────────────────────────
export const DISCOUNTS = {
  'Tenure Discount': {
    '1 year': '0%', '2 years': '7.5%', '3 years': '10%', '4 years': '12.5%', '5 years': '15%',
    note: 'Applied per policy year. Multi-year discount reduces your effective annual premium.',
  },
  'Affiliate / Employee Discount': { discount: '10%', note: 'Cannot combine with Discount in Lieu of Commission' },
  'CIBIL Score Discount': {
    'Up to 700': '0%', '701–750': '2.5%', '751–800': '5%', '801–849': '7.5%', '850+': '15%',
  },
  'NRI Discount': { discount: '15%' },
  'Auto Debit Discount': { discount: '2.5%' },
  'Multiple Member Discount': { '2–3 members': '5%', '4+ members': '10%' },
  'Discount in Lieu of Commission': { discount: '15%', note: 'Cannot combine with Employee Discount' },
  'Corporate GMC Policyholder Discount': { discount: '5%' },
  'Prudential Healthy Living Discount': { discount: '0.75% of base premium loading' },
};

// ─── Installment Loading ──────────────────────────────────────────────────────
export const INSTALLMENT_LOADING = {
  'Monthly': '+6%', 'Quarterly': '+4%', 'Half-Yearly': '+2%', 'Annual': '0%',
  note: 'Loading added to total premium before instalment split',
};

// ─── Zones ───────────────────────────────────────────────────────────────────
export const ZONE_GUIDE = {
  'Zone 1': 'Highest premium — major metros (Mumbai, Delhi, Bangalore, etc.)',
  'Zone 2': 'Tier-1 cities (Pune, Hyderabad, Chennai, Kolkata, etc.)',
  'Zone 3': 'Tier-2 cities',
  'Zone 4': 'Lowest premium — smaller towns and rural areas',
  'Pan India': 'Single pricing for all areas (Sub-Standard & Senior plans)',
};

// ─── Family Type Guide ────────────────────────────────────────────────────────
export const FAMILY_GUIDE: Record<string, string> = {
  '1A': 'Individual (1 Adult)',
  '2A': 'Couple (2 Adults)',
  '1A1C': '1 Adult + 1 Child',
  '1A2C': '1 Adult + 2 Children',
  '1A3C': '1 Adult + 3 Children',
  '1A4C': '1 Adult + 4 Children',
  '2A1C': '2 Adults + 1 Child',
  '2A2C': '2 Adults + 2 Children',
  '2A3C': '2 Adults + 3 Children',
  '2A4C': '2 Adults + 4 Children',
};

// ─── Pre-Read Business Rules ──────────────────────────────────────────────────
export const BUSINESS_RULES = [
  'Instant Hospitalization for Chronic Conditions and PED Waiting Period Modification CANNOT be combined',
  'Consumables List I and Consumable Plus (List I–IV) CANNOT be combined',
  'Aggregate Deductible and Per Claim Deductible CANNOT be combined',
  'Chronic Management can only be opted if Instant Hospitalization for Chronic Conditions is also opted',
  'Employee/Affiliate Discount and Discount in Lieu of Commission CANNOT be combined',
  'Spouse Protect only for 1A, 1A1C, 1A2C, 1A3C, 1A4C family types',
  'Child Protect available for all family types except 1A and Multi-Individual',
  'Maternity & Newborn Expenses NOT available for 1A, 1A1C, 1A2C, 1A3C, 1A4C family types',
  'Maternity Fixed Benefit NOT available for 1A, 1A1C, 1A2C, 1A3C, 1A4C family types',
  'Tenure Wise option available only for 3-year tenure and above',
  'Maternity Fixed Benefit only for 3-year tenure with Single Premium Payment',
  'Surrogate Mother (36-month cover) only for 3-year tenure with Single Premium',
  'Maternity 9-month waiting period only for 3-year policy with Single Premium',
  'Personal Accident only for individuals aged 18+ in Floater policy',
  'Adventure Sports only for adults in Floater policy',
  'Advance Prudential Health Check-up only for adults in Floater policy',
  'Critical Illness only for members aged 18+ in Floater policy',
  'Fitness Plus for age 12+ (Multi-Individual or 1A policy)',
  'Chronic Management for age 18+ only',
  'If Maternity ₹50K is opted, Infertility Cover CANNOT be opted',
  'Infertility under Global Plans uses Global Maternity Sum Insured',
  'Enhanced Geographical Scope only for Global plans; current geography must be the base geography',
];

// ─── Premium Lookup ───────────────────────────────────────────────────────────
