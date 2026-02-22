import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MemberDiseaseItem {
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @IsString()
  @IsNotEmpty()
  diseaseId!: string;

  @IsBoolean()
  @IsOptional()
  declared?: boolean;
}

export class DiseaseDeclarationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberDiseaseItem)
  diseases!: MemberDiseaseItem[];
}

export class CriticalConditionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberDiseaseItem)
  conditions!: MemberDiseaseItem[];
}
