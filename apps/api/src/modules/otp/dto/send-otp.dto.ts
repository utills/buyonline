import { IsString, IsNotEmpty, Matches, IsEnum, IsOptional } from 'class-validator';

export enum OtpPurpose {
  LOGIN = 'LOGIN',
  KYC = 'KYC',
}

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, { message: 'Invalid Indian mobile number' })
  mobile!: string;

  @IsEnum(OtpPurpose)
  @IsOptional()
  purpose?: OtpPurpose;
}
