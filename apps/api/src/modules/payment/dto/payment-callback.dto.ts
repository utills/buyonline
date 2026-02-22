import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum PaymentCallbackStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export class PaymentCallbackDto {
  @IsString()
  @IsNotEmpty()
  gatewayOrderId!: string;

  @IsString()
  @IsNotEmpty()
  gatewayPaymentId!: string;

  @IsString()
  @IsOptional()
  gatewaySignature?: string;

  @IsEnum(PaymentCallbackStatus)
  status!: PaymentCallbackStatus;

  @IsString()
  @IsOptional()
  transactionId?: string;
}
