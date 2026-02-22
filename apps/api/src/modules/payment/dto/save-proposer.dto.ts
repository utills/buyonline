import { IsString, IsNotEmpty, IsEmail, IsDateString } from 'class-validator';

export class SaveProposerDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsDateString()
  dob!: string;

  @IsEmail()
  email!: string;
}
