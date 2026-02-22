import { IsEnum } from 'class-validator';

export enum KycMethodEnum {
  CKYC = 'CKYC',
  EKYC = 'EKYC',
  MANUAL = 'MANUAL',
}

export class SetKycMethodDto {
  @IsEnum(KycMethodEnum)
  method!: KycMethodEnum;
}
