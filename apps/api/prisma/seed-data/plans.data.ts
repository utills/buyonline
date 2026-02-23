export const PLAN_DEFINITIONS = [
  {
    id: 'plan-premier',
    name: 'PRUHealth Premier',
    tier: 'PREMIER' as const,
    description: 'Essential health coverage with comprehensive hospitalization benefits',
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
  {
    id: 'plan-signature',
    name: 'PRUHealth Signature',
    tier: 'SIGNATURE' as const,
    description: 'Enhanced health coverage with wider network and additional benefits',
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
  {
    id: 'plan-global',
    name: 'PRUHealth Global',
    tier: 'GLOBAL' as const,
    description: 'Premium worldwide health coverage with no limits on room rent and global network access',
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
];

// 8 sum-insured tiers (was 4) — doubles the pricing matrix
export const SUM_INSURED_OPTIONS = [
  { value: 300000,    label: '3 Lakh' },
  { value: 500000,    label: '5 Lakh' },
  { value: 750000,    label: '7.5 Lakh' },
  { value: 1000000,   label: '10 Lakh' },
  { value: 1500000,   label: '15 Lakh' },
  { value: 2500000,   label: '25 Lakh' },
  { value: 5000000,   label: '50 Lakh' },
  { value: 10000000,  label: '1 Crore' },
];

export const TENURE_OPTIONS = [12, 24, 36, 48, 60]; // months

// Annual base premiums (INR) per plan × sum-insured
export const BASE_PREMIUM_MAP: Record<string, Record<number, number>> = {
  'plan-premier': {
    300000:   6500,
    500000:   8500,
    750000:   11000,
    1000000:  13500,
    1500000:  17000,
    2500000:  22000,
    5000000:  35000,
    10000000: 55000,
  },
  'plan-signature': {
    300000:   9000,
    500000:   12000,
    750000:   15500,
    1000000:  19000,
    1500000:  24000,
    2500000:  30000,
    5000000:  48000,
    10000000: 75000,
  },
  'plan-global': {
    300000:   14000,
    500000:   18000,
    750000:   23000,
    1000000:  28000,
    1500000:  36000,
    2500000:  45000,
    5000000:  72000,
    10000000: 110000,
  },
};

export const TENURE_MULTIPLIER: Record<number, number> = {
  12: 1.0,
  24: 1.9,
  36: 2.7,
  48: 3.4,
  60: 4.0,
};

export const DISCOUNT_MAP: Record<number, number> = {
  12: 0,
  24: 5,
  36: 8,
  48: 10,
  60: 12,
};
