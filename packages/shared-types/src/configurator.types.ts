export interface JourneyStepConfig {
  id: string;
  label: string;
  route: string;
  enabled: boolean;
  required: boolean;
  sortOrder: number;
}

export interface JourneyPhaseConfig {
  id: string;
  label: string;
  enabled: boolean;
  sortOrder: number;
  steps: JourneyStepConfig[];
}

export interface PlanConfig {
  planId: string;
  enabled: boolean;
  highlighted: boolean;
  customLabel?: string;
}

export interface AddonConfig {
  addonId: string;
  enabled: boolean;
  preChecked: boolean;
}

export interface HealthQuestionConfig {
  questionKey: string;
  enabled: boolean;
  sortOrder: number;
}

export interface ChatConfig {
  aiEnabled: boolean;
  agenticEnabled: boolean;
  welcomeMessage: string;
  suggestedPrompts: string[];
}

export interface BrandingConfig {
  primaryColor: string;
  logoText: string;
  tagline: string;
}

export interface FeatureFlags {
  resumeJourneyEnabled: boolean;
  hospitalSearchEnabled: boolean;
  ekycEnabled: boolean;
  ckycEnabled: boolean;
}

export interface JourneyConfig {
  version: number;
  updatedAt: string;
  phases: JourneyPhaseConfig[];
  plans: PlanConfig[];
  addons: AddonConfig[];
  healthQuestions: HealthQuestionConfig[];
  chat: ChatConfig;
  branding: BrandingConfig;
  featureFlags: FeatureFlags;
}

export interface SaveConfigRequest {
  config: JourneyConfig;
}

export interface ConfigResponse {
  id: string;
  version: number;
  config: JourneyConfig;
  updatedAt: string;
}
