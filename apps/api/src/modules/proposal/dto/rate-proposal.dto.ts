import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RateProposalDto {
  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsString()
  @IsOptional()
  reviewNotes?: string;
}
