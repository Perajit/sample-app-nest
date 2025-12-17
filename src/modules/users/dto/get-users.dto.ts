import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetUsersDto {
  @IsOptional()
  keyword?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
