// ─── Plan Definitions ─────────────────────────────────────────────────────────
// Plans sourced from the PHI product rate card (XL)
// Tiers mapped: PREMIER → PHI Basic, SIGNATURE → PHI Flagship 1, GLOBAL → PHI Flagship 2/3

export const PLAN_DEFINITIONS = [
  {
    id: 'plan-premier',
    name: 'PHI Basic',
    tier: 'PREMIER' as const,
    description: 'Entry-level comprehensive health insurance with solid hospitalization coverage. Single private AC room, 500+ day-care procedures, annual health screenings.',
    features: {
      roomRent: 'Single Private AC Room (upgrade optional)',
      preSurgery: '30 days',
      postSurgery: '60 days',
      daycare: '500+ procedures covered',
      ambulance: 'Up to ₹5,000 per hospitalization',
      healthCheckup: 'Annual cancer screening',
      noClaimBonus: 'Up to 500% of Sum Insured',
      restoration: '100% of Sum Insured (optional)',
      smartSelectDiscount: '−15% Smart Select Network Discount',
    },
    sortOrder: 1,
  },
  {
    id: 'plan-signature',
    name: 'PHI Flagship 1',
    tier: 'SIGNATURE' as const,
    description: 'Mid-range plan with enhanced benefits, wider sum-insured options up to ₹10 Lakh, and optional maternity & newborn cover for floater policies.',
    features: {
      roomRent: 'Single Private AC Room (enhanced options)',
      preSurgery: '30 days',
      postSurgery: '60 days',
      daycare: '500+ procedures covered',
      ambulance: 'Up to ₹5,000 per hospitalization',
      healthCheckup: 'Annual health check-up',
      noClaimBonus: 'Up to 500% of Sum Insured',
      restoration: '100% of Sum Insured (optional)',
      maternity: 'Optional (Floater only) — Maternity & Newborn',
      spouseProtect: 'Optional Spouse Protect add-on',
    },
    sortOrder: 2,
  },
  {
    id: 'plan-global',
    name: 'PHI Flagship 2/3',
    tier: 'GLOBAL' as const,
    description: 'Premium domestic plan with wider sum-insured up to ₹2 Crore, enhanced pre/post hospitalisation, and comprehensive wellness benefits.',
    features: {
      roomRent: 'Single Private AC Room (enhanced)',
      preSurgery: '60 days',
      postSurgery: '90 days',
      daycare: '500+ procedures covered',
      ambulance: 'Up to ₹5,000 per hospitalization',
      healthCheckup: 'Annual comprehensive health check-up',
      noClaimBonus: 'Up to 500% of Sum Insured',
      restoration: '100% of Sum Insured (optional)',
      maternity: 'Optional (Floater only)',
      criticalIllness: 'Optional Critical Illness add-on',
      higherSI: 'Sum Insured up to ₹2 Crore',
    },
    sortOrder: 3,
  },
];

// ─── Sum Insured Options ───────────────────────────────────────────────────────
// Matching the XL rate card SI tiers (all 3 plans support these)
export const SUM_INSURED_OPTIONS = [
  { value: 500000,   label: '5 Lakh' },
  { value: 1000000,  label: '10 Lakh' },
  { value: 2000000,  label: '20 Lakh' },
  { value: 3000000,  label: '30 Lakh' },
  { value: 5000000,  label: '50 Lakh' },
  { value: 7500000,  label: '75 Lakh' },
  { value: 10000000, label: '1 Crore' },
];

export const TENURE_OPTIONS = [12, 24, 36]; // months (annual, 2-yr, 3-yr)

// ─── Base Premium Map ──────────────────────────────────────────────────────────
// Source: PHI Rate Card — Zone 4 (baseline), Individual, 1-year tenure
// Age bands: 18-35 | 36-40 | 41-45 | 46-50 | 51-55 | 56-60 | 61-65 | 66+
// Seeded value = midpoint age band (31-35) for Zone 4 individual.
// The seed uses this as a flat annual premium; real age-band logic is in JourneyFlowService.

export const BASE_PREMIUM_MAP: Record<string, Record<number, number>> = {
  // PHI Basic — Zone 4, age 31-35, individual (direct from XL)
  'plan-premier': {
    500000:   3875,
    1000000:  4417,
    2000000:  5847,
    3000000:  6798,
    5000000:  7307,
    7500000:  8328,
    10000000: 9227,
  },
  // PHI Flagship 1 — Zone 4, age 31-35, individual (direct from XL)
  'plan-signature': {
    500000:   5490,
    1000000:  6282,
    2000000:  8247,
    3000000:  9617,
    5000000:  10357,
    7500000:  11830,
    10000000: 13067,
  },
  // PHI Flagship 2/3 — Zone 4, age 31-35, individual (direct from XL)
  'plan-global': {
    500000:   6885,
    1000000:  7710,
    2000000:  9722,
    3000000:  11143,
    5000000:  11907,
    7500000:  13185,
    10000000: 14427,
  },
};

// ─── Tenure Multipliers ───────────────────────────────────────────────────────
// Multi-year discounts: 2yr = 5% off, 3yr = 8% off (effective multiplier)
export const TENURE_MULTIPLIER: Record<number, number> = {
  12: 1.0,
  24: 1.90,  // ~5% savings vs 2×annual
  36: 2.76,  // ~8% savings vs 3×annual
};

// ─── Multi-year Discount ──────────────────────────────────────────────────────
export const DISCOUNT_MAP: Record<number, number> = {
  12: 0,
  24: 5,
  36: 8,
};

// ─── Age-Band Premium Multipliers (Zone 4 relative to 31-35 baseline) ─────────
// Used by JourneyFlowService to adjust displayed premiums based on customer age.
// Values derived from XL rate card ratio (age_band_premium / 31-35_premium).
export const AGE_BAND_MULTIPLIER: Record<string, number> = {
  '18-25': 1.00,   // same as 31-35 in XL
  '26-30': 1.00,
  '31-35': 1.00,   // baseline
  '36-40': 1.19,
  '41-45': 1.42,
  '46-50': 1.79,
  '51-55': 2.22,
  '56-60': 2.94,
  '61-65': 3.96,
  '66-70': 5.15,
  '71+':   7.04,
};
