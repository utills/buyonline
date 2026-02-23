// ─── Agentic Phase ────────────────────────────────────────────────────────────
export type AgenticPhase =
  | 'greeting'
  | 'members'
  | 'age'
  | 'otp_sent'
  | 'otp_verify'
  | 'pincode'
  | 'pre_existing'
  | 'eligibility'
  | 'plan_selection'
  | 'addon_selection'
  | 'proposer_details'
  | 'payment_redirect'
  | 'post_payment'
  | 'kyc'
  | 'health_declaration'
  | 'complete';

// ─── Plan Card Data ───────────────────────────────────────────────────────────
export interface PlanCardData {
  planName: string;
  planTier: string;
  sumInsured: number;
  sumInsuredLabel: string;
  basePremium: number;
  totalPremium: number;
  monthlyPremium: number;
  features?: string[];
  isRecommended?: boolean;
}

// ─── Agentic Message ─────────────────────────────────────────────────────────
export interface AgenticMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  error?: boolean;
  widget?: 'otp' | 'plan-card' | 'upload' | 'handoff';
  widgetData?: Record<string, unknown>;
}

// ─── Collected Data ───────────────────────────────────────────────────────────
export interface AgenticCollectedData {
  members: {
    self: boolean;
    spouse: boolean;
    kidsCount: number;
  };
  eldestAge: number;
  mobile: string;
  pincode: string;
  hospitalCount: number;
  preExisting: string[];
  planSelected: {
    planName: string;
    planTier: string;
    totalPremium: number;
    sumInsuredLabel: string;
  };
  kycVerified: boolean;
  healthSubmitted: boolean;
  paymentDone: boolean;
}

// ─── State Update from SSE ────────────────────────────────────────────────────
export interface AgenticStateUpdate {
  phase?: AgenticPhase;
  members?: {
    self?: boolean;
    spouse?: boolean;
    kidsCount?: number;
  };
  eldestAge?: number;
  mobile?: string;
  pincode?: string;
  hospitalCount?: number;
  preExisting?: string[];
  planSelected?: {
    planName: string;
    planTier: string;
    totalPremium: number;
    sumInsuredLabel: string;
  };
  kycVerified?: boolean;
  healthSubmitted?: boolean;
  paymentDone?: boolean;
}

// ─── SSE Event ────────────────────────────────────────────────────────────────
export interface AgenticSSEEvent {
  token?: string;
  done?: boolean;
  error?: string;
  stateUpdate?: AgenticStateUpdate;
  redirect?: { path: string; returnPath: string };
  handoff?: {
    applicationId: string;
    leadId: string;
    mobile: string;
    redirectPath: string;
  };
}
