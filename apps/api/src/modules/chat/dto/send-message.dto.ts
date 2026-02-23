import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsIn, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message!: string;

  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsString()
  @IsOptional()
  applicationId?: string;

  @IsBoolean()
  @IsOptional()
  useAI?: boolean;

  @IsString()
  @IsOptional()
  @IsIn(['standard', 'agentic'])
  journeyMode?: 'standard' | 'agentic';

  @IsString()
  @IsOptional()
  leadId?: string;
}
