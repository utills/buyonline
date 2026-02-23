import { IsString, IsNotEmpty, Matches, IsEnum, IsOptional } from 'class-validator';
import { OtpPurpose } from '@buyonline/shared-types';

export { OtpPurpose };

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, { message: 'Invalid Indian mobile number' })
  mobile!: string;

  @IsEnum(OtpPurpose)
  @IsOptional()
  purpose?: OtpPurpose;
}
