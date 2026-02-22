import { PaymentStatus } from './enums';

export interface ProposerDetails {
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
}

export interface InitiatePaymentRequest {
  applicationId: string;
  amount: number;
}

export interface PaymentResponse {
  id: string;
  applicationId: string;
  amount: number;
  status: PaymentStatus;
  transactionId?: string;
  paymentMethod?: string;
  gatewayOrderId?: string;
  paidAt?: string;
}

export interface BankDetailsRequest {
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}
