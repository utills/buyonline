import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class HospitalizationDto {
  @IsString()
  @IsOptional()
  hospitalizationReason?: string;

  @IsString()
  @IsOptional()
  dischargeSummaryUrl?: string;

  @IsString()
  @IsOptional()
  medicationDetails?: string;
}

export class DisabilityDto {
  @IsBoolean()
  hasDisability!: boolean;

  @IsString()
  @IsOptional()
  disabilityDetails?: string;
}

export class BankDetailsDto {
  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @IsString()
  @IsNotEmpty()
  ifscCode!: string;
}
