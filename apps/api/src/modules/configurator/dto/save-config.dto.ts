import { IsObject, IsNotEmpty } from 'class-validator';
import type { JourneyConfig } from '@buyonline/shared-types';

export class SaveConfigDto {
  @IsObject()
  @IsNotEmpty()
  config!: JourneyConfig;
}
