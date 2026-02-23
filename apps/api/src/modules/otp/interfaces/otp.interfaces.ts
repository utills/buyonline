export interface IOtpService {
  sendOtp(mobile: string): Promise<OtpSendResult>;
  verifyOtp(mobile: string, otp: string): Promise<OtpVerifyResult>;
}

export interface OtpSendResult {
  success: boolean;
  mobile: string;
  devOtp?: string;
  error?: string;
}

export interface OtpVerifyResult {
  success: boolean;
  verified: boolean;
  mobile?: string;
  error?: string;
}
