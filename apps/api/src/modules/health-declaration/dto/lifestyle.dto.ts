import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LifestyleAnswerItem {
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @IsString()
  @IsNotEmpty()
  questionKey!: string;

  @IsBoolean()
  answer!: boolean;

  @IsString()
  @IsOptional()
  subAnswer?: string;
}

export class LifestyleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LifestyleAnswerItem)
  answers!: LifestyleAnswerItem[];
}
