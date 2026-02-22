import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateLeadDto {
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  consentGiven?: boolean;
}
