export interface IPaymentService {
  initiatePayment(applicationId: string): Promise<PaymentInitResult>;
  handleCallback(orderId: string, paymentId: string, signature: string): Promise<PaymentCallbackResult>;
}

export interface PaymentInitResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  error?: string;
}

export interface PaymentCallbackResult {
  success: boolean;
  applicationId?: string;
  transactionId?: string;
  error?: string;
}
