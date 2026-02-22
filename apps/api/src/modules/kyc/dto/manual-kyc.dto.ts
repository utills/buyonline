import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum ManualDocumentType {
  PAN_CARD = 'PAN_CARD',
  AADHAR_CARD = 'AADHAR_CARD',
  PASSPORT = 'PASSPORT',
  VOTER_ID = 'VOTER_ID',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  ADDRESS_PROOF = 'ADDRESS_PROOF',
}

export class ManualKycDocumentDto {
  @IsEnum(ManualDocumentType)
  documentType!: ManualDocumentType;

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
