import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { PaymentStatus } from '@buyonline/shared-types';

export { PaymentStatus };

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

  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @IsString()
  @IsOptional()
  transactionId?: string;
}
