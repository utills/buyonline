import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class GenerateTokenDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  applicationId!: string;
}
