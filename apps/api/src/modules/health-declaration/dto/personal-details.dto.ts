import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class PersonalDetailsDto {
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsDateString()
  dob!: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsNumber()
  @IsOptional()
  heightFt?: number;

  @IsNumber()
  @IsOptional()
  heightIn?: number;

  @IsNumber()
  @IsOptional()
  weightKg?: number;
}
