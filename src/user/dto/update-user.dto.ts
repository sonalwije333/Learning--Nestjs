// src/users/dto/update-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsPhoneNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Role } from '../../shared/enums/role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Updated Name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'updated@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ minLength: 6, example: 'newpassword123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  contact_number?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({ enum: Role, example: Role.Admin })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}