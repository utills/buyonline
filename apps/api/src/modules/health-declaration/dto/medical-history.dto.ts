import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MedicalAnswerItem {
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @IsBoolean()
  answer!: boolean;

  @IsString()
  @IsOptional()
  details?: string;
}

export class MedicalHistoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicalAnswerItem)
  answers!: MedicalAnswerItem[];
}
