import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsPhoneNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Role } from '../../shared/enums/role.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiProperty()
  contact_number: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;
}