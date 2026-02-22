import { MemberSelection } from './member.types';
import { OtpPurpose } from './enums';

export interface CreateLeadRequest {
  mobile: string;
  countryCode: string;
  members: MemberSelection;
  eldestMemberAge: number;
  consentGiven: boolean;
}

export interface LeadResponse {
  id: string;
  mobile: string;
  isVerified: boolean;
}

export interface SendOtpRequest {
  mobile: string;
  countryCode: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpRequest {
  mobile: string;
  otp: string;
  purpose: OtpPurpose;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  expiresInSeconds?: number;
}
