import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsArray,
  IsInt,
  Min,
  Matches,
  IsUrl,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['INFORMATIVE', 'ACTIONABLE', 'LEAD_GEN'])
  type!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  ctaLabel?: string;

  @IsString()
  @IsOptional()
  @IsIn(['journey', 'plan'])
  ctaType?: string;

  @IsString()
  @IsOptional()
  ctaPlanId?: string;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDesc?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
