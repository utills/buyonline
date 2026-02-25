import { JourneyStep, PlanTier } from '@buyonline/shared-types';

export const COLORS = {
  primary: '#ED1B2D',
  primaryDark: '#C8162A',
  primaryLight: '#FF4D6A',
  white: '#FFFFFF',
  black: '#000000',
  footer: '#1A1A1A',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

export const STEP_ORDER: JourneyStep[] = [
  JourneyStep.LANDING,
  JourneyStep.ONBOARDING,
  JourneyStep.QUOTE,
  JourneyStep.PAYMENT,
  JourneyStep.KYC,
  JourneyStep.HEALTH,
  JourneyStep.COMPLETE,
];

export const STEP_LABELS: Record<JourneyStep, string> = {
  [JourneyStep.LANDING]: 'Get Started',
  [JourneyStep.ONBOARDING]: 'Onboarding',
  [JourneyStep.QUOTE]: 'Quote',
  [JourneyStep.PAYMENT]: 'Payment',
  [JourneyStep.KYC]: 'KYC',
  [JourneyStep.HEALTH]: 'Health',
  [JourneyStep.COMPLETE]: 'Complete',
};

export const PLAN_TIER_LABELS: Record<PlanTier, string> = {
  [PlanTier.PREMIER]: 'Premier',
  [PlanTier.SIGNATURE]: 'Signature',
  [PlanTier.GLOBAL]: 'Global',
};

export const PLAN_TIER_DESCRIPTIONS: Record<PlanTier, string> = {
  [PlanTier.PREMIER]: 'Essential coverage for your family',
  [PlanTier.SIGNATURE]: 'Enhanced coverage with premium features',
  [PlanTier.GLOBAL]: 'Worldwide coverage with best-in-class benefits',
};

export const TITLE_OPTIONS = ['Mr', 'Mrs', 'Ms', 'Dr'] as const;

export const IDENTITY_PROOF_OPTIONS = [
  { value: 'PAN_CARD', label: 'PAN Card' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'VOTER_ID', label: 'Voter ID' },
  { value: 'DRIVING_LICENSE', label: 'Driving License' },
] as const;

export const ADDRESS_PROOF_OPTIONS = [
  { value: 'AADHAR_CARD', label: 'Aadhar Card' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'VOTER_ID', label: 'Voter ID' },
  { value: 'DRIVING_LICENSE', label: 'Driving License' },
  { value: 'ADDRESS_PROOF', label: 'Utility Bill' },
] as const;

export const FILE_UPLOAD = {
  maxSizeMB: 10,
  maxSizeBytes: 10 * 1024 * 1024,
  acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  acceptedExtensions: '.pdf,.jpg,.jpeg,.png',
} as const;

export const OTP_TIMER_SECONDS = 30;

// Browser: always use relative URLs → routes through Next.js proxy (no CORS)
// Server (SSR): full URL needed for server-to-server calls
export const API_BASE_URL = typeof window !== 'undefined'
  ? ''
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
