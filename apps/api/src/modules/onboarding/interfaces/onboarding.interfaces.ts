export interface IOnboardingService {
  addMembers(applicationId: string, members: MemberInput[]): Promise<void>;
  checkEligibility(applicationId: string): Promise<EligibilityResult>;
  declareDiseases(applicationId: string, diseases: DiseaseInput[]): Promise<void>;
  updatePincode(applicationId: string, pincode: string): Promise<void>;
}

export interface MemberInput {
  memberType: string;
  label: string;
  age: number;
  gender?: string;
}

export interface DiseaseInput {
  diseaseCode: string;
  memberId: string;
  diagnosisYear?: number;
  isControlled?: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  ineligibleMembers: string[];
  reasons: string[];
}
