import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class EkycDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{12}$/, { message: 'aadharNumber must be exactly 12 digits' })
  aadharNumber!: string;

  @IsString()
  @IsOptional()
  digilockerRef?: string;
}
