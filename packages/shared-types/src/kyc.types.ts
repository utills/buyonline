import { DocumentType, KycMethod, KycStatus } from './enums';

export interface KycMethodSelection {
  method: KycMethod;
}

export interface CkycRequest {
  panNumber: string;
  dob: string;
}

export interface EkycRequest {
  aadharNumber: string;
  dob: string;
  useDigiLocker?: boolean;
}

export interface ManualKycRequest {
  identityProofType: DocumentType;
  identityProofUrl: string;
  addressProofType: DocumentType;
  addressProofUrl: string;
}

export interface KycResponse {
  id: string;
  method: KycMethod;
  status: KycStatus;
  verifiedAt?: string;
  failureReason?: string;
}
