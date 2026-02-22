import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MemberItemDto {
  @IsString()
  @IsNotEmpty()
  memberType!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsNumber()
  age!: number;

  @IsString()
  @IsOptional()
  gender?: string;
}

export class AddMembersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberItemDto)
  members!: MemberItemDto[];
}
