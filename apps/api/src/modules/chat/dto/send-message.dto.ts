import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsIn, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Transform(({ value }: { value: string }) =>
    value
      .replace(/<[^>]*>/g, '') // strip HTML tags
      .replace(/\[INST\]|\[\/INST\]|<\|system\|>|<\|user\|>/gi, '') // strip instruction markers
      .trim()
  )
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
