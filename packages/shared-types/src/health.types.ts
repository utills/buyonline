import { TobaccoType } from './enums';

export interface MemberPersonalDetails {
  memberId: string;
  title: string;
  firstName: string;
  lastName: string;
  mobile?: string;
  dob: string;
  heightFt: number;
  heightIn: number;
  weightKg: number;
  isNominee?: boolean;
}

export interface LifestyleAnswer {
  memberId: string;
  questionKey: 'tobacco' | 'alcohol';
  answer: boolean;
  subAnswer?: TobaccoType;
}

export interface MedicalAnswer {
  memberId: string;
  questionKey: string;
  answer: boolean;
  details?: string;
}

export interface HospitalizationDetails {
  reason: string;
  isDischargeSummaryAvailable: boolean;
  dischargeSummaryUrl?: string;
  medicationName?: string;
  investigationName?: string;
  symptomName?: string;
  treatmentName?: string;
}

export interface DisabilityDetails {
  hasDisability: boolean;
  memberIds: string[];
  hasPriorInsuranceDecline: boolean;
  priorInsuranceDetails?: string;
}

export interface HealthQuestion {
  id: string;
  category: 'medical' | 'lifestyle' | 'hospitalization';
  questionText: string;
  questionKey: string;
  sortOrder: number;
}

export const CHRONIC_CONDITIONS = [
  'Cancer', 'Diabetes', 'Hypertension', 'Heart Disease', 'Stroke',
  'Asthma', 'COPD', 'Kidney Failure', 'Liver Disease', 'Thyroid Disorder',
  'Epilepsy', 'Arthritis', 'High Cholesterol', 'Depression', 'Gastric Issues',
  'Sleep Apnea', 'Chronic Migraine', 'Organ Transplant', 'Cerebral Palsy',
] as const;
