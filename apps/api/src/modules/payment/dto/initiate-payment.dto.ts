import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class InitiatePaymentDto {
  @IsString()
  @IsNotEmpty()
  applicationId!: string;

  @IsNumber()
  amount!: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
