import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class PincodeDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'Pincode must be exactly 6 digits' })
  pincode!: string;
}
