import { IsArray, IsString } from 'class-validator';

export class SelectAddonsDto {
  @IsArray()
  @IsString({ each: true })
  addonIds!: string[];
}
