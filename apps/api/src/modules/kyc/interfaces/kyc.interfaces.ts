export interface IKycService {
  setMethod(applicationId: string, method: 'EKYC' | 'CKYC' | 'MANUAL'): Promise<void>;
  verifyEkyc(applicationId: string, panNumber: string, dob: string): Promise<KycResult>;
  verifyCkyc(applicationId: string, mobile: string, dob: string): Promise<KycResult>;
}

export interface KycResult {
  success: boolean;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  kycId?: string;
  error?: string;
}
