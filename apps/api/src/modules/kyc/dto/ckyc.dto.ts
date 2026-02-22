import { IsString, IsNotEmpty, Matches, IsDateString } from 'class-validator';

export class CkycDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{5}\d{4}[A-Z]$/, { message: 'Invalid PAN number format' })
  panNumber!: string;

  @IsDateString()
  @IsNotEmpty()
  dob!: string;
}
