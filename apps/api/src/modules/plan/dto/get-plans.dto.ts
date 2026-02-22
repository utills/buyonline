import { IsString, IsNotEmpty } from 'class-validator';

export class GetPlansQueryDto {
  @IsString()
  @IsNotEmpty()
  applicationId!: string;
}
