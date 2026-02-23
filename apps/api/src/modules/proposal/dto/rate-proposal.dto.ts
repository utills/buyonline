import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ProposalStatus } from '@buyonline/shared-types';

export class RateProposalDto {
  @IsEnum(ProposalStatus)
  @IsNotEmpty()
  status!: ProposalStatus;

  @IsString()
  @IsOptional()
  reviewNotes?: string;
}
