import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentType } from '@buyonline/shared-types';

export { DocumentType };

export class ManualKycDocumentDto {
  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @IsNumber()
  @Min(0)
  fileSizeBytes!: number;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;
}

export class ManualKycDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManualKycDocumentDto)
  documents!: ManualKycDocumentDto[];

  @IsString()
  @IsOptional()
  panNumber?: string;
}
