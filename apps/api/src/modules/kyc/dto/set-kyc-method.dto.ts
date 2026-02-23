import { IsEnum } from 'class-validator';
import { KycMethod } from '@buyonline/shared-types';

export { KycMethod };

export class SetKycMethodDto {
  @IsEnum(KycMethod)
  method!: KycMethod;
}
