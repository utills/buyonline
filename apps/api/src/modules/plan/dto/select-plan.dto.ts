import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';

export enum CoverageLevel {
  INDIVIDUAL = 'INDIVIDUAL',
  FLOATER = 'FLOATER',
}

export class SelectPlanDto {
  @IsString()
  @IsNotEmpty()
  planId!: string;

  @IsNumber()
  sumInsured!: number;

  @IsEnum(CoverageLevel)
  coverageLevel!: CoverageLevel;

  @IsNumber()
  tenureMonths!: number;
}

