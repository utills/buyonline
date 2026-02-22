import { ApplicationStatus, JourneyStep, CoverageLevel, PlanTier, KycMethod, KycStatus, PaymentStatus, DocumentType } from './enums';
import { Plan, PlanPricing, Addon, PricingBreakdown } from './plan.types';
import { ProposerDetails, BankDetailsRequest } from './payment.types';
import { MemberPersonalDetails, LifestyleAnswer, MedicalAnswer, HospitalizationDetails, DisabilityDetails } from './health.types';

export interface GenerateTokenRequest {
  applicationId: string;
}

export interface GenerateTokenResponse {
  token: string;
  resumeUrl: string;
  expiresAt: string;
}

export interface ValidateTokenResponse {
  applicationId: string;
  maskedMobile: string;
  mobile: string;
  status: ApplicationStatus;
  currentStep: string;
}

export interface VerifyResumeRequest {
  mobile: string;
  otp: string;
}

export interface ResumeJourneyState {
  applicationId: string;
  leadId: string;
  currentStep: JourneyStep;
  completedSteps: JourneyStep[];
  redirectPath: string;
}

export interface ResumeLeadState {
  members: {
    self: boolean;
    spouse: boolean;
    kidsCount: number;
  };
  eldestMemberAge: number | null;
  mobile: string;
  consentGiven: boolean;
}

export interface ResumeOnboardingState {
  pincode: string;
  nearbyHospitals: number;
  preExistingDiseases: Record<string, boolean>;
  criticalConditions: Record<string, string[]>;
  eligibleMembers: string[];
  ineligibleMembers: { memberId: string; reason: string }[];
}

export interface ResumeQuoteState {
  plans: Plan[];
  selectedPlanId: string | null;
  sumInsured: number;
  tenureMonths: number;
  coverageLevel: CoverageLevel;
  selectedTier: PlanTier;
  addons: Addon[];
  selectedAddonIds: string[];
  pricing: PricingBreakdown | null;
  planPricings: PlanPricing[];
}

export interface ResumePaymentState {
  proposer: ProposerDetails | null;
  paymentStatus: PaymentStatus | null;
  transactionId: string | null;
  paymentMethod: string | null;
  gatewayOrderId: string | null;
  amount: number;
}

export interface ResumeKycState {
  method: KycMethod | null;
  status: KycStatus;
  panNumber: string;
  aadharNumber: string;
  dob: string;
  identityProofType: DocumentType | null;
  identityProofUrl: string;
  addressProofType: DocumentType | null;
  addressProofUrl: string;
  useDigiLocker: boolean;
}

export interface ResumeHealthState {
  personalDetails: Record<string, MemberPersonalDetails>;
  lifestyleAnswers: Record<string, LifestyleAnswer[]>;
  medicalAnswers: Record<string, MedicalAnswer[]>;
  hospitalizationDetails: HospitalizationDetails | null;
  disabilityDetails: DisabilityDetails | null;
  bankDetails: BankDetailsRequest | null;
}

export interface ResumeStateResponse {
  journey: ResumeJourneyState;
  lead: ResumeLeadState;
  onboarding: ResumeOnboardingState;
  quote: ResumeQuoteState;
  payment: ResumePaymentState;
  kyc: ResumeKycState;
  health: ResumeHealthState;
}
