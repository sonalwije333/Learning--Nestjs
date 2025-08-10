import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { Role } from 'src/shared/enums/role.enum';

export class PaginationParams {
  @ApiPropertyOptional({ default: 1, example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: Role, required: false })
  @IsOptional()
  role?: Role;
}