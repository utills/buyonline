import { IsString, IsNotEmpty, Matches, IsBoolean, IsOptional, IsInt, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MembersDto {
  @IsBoolean()
  self!: boolean;

  @IsBoolean()
  spouse!: boolean;

  @IsInt()
  @Min(0)
  @Max(4)
  kidsCount!: number;

  @IsBoolean()
  @IsOptional()
  father?: boolean;

  @IsBoolean()
  @IsOptional()
  mother?: boolean;

  @IsBoolean()
  @IsOptional()
  fatherInLaw?: boolean;

  @IsBoolean()
  @IsOptional()
  motherInLaw?: boolean;
}

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, { message: 'Invalid Indian mobile number' })
  mobile!: string;

  @IsString()
  @IsOptional()
  countryCode?: string;

  @ValidateNested()
  @Type(() => MembersDto)
  members!: MembersDto;

  @IsInt()
  @Min(18)
  @Max(99)
  eldestMemberAge!: number;

  @IsBoolean()
  consentGiven!: boolean;
}
